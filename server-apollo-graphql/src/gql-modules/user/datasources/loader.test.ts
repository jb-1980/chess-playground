import { assert, describe, expect, it } from "vitest"
import { UserLoader } from "./loader"
import { MockUserLoader } from "./test-utils/mock-loader"
import { getTestUserDocument } from "./test-utils/mock-user"
import { isSuccess } from "../../../lib/result"

describe("UserLoader", () => {
  it("should get a user by username", async () => {
    // arrange
    const user = getTestUserDocument()
    const loader = new UserLoader(new MockUserLoader([user]))
    // act
    const result = await loader.getUserByUsername(user.username)
    // assert
    assert(isSuccess(result))

    expect(result.data).toEqual(user)
  })

  it("should get null if user not found by username", async () => {
    // arrange
    const user = getTestUserDocument()
    const loader = new UserLoader(new MockUserLoader([user]))
    // act
    const result = await loader.getUserByUsername("notfound")
    // assert
    assert(isSuccess(result))
    expect(result.data).toBeNull()
  })

  it("should get a user by id", async () => {
    // arrange
    const user = getTestUserDocument()
    const loader = new UserLoader(new MockUserLoader([user]))
    // act
    const result = await loader.getUsersByIds([user._id])
    // assert
    assert(isSuccess(result))

    expect(result.data[0]).toEqual(user)
  })
})
