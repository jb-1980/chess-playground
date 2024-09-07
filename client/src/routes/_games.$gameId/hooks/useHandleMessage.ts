import { Move } from "chess.js"
import { useCallback } from "react"
import { Game, GameStatus } from "../types"
import useWebsocket from "react-use-websocket"

export enum ResponseMessageType {
  FETCH_GAME_RESPONSE = "fetch-game-response",
  JOIN_GAME_RESPONSE = "join-game-response",
  MOVE_RESPONSE = "move-response",
  ERROR = "error",
}

export enum RequestMessageTypes {
  MOVE = "move",
  JOIN_GAME = "join-game",
  GET_GAME = "get-game",
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
export const useGameSocket = () => {
  const {
    sendJsonMessage: _sendJsonMessage,
    lastJsonMessage,
    readyState,
  } = useWebsocket<ResponseMessage>("ws://localhost:5000")

  const sendJsonMessage = useCallback(
    (message: RequestMessage) => {
      _sendJsonMessage(message)
    },
    [_sendJsonMessage]
  )
  return { sendJsonMessage, lastJsonMessage, readyState }
}
