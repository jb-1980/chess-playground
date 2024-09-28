import { match } from "ts-pattern"
import { useLoginWithReactQuery } from "./react-query/useLoginWithReactQuery"
import { useLoginMutation } from "./apollo/login.operation"

export enum LoginError {
  INCORRECT_USERNAME_OR_PASSWORD = "Incorrect username or password",
  UNKNOWN_SERVER_ERROR = "Unknown server error",
}

type MutationFn = (
  username: string,
  password: string,
  onSuccess: (data: string) => void,
) => Promise<void>

/** Normally it is bad to conditionally call hooks, as the order of hooks must
 *  be the same on every render. However, in this case, the condition is based
 *  on an environment variable that is set at build time, so the order of hooks
 *  will always be the same.
 */
/* eslint-disable react-hooks/rules-of-hooks */
export const useHandleLogin = (): {
  mutate: MutationFn
  data: string | undefined | null
  isLoading: boolean
  error: LoginError | undefined
} => {
  const PROVIDER = import.meta.env.VITE_DATASOURCE

  if (PROVIDER === "APOLLO") {
    const [mutateFn, opts] = useLoginMutation()
    const mutate: MutationFn = async (username, password, onSucess) => {
      await mutateFn({
        variables: { username, password },
        onCompleted: (data) => {
          const token = match(data.login)
            .with({ __typename: "LoginSuccess" }, ({ token }) => token)
            .with({ __typename: "LoginError" }, () => null)
            .exhaustive()
          if (token) {
            onSucess(token)
          }
        },
      })
    }
    const data = match(opts.data?.login)
      .with({ __typename: "LoginSuccess" }, ({ token }) => token)
      .with({ __typename: "LoginError" }, () => null)
      .with(undefined, () => undefined)
      .exhaustive()

    const error = opts.error
      ? LoginError.UNKNOWN_SERVER_ERROR
      : match(opts.data?.login)
          .with(
            {
              __typename: "LoginError",
              message: "BAD_CREDENTIALS",
            },
            () => LoginError.INCORRECT_USERNAME_OR_PASSWORD,
          )
          .with(
            { __typename: "LoginError" },
            () => LoginError.UNKNOWN_SERVER_ERROR,
          )
          .with({ __typename: "LoginSuccess" }, () => undefined)
          .with(undefined, () => undefined)
          .exhaustive()

    return { mutate, data, isLoading: opts.loading, error }
  }

  console.log("Using react-query")
  const mutation = useLoginWithReactQuery()

  const mutate = async (
    username: string,
    password: string,
    onSuccess: (data: string) => void,
  ) => {
    await mutation.mutateAsync(
      { username, password },
      {
        onSuccess: (data) => {
          onSuccess(data.token)
        },
      },
    )
  }

  return {
    mutate,
    data: mutation.error ? null : mutation.data?.token,
    isLoading: mutation.isPending,
    error:
      mutation.error &&
      mutation.error.message === "Incorrect username or password"
        ? LoginError.INCORRECT_USERNAME_OR_PASSWORD
        : LoginError.UNKNOWN_SERVER_ERROR,
  }
}
