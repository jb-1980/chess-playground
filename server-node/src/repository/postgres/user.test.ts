import { faker } from "@faker-js/faker"
import {
  FailureType,
  isFailure,
  isSuccess,
  SuccessType,
} from "../../lib/result"
import { seedUser } from "./test-utils/seed-user"
import { UserLoader, UserMutator } from "./user"
import { resetDb } from "./test-utils/reset-db"
import bcrypt from "bcrypt"
import prisma from "./client"

describe("Repository::Postgres: User", () => {
  beforeAll(async () => {
    await resetDb()
  })

  beforeEach(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await resetDb()
  })

  describe("UserLoader", () => {
    it("should get user by id", async () => {
      // arrange
      const password = faker.internet.password()
      const passwordHash = await bcrypt.hash(password, 10)
      const userLoader = new UserLoader()
      const user = await seedUser({ passwordHash })
      // act
      const result = await userLoader.validateUser(user.username, password)
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>

      expect(successResult.data).toContainAllEntries([
        ["id", user.id],
        ["username", user.username],
        ["rating", user.rating],
        ["avatarUrl", user.avatarUrl],
      ])
    })

    it("should return BAD_CREDENTIALS if user not found", async () => {
      // arrange
      const userLoader = new UserLoader()
      // act
      const result = await userLoader.validateUser(
        faker.internet.userName(),
        faker.internet.password(),
      )
      // assert
      expect(result).toSatisfy(isFailure)
      const failResult = result as FailureType<typeof result>
      expect(failResult.message).toEqual("BAD_CREDENTIALS")
    })

    it("should get all users", async () => {
      // arrange
      const userLoader = new UserLoader()
      const user1 = await seedUser()
      const user2 = await seedUser()
      // act
      const result = await userLoader.getUsersByIds([user1.id, user2.id])
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      expect(successResult.data).toContainAllValues([
        expect.objectContaining({
          id: user1.id,
          username: user1.username,
          rating: user1.rating,
          avatarUrl: user1.avatarUrl,
        }),
        expect.objectContaining({
          id: user2.id,
          username: user2.username,
          rating: user2.rating,
          avatarUrl: user2.avatarUrl,
        }),
      ])
    })
  })

  describe("UserMutator", () => {
    it("should create a user", async () => {
      // arrange
      const userMutator = new UserMutator()
      const username = faker.internet.userName()
      // act
      const result = await userMutator.createUser(
        username,
        faker.internet.password(),
      )
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      expect(successResult.data).toContainAllEntries([
        ["id", expect.any(String)],
        ["username", username],
        ["rating", 1200],
        ["avatarUrl", undefined],
      ])
    })

    it("should update a user's rating", async () => {
      // arrange
      const userMutator = new UserMutator()
      const user = await seedUser()
      const newRating = user.rating + 100
      // act
      const result = await userMutator.updateUserRating(user.id, newRating)
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      expect(successResult.data).toBeTrue()

      const updatedUser = await prisma.user.findUnique({
        where: { username: user.username },
      })

      expect(updatedUser).toContainAllEntries([
        ["id", user.id],
        ["username", user.username],
        ["rating", newRating],
        ["avatarUrl", user.avatarUrl],
        ["passwordHash", user.passwordHash],
      ])
    })
  })
})
