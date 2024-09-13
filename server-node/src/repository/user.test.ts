import { faker } from "@faker-js/faker"
import { isSuccess, SuccessType } from "../lib/result"
import { resetDb } from "../test-utils/reset-db"
import { seedUser } from "./test-utils/seed-user"
import { UserLoader, UserMutator } from "./user"
import { ObjectId } from "mongodb"

describe("Repository: User", () => {
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
      const userLoader = new UserLoader()
      const user = await seedUser()
      // act
      const result = await userLoader.getUserByUsername(user.username)
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>

      expect(successResult.data).toContainAllEntries([
        ["_id", user._id],
        ["username", user.username],
        ["rating", user.rating],
        ["avatarUrl", user.avatarUrl],
        ["passwordHash", user.passwordHash],
      ])
    })

    it("should return null if user not found", async () => {
      // arrange
      const userLoader = new UserLoader()
      // act
      const result = await userLoader.getUserByUsername(
        faker.internet.userName()
      )
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      expect(successResult.data).toBeNull()
    })

    it("should get all users", async () => {
      // arrange
      const userLoader = new UserLoader()
      const user1 = await seedUser()
      const user2 = await seedUser()
      // act
      const result = await userLoader.getUsersByIds([
        user1._id.toHexString(),
        user2._id.toHexString(),
      ])
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      expect(successResult.data).toContainAllValues([
        expect.objectContaining({
          _id: user1._id,
          username: user1.username,
          rating: user1.rating,
          passwordHash: user1.passwordHash,
          avatarUrl: user1.avatarUrl,
        }),
        expect.objectContaining({
          _id: user2._id,
          username: user2.username,
          rating: user2.rating,
          passwordHash: user2.passwordHash,
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
        faker.internet.password()
      )
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      expect(successResult.data).toContainAllEntries([
        ["_id", expect.any(ObjectId)],
        ["username", username],
        ["rating", 1200],
        ["passwordHash", expect.any(String)],
      ])
    })

    it("should update a user's rating", async () => {
      // arrange
      const userMutator = new UserMutator()
      const user = await seedUser()
      const newRating = user.rating + 100
      // act
      const result = await userMutator.updateUserRating(user._id, newRating)
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      expect(successResult.data).toBeTrue()

      const userLoader = new UserLoader()
      const updatedUser = await userLoader.getUserByUsername(user.username)
      expect(updatedUser).toSatisfy(isSuccess)
      const successUser = updatedUser as SuccessType<typeof updatedUser>
      expect(successUser.data).toContainAllEntries([
        ["_id", user._id],
        ["username", user.username],
        ["rating", newRating],
        ["avatarUrl", user.avatarUrl],
        ["passwordHash", user.passwordHash],
      ])
    })
  })
})
