import { useLoginWithReactQuery } from "./solid-query/useLoginWithReactQuery"

export enum LoginError {
  INCORRECT_USERNAME_OR_PASSWORD = "Incorrect username or password",
  UNKNOWN_SERVER_ERROR = "Unknown server error",
}

type MutationFn = (
  username: string,
  password: string,
  onSuccess: (data: string) => void,
) => Promise<void>

export const useHandleLogin = (): (() => {
  mutate: MutationFn
  data: string | undefined | null
  isLoading: boolean
  error: LoginError | undefined
}) => {
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

  return () => ({
    mutate,
    data: mutation.error ? null : mutation.data?.token,
    isLoading: mutation.isPending,
    error: mutation.error
      ? mutation.error.message === "Invalid credentials"
        ? LoginError.INCORRECT_USERNAME_OR_PASSWORD
        : LoginError.UNKNOWN_SERVER_ERROR
      : undefined,
  })
}
