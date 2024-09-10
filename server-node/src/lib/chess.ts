import { Chess } from "chess.js"
import { GameStatus } from "../domain/game"

export const validateMove = (fen: string, move: string): boolean => {
  const chess = new Chess(fen)
  try {
    // will throw an "Invalid move" error if the move is invalid
    chess.move(move)
    return true
  } catch (_e) {
    return false
  }
}

/**
 * When a game is not terminated by a non-move event (e.g. timeout, resignation, etc.),
 * then check if the game has resulted in a checkmate, stalemate, threefold repetition,
 * insufficient material, or fifty-move rule.
 * @param chess Chess instance
 * @returns GameStatus
 */
export const getStatus = (fen: string): GameStatus => {
  const chess = new Chess(fen)
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

export const createPgnFromMoves = (
  moves: string[],
  headers: { [key: string]: string }
): string => {
  const chess = new Chess()
  try {
    for (const move of moves) {
      console.log({ move })
      chess.move(move)
    }
  } catch (e) {
    console.error(e)
  }

  for (const [key, value] of Object.entries(headers)) {
    chess.header(key, value)
  }
  return chess.pgn()
}

/**
 * calculate a new rating based on the elo rating system
 *
 */
export const calculateNewRatings = (
  whiteRating: number,
  blackRating: number,
  /** 1 for White wins, 0 for Black wins, 0.5 for draw */
  outcome: 1 | 0 | 0.5,
  K = 32
): {
  whiteRating: number
  blackRating: number
} => {
  const getProbability = (rating1: number, rating2: number): number => {
    return 1 / (1 + 10 ** ((rating2 - rating1) / 400))
  }
  const whiteProbability = getProbability(whiteRating, blackRating)
  const blackProbability = getProbability(blackRating, whiteRating)

  const newWhiteRating = Math.round(
    whiteRating + K * (outcome - whiteProbability)
  )
  const newBlackRating = Math.round(
    blackRating + K * (1 - outcome - blackProbability)
  )
  return {
    whiteRating: newWhiteRating,
    blackRating: newBlackRating,
  }
}
