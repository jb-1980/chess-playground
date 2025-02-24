import { Router } from "express"
import { handle_GetGames } from "../queries/get-games"
import { handle_GetGameById } from "../queries/get-game-by-id"
/** Routes at /api/queries/* */
export const queriesRouter = Router()

export const QueriesRoutes = {
  GetGamesQuery: "/get-games",
  GetGameByIdQuery: "/get-game-by-id",
} as const

queriesRouter
  .post(QueriesRoutes.GetGamesQuery, handle_GetGames)
  .post(QueriesRoutes.GetGameByIdQuery, handle_GetGameById)
