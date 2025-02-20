import { faker } from "@faker-js/faker"
import { getTestContext } from "../middleware/test-util"
import { command_RegisterUser } from "./register-user"
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
import * as commandModule from "./register-user"

describe("Command::register-user", () => {
  describe("POST /register-user", () => {
    beforeEach(() => {
      jest.restoreAllMocks()
    })
    it(`Should return 400 for invalid request body`, async () => {
      // arrange
      const body = {}
      const app = setupExpress()

      // act
      const response = await request(app).post("/register-user").send(body)

      // assert
      expect(response.status).toEqual(400)
    })

    it(`Should return 500 for an error in the command`, async () => {
      // arrange
      const commandSpy = jest
        .spyOn(commandModule, "command_RegisterUser")
        .mockResolvedValueOnce(Result.Fail("DB_ERR_FAILED_TO_CREATE_USER"))
      const body = {
        username: faker.internet.userName(),
        password: faker.internet.password(),
      }
      const app = setupExpress()

      // act
      const response = await request(app).post("/register-user").send(body)

      // assert
      expect(response.status).toEqual(500)
      expect(commandSpy).toHaveBeenCalledOnce()
    })

    it(`Should return 200 for a successful command`, async () => {
      const body = {
        username: faker.internet.userName(),
        password: faker.internet.password(),
      }

      const commandSpy = jest
        .spyOn(commandModule, "command_RegisterUser")
        .mockResolvedValueOnce(Result.Success(getTestUser()))

      const app = setupExpress()

      const response = await request(app).post("/register-user").send(body)

      expect(response.status).toEqual(200)
      expect(response.body).toContainAllEntries([["token", expect.any(String)]])
      expect(commandSpy).toHaveBeenCalledOnce()
    })
  })

  describe("Command", () => {
    it("should create a user", async () => {
      // arrange
      const context = getTestContext()
      // act
      const result = await command_RegisterUser(
        {
          username: faker.internet.userName(),
          password: faker.internet.password(),
        },
        context,
      )
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      expect(successResult.data).toContainAllEntries([
        ["id", expect.any(String)],
        ["username", expect.any(String)],
        ["rating", expect.any(Number)],
        ["avatarUrl", expect.any(String)],
      ])
    })
    it("should not create a user if the username is taken", async () => {
      // arrange
      const user = getTestUser()
      const context = getTestContext([user])

      // act
      const result = await command_RegisterUser(
        {
          username: user.username,
          password: faker.internet.password(),
        },
        context,
      )
      // assert
      expect(result).toSatisfy(isFailure)
      const failResult = result as FailureType<typeof result>
      expect(failResult.message).toEqual("USER_ALREADY_EXISTS")
    })
  })
})
