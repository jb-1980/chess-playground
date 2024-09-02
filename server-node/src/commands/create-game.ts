import { Request, Response } from "express"
import { z, ZodError } from "zod"
import {
  createUser,
  ParsedUserDocument,
  UserDocument,
} from "../repository/user"
import { signToken } from "../lib/jwt"

const CreateGameSchema = z.object({
  gameId: z.string(),
})

export const handle_UpsertGame = async (
  req: Request,
  res: Response<{ token: string } | ZodError | { error: string }>
) => {
  const requestBody = req.body
  const parsedBody = RegisterUserSchema.safeParse(requestBody)

  if (!parsedBody.success) {
    return res.status(400).json(parsedBody.error)
  }

  try {
    const user = await command_RegisterUser(parsedBody.data)
    return res.status(200).json({
      token: signToken(user),
    })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message })
    }
    return res.status(500).json({ error: "Unknown server error" })
  }
}

export const command_RegisterUser = async (args: {
  username: string
  password: string
}) => {
  const { username, password } = args
  const user = await createUser(username, password)

  return makeUserDto(user)
}

const makeUserDto = (
  user: UserDocument
): Pick<ParsedUserDocument, "id" | "username"> => {
  return {
    id: user._id.toString(),
    username: user.username,
  }
}
