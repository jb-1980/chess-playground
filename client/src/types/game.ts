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

// prettier-ignore
type Square = 
  | "a1" | "a2" | "a3" | "a4" | "a5" | "a6" | "a7" | "a8"
  | "b1" | "b2" | "b3" | "b4" | "b5" | "b6" | "b7" | "b8"
  | "c1" | "c2" | "c3" | "c4" | "c5" | "c6" | "c7" | "c8"
  | "d1" | "d2" | "d3" | "d4" | "d5" | "d6" | "d7" | "d8"
  | "e1" | "e2" | "e3" | "e4" | "e5" | "e6" | "e7" | "e8"
  | "f1" | "f2" | "f3" | "f4" | "f5" | "f6" | "f7" | "f8"
  | "g1" | "g2" | "g3" | "g4" | "g5" | "g6" | "g7" | "g8"
  | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "h7" | "h8"

export type Move = {
  color: "w" | "b"
  from: Square
  to: Square
  piece: "p" | "n" | "b" | "r" | "q" | "k"
  captured?: "p" | "n" | "b" | "r" | "q" | "k" | null
  promotion?: "p" | "n" | "b" | "r" | "q" | "k" | null
  flags: string
  san: string
  lan: string
  before: string
  after: string
}

export type Game = {
  id: string
  moves: Move[]
  pgn: string
  whitePlayer: User
  blackPlayer: User
  status: keyof typeof GameStatus
}
