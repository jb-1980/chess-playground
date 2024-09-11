import { Router } from "express"
import { queriesRouter } from "./queries"
import { handle_registerUser } from "../commands/register-user"
import { contextMiddleware } from "../middleware/context"
import { authenticationMiddleware } from "../middleware/auth"
import { commandsRouter } from "./commands"
import { handle_LoginUser } from "../commands/login"

export const router = Router()

// Special routes that don't require authentication
router.post("/register-user", contextMiddleware, handle_registerUser)
router.post("/login", contextMiddleware, handle_LoginUser)

router.use("/api", authenticationMiddleware, contextMiddleware)
router.use("/api/queries", queriesRouter)
router.use("/api/commands", commandsRouter)
