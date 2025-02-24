import { Router } from "express"
import { handle_Move } from "../commands/move"
import { handle_registerUser } from "../commands/register-user"
import { handle_LoginUser } from "../commands/login"

export const CommandsRoutes = {
  LoginCommand: "/login",
  RegisterUserCommand: "/register-user",
  MoveCommand: "/move",
} as const

/** Routes at /api/commands/* */
export const commandsRouter = Router()
  .post(CommandsRoutes.MoveCommand, handle_Move)
  .post(CommandsRoutes.RegisterUserCommand, handle_registerUser)
  .post(CommandsRoutes.LoginCommand, handle_LoginUser)
