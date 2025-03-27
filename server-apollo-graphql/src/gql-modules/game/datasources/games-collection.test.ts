// @vitest-environment mongodb
import { afterEach, assert, describe, expect, it } from "vitest"
import { mongoDB } from "../../../database/connection"
import { isSuccess } from "../../../lib/result"
import { getTestMoveValues, getTestOutcomes } from "./test-utils/mock-game"
import { faker } from "@faker-js/faker"
import { Color } from "../../types.generated"
import { seedGame } from "./test-utils/seed-game"
import {
  Games,
  MongoDBGameLoader,
  MongoDBGameMutator,
} from "./games-collection"
import { getTestUserDocument } from "../../user/datasources/test-utils/mock-user"
import { Game } from "../resolvers/Game"

describe("Mongo Games Collection", () => {
  afterEach(async () => {
    await mongoDB.dropDatabase()
  })

  describe("MongoDBGameLoader", () => {
    it("gets a game by id", async () => {
      // arrange
      const game = await seedGame()
      const gameLoader = new MongoDBGameLoader()
      // act
      const result = await gameLoader.batchGames.load(game._id)
      // assert
      expect(result).toEqual(game)
    })

    it("gets games for player", async () => {
      // arrange
      const game = await seedGame()
      const gameLoader = new MongoDBGameLoader()
      // act
      const result = await gameLoader.batchGamesForPlayer.load(
        game.whitePlayer._id.toString(),
      )
      // assert
      expect(result[0]).toEqual(game)
    })
  })

  describe("GameMutator", () => {
    it("creates a game", async () => {
      // arrange
      const gameMutator = new MongoDBGameMutator()
      const whitePlayer = getTestUserDocument()
      const blackPlayer = getTestUserDocument()
      const outcomes = getTestOutcomes()
      // act
      const result = await gameMutator.insertGame(
        whitePlayer,
        blackPlayer,
        outcomes,
      )
      // assert
      assert(isSuccess(result))
      expect(result.data).toBeString()

      const game = await Games.findOne({ _id: result.data })
      expect(game).not.toBeNull()
    })

    it("should add a move to a game", async () => {
      // arrange
      const gameMutator = new MongoDBGameMutator()
      const game = await seedGame()
      const { move, pgn, status } = getTestMoveValues()
      // act
      const result = await gameMutator.addMoveToGame({
        gameId: game._id,
        move,
        status,
        pgn,
      })
      // assert
      assert(isSuccess(result))
      const wasGameUpdated = result.data
      expect(wasGameUpdated).toBeTrue()

      const updatedGame = await Games.findOne({ _id: game._id })
      const { createdAt, ...lastMove } = updatedGame?.moves.at(-1)
      expect(updatedGame).not.toBeNull()
      expect(lastMove).toMatchObject(move)
      expect(createdAt).toBeDate()
      expect(updatedGame?.pgn).toEqual(pgn)
      expect(updatedGame?.status).toEqual(status)
    })

    it("should set the outcome of a game", async () => {
      // arrange
      const gameMutator = new MongoDBGameMutator()
      const game = await seedGame()
      const isDraw = faker.datatype.boolean()
      const outcome = {
        winner: isDraw ? null : faker.helpers.objectValue(Color),
        draw: isDraw,
      }
      // act
      const result = await gameMutator.setOutcome(
        game._id,
        outcome.winner,
        outcome.draw,
      )
      // assert
      assert(isSuccess(result))
      expect(result.data).toBeTrue()
    })
  })
})
