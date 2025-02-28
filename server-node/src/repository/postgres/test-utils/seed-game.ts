import {
  Game as DBGame,
  Move as DBMove,
  GameOutcomes,
  User,
} from "@prisma/client"
import { faker } from "@faker-js/faker"
import {
  Color,
  Piece,
  Square,
  Move as GameMove,
  GameStatus,
} from "../../../domain/game"
import { Chess, Move } from "chess.js"
import prisma from "../client"
import { seedUser } from "./seed-user"
import { FullGame } from "../tables/game/game"
import { getTestMoveValues } from "../../../test-utils/game"

type Overrides = Partial<
  Omit<DBGame, "id" | "whitePlayer" | "blackPlayer" | "GameOutcomes"> & {
    whitePlayer: Partial<User>
    blackPlayer: Partial<User>

    GameOutcomes: Partial<GameOutcomes>
  }
>

export const getTestPostgresOutcomes = (
  overrides: Overrides["GameOutcomes"] = {},
): GameOutcomes => ({
  id: faker.string.uuid(),
  gameId: faker.string.uuid(),
  whiteWinsWhiteRating: 1500,
  whiteWinsBlackRating: 1500,
  blackWinsWhiteRating: 1500,
  blackWinsBlackRating: 1500,
  drawWhiteRating: 1500,
  drawBlackRating: 1500,
  ...overrides,
})

export const getTestPostgresGame = (
  overrides: Partial<DBGame> = {},
): DBGame => {
  return {
    id: faker.string.uuid(),
    pgn: "",
    whitePlayerId: faker.string.uuid(),
    blackPlayerId: faker.string.uuid(),
    outcome: null,
    status: faker.helpers.objectValue(GameStatus),
    createdAt: new Date(),
    ...overrides,
  }
}

export const seedGame = async (
  overrides: Partial<DBGame> = {},
): Promise<DBGame> => {
  const gameDocument = getTestPostgresGame(overrides)
  return await prisma.game.create({ data: gameDocument })
}

export const seedMoves = async (
  gameId: string,
  howMany: number = 10,
  moveHistory: Move[] = [],
): Promise<DBMove[]> => {
  const playedMoves = moveHistory.length
    ? moveHistory
    : getTestMoveValues(howMany).moveHistory
  const moves = []
  for (const move of playedMoves) {
    const nextMove = await prisma.move.create({
      data: {
        gameId,
        createdAt: new Date(),
        ...move,
      },
    })
    moves.push(nextMove)
  }
  return moves
}

export const seedFullGame = async (
  overrides: Partial<
    DBGame & { moves: Move[]; whitePlayer: User; blackPlayer: User }
  > = {},
  moveCount: number = 10,
): Promise<FullGame> => {
  const {
    moves: movesOverride,
    whitePlayer: whitePlayerOverride,
    blackPlayer: blackPlayerOverride,
    ...gameOverrides
  } = overrides
  const whitePlayer = whitePlayerOverride ?? (await seedUser())
  const blackPlayer = blackPlayerOverride ?? (await seedUser())
  const game = await seedGame({
    whitePlayerId: whitePlayer.id,
    blackPlayerId: blackPlayer.id,
    ...gameOverrides,
  })
  const moves = await seedMoves(game.id, moveCount, movesOverride ?? [])
  return {
    ...game,
    moves,
    whitePlayer,
    blackPlayer,
  }
}
