import { faker } from "@faker-js/faker"
import {
  GameStatus,
  Move as GameMove,
  Color,
  Piece,
  Square,
} from "../gql-modules/types.generated"
import { Chess, Move } from "chess.js"
import {
  GameDocument,
  MongoGameDocument,
} from "../gql-modules/game/datasources/data-schema"
import { Games } from "src/gql-modules/game/datasources/games-collection"

type GameOutcome = GameDocument["outcomes"]

export type Overrides = Partial<
  Omit<
    GameDocument,
    "_id" | "whitePlayer" | "blackPlayer" | "outcome" | "outcomes"
  > & {
    whitePlayer: Partial<GameDocument["whitePlayer"]>
    blackPlayer: Partial<GameDocument["blackPlayer"]>
    outcome: Partial<GameDocument["outcome"]>
    outcomes: Partial<
      Omit<GameOutcome, "whiteWins" | "blackWins" | "draw"> & {
        whiteWins: Partial<GameDocument["outcomes"]["whiteWins"]>
        blackWins: Partial<GameDocument["outcomes"]["blackWins"]>
        draw: Partial<GameDocument["outcomes"]["draw"]>
      }
    >
  }
>

export const getTestOutcomes = (
  overrides?: Partial<
    Omit<GameOutcome, "whiteWins" | "blackWins" | "draw"> & {
      whiteWins: Partial<GameOutcome["whiteWins"]>
      blackWins: Partial<GameOutcome["blackWins"]>
      draw: Partial<GameOutcome["draw"]>
    }
  >,
) => {
  const whiteWins = {
    whiteRating: 1500,
    blackRating: 1500,
    ...overrides?.whiteWins,
  }
  const blackWins = {
    whiteRating: 1500,
    blackRating: 1500,
    ...overrides?.blackWins,
  }
  const draw = {
    whiteRating: 1500,
    blackRating: 1500,
    ...overrides?.draw,
  }
  return {
    whiteWins,
    blackWins,
    draw,
  }
}

export const getTestMoveValues = (
  moveNumber = 10,
): {
  move: GameMove
  pgn: string
  status: GameStatus
  moveHistory: GameMove[]
} => {
  const chess = new Chess()
  let move: Move = chess.moves({ verbose: true })[0]
  const moveHistory = []

  function mapMove(move: Move): GameMove {
    const { captured, color, piece, promotion, from, to, ...rest } = move
    return {
      ...rest,
      from: from as Square,
      to: to as Square,
      color: color === "w" ? Color.w : Color.b,
      piece: piece.toLowerCase() as Piece,
      ...(captured && { captured: captured as Piece }),
      ...(promotion && {
        promotion: promotion as Piece,
      }),
    }
  }

  let newMove = mapMove(move)
  while (moveNumber > 0) {
    const moves = chess.moves({ verbose: true })
    move = faker.helpers.arrayElement(moves)
    move = chess.move(move)
    newMove = mapMove(move)
    moveHistory.push(newMove)
    moveNumber--
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
    moveHistory,
  }
}

export const getTestMongoDBGame = (
  overrides: Overrides = {},
): MongoGameDocument => {
  const { whitePlayer, blackPlayer, outcome, outcomes, ...rest } = overrides
  return {
    _id: faker.database.mongodbObjectId(),
    moves: [],
    pgn: "",
    whitePlayer: {
      _id: faker.database.mongodbObjectId(),
      username: "whitePlayer",
      rating: 1500,
      avatarUrl: "",
      ...whitePlayer,
    },
    blackPlayer: {
      _id: faker.database.mongodbObjectId(),
      username: "blackPlayer",
      rating: 1500,
      avatarUrl: "",
      ...blackPlayer,
    },
    status: faker.helpers.objectValue(GameStatus),
    outcome: {
      winner: null,
      draw: false,
      ...outcome,
    },
    outcomes: getTestOutcomes(outcomes),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...rest,
  }
}

export const seedGame = async (
  overrides: Overrides = {},
): Promise<MongoGameDocument> => {
  const gameDocument = getTestMongoDBGame(overrides)
  const { insertedId } = await Games.insertOne(gameDocument)
  return await Games.findOne({ _id: insertedId })
}
