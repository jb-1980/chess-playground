import { faker } from "@faker-js/faker"
import { getTestContext, getTestMiddleware } from "../middleware/test-util"
import {
  FailureType,
  isFailure,
  isSuccess,
  Result,
  SuccessType,
} from "../lib/result"
import { getTestUser } from "../test-utils/user"
import { setupExpress } from "../server/setup-express"
import request from "supertest"
import * as commandModule from "./move"
import { Express } from "express"
import { getTestGame, getTestMoveValues } from "../test-utils/game"
import { DEFAULT_POSITION } from "chess.js"
import { getTestToken } from "../test-utils/jwt"
import { Routes } from "../routes"

describe("Command::move", () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })
  describe("POST /api/commands/move", () => {
    const app = setupExpress(getTestMiddleware())
    it(`Should return 400 for invalid request body`, async () => {
      // arrange
      const body = {}
      const tokenHeader = `Bearer ${getTestToken()}`

      // act
      const response = await request(app)
        .post(Routes.MoveCommand)
        .set("Authorization", tokenHeader)
        .send(body)

      // assert
      expect(response.status).toEqual(400)
    })

    it(`Should return 401 for invalid move`, async () => {
      // arrange
      const moveValues = getTestMoveValues()
      const body = {
        gameId: faker.database.mongodbObjectId(),
        move: moveValues.move,
      }
      const error = faker.helpers.objectValue(commandModule.MoveError)
      const commandSpy = jest
        .spyOn(commandModule, "command_Move")
        .mockResolvedValueOnce(Result.Fail(error))

      const tokenHeader = `Bearer ${getTestToken()}`

      // act
      const response = await request(app)
        .post(Routes.MoveCommand)
        .set("Authorization", tokenHeader)
        .send(body)

      // assert
      expect(response.status).toEqual(401)
      expect(response.body).toContainAllEntries([["error", error]])
      expect(commandSpy).toHaveBeenCalledOnce()
    })

    it(`Should return 200 for a successful move`, async () => {
      // arrange
      const moveValues = getTestMoveValues()
      const body = {
        gameId: faker.database.mongodbObjectId(),
        move: moveValues.move,
      }
      const tokenHeader = `Bearer ${getTestToken()}`

      const commandSpy = jest
        .spyOn(commandModule, "command_Move")
        .mockResolvedValueOnce(Result.Success(moveValues.pgn))

      const response = await request(app)
        .post(Routes.MoveCommand)
        .set("Authorization", tokenHeader)
        .send(body)

      expect(response.status).toEqual(200)
      expect(response.body).toContainAllEntries([["newPGN", moveValues.pgn]])
      expect(commandSpy).toHaveBeenCalledOnce()
    })
  })

  describe("Command", () => {
    it("should return a pgn string for a valid move", async () => {
      // arrange
      const user = getTestUser()
      const moveValues = getTestMoveValues()

      const whiteTurn = moveValues.move.color === "w"
      const game = getTestGame({
        moves: moveValues.moveHistory.slice(0, -1),
        whitePlayer: whiteTurn ? user : undefined,
        blackPlayer: whiteTurn ? undefined : user,
      })
      const context = getTestContext([user], [game])

      // act
      const result = await commandModule.command_Move(
        {
          gameId: game.id,
          move: moveValues.move,
        },
        context,
      )
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      expect(successResult.data.includes(moveValues.pgn)).toBeTruthy()
    })

    it("should fail with invalid move", async () => {
      // arrange
      const user = getTestUser()
      const moveValues = getTestMoveValues()

      const whiteTurn = moveValues.move.color === "w"
      const game = getTestGame({
        moves: moveValues.moveHistory.slice(0, -1),
        whitePlayer: whiteTurn ? user : undefined,
        blackPlayer: whiteTurn ? undefined : user,
      })
      const context = getTestContext([user], [game])
      const invalidMove = {
        ...moveValues.move,
        before: DEFAULT_POSITION,
        san: "Qd4",
      }

      // act
      const result = await commandModule.command_Move(
        {
          gameId: game.id,
          move: invalidMove,
        },
        context,
      )
      // assert
      expect(result).toSatisfy(isFailure)
      const failResult = result as FailureType<typeof result>
      expect(failResult.message).toEqual(commandModule.MoveError.INVALID)
    })

    it("should fail when can't find game", async () => {
      // arrange
      const user = getTestUser()
      const moveValues = getTestMoveValues()
      const context = getTestContext([user])

      // act
      const result = await commandModule.command_Move(
        {
          gameId: faker.database.mongodbObjectId(),
          move: moveValues.move,
        },
        context,
      )
      // assert
      expect(result).toSatisfy(isFailure)
      const failResult = result as FailureType<typeof result>
      expect(failResult.message).toEqual(commandModule.MoveError.GAME_NOT_FOUND)
    })

    it("should fail when not your move", async () => {
      // arrange
      const user = getTestUser()
      const moveValues = getTestMoveValues()
      const whiteTurn = moveValues.move.color === "w"
      const game = getTestGame({
        moves: moveValues.moveHistory.slice(0, -1),
        whitePlayer: whiteTurn ? undefined : user,
        blackPlayer: whiteTurn ? user : undefined,
      })
      const context = getTestContext([user], [game])

      // act
      const result = await commandModule.command_Move(
        {
          gameId: faker.database.mongodbObjectId(),
          move: moveValues.move,
        },
        context,
      )
      // assert
      expect(result).toSatisfy(isFailure)
      const failResult = result as FailureType<typeof result>
      expect(failResult.message).toEqual(commandModule.MoveError.GAME_NOT_FOUND)
    })
  })
})
