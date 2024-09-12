import { Move } from "chess.js"
import { useCallback } from "react"
import useWebsocket from "react-use-websocket"
import { retrieveToken } from "../../../lib/token"
import { Game, GameStatus } from "../../../types/game"

export enum ResponseMessageType {
  FETCH_GAME_RESPONSE = "fetch-game-response",
  JOIN_GAME_RESPONSE = "join-game-response",
  MOVE_RESPONSE = "move-response",
  ERROR = "error",
  PING = "ping",
}

export enum RequestMessageTypes {
  MOVE = "move",
  JOIN_GAME = "join-game",
  GET_GAME = "get-game",
  PONG = "pong",
}

type ResponseMessage =
  | {
      type: ResponseMessageType.FETCH_GAME_RESPONSE
      payload: Game
    }
  | {
      type: ResponseMessageType.JOIN_GAME_RESPONSE
      payload: {
        gameId: string
      }
    }
  | {
      type: ResponseMessageType.MOVE_RESPONSE
      payload: {
        fen: string
        pgn: string
      }
    }
  | {
      type: ResponseMessageType.ERROR
      payload: {
        message: string
      }
    }
  | {
      type: ResponseMessageType.PING
    }

type RequestMessage =
  | {
      type: RequestMessageTypes.MOVE
      payload: {
        gameId: string
        playerId: string
        move: Move & { number: number }
        status: GameStatus
        pgn: string
      }
    }
  | {
      type: RequestMessageTypes.JOIN_GAME
      payload: {
        playerId: string
      }
    }
  | {
      type: RequestMessageTypes.GET_GAME
      payload: {
        gameId: string
        playerId: string
      }
    }
  | {
      type: RequestMessageTypes.PONG
    }
export const useGameSocket = () => {
  const token = retrieveToken()
  const {
    sendJsonMessage: _sendJsonMessage,
    lastJsonMessage,
    lastMessage,
    readyState,
  } = useWebsocket<ResponseMessage>(import.meta.env.VITE_WEBSOCKET_URL, {
    protocols: ["Bearer", token ?? ""],
  })

  console.log({ lastMessage })
  const sendJsonMessage = useCallback(
    (message: RequestMessage) => {
      _sendJsonMessage(message)
    },
    [_sendJsonMessage]
  )
  return { sendJsonMessage, lastJsonMessage, readyState }
}
