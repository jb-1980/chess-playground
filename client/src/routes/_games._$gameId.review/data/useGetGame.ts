import { match } from "ts-pattern"
import { Game } from "../../../types/game"
import { useGetGameWithReactQuery } from "./react-query/useGetGameWithReactQuery"
import { useGameQuery } from "./apollo/get-game.operation"

export enum GetGameError {
  GAME_NOT_FOUND = "GAME_NOT_FOUND",
  UNKNOWN_SERVER_ERROR = "Unknown server error",
}

/** Normally it is bad to conditionally call hooks, as the order of hooks must
 *  be the same on every render. However, in this case, the condition is based
 *  on an environment variable that is set at build time, so the order of hooks
 *  will always be the same.
 */
/* eslint-disable react-hooks/rules-of-hooks */
export const useGetGame = (
  gameId: string,
): {
  data: Game | undefined | null
  isLoading: boolean
  error: GetGameError | undefined
} => {
  const PROVIDER = import.meta.env.VITE_DATASOURCE

  if (PROVIDER === "APOLLO") {
    const result = useGameQuery({
      variables: { gameId: gameId },
    })

    const data = match(result.data?.game)
      .with({ __typename: "GetGameError" }, () => null)
      .with({ __typename: "Game" }, (game) => ({
        ...game,
        moves: game.moves.map((m) => ({
          ...m,
          captured: m.captured ?? undefined,
          promotion: m.promotion ?? undefined,
        })),
      }))
      .with(undefined, () => undefined)
      .exhaustive()

    const error = result.error
      ? GetGameError.UNKNOWN_SERVER_ERROR
      : match(result.data?.game)
          .with(
            {
              __typename: "GetGameError",
              message: GetGameError.GAME_NOT_FOUND,
            },
            () => GetGameError.GAME_NOT_FOUND,
          )
          .with(
            { __typename: "GetGameError" },
            () => GetGameError.UNKNOWN_SERVER_ERROR,
          )
          .with({ __typename: "Game" }, () => undefined)
          .with(undefined, () => undefined)
          .exhaustive()

    return { data, isLoading: result.loading, error }
  }

  const result = useGetGameWithReactQuery(gameId)

  return {
    data: result.error ? null : result.data,
    isLoading: result.isPending || result.isLoading,
    error: result.error ? GetGameError.UNKNOWN_SERVER_ERROR : undefined,
  }
}
