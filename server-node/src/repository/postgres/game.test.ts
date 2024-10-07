import { faker } from "@faker-js/faker"
import { isSuccess, SuccessType } from "../../lib/result"
import { resetDb } from "./test-utils/reset-db"
import { GameLoader, GameMutator, makeGameDTO } from "./game"
import { seedGame, getTestMoveValues } from "./test-utils/seed-game"
import { Color, GameStatus, Move } from "../../domain/game"
import { getTestUser } from "../../test-utils/user"
import { seedUser } from "./test-utils/seed-user"
import { makeUserDto } from "./user"

describe("Repository::MongoDB: Game", () => {
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
      const blackPlayer = await seedUser()
      const whitePlayer = await seedUser()
      const game = await seedGame({
        whitePlayerId: whitePlayer.id,
        blackPlayerId: blackPlayer.id,
      })
      // act
      const result = await gameLoader.getGameById(game.id)
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>

      expect(successResult.data).toContainAllEntries([
        ["id", game.id],
        ["moves", []],
        ["pgn", game.pgn],
        ["whitePlayer", makeUserDto(whitePlayer)],
        ["blackPlayer", makeUserDto(blackPlayer)],
        ["status", game.status],
        ["createdAt", game.createdAt],
      ])
    })

    it("should return null if game not found", async () => {
      // arrange
      const gameLoader = new GameLoader()
      // act
      const result = await gameLoader.getGameById(
        faker.database.mongodbObjectId(),
      )
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      expect(successResult.data).toBeNull()
    })

    it("should get all games for a player", async () => {
      // arrange
      const gameLoader = new GameLoader()
      const user1 = await seedUser()
      const user2 = await seedUser()
      const user3 = await seedUser()

      const game1 = await seedGame({
        whitePlayerId: user1.id,
        blackPlayerId: user2.id,
      })
      const game2 = await seedGame({
        blackPlayerId: user1.id,
        whitePlayerId: user3.id,
      })
      await seedGame({
        whitePlayerId: user2.id,
        blackPlayerId: user3.id,
      })
      // act
      const result = await gameLoader.getGamesForPlayerId(user1.id)
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      expect(successResult.data).toContainAllValues([
        makeGameDTO({
          ...game1,
          moves: [],
          whitePlayer: user1,
          blackPlayer: user2,
        }),
        makeGameDTO({
          ...game2,
          moves: [],
          whitePlayer: user3,
          blackPlayer: user1,
        }),
      ])
    })
  })

  describe("GameMutator", () => {
    it("should create a new game", async () => {
      // arrange
      const gameMutator = new GameMutator()
      const whitePlayer = await seedUser()
      const blackPlayer = await seedUser()
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
      const whitePlayer = await seedUser()
      const blackPlayer = await seedUser()
      const game = await seedGame({
        whitePlayerId: whitePlayer.id,
        blackPlayerId: blackPlayer.id,
      })
      const { move, pgn, status } = getTestMoveValues()
      // act
      const result = await gameMutator.addMoveToGame({
        gameId: game.id,
        move,
        status: status as GameStatus,
        pgn,
      })
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      const updatedGame = successResult.data
      expect(updatedGame).toBeTrue()

      const gameLoader = new GameLoader()
      const gameResult = await gameLoader.getGameById(game.id)
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
      const whitePlayer = await seedUser()
      const blackPlayer = await seedUser()
      const game = await seedGame({
        whitePlayerId: whitePlayer.id,
        blackPlayerId: blackPlayer.id,
      })
      const isDraw = faker.datatype.boolean()
      const outcome = {
        winner: isDraw ? null : faker.helpers.objectValue(Color),
        draw: isDraw,
      }
      // act
      const result = await gameMutator.setOutcome(
        game.id,
        outcome.winner,
        outcome.draw,
      )
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      const gameOutcome = successResult.data
      expect(gameOutcome).toBeTrue()

      const gameLoader = new GameLoader()
      const gameResult = await gameLoader.getGameById(game.id)
      expect(gameResult).toSatisfy(isSuccess)
      const gameData = gameResult as SuccessType<typeof gameResult>
      const gameDocument = gameData.data
      expect(gameDocument).not.toBeNull()
    })
  })
})
