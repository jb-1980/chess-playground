import { faker } from "@faker-js/faker"
import { isSuccess, SuccessType } from "../../../../lib/result"
import { PostgresUserLoader, PostgresUserMutator } from "./user"
import prisma from "../../client"
import { resetDb } from "../../test-utils/reset-db"
import { seedUser } from "../../test-utils/seed-user"

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
      const userLoader = new PostgresUserLoader()
      const user = await seedUser()

      // act
      const result = await userLoader.batchUsersById.load(user.id)

      // assert
      expect(result).toContainAllEntries([
        ["id", user.id],
        ["username", user.username],
        ["rating", user.rating],
        ["avatarUrl", user.avatarUrl],
      ])
    })

    it("should return null if user not found by id", async () => {
      // arrange
      const userLoader = new PostgresUserLoader()
      // act
      const result = await userLoader.batchUsersById.load(
        faker.database.mongodbObjectId(),
      )
      // assert
      expect(result).toBeNull()
    })

    it("should load a user by username", async () => {
      // arrange
      const userLoader = new PostgresUserLoader()
      const user = await seedUser()
      // act
      const result = await userLoader.batchUsersByUsername.load(user.username)
      // assert
      expect(result).toContainAllEntries([
        ["id", user.id],
        ["username", user.username],
        ["rating", user.rating],
        ["avatarUrl", user.avatarUrl],
        ["passwordHash", user.passwordHash],
      ])
    })

    it("should return null if user not found by username", async () => {
      // arrange
      const userLoader = new PostgresUserLoader()
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
      const userMutator = new PostgresUserMutator()
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
      const userMutator = new PostgresUserMutator()
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
