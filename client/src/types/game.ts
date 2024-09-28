import { Move } from "chess.js"
import { User } from "./user"

export const GameStatus = {
  NOT_STARTED: "NOT_STARTED",
  JOINING: "JOINING",
  PLAYING: "PLAYING",
  CHECKMATE: "CHECKMATE",
  STALEMATE: "STALEMATE",
  THREE_MOVE_REPETITION: "THREE_MOVE_REPETITION",
  INSUFFICIENT_MATERIAL: "INSUFFICIENT_MATERIAL",
  FIFTY_MOVE_RULE: "FIFTY_MOVE_RULE",
  RESIGNATION: "RESIGNATION",
  AGREED_DRAW: "AGREED_DRAW",
  TIMEOUT: "TIMEOUT",
  ABANDONED: "ABANDONED",
} as const

export type Game = {
  id: string
  moves: Move[]
  pgn: string
  whitePlayer: User
  blackPlayer: User
  status: GameStatus
}
