import { ObjectId } from "mongodb"

export type UserDocument = {
  _id: ObjectId
  username: string
  passwordHash: string
  rating: number
  avatarUrl?: string
}
