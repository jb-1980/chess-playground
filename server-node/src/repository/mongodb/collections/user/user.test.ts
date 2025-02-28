import { faker } from "@faker-js/faker"
import { isSuccess, SuccessType } from "../../../../lib/result"
import { seedUser } from "../../test-utils/seed-user"
import { MongoDBUserLoader, MongoDBUserMutator, Users } from "./user"
import { resetDb } from "../../test-utils/reset-db"
import { mongoClient } from "../../connection"

describe("Repository::MongoDB: User", () => {
  beforeAll(async () => {
    await resetDb()
  })

  beforeEach(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await resetDb()
    await mongoClient.close()
  })

  describe("UserLoader", () => {
    it("should get user by id", async () => {
      // arrange
      const userLoader = new MongoDBUserLoader()
      const user = await seedUser()

      // act
      const result = await userLoader.batchUsersById.load(
        user._id.toHexString(),
      )

      // assert
      expect(result).toContainAllEntries([
        ["id", user._id.toHexString()],
        ["username", user.username],
        ["rating", user.rating],
        ["avatarUrl", user.avatarUrl],
      ])
    })

    it("should return null if user not found by id", async () => {
      // arrange
      const userLoader = new MongoDBUserLoader()
      // act
      const result = await userLoader.batchUsersById.load(
        faker.database.mongodbObjectId(),
      )
      // assert
      expect(result).toBeNull()
    })

    it("should load a user by username", async () => {
      // arrange
      const userLoader = new MongoDBUserLoader()
      const user = await seedUser()
      // act
      const result = await userLoader.batchUsersByUsername.load(user.username)
      // assert
      expect(result).toContainAllEntries([
        ["id", user._id.toHexString()],
        ["username", user.username],
        ["rating", user.rating],
        ["avatarUrl", user.avatarUrl],
        ["passwordHash", user.passwordHash],
      ])
    })

    it("should return null if user not found by username", async () => {
      // arrange
      const userLoader = new MongoDBUserLoader()
      // act
      const result = await userLoader.batchUsersByUsername.load(
        faker.internet.userName(),
      )
      // assert
      expect(result).toBeNull()
    })
  })

  describe("UserMutator", () => {
    it("should create a user", async () => {
      // arrange
      const userMutator = new MongoDBUserMutator()
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
      ])
    })

    it("should update a user's rating", async () => {
      // arrange
      const userMutator = new MongoDBUserMutator()
      const user = await seedUser()
      const newRating = user.rating + 100
      // act
      const result = await userMutator.updateUserRating(user._id, newRating)
      // assert
      expect(result).toSatisfy(isSuccess)
      const successResult = result as SuccessType<typeof result>
      expect(successResult.data).toBeTrue()

      const updatedUser = await Users.findOne({ username: user.username })

      expect(updatedUser).toContainAllEntries([
        ["_id", user._id],
        ["username", user.username],
        ["rating", newRating],
        ["avatarUrl", user.avatarUrl],
        ["passwordHash", user.passwordHash],
      ])
    })
  })
})
