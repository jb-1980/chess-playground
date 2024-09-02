import jwt from "jsonwebtoken"
import { ParsedUserDocument } from "../repository/user"

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error(
    "Please define the JWT_SECRET environment variable inside .env"
  )
}

export const signToken = (
  payload: Pick<ParsedUserDocument, "id" | "username">
) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "24h",
  })
}

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as Pick<
    ParsedUserDocument,
    "id" | "username"
  >
}
