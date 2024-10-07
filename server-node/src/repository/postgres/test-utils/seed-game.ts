import {
  Game as DBGame,
  GameOutcomes,
  GameStatus,
  Outcome,
  User,
} from "@prisma/client"
import { faker } from "@faker-js/faker"
import {
  Game,
  Color,
  Piece,
  Square,
  Move as GameMove,
} from "../../../domain/game"
import { Chess, Move } from "chess.js"
import prisma from "../client"

type Overrides = Partial<
  Omit<DBGame, "id" | "whitePlayer" | "blackPlayer" | "GameOutcomes"> & {
    whitePlayer: Partial<User>
    blackPlayer: Partial<User>

    GameOutcomes: Partial<GameOutcomes>
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

export const getTestGame = (overrides: Partial<DBGame> = {}): DBGame => {
  return {
    id: faker.string.uuid(),
    // moves: [],
    pgn: "",
    whitePlayerId: faker.string.uuid(),
    blackPlayerId: faker.string.uuid(),
    outcome: null,
    // whitePlayer: {
    //   id: faker.string.uuid(),
    //   username: "whitePlayer",
    //   rating: 1500,
    //   avatarUrl: "",
    //   ...whitePlayer,
    // },
    // blackPlayer: {
    //   id: faker.string.uuid(),
    //   username: "blackPlayer",
    //   rating: 1500,
    //   avatarUrl: "",
    //   ...blackPlayer,
    // },
    status: faker.helpers.objectValue(GameStatus),
    createdAt: new Date(),
    // outcomes: {
    //   whiteWins: {
    //     whiteRating: 1500,
    //     blackRating: 1500,
    //     ...whiteWins,
    //   },
    //   blackWins: {
    //     whiteRating: 1500,
    //     blackRating: 1500,
    //     ...blackWins,
    //   },
    //   draw: {
    //     whiteRating: 1500,
    //     blackRating: 1500,
    //     ...draw,
    //   },
    // },
    ...overrides,
  }
}

export const seedGame = async (
  overrides: Partial<DBGame> = {},
): Promise<DBGame> => {
  const gameDocument = getTestGame(overrides)
  return await prisma.game.create({ data: gameDocument })
}
