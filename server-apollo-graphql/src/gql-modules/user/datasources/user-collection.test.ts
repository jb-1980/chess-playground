// @vitest-environment mongodb
import { afterEach, assert, describe, expect, it } from "vitest"
import { mongoDB } from "../../../database/connection"
import { seedUser } from "./test-utils/seed-user"
import {
  MongoDBUserMutator,
  MongoUserDataLoader,
  Users,
} from "./user-collection"
import { isSuccess } from "../../../lib/result"
import { faker } from "@faker-js/faker"

describe("Mongo User Collection", () => {
  afterEach(async () => {
    await mongoDB.dropDatabase()
  })

  describe("MongoUserDataLoader", () => {
    it("get a user by username", async () => {
      // arrange
      const userLoader = new MongoUserDataLoader()
      const user = await seedUser()
      // act
      const result = await userLoader.batchUsersByUsername.load(user.username)
      // assert
      expect(result).toEqual(user)
    })

    it("get users by id", async () => {
      // arrange
      const userLoader = new MongoUserDataLoader()
      const user = await seedUser()

      // act
      const result = await userLoader.batchUsersById.load(user._id)

      // assert
      expect(result).toEqual(user)
    })

    it("should return null if user not found by id", async () => {
      // arrange
      const userLoader = new MongoUserDataLoader()
      // act
      const result = await userLoader.batchUsersById.load(
        faker.database.mongodbObjectId(),
      )
      // assert
      expect(result).toBeNull()
    })
  })

  describe("UserMutator", () => {
    it("should create a user", async () => {
      // arrange
      const userMutator = new MongoDBUserMutator()
      const username = faker.internet.username()
      // act
      const result = await userMutator.createUser(
        username,
        faker.internet.password(),
      )
      // assert
      assert(isSuccess(result))
      expect(result.data._id).toBeString()
      expect(result.data.username).toBe(username)
      expect(result.data.rating).toBe(1200)
    })

    it("should update a user's rating", async () => {
      // arrange
      const userMutator = new MongoDBUserMutator()
      const user = await seedUser()
      const newRating = user.rating + 100
      // act
      const result = await userMutator.updateUserRating(user._id, newRating)
      // assert
      assert(isSuccess(result))
      expect(result.data).toBeTrue()

      const updatedUser = await Users.findOne({ username: user.username })
      expect(updatedUser.rating).toBe(newRating)
    })
  })
})
