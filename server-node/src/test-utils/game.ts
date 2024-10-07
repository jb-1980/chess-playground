import { faker } from "@faker-js/faker"
import {
  Color,
  GameStatus,
  Piece,
  Square,
  Move as GameMove,
  Game,
} from "../domain/game"
import { Chess, Move } from "chess.js"

type Overrides = Partial<
  Omit<Game, "whitePlayer" | "blackPlayer"> & {
    whitePlayer: Partial<Game["whitePlayer"]>
    blackPlayer: Partial<Game["blackPlayer"]>
  }
>

export const randomSan = () => {
  const piece = faker.helpers.objectValue(Piece)
  const to = faker.helpers.objectValue(Square.enum)
  if (piece === Piece.PAWN) {
    return to
  }

  return piece.toUpperCase() + to
}

export const getTestMoveValues = (
  moveNumber = 10,
): {
  move: GameMove
  pgn: string
  status: GameStatus
} => {
  const chess = new Chess()
  let move: Move = chess.moves({ verbose: true })[0]

  while (moveNumber > 0) {
    const moves = chess.moves({ verbose: true })
    move = faker.helpers.arrayElement(moves)
    move = chess.move(move)
    moveNumber--
  }

  const { captured, color, piece, promotion, ...rest } = move
  const newMove = {
    ...rest,
    color: move.color === "w" ? Color.WHITE : Color.BLACK,
    piece: move.piece.toLowerCase() as Piece,
    ...(captured && { captured: captured as Piece }),
    ...(promotion && {
      promotion: promotion as Piece,
    }),
  }
  return {
    move: newMove,
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
  }
}

export const getTestGame = (overrides: Overrides = {}): Game => {
  const { whitePlayer, blackPlayer, ...rest } = overrides
  return {
    id: faker.database.mongodbObjectId(),
    moves: [],
    pgn: "",
    whitePlayer: {
      id: faker.database.mongodbObjectId(),
      username: "whitePlayer",
      rating: 1500,
      avatarUrl: "",
      ...whitePlayer,
    },
    blackPlayer: {
      id: faker.database.mongodbObjectId(),
      username: "blackPlayer",
      rating: 1500,
      avatarUrl: "",
      ...blackPlayer,
    },
    status: faker.helpers.objectValue(GameStatus),
    createdAt: new Date(),
    ...rest,
  }
}
