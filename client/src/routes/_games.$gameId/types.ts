import { Color, PieceSymbol } from "chess.js"

export enum GameStatus {
  NOT_STARTED = "NOT_STARTED",
  JOINING = "JOINING",
  PLAYING = "PLAYING",
  CHECKMATE = "CHECKMATE",
  STALEMATE = "STALEMATE",
  THREE_MOVE_REPETITION = "THREE_MOVE_REPETITION",
  INSUFFICIENT_MATERIAL = "INSUFFICIENT_MATERIAL",
  FIFTY_MOVE_RULE = "FIFTY_MOVE_RULE",
}

export type Game = {
  moves: {
    /** A SAN string of the move */
    move: string
    /** The move number */
    number: number
    /** The player who made the move */
    player: Color
    /** The piece the pawn was promoted to */
    promotion: PieceSymbol
    /** The FEN string after the move */
    fen: string
    /** The time the move was made */
    createdAt: string
  }[]
  pgn: string
  whitePlayer: {
    _id: string
    username: string
  }
  blackPlayer: {
    _id: string
    username: string
  }
  status: GameStatus
}
