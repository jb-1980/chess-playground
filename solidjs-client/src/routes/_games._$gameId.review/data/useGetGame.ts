import { Game } from "../../../types/game"
import { useGetGameWithReactQuery } from "./solid-query/useGetGameWithReactQuery"

export enum GetGameError {
  GAME_NOT_FOUND = "GAME_NOT_FOUND",
  UNKNOWN_SERVER_ERROR = "Unknown server error",
}

export const useGetGame = (
  gameId: string,
): (() => {
  data: Game | undefined | null
  isLoading: boolean
  error: GetGameError | undefined
}) => {
  const result = useGetGameWithReactQuery(gameId)

  return () => ({
    data: result.error ? null : result.data,
    isLoading: result.isPending || result.isLoading,
    error: result.error ? GetGameError.UNKNOWN_SERVER_ERROR : undefined,
  })
}
