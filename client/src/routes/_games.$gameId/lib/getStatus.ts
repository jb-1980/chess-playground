import { Chess } from "chess.js"
import { GameStatus } from "../../../types/game"

export const getStatus = (chess: Chess): GameStatus => {
  if (chess.isGameOver()) {
    if (chess.isCheckmate()) {
      return GameStatus.CHECKMATE
    }
    if (chess.isStalemate()) {
      return GameStatus.STALEMATE
    }
    if (chess.isThreefoldRepetition()) {
      return GameStatus.THREE_MOVE_REPETITION
    }
    if (chess.isInsufficientMaterial()) {
      return GameStatus.INSUFFICIENT_MATERIAL
    }
    if (chess.isDraw()) {
      return GameStatus.FIFTY_MOVE_RULE
    }
  }
  return GameStatus.PLAYING
}
