import { ObjectId } from "mongodb"
import { MongoCollection } from "../../collection"
import bcrypt from "bcrypt"
import { AsyncResult, Result } from "../../../../lib/result"
import DataLoader from "dataloader"
import { DBUserLoader, DBUserMutator } from "../../../loaders"
import { User } from "../../../../domain/user"

export type UserDocument = {
  _id: ObjectId | string
  username: string
  passwordHash: string
  rating: number
  avatarUrl?: string | null
}

export type ParsedUserDocument = Omit<UserDocument, "_id" | "passwordHash"> & {
  id: string
}

export const Users = MongoCollection<UserDocument>("users")

export const makeUserDto = (
  user: Omit<UserDocument, "passwordHash">,
): User => ({
  id: typeof user._id === "string" ? user._id : user._id.toHexString(),
  username: user.username,
  rating: user.rating,
  avatarUrl: user.avatarUrl,
})

export class MongoDBUserLoader implements DBUserLoader {
  batchUsersById = new DataLoader<string, User | null>(async (ids) => {
    const users = await Users.find({
      _id: { $in: ids.map((id) => new ObjectId(id)) },
    }).toArray()

    const usersMap = users.reduce(
      (map, user) => {
        map[user._id.toString()] = makeUserDto(user)
        return map
      },
      {} as Record<string, User>,
    )

    return ids.map((id) => usersMap[id] || null)
  })

  batchUsersByUsername = new DataLoader<
    string,
    (User & { passwordHash: string }) | null
  >(async (usernames) => {
    const users = await Users.find({ username: { $in: usernames } }).toArray()

    const usersMap = users.reduce(
      (map, user) => {
        map[user.username] = {
          ...makeUserDto(user),
          passwordHash: user.passwordHash,
        }
        return map
      },
      {} as Record<string, User & { passwordHash: string }>,
    )

    return usernames.map((username) => usersMap[username] || null)
  })
}

export class MongoDBUserMutator implements DBUserMutator {
  public async createUser(
    username: string,
    passwordHash: string,
  ): AsyncResult<User, "DB_ERR_FAILED_TO_CREATE_USER"> {
    try {
      const { insertedId } = await Users.insertOne({
        _id: new ObjectId().toHexString(),
        username,
        passwordHash,
        rating: 1200,
        avatarUrl: "",
      })
      return Result.Success({
        id:
          insertedId instanceof ObjectId
            ? insertedId.toHexString()
            : insertedId,
        username,
        rating: 1200,
      })
    } catch (error) {
      console.dir(error, { depth: 6 })
      return Result.Fail("DB_ERR_FAILED_TO_CREATE_USER", error)
    }
  }

  public async updateUserRating(
    userId: ObjectId | string,
    newRating: number,
  ): AsyncResult<boolean, "DB_ERR_FAILED_TO_UPDATE_USER_RATING"> {
    const _id = userId instanceof ObjectId ? userId : new ObjectId(userId)
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
