import { afterEach, assert, describe, expect, it } from "vitest"
import { register } from "./register"
import { getTestUserDocument, makeUserDTO, seedUser } from "@test-utils"
import { getApolloContextReturnValue } from "src/server-config/context"
import { mongoDB } from "src/database/connection"

describe("User Resolvers::register mutation", () => {
  afterEach(async () => {
    await mongoDB.dropDatabase()
  })
  it("should register a user", async () => {
    // arrange
    const user = getTestUserDocument()
    const context = getApolloContextReturnValue(makeUserDTO(user))
    // act
    const result = await register(
      null,
      { username: "test", password: "test" },
      context,
      null,
    )
    // assert

    assert(result.__typename === "RegisterSuccess")
    expect(result.token).toBeString()
  })

  it("should not register a user if the username is taken", async () => {
    // arrange
    const user = await seedUser()
    const context = getApolloContextReturnValue(makeUserDTO(user))

    // act
    const result = await register(
      null,
      { username: user.username, password: "test" },
      context,
      null,
    )
    // assert
    assert(result.__typename === "RegisterError")
    expect(result.message).toBe("USER_ALREADY_EXISTS")
  })
})
