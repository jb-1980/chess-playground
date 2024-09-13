import { ObjectId } from "mongodb"
import { Games, GameDocument } from "../game"
import { faker } from "@faker-js/faker"
import { Color, GameStatus, Piece, Square } from "../../domain/game"
import { Chess, Move } from "chess.js"

type Overrides = Partial<
  Omit<
    GameDocument,
    "_id" | "whitePlayer" | "blackPlayer" | "outcome" | "outcomes"
  > & {
    whitePlayer: Partial<GameDocument["whitePlayer"]>
    blackPlayer: Partial<GameDocument["blackPlayer"]>
    outcome: Partial<GameDocument["outcome"]>
    outcomes: Partial<
      Omit<GameDocument["outcomes"], "whiteWins" | "blackWins" | "draw"> & {
        whiteWins: Partial<GameDocument["outcomes"]["whiteWins"]>
        blackWins: Partial<GameDocument["outcomes"]["blackWins"]>
        draw: Partial<GameDocument["outcomes"]["draw"]>
      }
    >
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
  moveNumber = 10
): {
  move: Omit<GameDocument["moves"][0], "createdAt">
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

export const getTestGame = (overrides: Overrides = {}): GameDocument => {
  const { whitePlayer, blackPlayer, outcome, outcomes, ...rest } = overrides
  const { whiteWins, blackWins, draw } = outcomes || {}
  return {
    _id: new ObjectId(),
    moves: [],
    pgn: "",
    whitePlayer: {
      _id: new ObjectId(),
      username: "whitePlayer",
      rating: 1500,
      avatarUrl: "",
      ...whitePlayer,
    },
    blackPlayer: {
      _id: new ObjectId(),
      username: "blackPlayer",
      rating: 1500,
      avatarUrl: "",
      ...blackPlayer,
    },
    status: faker.helpers.objectValue(GameStatus),
    createdAt: new Date(),
    outcome: {
      winner: null,
      draw: false,
      ...outcome,
    },
    outcomes: {
      whiteWins: {
        whiteRating: 1500,
        blackRating: 1500,
        ...whiteWins,
      },
      blackWins: {
        whiteRating: 1500,
        blackRating: 1500,
        ...blackWins,
      },
      draw: {
        whiteRating: 1500,
        blackRating: 1500,
        ...draw,
      },
    },
    ...rest,
  }
}

export const seedGame = async (
  overrides: Overrides = {}
): Promise<GameDocument> => {
  const gameDocument = getTestGame(overrides)
  const { insertedId } = await Games.insertOne(gameDocument)
  return {
    ...gameDocument,
    _id: insertedId,
  }
}
