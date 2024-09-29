import useWebsocket, { ReadyState } from "react-use-websocket"
import { retrieveToken } from "../../../../lib/token"
import { useEffect, useState } from "react"
import { Game } from "../../../../types/game"

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
  const token = retrieveToken()
  const { sendJsonMessage, lastJsonMessage, readyState } =
    useWebsocket<ResponseMessage>(import.meta.env.VITE_WEBSOCKET_URL, {
      protocols: ["Bearer", token ?? ""],
    })

  const [messageSent, setMessageSent] = useState(false)

  useEffect(() => {
    if (readyState === ReadyState.OPEN && !messageSent) {
      sendJsonMessage({
        type: "observe-game",
        payload: {
          gameId,
        },
      })
      setMessageSent(true)
    }
  }, [readyState, messageSent, gameId, sendJsonMessage])
  return { lastJsonMessage, readyState }
}
