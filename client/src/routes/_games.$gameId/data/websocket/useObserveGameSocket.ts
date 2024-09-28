import useWebsocket, { ReadyState } from "react-use-websocket"
import { retrieveToken } from "../../../../lib/token"
import { useEffect, useState } from "react"
import { Game } from "../../../../types/game"

export enum ResponseMessageType {
  FETCH_GAME_RESPONSE = "fetch-game-response",
  ERROR = "error",
}

type ResponseMessage =
  | {
      type: ResponseMessageType.FETCH_GAME_RESPONSE
      payload: Game
    }
  | {
      type: ResponseMessageType.ERROR
      payload: {
        message: string
      }
    }

export const useObserveGameSocket = (playerId: string) => {
  const token = retrieveToken()
  const { sendJsonMessage, lastJsonMessage, readyState } =
    useWebsocket<ResponseMessage>(import.meta.env.VITE_WEBSOCKET_URL, {
      protocols: ["Bearer", token ?? ""],
    })

  const [messageSent, setMessageSent] = useState(false)

  useEffect(() => {
    if (readyState === ReadyState.OPEN && !messageSent) {
      sendJsonMessage({
        type: "get-game",
        payload: {
          gameId: "string",
          playerId: "string",
        },
      })
      setMessageSent(true)
    }
  }, [readyState, messageSent, playerId, sendJsonMessage])
  return { lastJsonMessage, readyState }
}
