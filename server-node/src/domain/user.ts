import { ObjectId } from "mongodb"
import { z } from "zod"

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  rating: z.number().default(1200),
  avatarUrl: z.string().optional(),
})

export type User = z.infer<typeof userSchema>

export const makeUserDto = (user: {
  _id: ObjectId
  username: string
  rating: number
}): User => {
  return {
    id: user._id.toString(),
    username: user.username,
    rating: user.rating,
  }
}
