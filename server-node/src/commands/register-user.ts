import { Request, Response } from "express"
import { z, ZodError } from "zod"
import { signToken } from "../middleware/auth"
import { AsyncResult, isSuccess, Result } from "../lib/result"
import { User } from "../domain/user"
import { Context } from "../middleware/context"

const RegisterUserSchema = z.object({
  username: z.string(),
  password: z.string().min(8),
})

export const handle_registerUser = async (
  req: Request,
  res: Response<{ token: string } | ZodError | { error: string }>,
) => {
  const requestBody = req.body
  const parsedBody = RegisterUserSchema.safeParse(requestBody)

  if (!parsedBody.success) {
    return res.status(400).json(parsedBody.error)
  }

  const userResult = await command_RegisterUser(parsedBody.data, req.context)

  if (isSuccess(userResult)) {
    return res.status(200).json({
      token: signToken(userResult.data),
    })
  }

  if (userResult.message === "USER_ALREADY_EXISTS") {
    return res.status(409).json({ error: "USER_ALREADY_EXISTS" })
  }

  return res.status(500).json({ error: userResult.message })
}

export const command_RegisterUser = async (
  args: {
    username: string
    password: string
  },
  { Mutator }: Context,
): AsyncResult<
  User,
  "DB_ERR_FAILED_TO_CREATE_USER" | "USER_ALREADY_EXISTS"
> => {
  const { username, password } = args
  const userResult = await Mutator.UserMutator.createUser(username, password)

  if (isSuccess(userResult)) {
    return Result.Success(userResult.data)
  }

  return userResult
}
