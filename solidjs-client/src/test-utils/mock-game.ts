import { faker } from "@faker-js/faker"
import { GameStatus, Move as GameMove, Game } from "../types/game"
import { Chess, Move } from "chess.js"
import { getMockUser } from "./mock-user"

type Overrides = Partial<
  Omit<Game, "whitePlayer" | "blackPlayer"> & {
    whitePlayer: Partial<Game["whitePlayer"]>
    blackPlayer: Partial<Game["blackPlayer"]>
  }
>

const getTestMoveValues = (
  moveNumber = 10,
): {
  move: GameMove
  pgn: string
  status: keyof typeof GameStatus
  moveHistory: GameMove[]
} => {
  const chess = new Chess()
  let move: Move = chess.moves({ verbose: true })[0]
  const moveHistory = []

  while (moveNumber > 0) {
    const moves = chess.moves({ verbose: true })
    move = faker.helpers.arrayElement(moves)
    move = chess.move(move)
    moveHistory.push(move)
    moveNumber--
  }

  function cleanMove(move: Move): GameMove {
    return Object.entries(move).reduce((acc, [key, value]) => {
      if (value === undefined) {
        return acc
      }
      return { ...acc, [key]: value }
    }, {} as GameMove)
  }

  return {
    move: cleanMove(move),
    pgn: chess.pgn(),
    status: chess.isGameOver()
      ? chess.isInsufficientMaterial()
        ? GameStatus.INSUFFICIENT_MATERIAL
        : chess.isStalemate()
          ? GameStatus.STALEMATE
          : chess.isThreefoldRepetition()
            ? GameStatus.THREE_MOVE_REPETITION
            : chess.isCheckmate()
              ? GameStatus.CHECKMATE
              : GameStatus.FIFTY_MOVE_RULE
      : GameStatus.PLAYING,
    moveHistory: moveHistory.map(cleanMove),
  }
}

export const getMockGame = (overrides: Overrides = {}): Game => {
  const { whitePlayer, blackPlayer, ...rest } = overrides
  const moveValues = getTestMoveValues()
  return {
    id: faker.database.mongodbObjectId(),
    moves: moveValues.moveHistory,
    pgn: "",
    whitePlayer: getMockUser(whitePlayer),
    blackPlayer: getMockUser(blackPlayer),
    status: faker.helpers.objectValue(GameStatus),
    ...rest,
  }
}
