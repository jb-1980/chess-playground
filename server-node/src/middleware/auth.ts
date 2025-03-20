import jwt from "jsonwebtoken"
import { User, userSchema } from "../domain/user"
import { NextFunction, Request, Response } from "express"
import { Routes } from "../routes"
import { match } from "ts-pattern"

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error(
    "Please define the JWT_SECRET environment variable inside .env",
  )
}

export const signToken = (payload: User): string => {
  userSchema.parse(payload)

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
  const parsedUser = userSchema.safeParse(verifiedToken)
  if (!parsedUser.success) {
    console.error(parsedUser.error)
    throw new Error("MALFORMED_TOKEN_ERROR")
  }
  return parsedUser.data
}

declare global {
  namespace Express {
    interface Request {
      user: User
    }
  }
}

export const authenticationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  match(req.path)
    .with(Routes.RegisterUserCommand, () => next())
    .with(Routes.LoginCommand, () => next())
    .otherwise(() => {
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
    })
}
