import { ObjectId } from "mongodb"
import { Games, GameDocument } from "../collections/game/game"
import { faker } from "@faker-js/faker"
import { GameStatus } from "../../../domain/game"

import { getTestOutcomes } from "../../../test-utils/game"

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

export const getTestMongoDBGame = (overrides: Overrides = {}): GameDocument => {
  const { whitePlayer, blackPlayer, outcome, outcomes, ...rest } = overrides
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
    outcomes: getTestOutcomes(outcomes),
    ...rest,
  }
}

export const seedGame = async (
  overrides: Overrides = {},
): Promise<GameDocument> => {
  const gameDocument = getTestMongoDBGame(overrides)
  const { insertedId } = await Games.insertOne(gameDocument)
  return {
    ...gameDocument,
    _id: insertedId,
  }
}
