import { faker } from "@faker-js/faker"
import {
  FailureType,
  isFailure,
  isSuccess,
  Result,
  SuccessType,
} from "../lib/result"
import { getTestUser } from "../test-utils/user"

import * as commandModule from "./create-game"
import { getTestContext } from "../test-utils/context"

describe("Command::create-game", () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  describe("Command", () => {
    it("should return a success result", async () => {
      // arrange
      const users = [getTestUser(), getTestUser()]
      const context = getTestContext({ users })
      // act
      const result = await commandModule.command_CreateGame(
        [users[0].id, users[1].id],
        context,
      )
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      expect(successResult.data).toContainAllEntries([
        ["gameId", expect.any(String)],
        ["whitePlayer", expect.any(Object)],
        ["blackPlayer", expect.any(Object)],
      ])
    })
    it("should fail with `USERS_NOT_FOUND` if given an invalid userid", async () => {
      // arrange
      const context = getTestContext()

      // act
      const result = await commandModule.command_CreateGame(
        ["invalid-id", "invalid-id"],
        context,
      )
      // assert
      expect(result).toSatisfy(isFailure)
      const failResult = result as FailureType<typeof result>
      expect(failResult.message).toEqual("USERS_NOT_FOUND")
    })
  })
})
