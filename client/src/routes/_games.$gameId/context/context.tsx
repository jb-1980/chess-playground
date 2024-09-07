import { Chess } from "chess.js"
import { createContext, useCallback, useEffect, useMemo } from "react"
import { getStatus } from "../lib/getStatus"
import type { GameContextValues } from "./types"
import { useNavigate, useParams } from "react-router-dom"
import { useUserContext } from "../../Root/context"
import { GameActions, useChess } from "../hooks/useChess"
import { GameStatus } from "../types"
import {
  RequestMessageTypes,
  ResponseMessageType,
  useGameSocket,
} from "../hooks/useHandleMessage"

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

  const { turn, myColor, fen, status, whitePlayer, blackPlayer } = gameState
  const onMove = useCallback(
    (move: { from: string; to: string; promotion: string }) => {
      if (turn !== myColor) {
        return false
      }
      try {
        // will throw an "Illegal move" error if the move is invalid
        const _move = chess.move(move)
        const _status = getStatus(chess)
        console.log({ _move, _status, pgn: chess.pgn() })
        dispatch({
          type: GameActions.SET_MOVE,
          payload: { fen: chess.fen(), status: _status },
        })

        sendJsonMessage({
          type: RequestMessageTypes.MOVE,
          payload: {
            gameId,
            move: {
              ..._move,
              number: chess.moveNumber(),
            },
            pgn: chess.pgn(),
            status: _status,
            playerId,
          },
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
        case ResponseMessageType.FETCH_GAME_RESPONSE: {
          const game = lastJsonMessage.payload
          console.log({ GameFoundPGN: game.pgn })
          chess.loadPgn(game.pgn)
          dispatch({
            type: GameActions.FETCH_GAME,
            payload: game,
          })
          if (game.id !== gameId) {
            navigate(`/games/${game.id}`)
          }
          break
        }
        case ResponseMessageType.JOIN_GAME_RESPONSE: {
          const { gameId } = lastJsonMessage.payload
          navigate(`/games/${gameId}`)
          break
        }
        case ResponseMessageType.MOVE_RESPONSE: {
          const { pgn, fen } = lastJsonMessage.payload
          chess.loadPgn(pgn)
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
    if (gameId === "new" && status === GameStatus.NOT_STARTED) {
      dispatch({ type: GameActions.JOIN_GAME })
      sendJsonMessage({
        type: RequestMessageTypes.JOIN_GAME,
        payload: { playerId },
      })
    } else if (status === GameStatus.JOINING) {
      sendJsonMessage({
        type: RequestMessageTypes.GET_GAME,
        payload: { gameId, playerId },
      })
    }
  }, [gameId, playerId, sendJsonMessage, status, dispatch])

  const value = useMemo(
    () => ({ status, fen, turn, myColor, whitePlayer, blackPlayer, onMove }),
    [status, fen, turn, onMove, myColor, whitePlayer, blackPlayer]
  )

  if ([GameStatus.NOT_STARTED, GameStatus.JOINING].includes(status)) {
    return <div>Joining...</div>
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
