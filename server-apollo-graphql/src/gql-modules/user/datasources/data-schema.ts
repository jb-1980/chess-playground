import { WithId } from "mongodb"
import { TDocument } from "../../../database/collection"

export type UserDocument = {
  _id: string
  username: string
  passwordHash: string
  rating: number
  avatarUrl?: string
}

export type MongoUserDocument = WithId<TDocument<UserDocument>>
