import { createApiQuery } from "../../../lib/api-handlers"
import { Game } from "../../../types/game"

type GetGameResponseObject = Game[]

export const useGetGames = (playerId: string) =>
  createApiQuery<{ playerId: string }, GetGameResponseObject>(
    "/queries/get-games",
    {
      playerId,
    },
  )
