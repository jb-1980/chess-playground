import { Request, Response } from "express"
import { getGamesForPlayerId } from "../repository/game"
import { AsyncResult, isFailure, Result } from "../lib/result"
import { Game, makeGameDTO } from "../domain/game"
import { z, ZodError } from "zod"

const GetGamesRequestSchema = z.object({
  playerId: z.string(),
})

export const handle_GetGames = async (
  req: Request,
  res: Response<Game[] | ZodError | "DB_ERR_GET_GAMES_FOR_USER_ID">
) => {
  const parsedBody = GetGamesRequestSchema.safeParse(req.body)
  if (!parsedBody.success) {
    return res.status(400).json(parsedBody.error)
  }
  const { playerId } = parsedBody.data
  const gamesResult = await query_GetGamesForPlayerId(playerId)
  if (isFailure(gamesResult)) {
    return res.status(500).json(gamesResult.message)
  }

  return res.status(200).json(gamesResult.data)
}

export const query_GetGamesForPlayerId = async (
  playerId: string
): AsyncResult<Game[], "DB_ERR_GET_GAMES_FOR_USER_ID"> => {
  const gamesResult = await getGamesForPlayerId(playerId)
  if (isFailure(gamesResult)) {
    return gamesResult
  }
  return Result.Success(gamesResult.data.map(makeGameDTO))
}
