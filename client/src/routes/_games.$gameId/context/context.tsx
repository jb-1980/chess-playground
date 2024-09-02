import { Chess } from "chess.js"
import { createContext, useCallback, useEffect, useMemo } from "react"
import { getStatus } from "../lib/getStatus"
import type { GameContextValues } from "./types"
import { useNavigate, useParams } from "react-router-dom"
import { useUserContext } from "../../Root/context"
import { GameActions, useChess } from "../hooks/useChess"
import { GameStatus } from "../types"
import { useGameSocket } from "../hooks/useHandleMessage"

export const GameContext = createContext<GameContextValues | undefined>(
  undefined
)

export const GameContextProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { sendJsonMessage, lastJsonMessage } = useGameSocket()
  const gameId = useParams().gameId!
  const navigate = useNavigate()
  const { id: playerId } = useUserContext()
  const chess = useMemo(() => new Chess(), [])
  const [gameState, dispatch] = useChess(playerId)

  console.log({ gameState })

  const { turn, myColor, fen, status } = gameState
  const onMove = useCallback(
    (move: { from: string; to: string; promotion: string }) => {
      if (turn !== myColor) {
        return false
      }
      try {
        // will throw an "Illegal move" error if the move is invalid
        const _move = chess.move(move)
        const _status = getStatus(chess)
        console.log({ _move, _status })
        dispatch({
          type: GameActions.SET_MOVE,
          payload: { fen: chess.fen(), status: _status },
        })

        sendJsonMessage({
          type: "move",
          gameId,
          move: {
            ..._move,
            number: chess.moveNumber(),
          },
          pgn: chess.pgn(),
          status: _status,
          playerId,
        })
        return true
      } catch (err) {
        console.log({ err })
        if (err instanceof Error && err.message === "Illegal move") {
          return false
        }
        throw err
      }
    },
    [chess, gameId, sendJsonMessage, myColor, turn, dispatch, playerId]
  )

  useEffect(() => {
    if (lastJsonMessage !== null) {
      switch (lastJsonMessage.type) {
        case "game-found": {
          const { game } = lastJsonMessage
          chess.loadPgn(game.pgn)
          dispatch({
            type: GameActions.SET_GAME,
            payload: lastJsonMessage.game,
          })
          break
        }
        case "game-created": {
          const { gameId, whitePlayerId } = lastJsonMessage
          dispatch({
            type: GameActions.CREATE_GAME,
            payload: { whitePlayerId: whitePlayerId },
          })
          navigate(`/games/${gameId}`)
          break
        }
        case "move": {
          const { fen } = lastJsonMessage
          chess.load(fen)
          dispatch({
            type: GameActions.SET_MOVE,
            payload: { fen, status: getStatus(chess) },
          })
          break
        }
      }
    }
  }, [lastJsonMessage, navigate, chess, playerId, dispatch])

  useEffect(() => {
    if (gameId === "new") {
      sendJsonMessage({ type: "join-game", playerId })
    } else if (status === GameStatus.NOT_STARTED) {
      sendJsonMessage({ type: "get-game", gameId, playerId })
    } else if (
      ![
        GameStatus.PLAYING,
        GameStatus.CHECKMATE,
        GameStatus.STALEMATE,
        GameStatus.THREE_MOVE_REPETITION,
        GameStatus.INSUFFICIENT_MATERIAL,
        GameStatus.FIFTY_MOVE_RULE,
      ].includes(status)
    ) {
      dispatch({ type: GameActions.JOIN_GAME })
    }
  }, [gameId, playerId, sendJsonMessage, status, dispatch])

  const value = useMemo(
    () => ({ status, fen, turn, myColor, onMove }),
    [status, fen, turn, onMove, myColor]
  )

  if ([GameStatus.NOT_STARTED, GameStatus.JOINING].includes(status)) {
    return <div>Loading...</div>
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
