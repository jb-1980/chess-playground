import { Request, Response } from "express"
import { z, ZodError } from "zod"
import {
  createUser,
  getUser,
  ParsedUserDocument,
  UserDocument,
} from "../repository/user"
import bcrypt from "bcrypt"
import { signToken } from "../lib/jwt"

const RegisterUserSchema = z.object({
  username: z.string(),
  password: z.string().min(8),
})

export const handle_LoginUser = async (
  req: Request,
  res: Response<{ token: string } | ZodError | { error: string }>
) => {
  const requestBody = req.body
  const parsedBody = RegisterUserSchema.safeParse(requestBody)

  if (!parsedBody.success) {
    return res.status(400).json(parsedBody.error)
  }

  try {
    const token = await command_LoginUser(parsedBody.data)
    if (!token) {
      return res.status(400).json({ error: "Invalid username or password" })
    }
    return res.status(200).json({ token })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message })
    }
    return res.status(500).json({ error: "Unknown server error" })
  }
}

export const command_LoginUser = async (args: {
  username: string
  password: string
}): Promise<string | null> => {
  const { username, password } = args
  const user = await getUser(username)

  if (!user) {
    return null
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatch) {
    return null
  }
  const parsedUser = makeUserDto(user)
  return signToken(parsedUser)
}

const makeUserDto = (
  user: UserDocument
): Pick<ParsedUserDocument, "id" | "username"> => {
  return {
    id: user._id.toString(),
    username: user.username,
  }
}
