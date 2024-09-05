import { ObjectId } from "mongodb"
import { MongoCollection } from "./collection"
import bcrypt from "bcrypt"
import { AsyncResult, Result } from "../lib/result"

export type UserDocument = {
  _id: ObjectId
  username: string
  passwordHash: string
  rating: number
  avatarUrl?: string
}

export type ParsedUserDocument = Omit<UserDocument, "_id" | "passwordHash"> & {
  id: string
}

export const Users = MongoCollection<UserDocument>("users")

export const createUser = async (
  username: string,
  password: string
): AsyncResult<
  UserDocument,
  "DB_ERR_FAILED_TO_CREATE_USER" | "USER_ALREADY_EXISTS"
> => {
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
      _id: insertedId,
      username,
      passwordHash,
      rating: 1200,
    })
  } catch (error) {
    console.error(error)
    return Result.Fail("DB_ERR_FAILED_TO_CREATE_USER", error)
  }
}

export const getUser = async (
  username: string
): AsyncResult<UserDocument | null, "DB_ERR_FAILED_TO_GET_USER"> => {
  try {
    const user = await Users.findOne({ username })

    return Result.Success(user)
  } catch (error) {
    console.error(error)
    return Result.Fail("DB_ERR_FAILED_TO_GET_USER", error)
  }
}

export const getUsersByIds = async (
  ids: string[]
): AsyncResult<UserDocument[], "DB_ERR_FAILED_TO_GET_USERS_BY_IDS"> => {
  try {
    const objectIds = ids.map((id) => new ObjectId(id))
    const users = await Users.find({ _id: { $in: objectIds } }).toArray()
    return Result.Success(users)
  } catch (error) {
    console.error(error)
    return Result.Fail("DB_ERR_FAILED_TO_GET_USERS_BY_IDS" as const, error)
  }
}
