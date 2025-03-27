import { assert, describe, expect, it, vi } from "vitest"
import { getTestUserDocument } from "../../datasources/test-utils/mock-user"
import { register } from "./register"
import { Result } from "../../../../lib/result"
import { getMockContext } from "../../../../test-utils/mock-context"

describe("User Resolvers::register mutation", () => {
  it("should register a user", async () => {
    // arrange
    const user = getTestUserDocument()
    const context = getMockContext({
      users: [user],
    })
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
    const user = getTestUserDocument()
    const context = getMockContext({
      users: [user],
    })
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
