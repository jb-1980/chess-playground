import type { WebSocket } from "ws"
import { GameDocument } from "../repository/game"
import { Game, makeGameDTO } from "../domain/game"

export type TaggedWebSocket = WebSocket & { id: string }

export const Queue = new Set<string>()
export const PlayersInActiveGames = new Set<string>()

type Topics = `JOIN_GAME.${string}` | `OBSERVE_GAME.${string}`

type PublishArgs =
  | {
      topic: `JOIN_GAME.${string}`
      payload: JoinGameResponseMessage | ErrorResponseMessage
    }
  | {
      topic: `OBSERVE_GAME.${string}`
      payload: ObserveGameResponseMessage | ErrorResponseMessage
    }

export class SimplePubSub {
  _topics = new Map<Topics, TaggedWebSocket[]>()
  constructor() {}

  get topics() {
    return this._topics
  }

  publish(args: PublishArgs, filter?: (ws: TaggedWebSocket) => boolean) {
    const { topic, payload } = args
    let subscribers = this._topics.get(topic)
    if (!subscribers) {
      return
    }

    if (filter) {
      subscribers = subscribers.filter(filter)
    }
    subscribers.forEach((ws) => {
      ws.send(JSON.stringify(payload))
    })
  }

  subscribe(topic: Topics, ws: TaggedWebSocket) {
    const subscribers = this._topics.get(topic)
    if (!subscribers) {
      this._topics.set(topic, [ws])
      return
    }

    const websocketIds = subscribers.map((ws) => (ws as TaggedWebSocket).id)
    if (websocketIds.includes(ws.id)) {
      return
    }
    this._topics.set(topic, [ws, ...subscribers])
  }

  unsubscribe(topic: Topics, ws: TaggedWebSocket) {
    const subscribers = this._topics.get(topic)
    if (!subscribers) {
      return
    }

    this._topics.set(
      topic,
      subscribers.filter((subscriber) => subscriber !== ws),
    )
  }
}

enum MessageResponseType {
  JOIN_GAME_RESPONSE = "join-game-response",
  OBSERVE_GAME = "move-response",
  ERROR = "error",
}

type ObserveGameResponseMessage = {
  type: MessageResponseType.OBSERVE_GAME
  payload: Game
}

type JoinGameResponseMessage = {
  type: MessageResponseType.JOIN_GAME_RESPONSE
  payload: {
    gameId: string
  }
}

type ErrorResponseMessage = {
  type: MessageResponseType.ERROR
  payload: {
    message: string
    error: unknown
  }
}

export const makeObserveGameResponseMessage = (
  payload: GameDocument,
): ObserveGameResponseMessage => {
  return {
    type: MessageResponseType.OBSERVE_GAME,
    payload: makeGameDTO(payload),
  }
}

export const makeJoinGameResponseMessage = (payload: {
  gameId: string
}): JoinGameResponseMessage => ({
  type: MessageResponseType.JOIN_GAME_RESPONSE,
  payload: {
    gameId: payload.gameId,
  },
})

export const makeErrorMessage = (
  message: string,
  error: unknown,
): ErrorResponseMessage => ({
  type: MessageResponseType.ERROR,
  payload: {
    message,
    error,
  },
})
