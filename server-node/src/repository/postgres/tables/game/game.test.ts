import { faker } from "@faker-js/faker"
import { isSuccess, SuccessType } from "../../../../lib/result"
import { resetDb } from "../../test-utils/reset-db"
import { makeGameDTO, PostgresGameLoader, PostgresGameMutator } from "./game"
import {
  getTestPostgresOutcomes,
  seedFullGame,
} from "../../test-utils/seed-game"
import { Color, Move } from "../../../../domain/game"
import { seedUser } from "../../test-utils/seed-user"
import { getTestMoveValues } from "../../../../test-utils/game"

describe("Repository::Postgres: Game", () => {
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
      const gameLoader = new PostgresGameLoader()
      const game = await seedFullGame()

      // act
      const result = await gameLoader.batchGames.load(game.id)

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
      const gameLoader = new PostgresGameLoader()
      // act
      const result = await gameLoader.batchGames.load(faker.string.uuid())
      // assert
      expect(result).toBeNull()
    })

    it("should get all games for a player", async () => {
      // arrange
      const gameLoader = new PostgresGameLoader()
      const game1 = await seedFullGame({}, 1)
      const game2 = await seedFullGame(
        {
          blackPlayer: game1.whitePlayer,
        },
        1,
      )
      await seedFullGame()
      // act
      const result = await gameLoader.batchGamesForPlayer.load(
        game1.whitePlayerId,
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
      const gameMutator = new PostgresGameMutator()
      const whitePlayer = await seedUser()
      const blackPlayer = await seedUser()
      const outcomes = getTestPostgresOutcomes()
      // act
      const result = await gameMutator.insertGame(whitePlayer, blackPlayer, {
        whiteWins: {
          whiteRating: outcomes.whiteWinsWhiteRating,
          blackRating: outcomes.whiteWinsBlackRating,
        },
        blackWins: {
          whiteRating: outcomes.blackWinsWhiteRating,
          blackRating: outcomes.blackWinsBlackRating,
        },
        draw: {
          whiteRating: outcomes.drawWhiteRating,
          blackRating: outcomes.drawBlackRating,
        },
      })
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      const gameId = successResult.data
      expect(gameId).toBeString()

      const gameLoader = new PostgresGameLoader()
      const game = await gameLoader.batchGames.load(gameId)

      expect(game).not.toBeNull()
    })

    it("should add a move to a game", async () => {
      // arrange
      const gameMutator = new PostgresGameMutator()
      const { move, pgn, status, moveHistory } = getTestMoveValues()
      const game = await seedFullGame({
        moves: moveHistory.slice(0, -1),
      })
      // act
      const result = await gameMutator.addMoveToGame({
        gameId: game.id,
        move,
        status,
        pgn,
      })
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      const wasGameUpdated = successResult.data
      expect(wasGameUpdated).toBeTrue()

      const gameLoader = new PostgresGameLoader()
      const updatedGame = await gameLoader.batchGames.load(game.id)
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
      const gameMutator = new PostgresGameMutator()
      const game = await seedFullGame()
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
      const wasGameOutcomeSet = successResult.data
      expect(wasGameOutcomeSet).toBeTrue()
    })
  })
})
