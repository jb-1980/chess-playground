import { createEffect, createSignal } from "solid-js"
import { retrieveToken } from "../../../../lib/token"
import { createWS } from "@solid-primitives/websocket"
export enum ResponseMessageType {
  JOIN_GAME_RESPONSE = "join-game-response",
  ERROR = "error",
}

type ResponseMessage =
  | {
      type: ResponseMessageType.JOIN_GAME_RESPONSE
      payload: {
        gameId: string
      }
    }
  | {
      type: ResponseMessageType.ERROR
      payload: {
        message: string
      }
    }

export const useJoinGameSocket = (playerId: string) => {
  const token = retrieveToken()
  const ws = createWS(import.meta.env.VITE_WEBSOCKET_URL, [
    "Bearer",
    token ?? "",
  ])

  const [lastJsonMessage, setLastJsonMessage] =
    createSignal<ResponseMessage | null>(null)
  ws.send(
    JSON.stringify({
      type: "join-game",
      payload: {
        playerId,
      },
    }),
  )
  ws.addEventListener("message", (event) => {
    console.log("event.data", event.data)
    setLastJsonMessage(JSON.parse(event.data))
  })

  return lastJsonMessage
}
