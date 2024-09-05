import jwt from "jsonwebtoken"
import { User, userSchema } from "../domain/user"

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error(
    "Please define the JWT_SECRET environment variable inside .env"
  )
}

export const signToken = (payload: User): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "24h",
  })
}

export const verifyToken = (token: string): User => {
  const verifiedToken = jwt.verify(token, JWT_SECRET)
  const parsedUser = userSchema.safeParse(verifiedToken)
  if (!parsedUser.success) {
    console.error(parsedUser.error)
    throw new Error(
      "While token is valid, the payload is not of the expected shape"
    )
  }
  return parsedUser.data
}
