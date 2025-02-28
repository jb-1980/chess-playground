import { faker } from "@faker-js/faker"
import { isSuccess, SuccessType } from "../../../../lib/result"
import { resetDb } from "../../test-utils/reset-db"
import { makeGameDTO, MongoDBGameLoader, MongoDBGameMutator } from "./game"
import { seedGame } from "../../test-utils/seed-game"
import { ObjectId } from "mongodb"
import { Color, Move } from "../../../../domain/game"
import { getTestUser } from "../../../../test-utils/user"
import { getTestMoveValues, getTestOutcomes } from "../../../../test-utils/game"
import { mongoClient } from "../../connection"

describe("Repository::MongoDB: Game", () => {
  beforeAll(async () => {
    await resetDb()
  })

  beforeEach(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await resetDb()
    await mongoClient.close()
  })

  describe("GameLoader", () => {
    it("should get game by id", async () => {
      // arrange
      const gameLoader = new MongoDBGameLoader()
      const game = await seedGame()
      // act
      const result = await gameLoader.batchGames.load(game._id.toHexString())
      // assert

      const expectedGame = makeGameDTO(game)
      expect(result).toContainAllEntries([
        ["id", expectedGame.id],
        ["moves", expectedGame.moves],
        ["pgn", expectedGame.pgn],
        ["whitePlayer", expectedGame.whitePlayer],
        ["blackPlayer", expectedGame.blackPlayer],
        ["status", expectedGame.status],
        ["createdAt", game.createdAt],
      ])
    })

    it("should return null if game not found", async () => {
      // arrange
      const gameLoader = new MongoDBGameLoader()
      // act
      const result = await gameLoader.batchGames.load(
        faker.database.mongodbObjectId(),
      )
      // assert
      expect(result).toBeNull()
    })

    it("should get all games for a player", async () => {
      // arrange
      const gameLoader = new MongoDBGameLoader()
      const game1 = await seedGame({
        whitePlayer: { _id: new ObjectId() },
      })
      const game2 = await seedGame({
        blackPlayer: { _id: game1.whitePlayer._id },
      })
      await seedGame({
        whitePlayer: { _id: new ObjectId() },
      })
      // act
      const result = await gameLoader.batchGamesForPlayer.load(
        game1.whitePlayer._id.toHexString(),
      )
      // assert
      expect(result).toContainAllValues([
        makeGameDTO(game1),
        makeGameDTO(game2),
      ])
    })
  })

  describe("GameMutator", () => {
    it("should create a new game", async () => {
      // arrange
      const gameMutator = new MongoDBGameMutator()
      const whitePlayer = getTestUser()
      const blackPlayer = getTestUser()
      const outcomes = getTestOutcomes()
      // act
      const result = await gameMutator.insertGame(
        whitePlayer,
        blackPlayer,
        outcomes,
      )
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      const gameId = successResult.data
      expect(gameId).toBeString()

      const gameLoader = new MongoDBGameLoader()
      const game = await gameLoader.batchGames.load(gameId)

      expect(game).not.toBeNull()
    })

    it("should add a move to a game", async () => {
      // arrange
      const gameMutator = new MongoDBGameMutator()
      const game = await seedGame()
      const { move, pgn, status } = getTestMoveValues()
      // act
      const result = await gameMutator.addMoveToGame({
        gameId: game._id.toHexString(),
        move,
        status,
        pgn,
      })
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      const wasGameUpdated = successResult.data
      expect(wasGameUpdated).toBeTrue()

      const gameLoader = new MongoDBGameLoader()
      const updatedGame = await gameLoader.batchGames.load(
        game._id.toHexString(),
      )
      // @ts-expect-error, it is safe to assume that moves is not empty
      const { createdAt, ...lastMove } = updatedGame?.moves.at(-1) as Move
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
        game._id.toHexString(),
        outcome.winner,
        outcome.draw,
      )
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      const wasGameOutcomeSet = successResult.data
      expect(wasGameOutcomeSet).toBeTrue()
    })
  })
})
