import { Request, Response } from "express"
import { z, ZodError } from "zod"
import { signToken } from "../middleware/auth"
import { AsyncResult, isFailure, Result } from "../lib/result"
import { Context } from "../middleware/context"

const RegisterUserSchema = z.object({
  username: z.string(),
  password: z.string(),
})

export const handle_LoginUser = async (
  req: Request,
  res: Response<{ token: string } | ZodError | { error: string }>,
) => {
  const requestBody = req.body
  const parsedBody = RegisterUserSchema.safeParse(requestBody)

  if (!parsedBody.success) {
    return res.status(400).json(parsedBody.error)
  }

  const tokenResult = await command_LoginUser(parsedBody.data, req.context)
  if (isFailure(tokenResult)) {
    return res.status(401).json({ error: tokenResult.message })
  }
  return res.status(200).json({ token: tokenResult.data })
}

export const command_LoginUser = async (
  args: {
    username: string
    password: string
  },
  { Loader }: Context,
): AsyncResult<string, "BAD_CREDENTIALS" | "DB_ERR_FAILED_TO_GET_USER"> => {
  const { username, password } = args
  const userResult = await Loader.UserLoader.validateUser(username, password)

  if (!userResult.success) {
    return userResult
  }

  return Result.Success(signToken(userResult.data))
}
