import { Request, Response } from "express"
import { AsyncResult, isFailure, Result } from "../lib/result"
import { Game } from "../domain/game"
import { z, ZodError } from "zod"
import { Context } from "../middleware/context/context"

const GetGameRequestSchema = z.object({
  gameId: z.string(),
})

export const handle_GetGameById = async (
  req: Request,
  res: Response<
    Game | ZodError | "GAME_NOT_FOUND" | "DB_ERROR_WHILE_GETTING_GAME"
  >,
) => {
  const parsedBody = GetGameRequestSchema.safeParse(req.body)
  if (!parsedBody.success) {
    return res.status(400).json(parsedBody.error)
  }
  const { gameId } = parsedBody.data
  const gamesResult = await query_GetGameById(gameId, req.context)
  if (isFailure(gamesResult)) {
    if (gamesResult.error === "GAME_NOT_FOUND") {
      return res.status(404).json("GAME_NOT_FOUND")
    }
    return res.status(500).json(gamesResult.message)
  }

  return res.status(200).json(gamesResult.data)
}

export const query_GetGameById = async (
  gameId: string,
  { Loader: { GameLoader } }: Context,
): AsyncResult<Game, "GAME_NOT_FOUND" | "DB_ERROR_WHILE_GETTING_GAME"> => {
  const gameResult = await GameLoader.getGameById(gameId)
  if (isFailure(gameResult)) {
    return gameResult
  }

  if (!gameResult.data) {
    return Result.Fail("GAME_NOT_FOUND")
  }
  return Result.Success(gameResult.data)
}
