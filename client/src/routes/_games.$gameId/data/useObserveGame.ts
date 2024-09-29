import { match } from "ts-pattern"

import { ReadyState } from "react-use-websocket"
import { useObserveGameSubscription } from "./apollo/current-game.operation"
import {
  ResponseMessageType,
  useObserveGameSocket,
} from "./websocket/useObserveGameSocket"
import { Game } from "../../../types/game"

export enum ObserveGameError {
  UNKNOWN_SERVER_ERROR = "Unknown server error",
}

/** Normally it is bad to conditionally call hooks, as the order of hooks must
 *  be the same on every render. However, in this case, the condition is based
 *  on an environment variable that is set at build time, so the order of hooks
 *  will always be the same.
 */
/* eslint-disable react-hooks/rules-of-hooks */
export const useObserveGame = (
  gameId: string,
): {
  msg: Game | undefined | null
  isLoading: boolean
  error: ObserveGameError | undefined
} => {
  const PROVIDER = import.meta.env.VITE_DATASOURCE

  if (PROVIDER === "APOLLO") {
    const result = useObserveGameSubscription({
      variables: { gameId: gameId ?? "" },
    })

    const msg = result.data?.observeGame.game

    const error = result.error
      ? ObserveGameError.UNKNOWN_SERVER_ERROR
      : undefined

    return { msg, isLoading: result.loading, error }
  }

  const { lastJsonMessage, readyState } = useObserveGameSocket(gameId)

  const msg = match(lastJsonMessage)
    .with({ type: ResponseMessageType.ERROR }, () => null)
    .with({ type: ResponseMessageType.MOVE_RESPONSE }, ({ payload }) => payload)
    .otherwise(() => undefined)

  const error = match(lastJsonMessage)
    .with(
      { type: ResponseMessageType.ERROR },
      () => ObserveGameError.UNKNOWN_SERVER_ERROR,
    )
    .otherwise(() => undefined)
  return {
    msg,
    isLoading: readyState !== ReadyState.OPEN,
    error,
  }
}
