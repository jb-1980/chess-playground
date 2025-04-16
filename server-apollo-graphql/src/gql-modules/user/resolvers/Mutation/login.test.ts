import { afterEach, assert, describe, expect, it, vi } from "vitest"
import bcrypt from "bcrypt"
import { login } from "./login"
import { faker } from "@faker-js/faker"
import { getTestUserDocument, makeUserDTO, seedUser } from "@test-utils"
import { getApolloContextReturnValue } from "../../../../server-config/context"
import { mongoDB } from "src/database/connection"

describe("User Resolvers::login mutation", () => {
  afterEach(async () => {
    await mongoDB.dropDatabase()
  })
  it("should provide a token for a valid login", async () => {
    // arrange
    const user = await seedUser()
    const context = getApolloContextReturnValue(makeUserDTO(user))
    vi.spyOn(bcrypt, "compare").mockImplementation(() => Promise.resolve(true))
    // act
    const result = await login(
      null,
      { username: user.username, password: "test" },
      context,
      null,
    )
    console.log(result)
    // assert
    assert(result.__typename === "LoginSuccess")
    expect(result.token).toBeString()
  })

  it("should fail with invalid password", async () => {
    // arrange
    const user = getTestUserDocument()
    const context = getApolloContextReturnValue(makeUserDTO(user))

    vi.spyOn(bcrypt, "compare").mockImplementation(() => Promise.resolve(false))
    // act
    const result = await login(
      null,
      { username: user.username, password: "test" },
      context,
      null,
    )
    // assert
    assert(result.__typename === "LoginError")
    expect(result.message).toBe("BAD_CREDENTIALS")
  })
  it("should fail with invalid password", async () => {
    // arrange
    const user = getTestUserDocument()
    const context = getApolloContextReturnValue(makeUserDTO(user))

    // act
    const result = await login(
      null,
      {
        username: faker.internet.username(),
        password: faker.internet.password(),
      },
      context,
      null,
    )
    // assert
    assert(result.__typename === "LoginError")
    expect(result.message).toBe("BAD_CREDENTIALS")
  })
})
