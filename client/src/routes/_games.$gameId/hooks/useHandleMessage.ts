import { Move } from "chess.js"
import { useCallback } from "react"
import { Game, GameStatus } from "../types"
import useWebsocket from "react-use-websocket"

type ResponseMessage =
  | {
      type: "game-found"
      game: Game
    }
  | {
      type: "game-created"
      gameId: string
      whitePlayerId: string
    }
  | {
      type: "move"
      fen: string
    }

type RequestMessage =
  | {
      type: "move"
      gameId: string
      playerId: string
      move: Move & { number: number }
      status: GameStatus
      pgn: string
    }
  | {
      type: "join-game"
      playerId: string
    }
  | {
      type: "get-game"
      gameId: string
      playerId: string
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
