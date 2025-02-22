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
import * as commandModule from "./login"
import { Express } from "express"
import bcrypt from "bcrypt"
import { Routes } from "../routes"

describe("Command::login", () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })
  describe("POST /login", () => {
    const app = setupExpress(getTestMiddleware())

    it(`Should return 400 for invalid request body`, async () => {
      // arrange
      const body = {}

      // act
      const response = await request(app).post(Routes.LoginCommand).send(body)

      // assert
      expect(response.status).toEqual(400)
    })

    it(`Should return 401 for invalid credentials`, async () => {
      // arrange
      const commandSpy = jest
        .spyOn(commandModule, "command_LoginUser")
        .mockResolvedValueOnce(Result.Fail("BAD_CREDENTIALS"))
      const body = {
        username: faker.internet.userName(),
        password: faker.internet.password(),
      }

      // act
      const response = await request(app).post(Routes.LoginCommand).send(body)

      // assert
      expect(response.status).toEqual(401)
      expect(response.body).toContainAllEntries([["error", "BAD_CREDENTIALS"]])
      expect(commandSpy).toHaveBeenCalledOnce()
    })

    it(`Should return 200 for a successful login`, async () => {
      const body = {
        username: faker.internet.userName(),
        password: faker.internet.password(),
      }

      const token = faker.string.alphanumeric(10)
      const commandSpy = jest
        .spyOn(commandModule, "command_LoginUser")
        .mockResolvedValueOnce(Result.Success(token))

      const response = await request(app).post(Routes.LoginCommand).send(body)

      expect(response.status).toEqual(200)
      expect(response.body).toContainAllEntries([["token", token]])
      expect(commandSpy).toHaveBeenCalledOnce()
    })
  })

  describe("Command", () => {
    it("should return a token for a valid login", async () => {
      // arrange
      const user = getTestUser()
      const context = getTestContext([user])
      jest
        .spyOn(bcrypt, "compare")
        .mockImplementation(() => Promise.resolve(true))
      // act
      const result = await commandModule.command_LoginUser(
        {
          username: user.username,
          password: faker.internet.password(),
        },
        context,
      )
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      expect(successResult.data).toEqual(expect.any(String))
    })
    it("should fail with invalid password", async () => {
      // arrange
      const user = getTestUser()
      const context = getTestContext([user])
      jest
        .spyOn(bcrypt, "compare")
        .mockImplementation(() => Promise.resolve(false))
      // act
      const result = await commandModule.command_LoginUser(
        {
          username: user.username,
          password: faker.internet.password(),
        },
        context,
      )
      // assert
      expect(result).toSatisfy(isFailure)
      const failResult = result as FailureType<typeof result>
      expect(failResult.message).toEqual("BAD_CREDENTIALS")
    })

    it("should fail with invalid username", async () => {
      // arrange
      const context = getTestContext()
      // act
      const result = await commandModule.command_LoginUser(
        {
          username: faker.internet.userName(),
          password: faker.internet.password(),
        },
        context,
      )
      // assert
      expect(result).toSatisfy(isFailure)
      const failResult = result as FailureType<typeof result>
      expect(failResult.message).toEqual("BAD_CREDENTIALS")
    })
  })
})
