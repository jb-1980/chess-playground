import { Color } from "chess.js"
import { GameStatus, User } from "../types"

export type GameContextValues = {
  status: GameStatus
  fen: string | null
  turn: Color
  myColor: Color
  whitePlayer: User | null
  blackPlayer: User | null
  onMove: (args: { from: string; to: string; promotion: string }) => void
}
