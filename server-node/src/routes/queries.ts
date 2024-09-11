import { Router } from "express"
import { handle_GetGames } from "../queries/get-games"
import { handle_GetGameById } from "../queries/get-game-by-id"
/** Routes at /api/queries/* */
export const queriesRouter = Router()

queriesRouter
  .post("/get-games", handle_GetGames)
  .post("/get-game-by-id", handle_GetGameById)
