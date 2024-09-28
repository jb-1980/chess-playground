import jwt from "jsonwebtoken"
import { User } from "../gql-modules/types.generated"
import { Request, Response, NextFunction } from "express"

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error(
    "Please define the JWT_SECRET environment variable inside .env",
  )
}

export const signToken = (payload: User): string => {
  return jwt.sign(
    {
      ...payload,
      sub: payload.id,
    },
    JWT_SECRET,
    {
      expiresIn: "24h",
    },
  )
}

export const verifyToken = (token: string): User => {
  const verifiedToken = jwt.verify(token, JWT_SECRET, {
    ignoreExpiration: false,
  })
  if (typeof verifiedToken !== "object") {
    throw new Error("MALFORMED_TOKEN_ERROR")
  }
  return ensureUser(verifiedToken)
}

const ensureUser = (user: Record<string, unknown>): User => {
  const { id, username, rating, avatarUrl } = user
  if (typeof id !== "string") {
    throw new Error("MALFORMED_TOKEN_ERROR")
  }
  if (typeof username !== "string") {
    throw new Error("MALFORMED_TOKEN_ERROR")
  }
  if (typeof rating !== "number") {
    throw new Error("MALFORMED_TOKEN_ERROR")
  }

  return {
    id,
    username,
    rating,
    ...(avatarUrl && typeof avatarUrl === "string" ? { avatarUrl } : {}),
  }
}

declare global {
  namespace Express {
    interface Request {
      user: User | null
    }
  }
}

export const authenticationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (["Register", "Login"].includes(req.body.operationName)) {
    req.user = null
    return next()
  }
  const tokenHeader = req.headers.authorization
  if (!tokenHeader || !tokenHeader.startsWith("Bearer ")) {
    return res.sendStatus(401)
  }
  const token = tokenHeader?.split(" ")[1]
  try {
    req.user = verifyToken(token)
    next()
  } catch (error) {
    console.error(error)
    return res.status(401).json({ error: "INVALID_TOKEN" })
  }
}
