import { assert, describe, expect, it, vi } from "vitest"
import { getTestUserDocument } from "../../datasources/test-utils/mock-user"
import { getMockContext } from "../../../../test-utils/mock-context"
import bcrypt from "bcrypt"
import { login } from "./login"
import { faker } from "@faker-js/faker"

describe("User Resolvers::login mutation", () => {
  it("should provide a token for a valid login", async () => {
    // arrange
    const user = getTestUserDocument()
    const context = getMockContext({
      users: [user],
    })
    vi.spyOn(bcrypt, "compare").mockImplementation(() => Promise.resolve(true))
    // act
    const result = await login(
      null,
      { username: user.username, password: "test" },
      context,
      null,
    )
    // assert
    assert(result.__typename === "LoginSuccess")
    expect(result.token).toBeString()
  })

  it("should fail with invalid password", async () => {
    // arrange
    const user = getTestUserDocument()
    const context = getMockContext({
      users: [user],
    })
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
    const context = getMockContext({
      users: [user],
    })
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
