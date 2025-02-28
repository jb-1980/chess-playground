import { faker } from "@faker-js/faker"
import {
  FailureType,
  isFailure,
  isSuccess,
  SuccessType,
} from "../../../lib/result"
import { getTestUser } from "../../../test-utils/user"
import { UserLoader } from "./user-loader"
import bcrypt from "bcrypt"
import { MockUserLoader } from "../../../test-utils/db-injectors"

describe("UserLoader", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  it("should retrieve a valid user when proper credentials are given", async () => {
    // arrange
    const user = getTestUser()
    const loader = new UserLoader(new MockUserLoader([user]))
    jest
      .spyOn(bcrypt, "compare")
      .mockImplementation(() => Promise.resolve(true))

    // act
    const result = await loader.validateUser(
      user.username,
      faker.internet.password(),
    )

    // assert
    expect(result).toSatisfy(isSuccess)
    const successResult = result as SuccessType<typeof result>
    expect(successResult.data).toBeObject()
    expect(successResult.data?.id).toEqual(user.id)
  })

  it("should fail with `BAD_CREDENTIALS` when given invalid username", async () => {
    // arrange
    const loader = new UserLoader(new MockUserLoader())

    // act
    const result = await loader.validateUser(
      faker.string.uuid(),
      faker.internet.password(),
    )

    // assert
    expect(result).toSatisfy(isFailure)
    const failResult = result as FailureType<typeof result>
    expect(failResult.message).toBe("BAD_CREDENTIALS")
  })

  it("should fail with `BAD_CREDENTIALS` when given invalid password", async () => {
    // arrange
    const user = getTestUser()
    const loader = new UserLoader(new MockUserLoader([user]))
    jest
      .spyOn(bcrypt, "compare")
      .mockImplementation(() => Promise.resolve(false))

    // act
    const result = await loader.validateUser(
      faker.string.uuid(),
      faker.internet.password(),
    )

    // assert
    expect(result).toSatisfy(isFailure)
    const failResult = result as FailureType<typeof result>
    expect(failResult.message).toBe("BAD_CREDENTIALS")
  })

  it("should get all users for a group of ids", async () => {
    // arrange
    const users = [getTestUser(), getTestUser()]
    const loader = new UserLoader(new MockUserLoader(users))

    // act
    const result = await loader.getUsersByIds(users.map((user) => user.id))

    // assert
    expect(result).toSatisfy(isSuccess)
    const successResult = result as SuccessType<typeof result>
    expect(successResult.data).toBeArrayOfSize(2)
    expect(successResult.data[0].id).toEqual(users[0].id)
    expect(successResult.data[1].id).toEqual(users[1].id)
  })
})
