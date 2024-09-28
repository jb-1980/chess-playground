import { match } from "ts-pattern"
import { useJoinGameSubscription } from "./apollo/join-game.operation"
import {
  ResponseMessageType,
  useJoinGameSocket,
} from "./websockets/useJoinGameSocket"
import { ReadyState } from "react-use-websocket"

export enum JoinGameError {
  NO_MATCH_FOUND = "NO_MATCH_FOUND",
  ERROR_CREATING_GAME = "ERROR_CREATING_GAME",
}

/** Normally it is bad to conditionally call hooks, as the order of hooks must
 *  be the same on every render. However, in this case, the condition is based
 *  on an environment variable that is set at build time, so the order of hooks
 *  will always be the same.
 */
/* eslint-disable react-hooks/rules-of-hooks */
export const useJoinGame = (
  playerId: string,
): {
  msg: { gameId: string } | undefined | null
  isLoading: boolean
  error: JoinGameError | undefined
} => {
  const PROVIDER = import.meta.env.VITE_DATASOURCE

  if (PROVIDER === "APOLLO") {
    const result = useJoinGameSubscription({
      variables: { playerId },
    })

    const msg = match(result.data?.joinGame)
      .with({ __typename: "JoinGameErrorMsg" }, () => null)
      .with({ __typename: "JoinGameMsg" }, ({ gameId }) => ({ gameId }))
      .with(undefined, () => undefined)
      .exhaustive()

    const error = result.error
      ? JoinGameError.ERROR_CREATING_GAME
      : match(result.data?.joinGame)
          .with(
            {
              __typename: "JoinGameErrorMsg",
              message: JoinGameError.NO_MATCH_FOUND,
            },
            () => JoinGameError.NO_MATCH_FOUND,
          )
          .with(
            { __typename: "JoinGameErrorMsg" },
            () => JoinGameError.ERROR_CREATING_GAME,
          )
          .with({ __typename: "JoinGameMsg" }, () => undefined)
          .with(undefined, () => undefined)
          .exhaustive()

    return { msg, isLoading: result.loading, error }
  }

  const { lastJsonMessage, readyState } = useJoinGameSocket(playerId)

  const msg = match(lastJsonMessage)
    .with({ type: ResponseMessageType.ERROR }, () => null)
    .with({ type: ResponseMessageType.JOIN_GAME_RESPONSE }, ({ payload }) => ({
      gameId: payload.gameId,
    }))
    .otherwise(() => undefined)

  const error = match(lastJsonMessage)
    .with(
      { type: ResponseMessageType.ERROR },
      () => JoinGameError.ERROR_CREATING_GAME,
    )
    .otherwise(() => undefined)
  return {
    msg,
    isLoading: readyState !== ReadyState.OPEN,
    error,
  }
}
