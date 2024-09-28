import { match } from "ts-pattern"
import { Game } from "../../../types/game"
import { useGetGamesQuery } from "./apollo/get-games.operation"
import { useGetGamesWithReactQuery } from "./react-query/useGetGamesWithReactQuery"

export enum GetGamesError {
  GAME_NOT_FOUND = "GAME_NOT_FOUND",
  UNKNOWN_SERVER_ERROR = "Unknown server error",
}

/** Normally it is bad to conditionally call hooks, as the order of hooks must
 *  be the same on every render. However, in this case, the condition is based
 *  on an environment variable that is set at build time, so the order of hooks
 *  will always be the same.
 */
/* eslint-disable react-hooks/rules-of-hooks */
export const useGetGames = (
  playerId: string,
): {
  data: Game[] | undefined | null
  isLoading: boolean
  error: GetGamesError | undefined
} => {
  const PROVIDER = import.meta.env.VITE_DATASOURCE

  if (PROVIDER === "APOLLO") {
    const result = useGetGamesQuery({
      variables: { playerId },
    })

    const data = match(result.data?.gamesForPlayerId)
      .with({ __typename: "GetGamesForPlayerIdError" }, () => null)
      .with({ __typename: "GetGamesForPlayer" }, ({ games }) =>
        games.map((g) => ({
          ...g,
          moves: g.moves.map((m) => ({
            ...m,
            captured: m.captured ?? undefined,
            promotion: m.promotion ?? undefined,
          })),
        })),
      )
      .with(undefined, () => undefined)
      .exhaustive()

    const error = result.error
      ? GetGamesError.UNKNOWN_SERVER_ERROR
      : match(result.data?.gamesForPlayerId)
          .with(
            {
              __typename: "GetGamesForPlayerIdError",
              message: GetGamesError.GAME_NOT_FOUND,
            },
            () => GetGamesError.GAME_NOT_FOUND,
          )
          .with(
            { __typename: "GetGamesForPlayerIdError" },
            () => GetGamesError.UNKNOWN_SERVER_ERROR,
          )
          .with({ __typename: "GetGamesForPlayer" }, () => undefined)
          .with(undefined, () => undefined)
          .exhaustive()

    return { data, isLoading: result.loading, error }
  }

  const result = useGetGamesWithReactQuery(playerId)

  return {
    data: result.error ? null : result.data,
    isLoading: result.isPending || result.isLoading,
    error: result.error ? GetGamesError.UNKNOWN_SERVER_ERROR : undefined,
  }
}
