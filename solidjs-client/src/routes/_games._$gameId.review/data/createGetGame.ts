import { createApiQuery } from "../../../lib/api-handlers"
import { Game } from "../../../types/game"

export enum GetGameError {
  GAME_NOT_FOUND = "GAME_NOT_FOUND",
  UNKNOWN_SERVER_ERROR = "Unknown server error",
}

export const createGetGame = (
  gameId: string,
): (() => {
  data: Game | undefined | null
  isLoading: boolean
  error: GetGameError | undefined
}) => {
  const result = createApiQuery<{ gameId: string }, Game>(
    "/queries/get-game-by-id",
    { gameId },
  )

  return () => ({
    data: result.error ? null : result.data,
    isLoading: result.isPending || result.isLoading,
    error: result.error
      ? result.error.status === 404
        ? GetGameError.GAME_NOT_FOUND
        : GetGameError.UNKNOWN_SERVER_ERROR
      : undefined,
  })
}
