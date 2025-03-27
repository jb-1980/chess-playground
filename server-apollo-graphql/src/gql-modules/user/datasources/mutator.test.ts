import { faker } from "@faker-js/faker"
import {
  FailureType,
  isFailure,
  isSuccess,
  SuccessType,
} from "../../../lib/result"
import { assert, describe, expect, it } from "vitest"
import { MockUserMutator } from "./test-utils/mock-mutator"
import { MockUserLoader } from "./test-utils/mock-loader"
import { UserMutator } from "./mutator"
import { getTestUserDocument } from "./test-utils/mock-user"

describe("UserMutator", () => {
  it("should create a user", async () => {
    // arrange
    const mutator = new UserMutator(new MockUserMutator(), new MockUserLoader())
    const username = faker.internet.username()
    // act
    const result = await mutator.createUser(username, faker.internet.password())

    // assert
    assert(isSuccess(result))
    expect(result.data._id).toBeString()
    expect(result.data.username).toBe(username)
    expect(result.data.rating).toBe(1500)
    expect(result.data.avatarUrl).toBeString()
  })

  it("should not create a user if the username is taken", async () => {
    // arrange
    const user = getTestUserDocument()
    const mutator = new UserMutator(
      new MockUserMutator([user]),
      new MockUserLoader([user]),
    )

    // act
    const result = await mutator.createUser(
      user.username,
      faker.internet.password(),
    )

    // assert
    assert(isFailure(result))
    expect(result.message).toEqual("USER_ALREADY_EXISTS")
  })

  it("should update a user's rating", async () => {
    // arrange
    const user = getTestUserDocument()
    const mutator = new UserMutator(
      new MockUserMutator([user]),
      new MockUserLoader([user]),
    )
    // act
    const result = await mutator.updateUserRating(user._id, 2000)

    // assert
    assert(isSuccess(result))
    expect(result.data).toEqual(true)
  })
})
