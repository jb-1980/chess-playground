import { Color } from "chess.js"

export enum GameStatus {
  PLAYING = "PLAYING",
  CHECKMATE = "CHECKMATE",
  STALEMATE = "STALEMATE",
  THREE_MOVE_REPETITION = "THREE_MOVE_REPETITION",
  INSUFFICIENT_MATERIAL = "INSUFFICIENT_MATERIAL",
  FIFTY_MOVE_RULE = "FIFTY_MOVE_RULE",
}

export type GameContextValues = {
  status: GameStatus
  fen: string
  turn: Color
  onMove: (args: { from: string; to: string; promotion: string }) => void
}
