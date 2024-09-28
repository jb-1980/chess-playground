import { match } from "ts-pattern"
import { Move } from "chess.js"
import { useMoveMutation } from "./apollo/current-game.operation"
import { useMoveWithReactQuery } from "./react-query/useMoveWithReactQuery"

enum MoveError {
  INVALID = "INVALID",
  FAILED_TO_GET_GAME = "FAILED_TO_GET_GAME",
  GAME_NOT_FOUND = "GAME_NOT_FOUND",
  FAILED_TO_ADD_MOVE = "FAILED_TO_ADD_MOVE",
  NOT_YOUR_MOVE = "NOT_YOUR_MOVE",
}

type MutationFn = (
  gameId: string,
  move: Move,
  onSuccess?: (newPgn: string) => void,
) => Promise<void>

/** Normally it is bad to conditionally call hooks, as the order of hooks must
 *  be the same on every render. However, in this case, the condition is based
 *  on an environment variable that is set at build time, so the order of hooks
 *  will always be the same.
 */
/* eslint-disable react-hooks/rules-of-hooks */
export const useHandleMove = (): {
  mutate: MutationFn
  data: string | undefined | null
  isLoading: boolean
  error: MoveError | undefined
} => {
  const PROVIDER = import.meta.env.VITE_DATASOURCE

  if (PROVIDER === "APOLLO") {
    const [mutateFn, opts] = useMoveMutation()
    const mutate: MutationFn = async (gameId, move, onSucess) => {
      await mutateFn({
        variables: {
          gameId,
          move,
        },
        onCompleted: (data) => {
          const newPgn = match(data.move)
            .with({ __typename: "MoveSuccessResult" }, ({ newPGN }) => newPGN)
            .with({ __typename: "MoveErrorResult" }, () => null)
            .with(null, () => null)
            .exhaustive()
          if (newPgn && onSucess) {
            onSucess(newPgn)
          }
        },
      })
    }
    const data = match(opts.data?.move)
      .with({ __typename: "MoveSuccessResult" }, ({ newPGN }) => newPGN)
      .with({ __typename: "MoveErrorResult" }, () => null)
      .with(null, () => null)
      .with(undefined, () => undefined)
      .exhaustive()

    const error = opts.error
      ? MoveError.FAILED_TO_ADD_MOVE
      : match(opts.data?.move)
          .with(
            {
              __typename: "MoveErrorResult",
            },
            (move) => move.message as MoveError,
          )

          .with({ __typename: "MoveSuccessResult" }, () => undefined)
          .with(null, () => undefined)
          .with(undefined, () => undefined)
          .exhaustive()

    return { mutate, data, isLoading: opts.loading, error }
  }

  console.log("Using react-query")
  const mutation = useMoveWithReactQuery()

  const mutate: MutationFn = async (gameId, move, onSuccess) => {
    await mutation.mutateAsync(
      { gameId, move },
      {
        onSuccess: (data) => {
          if (onSuccess) {
            onSuccess(data.newPGN)
          }
        },
      },
    )
  }

  return {
    mutate,
    data: mutation.error ? null : mutation.data?.newPGN,
    isLoading: mutation.isPending,
    error: mutation.error ? MoveError.FAILED_TO_ADD_MOVE : undefined,
  }
}
