import { RawData, WebSocketServer, type WebSocket } from "ws"
import { getUsersByIds } from "./repository/user"
import {
  addMoveToGame,
  createGame,
  GameDocument,
  GameStatus,
  getGameById,
} from "./repository/game"
import { IncomingMessage } from "node:http"
import internal from "node:stream"
import { z } from "zod"
import { match } from "ts-pattern"
import { command_CreateGame } from "./commands/create-game"
import { isFailure } from "./lib/result"
import { makeUserDto, User } from "./domain/user"
import { moveSchema } from "./domain/game"

export const webSocketServer = new WebSocketServer({
  clientTracking: false,
  noServer: true,
})

const Queue: {
  playerId: string
  socket: WebSocket
}[] = []
const Games = new Map<
  string,
  { white: WebSocket | null; black: WebSocket | null }
>()

webSocketServer.on("connection", (ws) => {
  ws.on("error", (err) => {})

  ws.on("message", async (message) => {
    messageHandler(ws, message)
  })

  ws.on("close", () => {
    console.log("client disconnected")
  })
})

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

  webSocketServer.handleUpgrade(req, socket, head, (ws) => {
    webSocketServer.emit("connection", ws, req)
  })
}

const messageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("join-game"),
    payload: z.object({
      playerId: z.string(),
    }),
  }),
  z.object({
    type: z.literal("get-game"),
    payload: z.object({
      gameId: z.string(),
      playerId: z.string(),
    }),
  }),
  z.object({
    type: z.literal("move"),
    payload: z.object({
      gameId: z.string(),
      playerId: z.string(),
      move: moveSchema,
      status: z.nativeEnum(GameStatus),
      pgn: z.string(),
    }),
  }),
])

const messageHandler = (ws: WebSocket, data: RawData) => {
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

  match(parsedMessage.data)
    .with({ type: "join-game" }, async ({ payload }) => {
      const { playerId } = payload
      const alreadyWaiting = Queue.find(
        (player) => player.playerId === playerId
      )
      if (!alreadyWaiting) {
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
          const createGameResult = await command_CreateGame([
            waitingPlayer.playerId,
            newPlayerId,
          ])

          if (isFailure(createGameResult)) {
            Queue.unshift(waitingPlayer)
            Queue.push({
              playerId: newPlayerId,
              socket: ws,
            })
            return ws.send(
              JSON.stringify(
                makeErrorMessage(
                  "Failed to create game",
                  createGameResult.message
                )
              )
            )
          }

          const { gameId, whitePlayer } = createGameResult.data
          Games.set(gameId, {
            white: waitingPlayer.socket,
            black: ws,
          })
          const response = JSON.stringify(
            makeGameCreatedMessage({
              gameId,
              whitePlayerId: whitePlayer.id,
              pgn: "",
            })
          )
          ws.send(response)
          waitingPlayer.socket.send(response)
          return
        }
      }
      return
    })
    .with({ type: "get-game" }, async ({ payload }) => {
      const { gameId, playerId } = payload

      const gameResult = await getGameById(gameId)
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

      const gameSockets = Games.get(gameId)
      const response = JSON.stringify(makeGameFoundMessage(game))

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
    .with({ type: "move" }, async ({ payload }) => {
      const { gameId, playerId, move, status, pgn } = payload
      let gameSockets = Games.get(gameId)

      const addMoveResult = await addMoveToGame({
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

      const game = addMoveResult.data

      if (!game) {
        ws.send(JSON.stringify(makeErrorMessage("Game not found", null)))
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

      gameSockets[otherPlayer]?.send(
        JSON.stringify(makeMoveMessage({ fen: move.after, pgn }))
      )

      return
    })
    .exhaustive()
}

type GameFoundMessage = {
  type: "game-found"
  payload: Omit<GameDocument, "whitePlayer" | "blackPlayer"> & {
    whitePlayer: User
    blackPlayer: User
  }
}
type GameCreatedMessage = {
  type: "game-created"
  payload: {
    gameId: string
    pgn: string
    whitePlayerId: string
  }
}
type MoveMessage = {
  type: "move"
  payload: {
    fen: string
    pgn: string
  }
}
type ErrorMessage = {
  type: "error"
  payload: {
    message: string
    error: unknown
  }
}

const makeErrorMessage = (message: string, error: unknown): ErrorMessage => ({
  type: "error",
  payload: {
    message,
    error,
  },
})

const makeGameFoundMessage = (payload: GameDocument): GameFoundMessage => {
  return {
    type: "game-found",
    payload: {
      ...payload,
      whitePlayer: makeUserDto(payload.whitePlayer),
      blackPlayer: makeUserDto(payload.blackPlayer),
    },
  }
}

const makeGameCreatedMessage = (payload: {
  gameId: string
  whitePlayerId: string
  pgn: string
}): GameCreatedMessage => ({
  type: "game-created",
  payload,
})

const makeMoveMessage = (payload: {
  fen: string
  pgn: string
}): MoveMessage => ({
  type: "move",
  payload,
})
