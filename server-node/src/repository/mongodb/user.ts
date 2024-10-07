import { ObjectId } from "mongodb"
import { MongoCollection } from "./collection"
import bcrypt from "bcrypt"
import { AsyncResult, Result } from "../../lib/result"
import DataLoader from "dataloader"
import { UserLoaderInterface, UserMutatorInterface } from "../loaders"
import { User } from "../../domain/user"

export type UserDocument = {
  _id: ObjectId
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
  id: user._id.toHexString(),
  username: user.username,
  rating: user.rating,
  avatarUrl: user.avatarUrl,
})

export class UserLoader extends UserLoaderInterface {
  private _batchUsersById = new DataLoader<string, UserDocument | null>(
    async (ids) => {
      const users = await Users.find({
        _id: { $in: ids.map((id) => new ObjectId(id)) },
      }).toArray()

      const usersMap = users.reduce(
        (map, user) => {
          map[user._id.toString()] = user
          return map
        },
        {} as Record<string, UserDocument>,
      )

      return ids.map((id) => usersMap[id] || null)
    },
  )

  private _batchUsersByUsername = new DataLoader<string, UserDocument | null>(
    async (usernames) => {
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

  public async validateUser(
    username: string,
    password: string,
  ): AsyncResult<User, "DB_ERR_FAILED_TO_GET_USER" | "BAD_CREDENTIALS"> {
    try {
      const user = await this._batchUsersByUsername.load(username)
      if (!user) {
        return Result.Fail("BAD_CREDENTIALS")
      }

      const passwordMatch = await bcrypt.compare(password, user.passwordHash)
      if (!passwordMatch) {
        return Result.Fail("BAD_CREDENTIALS")
      }
      const parsedUser = makeUserDto(user)

      return Result.Success(parsedUser)
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERR_FAILED_TO_GET_USER", error)
    }
  }

  public async getUsersByIds(
    ids: string[],
  ): AsyncResult<User[], "DB_ERR_FAILED_TO_GET_USERS_BY_IDS"> {
    try {
      const users = await this._batchUsersById.loadMany(ids)
      return Result.Success(
        users
          .filter((user): user is UserDocument => {
            return user !== null && !(user instanceof Error)
          })
          .map(makeUserDto),
      )
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERR_FAILED_TO_GET_USERS_BY_IDS" as const, error)
    }
  }
}

export class UserMutator extends UserMutatorInterface {
  public async createUser(
    username: string,
    password: string,
  ): AsyncResult<User, "DB_ERR_FAILED_TO_CREATE_USER" | "USER_ALREADY_EXISTS"> {
    try {
      const user = await Users.findOne({ username })

      if (user) {
        return Result.Fail("USER_ALREADY_EXISTS")
      }

      const passwordHash = await bcrypt.hash(password, 10)

      const { insertedId } = await Users.insertOne({
        username,
        passwordHash,
        rating: 1200,
      })
      return Result.Success({
        id: insertedId.toHexString(),
        username,
        rating: 1200,
      })
    } catch (error) {
      console.error(error)
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
