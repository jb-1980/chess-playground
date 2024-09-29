import { Router } from "express"
import { handle_Move } from "../commands/move"

/** Routes at /api/commands/* */
export const commandsRouter = Router().post("/move", handle_Move)
