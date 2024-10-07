import { match } from "ts-pattern"
import { useRegisterMutation } from "./apollo/signup.operation"
import { useSignupWithReactQuery } from "./react-query/useSignupWithReactQuery"

export enum SignupError {
  USER_ALREADY_EXISTS = "User already exists",
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
export const useHandleSignup = (): {
  mutate: MutationFn
  data: string | undefined | null
  isLoading: boolean
  error: SignupError | undefined
} => {
  const PROVIDER = import.meta.env.VITE_DATASOURCE

  if (PROVIDER === "APOLLO") {
    const [mutateFn, opts] = useRegisterMutation()
    const mutate: MutationFn = async (username, password, onSucess) => {
      await mutateFn({
        variables: { username, password },
        onCompleted: (data) => {
          const token = match(data.register)
            .with({ __typename: "RegisterSuccess" }, ({ token }) => token)
            .with({ __typename: "RegisterError" }, () => null)
            .exhaustive()
          if (token) {
            onSucess(token)
          }
        },
      })
    }
    const data = match(opts.data?.register)
      .with({ __typename: "RegisterSuccess" }, ({ token }) => token)
      .with({ __typename: "RegisterError" }, () => null)
      .with(undefined, () => undefined)
      .exhaustive()

    const error = opts.error
      ? SignupError.UNKNOWN_SERVER_ERROR
      : match(opts.data?.register)
          .with(
            {
              __typename: "RegisterError",
              message: "Incorrect username or password",
            },
            () => SignupError.USER_ALREADY_EXISTS,
          )
          .with(
            { __typename: "RegisterError" },
            () => SignupError.UNKNOWN_SERVER_ERROR,
          )
          .with({ __typename: "RegisterSuccess" }, () => undefined)
          .with(undefined, () => undefined)
          .exhaustive()
    return { mutate, data, isLoading: opts.loading, error }
  }

  const mutation = useSignupWithReactQuery()

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
    error: mutation.error
      ? mutation.error.message === "Incorrect username or password"
        ? SignupError.USER_ALREADY_EXISTS
        : SignupError.UNKNOWN_SERVER_ERROR
      : undefined,
  }
}
