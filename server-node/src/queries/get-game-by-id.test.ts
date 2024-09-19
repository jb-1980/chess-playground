jest.mock("../repository/game")
import { query_GetGameById } from "./get-game-by-id"
import * as getGameByIdModule from "./get-game-by-id"
import { setupExpress } from "../server/setup-express"
import request from "supertest"
import { getTestToken } from "../test-utils/jwt"
import {
  FailureType,
  isFailure,
  isSuccess,
  Result,
  SuccessType,
} from "../lib/result"
import { makeGameDTO } from "../domain/game"
import { getTestGame } from "../repository/test-utils/seed-game"
import { createContext } from "../middleware/context"
import { faker } from "@faker-js/faker"

describe("Queries: Get Game By Id", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  describe("API Layer", () => {
    const app = setupExpress()
    const tokenHeader = `Bearer ${getTestToken()}`
    it("should return 400 if the request body is invalid", async () => {
      const response = await request(app)
        .post("/api/queries/get-game-by-id")
        .set("Authorization", tokenHeader)
        .send({})
      expect(response.status).toBe(400)
    })

    it("should return 500 if the query fails", async () => {
      const querySpy = jest
        .spyOn(getGameByIdModule, "query_GetGameById")
        .mockResolvedValueOnce(Result.Fail("DB_ERROR_WHILE_GETTING_GAME"))

      const gameId = faker.database.mongodbObjectId()
      const response = await request(app)
        .post("/api/queries/get-game-by-id")
        .set("Authorization", tokenHeader)
        .send({ gameId })

      expect(response.status).toBe(500)
      expect(response.body).toBe("DB_ERROR_WHILE_GETTING_GAME")
      expect(querySpy).toHaveBeenCalledWith(gameId, expect.anything())
    })

    it("should return 200 with the game data when the query succeeds", async () => {
      const expectedGame = makeGameDTO(getTestGame())
      const querySpy = jest
        .spyOn(getGameByIdModule, "query_GetGameById")
        .mockResolvedValueOnce(Result.Success(expectedGame))

      const response = await request(app)
        .post("/api/queries/get-game-by-id")
        .set("Authorization", tokenHeader)
        .send({ gameId: expectedGame.id })

      expect(response.status).toBe(200)
      expect(response.body).toEqual(expectedGame)
    })
  })

  describe("Query Layer", () => {
    it("should return a failure result if the loader fails", async () => {
      const context = createContext()
      context.Loader.GameLoader.getGameById = jest
        .fn()
        .mockResolvedValue(Result.Fail("DB_ERROR_WHILE_GETTING_GAME"))
      const result = await query_GetGameById(
        faker.database.mongodbObjectId(),
        context
      )
      expect(result).toSatisfy(isFailure)
      const failResult = result as FailureType<typeof result>
      expect(failResult.message).toBe("DB_ERROR_WHILE_GETTING_GAME")
    })

    it("should return a success result with the game data when the loader succeeds", async () => {
      const game = getTestGame()
      const context = createContext()
      context.Loader.GameLoader.getGameById = jest
        .fn()
        .mockResolvedValue(Result.Success(game))
      const result = await query_GetGameById(
        faker.database.mongodbObjectId(),
        context
      )
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      expect(successResult.data).toEqual(makeGameDTO(game))
    })
  })
})
