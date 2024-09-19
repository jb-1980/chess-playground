jest.mock("../repository/game")
import { query_GetGamesForPlayerId } from "./get-games"
import * as getGamesModule from "./get-games"
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

describe("Queries: Get Games", () => {
  describe("API Layer", () => {
    const app = setupExpress()
    const tokenHeader = `Bearer ${getTestToken()}`
    it("should return 400 if the request body is invalid", async () => {
      const response = await request(app)
        .post("/api/queries/get-games")
        .set("Authorization", tokenHeader)
        .send({})
      expect(response.status).toBe(400)
    })

    it("should return 500 if the query fails", async () => {
      const querySpy = jest
        .spyOn(getGamesModule, "query_GetGamesForPlayerId")
        .mockResolvedValueOnce(Result.Fail("DB_ERR_GET_GAMES_FOR_USER_ID"))

      const response = await request(app)
        .post("/api/queries/get-games")
        .set("Authorization", tokenHeader)
        .send({ playerId: "123" })

      expect(response.status).toBe(500)
      expect(response.body).toBe("DB_ERR_GET_GAMES_FOR_USER_ID")
      expect(querySpy).toHaveBeenCalledWith("123", expect.anything())
    })

    it("should return 200 with the game data when the query succeeds", async () => {
      const expectedGame = makeGameDTO(getTestGame())
      const querySpy = jest
        .spyOn(getGamesModule, "query_GetGamesForPlayerId")
        .mockResolvedValueOnce(Result.Success([expectedGame]))

      const response = await request(app)
        .post("/api/queries/get-games")
        .set("Authorization", tokenHeader)
        .send({ playerId: "123" })

      expect(response.status).toBe(200)
      expect(response.body).toEqual([expectedGame])
    })
  })

  describe("Query Layer", () => {
    it("should return a failure result if the loader fails", async () => {
      const context = createContext()
      context.Loader.GameLoader.getGamesForPlayerId = jest
        .fn()
        .mockResolvedValue(Result.Fail("DB_ERR_GET_GAMES_FOR_USER_ID"))
      const result = await query_GetGamesForPlayerId("123", context)
      expect(result).toSatisfy(isFailure)
      const failResult = result as FailureType<typeof result>
      expect(failResult.message).toBe("DB_ERR_GET_GAMES_FOR_USER_ID")
    })

    it("should return a success result with the game data when the loader succeeds", async () => {
      const game = getTestGame()
      const context = createContext()
      context.Loader.GameLoader.getGamesForPlayerId = jest
        .fn()
        .mockResolvedValue(Result.Success([game]))
      const result = await query_GetGamesForPlayerId("123", context)
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      expect(successResult.data).toEqual([makeGameDTO(game)])
    })
  })
})
