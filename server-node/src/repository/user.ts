import { ObjectId } from "mongodb"
import { MongoCollection } from "./collection"
import bcrypt from "bcrypt"

export type UserDocument = {
  _id: ObjectId
  username: string
  passwordHash: string
}

export type ParsedUserDocument = Omit<UserDocument, "_id"> & {
  id: string
}

export const Users = MongoCollection<UserDocument>("users")

export const createUser = async (
  username: string,
  password: string
): Promise<UserDocument> => {
  const user = await Users.findOne({ username })
  if (user) {
    throw new Error("User already exists")
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const { insertedId } = await Users.insertOne({
    username,
    passwordHash,
  })
  return {
    _id: insertedId,
    username,
    passwordHash,
  }
}

export const getUser = async (
  username: string
): Promise<UserDocument | null> => {
  const user = await Users.findOne({ username })

  return user
}

export const getUsersByIds = async (ids: string[]): Promise<UserDocument[]> => {
  const objectIds = ids.map((id) => new ObjectId(id))
  const users = await Users.find({ _id: { $in: objectIds } }).toArray()
  return users
}
