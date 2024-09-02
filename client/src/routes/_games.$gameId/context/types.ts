import { Color } from "chess.js"
import { GameStatus } from "../types"

export type GameContextValues = {
  status: GameStatus
  fen: string | null
  turn: Color
  myColor: Color
  onMove: (args: { from: string; to: string; promotion: string }) => void
}
