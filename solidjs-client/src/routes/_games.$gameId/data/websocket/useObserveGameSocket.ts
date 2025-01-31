import { createWS } from "@solid-primitives/websocket"
import { retrieveToken } from "../../../../lib/token"
import { Game } from "../../../../types/game"
import { createSignal } from "solid-js"

export enum ResponseMessageType {
  MOVE_RESPONSE = "move-response",
  ERROR = "error",
}

type ResponseMessage =
  | {
      type: ResponseMessageType.MOVE_RESPONSE
      payload: Game
    }
  | {
      type: ResponseMessageType.ERROR
      payload: {
        message: string
      }
    }

export const useObserveGameSocket = (gameId: string) => {
  // const token = retrieveToken()
  // const { sendJsonMessage, lastJsonMessage, readyState } =
  //   useWebsocket<ResponseMessage>(import.meta.env.VITE_WEBSOCKET_URL, {
  //     protocols: ["Bearer", token ?? ""],
  //   })

  // const [messageSent, setMessageSent] = useState(false)

  const token = retrieveToken()
  const ws = createWS(import.meta.env.VITE_WEBSOCKET_URL, [
    "Bearer",
    token ?? "",
  ])

  const [lastJsonMessage, setLastJsonMessage] =
    createSignal<ResponseMessage | null>(null)
  ws.send(
    JSON.stringify({
      type: "observe-game",
      payload: {
        gameId,
      },
    }),
  )
  ws.addEventListener("message", (event) => {
    console.log("event.data", event.data)
    setLastJsonMessage(JSON.parse(event.data))
  })

  return lastJsonMessage
}
