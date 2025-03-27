import DataLoader from "dataloader"
import { MongoCollection } from "../../../database/collection"
import { UserDocument } from "./data-schema"
import { DBUserLoader } from "./types"
import { AsyncResult, Result } from "../../../lib/result"
import { ObjectId } from "mongodb"

export const Users = new MongoCollection<UserDocument>("users")

await Users.initialize({
  indexes: {
    indexSpecs: [
      { name: "username", key: { username: 1 }, unique: true },
      { name: "rating", key: { rating: -1 } },
    ],
  },
  validator: {
    jsonSchema: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "username", "passwordHash", "rating", "avatarUrl"],
        properties: {
          _id: {
            bsonType: "string",
          },
          username: {
            bsonType: "string",
          },
          passwordHash: {
            bsonType: "string",
          },
          rating: {
            bsonType: "int",
          },
          avatarUrl: {
            bsonType: "string",
          },
        },
      },
    },
  },
})

export class MongoUserDataLoader implements DBUserLoader {
  batchUsersById = new DataLoader<string, UserDocument | null>(async (ids) => {
    const users = await Users.find({
      _id: { $in: ids },
    }).toArray()

    const usersMap = users.reduce(
      (map, user) => {
        map[user._id.toString()] = user
        return map
      },
      {} as Record<string, UserDocument>,
    )

    return ids.map((id) => usersMap[id] || null)
  })

  batchUsersByUsername = new DataLoader<string, null | UserDocument>(
    async (usernames): Promise<Array<UserDocument | null>> => {
      const users = await Users.find({ username: { $in: usernames } }).toArray()

      const usersMap = users.reduce(
        (map, user) => {
          map[user.username] = user
          return map
        },
        {} as Record<string, UserDocument>,
      )

      return usernames.map((username) => usersMap[username] || null)
    },
  )
}

export class MongoDBUserMutator {
  public async createUser(
    username: string,
    passwordHash: string,
  ): AsyncResult<UserDocument, "DB_ERR_FAILED_TO_CREATE_USER"> {
    try {
      const { insertedId } = await Users.insertOne({
        _id: new ObjectId().toHexString(),
        username,
        passwordHash,
        rating: 1200,
        avatarUrl: "",
      })
      return Result.Success({
        _id: insertedId,
        passwordHash,
        username,
        rating: 1200,
      })
    } catch (error) {
      console.dir(error, { depth: 6 })
      return Result.Fail("DB_ERR_FAILED_TO_CREATE_USER", error)
    }
  }

  public async updateUserRating(
    userId: string,
    newRating: number,
  ): AsyncResult<boolean, "DB_ERR_FAILED_TO_UPDATE_USER_RATING"> {
    const _id = userId
    try {
      const { modifiedCount } = await Users.updateOne(
        { _id },
        { $set: { rating: newRating } },
      )

      return Result.Success(modifiedCount === 1)
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERR_FAILED_TO_UPDATE_USER_RATING", error)
    }
  }
}
