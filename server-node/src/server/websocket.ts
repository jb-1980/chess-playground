import { RawData, WebSocketServer } from "ws"
import { IncomingMessage } from "node:http"
import internal from "node:stream"
import { z } from "zod"
import { match } from "ts-pattern"
import { Context, createContext } from "../middleware/context/context"
import { verifyToken } from "../middleware/auth"
import { User } from "../domain/user"
import {
  Queue,
  SimplePubSub,
  TaggedWebSocket,
  makeErrorMessage,
} from "../lib/pubsub"
import {
  joinGameMessage,
  subscription_joinGame,
} from "../subscriptions/join-game"
import {
  observeGameMessage,
  subscription_ObserveGame,
} from "../subscriptions/observe-game"

export const webSocketServer = new WebSocketServer({
  clientTracking: false,
  noServer: true,
})

export interface ExtWebSocket extends TaggedWebSocket {
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
  ws.on("error", (err) => {
    console.error(err)
  })

  ws.on("message", async (message) => {
    messageHandler(ws, message)
  })

  ws.on("close", (...args) => {
    console.dir(args, { depth: null })
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

const messageSchema = z.discriminatedUnion("type", [
  joinGameMessage,
  observeGameMessage,
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
    .with({ type: "join-game" }, async ({ payload }) => {
      subscription_joinGame(payload, ws)
    })
    .with({ type: "observe-game" }, async ({ payload }) => {
      subscription_ObserveGame(payload, ws)
    })
    .exhaustive()
}
