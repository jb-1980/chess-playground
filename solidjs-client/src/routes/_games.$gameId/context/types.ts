import { Color } from "chess.js"
import { GameStatus } from "../../../types/game"
import { User } from "../../../types/user"

export type GameContextValues = () => {
  status: keyof typeof GameStatus
  fen: string | null
  turn: Color
  myColor: Color
  whitePlayer: User | null
  blackPlayer: User | null
  onMove: (args: { from: string; to: string; promotion?: string }) => boolean
}
