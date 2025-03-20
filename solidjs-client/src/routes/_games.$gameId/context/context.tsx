import { Chess } from "chess.js"
import { getStatus } from "../lib/getStatus"
import type { GameContextValues } from "./types"
import { useUserContext } from "../../Root/context"
import { GameActions, getChessStateFromGame, useChess } from "../hooks/useChess"

import {
  ResponseMessageType,
  useObserveGameSocket,
} from "../data/websocket/useObserveGameSocket"
import { createMove } from "../data/createMove"
import { Game } from "../../../types/game"
import { createContext, createEffect, JSXElement } from "solid-js"
import { useParams } from "@solidjs/router"
import { match } from "ts-pattern"

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

  const onMove = (move: {
    from: string
    to: string
    promotion?: string
  }): boolean => {
    console.log({ gameState: gameState() })
    if (gameState().turn !== gameState().myColor) {
      return false
    }
    try {
      // will throw an "Illegal move" error if the move is invalid
      console.log({ moves: chess.moves() })
      console.log({ chess })
      const _move = chess.move(move)
      const _status = getStatus(chess)
      dispatch({
        type: GameActions.SET_MOVE,
        payload: { fen: chess.fen(), status: _status },
      })

      moveHandler.mutate({ gameId, move: _move })
      return true
    } catch (err) {
      console.error({ err })

      if (err instanceof Error && err.message.includes("Invalid move")) {
        return false
      }
      throw err
    }
  }

  const lastJsonMessage = useObserveGameSocket(gameId)

  createEffect(() => {
    const msg = match(lastJsonMessage())
      .with({ type: ResponseMessageType.ERROR }, () => null)
      .with(
        { type: ResponseMessageType.MOVE_RESPONSE },
        ({ payload }) => payload,
      )
      .otherwise(() => undefined)
    if (msg && msg.pgn) {
      chess.loadPgn(msg.pgn)
      dispatch({
        type: GameActions.FETCH_GAME,
        payload: msg,
      })
    }
  })

  const value = () => ({
    ...gameState(),
    onMove,
  })

  return (
    <GameContext.Provider value={value}>{props.children}</GameContext.Provider>
  )
}
