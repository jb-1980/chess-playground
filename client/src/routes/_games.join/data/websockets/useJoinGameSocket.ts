import useWebsocket, { ReadyState } from "react-use-websocket"
import { retrieveToken } from "../../../../lib/token"
import { useEffect, useState } from "react"

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
  const { sendJsonMessage, lastJsonMessage, readyState } =
    useWebsocket<ResponseMessage>(import.meta.env.VITE_WEBSOCKET_URL, {
      protocols: ["Bearer", token ?? ""],
    })

  const [messageSent, setMessageSent] = useState(false)

  useEffect(() => {
    if (readyState === ReadyState.OPEN && !messageSent) {
      sendJsonMessage({
        type: "join-game",
        payload: {
          playerId,
        },
      })
      setMessageSent(true)
    }
  }, [readyState, messageSent, playerId, sendJsonMessage])
  return { lastJsonMessage, readyState }
}
