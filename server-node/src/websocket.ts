import { RawData, WebSocketServer, type WebSocket } from "ws"
import { getUsersByIds } from "./repository/user"
import {
  addMoveToGame,
  createGame,
  GameStatus,
  getGameById,
} from "./repository/game"
import { IncomingMessage } from "node:http"
import internal from "node:stream"
import { z } from "zod"
import { match } from "ts-pattern"

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

const messageSchema = z.union([
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
      move: z.object({
        san: z.string(),
        number: z.number(),
        color: z.enum(["w", "b"]),
        after: z.string(),
        promotion: z.string(),
      }),
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
          const waitingPlayerId = waitingPlayer.playerId
          const users = await getUsersByIds([newPlayerId, waitingPlayerId])

          // randomly choose a player to be white
          const whitePlayer = users[Math.round(Math.random())]
          const blackPlayer = users.find(
            (user) => user.username !== whitePlayer.username
          )

          if (!whitePlayer || !blackPlayer) {
            ws.send(
              JSON.stringify({
                type: "error",
                payload: {
                  message: "Could not find players",
                  error: null,
                },
              })
            )
            return
          }

          const gameId = await createGame(
            {
              _id: whitePlayer._id,
              username: whitePlayer.username,
            },
            {
              _id: blackPlayer._id,
              username: blackPlayer.username,
            }
          )

          Games.set(gameId, {
            white: waitingPlayer.socket,
            black: ws,
          })
          const response = JSON.stringify({
            type: "game-created",
            payload: {
              gameId,
              whitePlayerId: whitePlayer._id,
            },
          })
          ws.send(response)
          waitingPlayer.socket.send(response)
          return
        }
      }
      return
    })
    .with({ type: "get-game" }, async ({ payload }) => {
      const { gameId, playerId } = payload

      const game = await getGameById(gameId)
      if (!game) {
        ws.send(
          JSON.stringify({
            type: "error",
            payload: {
              message: "Game not found",
              error: null,
            },
          })
        )
        return
      }

      const gameSockets = Games.get(gameId)
      const response = JSON.stringify({
        type: "game-found",
        payload: {
          game,
        },
      })

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

      const game = await addMoveToGame({
        gameId,
        move: {
          move: move.san,
          number: move.number,
          player: move.color,
          promotion: move.promotion,
          fen: move.after,
          createdAt: new Date(),
        },
        status,
        pgn,
      })

      if (!game) {
        ws.send(
          JSON.stringify({
            type: "error",
            payload: {
              message: "Game not found",
              error: null,
            },
          })
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

      gameSockets[otherPlayer]?.send(
        JSON.stringify({
          type: "move",
          payload: {
            fen: payload.move.after,
          },
        })
      )

      return
    })
    .exhaustive()
}
