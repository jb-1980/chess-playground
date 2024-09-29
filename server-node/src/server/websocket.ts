import { RawData, WebSocketServer } from "ws"
import { IncomingMessage } from "node:http"
import internal from "node:stream"
import { z } from "zod"
import { match } from "ts-pattern"
import { command_CreateGame } from "../commands/create-game"
import { isFailure } from "../lib/result"
import { Context, createContext } from "../middleware/context"
import { verifyToken } from "../middleware/auth"
import { User } from "../domain/user"
import {
  PlayersInActiveGames,
  Queue,
  SimplePubSub,
  TaggedWebSocket,
  makeErrorMessage,
  makeJoinGameResponseMessage,
} from "../lib/pubsub"
import { shiftSet } from "../lib/set-utils"

export const webSocketServer = new WebSocketServer({
  clientTracking: false,
  noServer: true,
})

interface ExtWebSocket extends TaggedWebSocket {
  context: Context
}

function onSocketError(err: Error) {
  console.error(err)
}

export const pubsub = new SimplePubSub()

export const handleUpgrade = (
  req: IncomingMessage,
  socket: internal.Duplex,
  head: Buffer,
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
    wsWithExt.id = user.id
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
    const inQueue = Queue.has(playerId)
    if (inQueue) {
      Queue.delete(playerId)
    }
    const topics = pubsub.topics
    for (const [topic, sockets] of topics) {
      for (const socket of sockets) {
        if (socket.id === playerId) {
          pubsub.unsubscribe(topic, socket)
        }
      }
    }
  })
})

const placeInQueue = (playerId: string, context: Context) =>
  new Promise<string | null>((resolve) => {
    const now = Date.now()
    // try for 30 seconds to find a match, else return no match found
    const timeout = now + 30000
    const interval = setInterval(async () => {
      if (Date.now() > timeout) {
        pubsub.publish({
          topic: `JOIN_GAME.${playerId}`,
          payload: makeErrorMessage("No match found", null),
        })
        if (Queue.has(playerId)) {
          Queue.delete(playerId)
        }
        clearInterval(interval)
        return resolve(null)
      }
      if (PlayersInActiveGames.has(playerId)) {
        clearInterval(interval)
        return resolve(null)
      }

      // check if this user has already joined the queue
      const alreadyWaiting = Queue.has(playerId)
      if (!alreadyWaiting) {
        // there is no one in the queue, so add this user to the queue and return
        if (Queue.size === 0) {
          Queue.add(playerId)
          return null
        }

        const newPlayerId = playerId
        const waitingPlayerId = shiftSet(Queue)

        if (waitingPlayerId) {
          PlayersInActiveGames.add(waitingPlayerId)
          PlayersInActiveGames.add(newPlayerId)
          // generate a random objectId string
          const createGameResult = await command_CreateGame(
            [newPlayerId, waitingPlayerId],
            context,
          )

          if (isFailure(createGameResult)) {
            const message = makeErrorMessage(
              "Error creating game",
              createGameResult.message,
            )
            pubsub.publish({
              topic: `JOIN_GAME.${playerId}`,
              payload: message,
            })
            pubsub.publish({
              topic: `JOIN_GAME.${waitingPlayerId}`,
              payload: message,
            })
            clearInterval(interval)
            return resolve(null)
          }

          const message = makeJoinGameResponseMessage({
            gameId: createGameResult.data.gameId,
          })
          pubsub.publish({
            topic: `JOIN_GAME.${playerId}`,
            payload: message,
          })
          pubsub.publish({
            topic: `JOIN_GAME.${waitingPlayerId}`,
            payload: message,
          })
          clearInterval(interval)
          return resolve(createGameResult.data.gameId)
        }
      }
      return null
    }, 1000)
  })

enum RequestMessageTypes {
  JOIN_GAME = "join-game",
  OBSERVE_GAME = "observe-game",
}

const messageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(RequestMessageTypes.JOIN_GAME),
    payload: z.object({
      playerId: z.string(),
    }),
  }),
  z.object({
    type: z.literal(RequestMessageTypes.OBSERVE_GAME),
    payload: z.object({
      gameId: z.string(),
    }),
  }),
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
      }),
    )
  }

  const context = ws.context
  const user = context.user
  if (!user) {
    return ws.send(
      JSON.stringify(
        makeErrorMessage("Unauthorized", "User not found in context"),
      ),
    )
  }

  match(parsedMessage.data)
    .with({ type: RequestMessageTypes.JOIN_GAME }, async ({ payload }) => {
      const { playerId } = payload
      pubsub.subscribe(`JOIN_GAME.${playerId}`, ws)
      placeInQueue(playerId, context)
    })
    .with({ type: RequestMessageTypes.OBSERVE_GAME }, async ({ payload }) => {
      const { gameId } = payload
      pubsub.subscribe(`OBSERVE_GAME.${gameId}`, ws)
    })
    .exhaustive()
}
