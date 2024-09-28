import { Color, DEFAULT_POSITION, WHITE } from "chess.js"
import { match } from "ts-pattern"
import { useReducer } from "react"
import { Game, GameStatus } from "../../../types/game"
import { User } from "../../../types/user"

type State = {
  /** A singleton of the Chess class */
  // chess: Chess
  /** The current game status */
  status: keyof typeof GameStatus
  /** The current FEN string */
  fen: string | null
  /** The current turn */
  turn: Color
  /** The color of the local player */
  myColor: Color
  /** The id of the local player */
  playerId: string
  whitePlayer: User | null
  blackPlayer: User | null
}

export enum GameActions {
  SET_MOVE = "SET_MOVE",
  JOIN_GAME = "JOIN_GAME",
  FETCH_GAME = "FETCH_GAME",
  RESET = "RESET",
}

type Action =
  | {
      type: GameActions.SET_MOVE
      payload: {
        status: keyof typeof GameStatus
        fen: string
      }
    }
  | {
      type: GameActions.FETCH_GAME
      payload: Game
    }
  | {
      type: GameActions.JOIN_GAME
    }
  | {
      type: GameActions.RESET
    }

const reducer = (state: State, action: Action): State =>
  match(action)
    .with({ type: GameActions.FETCH_GAME }, ({ payload }) => {
      const { whitePlayer, blackPlayer, moves, status } = payload
      const color = whitePlayer.id === state.playerId ? "w" : ("b" as Color)
      const lastMove = moves[moves.length - 1]
      const fen = lastMove ? lastMove.after : DEFAULT_POSITION
      const turn = fen.split(" ")[1] as Color
      return {
        ...state,
        myColor: color,
        fen,
        status,
        turn,
        whitePlayer,
        blackPlayer,
      }
    })
    .with({ type: GameActions.JOIN_GAME }, () => ({
      ...state,
      status: GameStatus.JOINING,
    }))
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
    .with({ type: GameActions.RESET }, () => getInitialState(state.playerId))
    .exhaustive()

const getInitialState = (playerId: string): State => ({
  status: GameStatus.NOT_STARTED,
  fen: null,
  turn: WHITE,
  myColor: WHITE,
  playerId,
  whitePlayer: null,
  blackPlayer: null,
})

export const getChessStateFromGame = (game: Game, playerId: string): State => {
  const { whitePlayer, blackPlayer, moves, status } = game
  const color = whitePlayer.id === playerId ? "w" : ("b" as Color)
  const lastMove = moves[moves.length - 1]
  const fen = lastMove ? lastMove.after : DEFAULT_POSITION
  const turn = fen.split(" ")[1] as Color
  return {
    status,
    fen,
    turn,
    myColor: color,
    playerId,
    whitePlayer,
    blackPlayer,
  }
}

export const useChess = (initialState: State) =>
  useReducer(reducer, initialState)
