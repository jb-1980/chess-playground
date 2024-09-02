import { Color, WHITE } from "chess.js"
import { match } from "ts-pattern"
import { Game, GameStatus } from "../types"
import { useReducer } from "react"

type State = {
  /** A singleton of the Chess class */
  // chess: Chess
  /** The current game status */
  status: GameStatus
  /** The current FEN string */
  fen: string | null
  /** The current turn */
  turn: Color
  /** The color of the local player */
  myColor: Color
  /** The id of the local player */
  playerId: string
}

export enum GameActions {
  SET_MOVE = "SET_MOVE",
  JOIN_GAME = "JOIN_GAME",
  CREATE_GAME = "CREATE_GAME",
  SET_GAME = "SET_GAME",
}

type Action =
  | {
      type: GameActions.SET_MOVE
      payload: {
        status: GameStatus
        fen: string
      }
    }
  | {
      type: GameActions.CREATE_GAME
      payload: { whitePlayerId: string }
    }
  | {
      type: GameActions.SET_GAME
      payload: Game
    }
  | {
      type: GameActions.JOIN_GAME
    }

const reducer = (state: State, action: Action): State =>
  match(action)
    .with({ type: GameActions.SET_GAME }, ({ payload }) => {
      const { whitePlayer, moves, status } = payload
      const color = whitePlayer._id === state.playerId ? "w" : ("b" as Color)
      const lastMove = moves[moves.length - 1]
      const fen = lastMove
        ? lastMove.fen
        : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      const turn = fen.split(" ")[1] as Color
      console.log({ color, fen, status, turn })
      return {
        ...state,
        myColor: color,
        fen,
        status,
        turn,
      }
    })
    .with({ type: GameActions.CREATE_GAME }, ({ payload }) => {
      const { whitePlayerId } = payload

      // create game
      return {
        ...state,
        myColor:
          whitePlayerId === state.playerId ? ("w" as Color) : ("b" as Color),
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        status: GameStatus.PLAYING,
        turn: WHITE as Color,
      }
    })
    .with({ type: GameActions.SET_MOVE }, ({ payload }) => {
      const { fen, status } = payload
      const turn: Color = state.turn === "w" ? "b" : "w"
      try {
        return {
          ...state,
          fen,
          status,
          turn,
        }
      } catch (err) {
        if (err instanceof Error && err.message === "Illegal move") {
          return state
        }
        throw err
      }
    })
    .with({ type: GameActions.JOIN_GAME }, () => ({
      ...state,
      status: GameStatus.JOINING,
    }))
    .exhaustive()

const getInitialState = (playerId: string): State => ({
  status: GameStatus.NOT_STARTED,
  fen: null,
  turn: WHITE,
  myColor: WHITE,
  playerId,
})

export const useChess = (playerId: string) =>
  useReducer(reducer, getInitialState(playerId))
