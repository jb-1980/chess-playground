import { faker } from "@faker-js/faker"
import { isSuccess, SuccessType } from "../lib/result"
import { resetDb } from "../test-utils/reset-db"
import { GameLoader, GameMutator } from "./game"
import { seedGame, getTestMoveValues } from "./test-utils/seed-game"
import { ObjectId } from "mongodb"
import { getTestUser } from "./test-utils/seed-user"
import { Color, Move } from "../domain/game"

describe("Repository: Game", () => {
  beforeAll(async () => {
    await resetDb()
  })

  beforeEach(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await resetDb()
  })

  describe("GameLoader", () => {
    it("should get game by id", async () => {
      // arrange
      const gameLoader = new GameLoader()
      const game = await seedGame()
      // act
      const result = await gameLoader.getGameById(game._id.toHexString())
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>

      expect(successResult.data).toContainAllEntries([
        ["_id", game._id],
        ["moves", game.moves],
        ["pgn", game.pgn],
        ["whitePlayer", game.whitePlayer],
        ["blackPlayer", game.blackPlayer],
        ["status", game.status],
        ["createdAt", game.createdAt],
        ["outcome", game.outcome],
        ["outcomes", game.outcomes],
      ])
    })

    it("should return null if game not found", async () => {
      // arrange
      const gameLoader = new GameLoader()
      // act
      const result = await gameLoader.getGameById(
        faker.database.mongodbObjectId()
      )
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      expect(successResult.data).toBeNull()
    })

    it("should get all games for a player", async () => {
      // arrange
      const gameLoader = new GameLoader()
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
      const result = await gameLoader.getGamesForPlayerId(
        game1.whitePlayer._id.toHexString()
      )
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      expect(successResult.data).toContainAllValues([game1, game2])
    })
  })

  describe("GameMutator", () => {
    it("should create a new game", async () => {
      // arrange
      const gameMutator = new GameMutator()
      const whitePlayer = getTestUser()
      const blackPlayer = getTestUser()
      // act
      const result = await gameMutator.createGame(whitePlayer, blackPlayer)
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      const gameId = successResult.data
      expect(gameId).toBeString()
      const gameLoader = new GameLoader()
      const gameResult = await gameLoader.getGameById(gameId)
      expect(gameResult).toSatisfy(isSuccess)
      const game = gameResult as SuccessType<typeof gameResult>
      expect(game.data).not.toBeNull()
    })

    it("should add a move to a game", async () => {
      // arrange
      const gameMutator = new GameMutator()
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
      const updatedGame = successResult.data
      expect(updatedGame).toBeTrue()

      const gameLoader = new GameLoader()
      const gameResult = await gameLoader.getGameById(game._id.toHexString())
      expect(gameResult).toSatisfy(isSuccess)
      const gameData = gameResult as SuccessType<typeof gameResult>
      const gameDocument = gameData.data
      // @ts-expect-error, it is safe to assume that moves is not empty
      const { createdAt, ...lastMove } = gameDocument?.moves.at(-1) as Move
      expect(gameDocument).not.toBeNull()
      expect(lastMove).toMatchObject(move)
      expect(createdAt).toBeDate()
      expect(gameDocument?.pgn).toEqual(pgn)
      expect(gameDocument?.status).toEqual(status)
    })

    it("should set the outcome of a game", async () => {
      // arrange
      const gameMutator = new GameMutator()
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
        outcome.draw
      )
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      const gameOutcome = successResult.data
      expect(gameOutcome).toBeTrue()

      const gameLoader = new GameLoader()
      const gameResult = await gameLoader.getGameById(game._id.toHexString())
      expect(gameResult).toSatisfy(isSuccess)
      const gameData = gameResult as SuccessType<typeof gameResult>
      const gameDocument = gameData.data
      expect(gameDocument).not.toBeNull()
      expect(gameDocument?.outcome).toMatchObject(outcome)
    })
  })
})
