import { faker } from "@faker-js/faker"
import {
  FailureType,
  isFailure,
  isSuccess,
  SuccessType,
} from "../../lib/result"
import { UserMutator } from "./user-mutator"
import { MockUserLoader, MockUserMutator } from "../../repository/test-utils"
import { getTestUser } from "../../test-utils/user"

describe("UserMutator", () => {
  it("should create a user", async () => {
    // arrange
    const mutator = new UserMutator(new MockUserMutator(), new MockUserLoader())

    // act
    const result = await mutator.createUser(
      faker.internet.userName(),
      faker.internet.password(),
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
    expect(result).toSatisfy(isFailure)
    const failResult = result as FailureType<typeof result>
    expect(failResult.message).toEqual("USER_ALREADY_EXISTS")
  })

  it("should update a user's rating", async () => {
    // arrange
    const user = getTestUser()
    const mutator = new UserMutator(
      new MockUserMutator([user]),
      new MockUserLoader([user]),
    )

    // act
    const result = await mutator.updateUserRating(user.id, 1500)

    // assert
    expect(result).toSatisfy(isSuccess)
    const successResult = result as SuccessType<typeof result>
    expect(successResult.data).toEqual(true)
  })
})
