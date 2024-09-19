import { RawData, WebSocketServer, WebSocket } from "ws"
import { GameDocument } from "../repository/game"
import { IncomingMessage } from "node:http"
import internal from "node:stream"
import { z } from "zod"
import { match } from "ts-pattern"
import { command_CreateGame } from "../commands/create-game"
import { isFailure } from "../lib/result"
import { Game, GameStatus, makeGameDTO, moveSchema } from "../domain/game"
import { createPgnFromMoves, getStatus, validateMove } from "../lib/chess"
import { Context, createContext } from "../middleware/context"
import { verifyToken } from "../middleware/auth"
import { User } from "../domain/user"

export const webSocketServer = new WebSocketServer({
  clientTracking: false,
  noServer: true,
})

interface ExtWebSocket extends WebSocket {
  context: Context
}

const Queue: {
  playerId: string
  socket: ExtWebSocket
}[] = []
const PlayersInActiveGames = new Set<string>()
const Games = new Map<
  string,
  { white: ExtWebSocket | null; black: ExtWebSocket | null }
>()

function onSocketError(err: Error) {
  console.error(err)
}

export const handleUpgrade = (
  req: IncomingMessage,
  socket: internal.Duplex,
  head: Buffer
) => {
  socket.on("error", onSocketError)

  socket.removeListener("error", onSocketError)

  const tokenString = req.headers["sec-websocket-protocol"]
  if (!tokenString) {
    socket.write("HTTP/1.1 401 Missing Authentication\r\n\r\n")
    socket.destroy()
    return
  }

  let user: User
  try {
    const token = tokenString.split(" ")[1]
    user = verifyToken(token)
  } catch (err) {
    console.error(err)
    socket.write("HTTP/1.1 401 Bad Credentials\r\n\r\n")
    socket.destroy()
    return
  }

  webSocketServer.handleUpgrade(req, socket, head, (ws) => {
    const wsWithExt = ws as ExtWebSocket
    wsWithExt.context = createContext(user)
    webSocketServer.emit("connection", wsWithExt)
  })
}

webSocketServer.on("connection", (ws: ExtWebSocket) => {
  ws.on("error", (err) => {})

  ws.on("message", async (message) => {
    messageHandler(ws, message)
  })

  ws.on("close", () => {
    console.info("client disconnected")
    const user = ws.context.user
    if (!user) {
      return
    }
    const playerId = user.id
    const queueIndex = Queue.findIndex((player) => player.playerId === playerId)
    if (queueIndex !== -1) {
      Queue.splice(queueIndex, 1)
    }
    const gameIds = Array.from(Games.keys())
    for (const gameId of gameIds) {
      const game = Games.get(gameId)
      if (!game) {
        continue
      }
      if (game.white?.context.user?.id === playerId) {
        game.white = null
      }
      if (game.black?.context.user?.id === playerId) {
        game.black = null
      }
      if (game.white === null && game.black === null) {
        Games.delete(gameId)
      } else {
        Games.set(gameId, game)
      }
    }
  })
})

enum RequestMessageTypes {
  MOVE = "move",
  JOIN_GAME = "join-game",
  GET_GAME = "get-game",
  TIMEOUT = "timeout",
  RESIGN = "resign",
  DRAW = "draw",
  OFFER_DRAW = "offer-draw",
  ABANDON = "abandon",
}

const messageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(RequestMessageTypes.JOIN_GAME),
    payload: z.object({
      playerId: z.string(),
    }),
  }),
  z.object({
    type: z.literal(RequestMessageTypes.GET_GAME),
    payload: z.object({
      gameId: z.string(),
      playerId: z.string(),
    }),
  }),
  z.object({
    type: z.literal(RequestMessageTypes.MOVE),
    payload: z.object({
      gameId: z.string(),
      playerId: z.string(),
      move: moveSchema,
      status: z.nativeEnum(GameStatus),
      pgn: z.string(),
    }),
  }),
  // z.object({
  //   type: z.literal(RequestMessageTypes.TIMEOUT),
  //   payload: z.object({
  //     gameId: z.string(),
  //     playerId: z.string(),
  //   }),
  // }),
  // z.object({
  //   type: z.literal(RequestMessageTypes.RESIGN),
  //   payload: z.object({
  //     gameId: z.string(),
  //     playerId: z.string(),
  //   }),
  // }),
  // z.object({
  //   type: z.literal(RequestMessageTypes.DRAW),
  //   payload: z.object({
  //     gameId: z.string(),
  //   }),
  // }),
  // z.object({
  //   type: z.literal(RequestMessageTypes.OFFER_DRAW),
  //   payload: z.object({
  //     gameId: z.string(),
  //     playerId: z.string(),
  //   }),
  // }),
])

const messageHandler = (ws: ExtWebSocket, data: RawData) => {
  const message = JSON.parse(data.toString())
  const parsedMessage = messageSchema.safeParse(message)
  if (!parsedMessage.success) {
    return ws.send(
      JSON.stringify({
        type: "error",
        payload: {
          message: "Invalid payload",
          error: parsedMessage.error,
        },
      })
    )
  }

  const context = ws.context
  const user = context.user
  if (!user) {
    return ws.send(
      JSON.stringify(
        makeErrorMessage("Unauthorized", "User not found in context")
      )
    )
  }

  match(parsedMessage.data)
    .with({ type: RequestMessageTypes.JOIN_GAME }, async ({ payload }) => {
      const { playerId } = payload

      if (PlayersInActiveGames.has(playerId)) {
        return ws.send(
          JSON.stringify(
            makeErrorMessage("Player is already in an active game", null)
          )
        )
      }
      // check if this user has already joined the queue
      const alreadyWaiting = Queue.find((player) => player.playerId === user.id)
      if (!alreadyWaiting) {
        // there is no one in the queue, so add this user to the queue and return
        if (Queue.length === 0) {
          Queue.push({
            playerId,
            socket: ws,
          })
          return
        }

        const newPlayerId = playerId
        const waitingPlayer = Queue.shift()

        if (waitingPlayer) {
          PlayersInActiveGames.add(waitingPlayer.playerId)
          PlayersInActiveGames.add(newPlayerId)
          const createGameResult = await command_CreateGame(
            [waitingPlayer.playerId, newPlayerId],
            context
          )

          if (isFailure(createGameResult)) {
            Queue.unshift(waitingPlayer)
            Queue.push({
              playerId: newPlayerId,
              socket: ws,
            })
            PlayersInActiveGames.delete(waitingPlayer.playerId)
            PlayersInActiveGames.delete(newPlayerId)
            return ws.send(
              JSON.stringify(
                makeErrorMessage(
                  "Failed to create game",
                  createGameResult.message
                )
              )
            )
          }

          const { gameId } = createGameResult.data
          Games.set(gameId, {
            white: waitingPlayer.socket,
            black: ws,
          })
          const response = JSON.stringify(
            makeJoinGameResponseMessage({
              gameId,
            })
          )

          ws.send(response)
          waitingPlayer.socket.send(response)
          return
        }
      }
      return
    })
    .with({ type: RequestMessageTypes.GET_GAME }, async ({ payload }) => {
      const { gameId, playerId } = payload
      const gameSockets = Games.get(gameId)

      const gameResult = await context.Loader.GameLoader.getGameById(
        gameId,
        true
      )
      if (isFailure(gameResult)) {
        ws.send(
          JSON.stringify(
            makeErrorMessage("Failed to get game", gameResult.message)
          )
        )
        return
      }
      const game = gameResult.data
      if (!game) {
        ws.send(JSON.stringify(makeErrorMessage("Game not found", null)))
        return
      }

      const response = JSON.stringify(makeGameFoundResponseMessage(game))

      const color =
        game.whitePlayer._id.toString() === playerId ? "white" : "black"
      if (!gameSockets) {
        Games.set(gameId, {
          white: color === "white" ? ws : null,
          black: color === "black" ? ws : null,
        })
        return ws.send(response)
      }

      const currentColorSocket = gameSockets[color]
      if (!currentColorSocket || currentColorSocket !== ws) {
        Games.set(gameId, {
          ...gameSockets,
          [color]: ws,
        })
      }
      gameSockets[color] = ws

      gameSockets.black?.send(response)
      gameSockets.white?.send(response)
      return
    })
    .with({ type: RequestMessageTypes.MOVE }, async ({ payload }) => {
      const { gameId, playerId, move } = payload
      let gameSockets = Games.get(gameId)

      const isValidMove = validateMove(move.before, move.san)
      if (!isValidMove) {
        ws.send(JSON.stringify(makeErrorMessage("Invalid move", { move })))
        return
      }

      const status = getStatus(move.after)

      const gameResult = await context.Loader.GameLoader.getGameById(
        gameId,
        true
      )
      if (isFailure(gameResult)) {
        ws.send(
          JSON.stringify(
            makeErrorMessage("Failed to get game", gameResult.message)
          )
        )
        return
      }

      const game = gameResult.data
      if (!game) {
        ws.send(JSON.stringify(makeErrorMessage("Game not found", null)))
        return
      }

      const headers: { [key: string]: string } = {
        Event: "Live Chess",
        Site: "chess-app",
        White: game.whitePlayer.username,
        Black: game.blackPlayer.username,
        UTCDate: game.createdAt.toISOString().split("T")[0],
        UTCTime: game.createdAt.toISOString().split("T")[1].split(".")[0],
        WhiteElo: game.whitePlayer.rating.toString(),
        BlackElo: game.blackPlayer.rating.toString(),
        Result: "*",
      }
      if (status === GameStatus.CHECKMATE) {
        headers.Result = move.color === "w" ? "1-0" : "0-1"
      } else if (status === GameStatus.STALEMATE) {
        headers.Result = "1/2-1/2"
      }
      const pgn = createPgnFromMoves(
        [...game.moves, move].map((m) => m.san),
        headers
      )

      const addMoveResult = await context.Mutator.GameMutator.addMoveToGame({
        gameId,
        move,
        status,
        pgn,
      })

      if (isFailure(addMoveResult)) {
        ws.send(
          JSON.stringify(
            makeErrorMessage(
              "Failed to add move to game",
              addMoveResult.message
            )
          )
        )
        return
      }

      const otherPlayer =
        game.whitePlayer._id.toString() === playerId ? "black" : "white"

      if (!gameSockets) {
        Games.set(gameId, {
          white: otherPlayer === "black" ? ws : null,
          black: otherPlayer === "white" ? ws : null,
        })
        return
      }

      const gameOverOutcomes = [
        GameStatus.CHECKMATE,
        GameStatus.STALEMATE,
        GameStatus.THREE_MOVE_REPETITION,
        GameStatus.INSUFFICIENT_MATERIAL,
        GameStatus.FIFTY_MOVE_RULE,
      ]
      if (gameOverOutcomes.includes(status)) {
        const newRatings = {
          whiteRating: game.whitePlayer.rating,
          blackRating: game.blackPlayer.rating,
        }
        const outcome = {
          winner: status === GameStatus.CHECKMATE ? move.color : null,
          draw: status !== GameStatus.CHECKMATE,
        }
        const whiteWins = move.color === "w"
        if (status === GameStatus.CHECKMATE) {
          newRatings.whiteRating = whiteWins
            ? game.outcomes.whiteWins.whiteRating
            : game.outcomes.blackWins.whiteRating
          newRatings.blackRating = whiteWins
            ? game.outcomes.whiteWins.blackRating
            : game.outcomes.blackWins.blackRating
        } else {
          newRatings.whiteRating = game.outcomes.draw.whiteRating
          newRatings.blackRating = game.outcomes.draw.blackRating
        }

        const {
          Mutator: { UserMutator, GameMutator },
        } = context

        await Promise.all([
          GameMutator.setOutcome(gameId, outcome.winner, outcome.draw),
          UserMutator.updateUserRating(
            game.whitePlayer._id,
            newRatings.whiteRating
          ),
          UserMutator.updateUserRating(
            game.blackPlayer._id,
            newRatings.blackRating
          ),
        ])

        PlayersInActiveGames.delete(game.whitePlayer._id.toString())
        PlayersInActiveGames.delete(game.blackPlayer._id.toString())
        Games.delete(gameId)
      }

      gameSockets[otherPlayer]?.send(
        JSON.stringify(makeMoveResponseMessage({ fen: move.after, pgn }))
      )

      return
    })

    .exhaustive()
}

enum MessageResponseType {
  FETCH_GAME_RESPONSE = "fetch-game-response",
  JOIN_GAME_RESPONSE = "join-game-response",
  MOVE_RESPONSE = "move-response",
  ERROR = "error",
}

type FetchGameResponseMessage = {
  type: MessageResponseType.FETCH_GAME_RESPONSE
  payload: Game
}
type JoinGameResponseMessage = {
  type: MessageResponseType.JOIN_GAME_RESPONSE
  payload: {
    gameId: string
  }
}
type MoveResponseMessage = {
  type: MessageResponseType.MOVE_RESPONSE
  payload: {
    fen: string
    pgn: string
  }
}
type ErrorResponseMessage = {
  type: MessageResponseType.ERROR
  payload: {
    message: string
    error: unknown
  }
}

const makeErrorMessage = (
  message: string,
  error: unknown
): ErrorResponseMessage => ({
  type: MessageResponseType.ERROR,
  payload: {
    message,
    error,
  },
})

const makeGameFoundResponseMessage = (
  payload: GameDocument
): FetchGameResponseMessage => {
  return {
    type: MessageResponseType.FETCH_GAME_RESPONSE,
    payload: makeGameDTO(payload),
  }
}

const makeJoinGameResponseMessage = (payload: {
  gameId: string
}): JoinGameResponseMessage => ({
  type: MessageResponseType.JOIN_GAME_RESPONSE,
  payload: {
    gameId: payload.gameId,
  },
})

const makeMoveResponseMessage = (payload: {
  fen: string
  pgn: string
}): MoveResponseMessage => ({
  type: MessageResponseType.MOVE_RESPONSE,
  payload,
})
