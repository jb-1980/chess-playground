import { Chess } from "chess.js"
import { getStatus } from "../lib/getStatus"
import type { GameContextValues } from "./types"
import { useUserContext } from "../../Root/context"
import { GameActions, getChessStateFromGame, useChess } from "../hooks/useChess"

import { useObserveGame } from "../data/useObserveGame"
import { createMove } from "../data/solid-query/createMove"
import { Game } from "../../../types/game"
import { createContext, JSXElement } from "solid-js"
import { useParams } from "@solidjs/router"

export const GameContext = createContext<GameContextValues | undefined>(
  undefined,
)

export const GameContextProvider = (props: {
  children: JSXElement
  game: Game
}) => {
  const gameId = useParams().gameId!
  const { id: playerId } = useUserContext()
  const chess = new Chess()
  chess.loadPgn(props.game.pgn)
  const [gameState, dispatch] = useChess(
    getChessStateFromGame(props.game, playerId),
  )

  const moveHandler = createMove()

  const { turn, myColor } = gameState
  const onMove = useCallback(
    (move: { from: string; to: string; promotion: string }) => {
      if (turn !== myColor) {
        return false
      }
      try {
        // will throw an "Illegal move" error if the move is invalid
        const _move = chess.move(move)
        const _status = getStatus(chess)
        dispatch({
          type: GameActions.SET_MOVE,
          payload: { fen: chess.fen(), status: _status },
        })

        mutate(gameId, _move)
        return true
      } catch (err) {
        console.error({ err })
        if (err instanceof Error && err.message === "Illegal move") {
          return false
        }
        throw err
      }
    },
    [chess, gameId, mutate, myColor, turn, dispatch],
  )

  const { msg } = useObserveGame(gameId)

  useEffect(() => {
    if (msg && msg.pgn) {
      const game = msg
      chess.loadPgn(game.pgn)
      dispatch({
        type: GameActions.FETCH_GAME,
        payload: game,
      })
    }
  }, [msg, dispatch, chess])

  const value = useMemo(
    () => ({
      ...gameState,
      onMove,
    }),
    [gameState, onMove],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
