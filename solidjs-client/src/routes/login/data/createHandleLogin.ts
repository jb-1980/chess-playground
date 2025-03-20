import { createApiMutation } from "../../../lib/api-handlers"

export enum LoginError {
  INCORRECT_USERNAME_OR_PASSWORD = "Incorrect username or password",
  UNKNOWN_SERVER_ERROR = "Unknown server error",
}

type MutationFn = (
  username: string,
  password: string,
  onSuccess: (data: string) => void,
) => void

type LoginHandler = () => {
  mutate: MutationFn
  data: string | undefined | null
  isLoading: boolean
  error: LoginError | undefined
}

export const createHandleLogin = (): LoginHandler => {
  const mutation = createApiMutation<
    { username: string; password: string },
    { token: string }
  >("/commands/login")
  const mutate = (
    username: string,
    password: string,
    onSuccess: (data: string) => void,
  ) => {
    mutation.mutate(
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
      ? mutation.error.status === 401
        ? LoginError.INCORRECT_USERNAME_OR_PASSWORD
        : LoginError.UNKNOWN_SERVER_ERROR
      : undefined,
  })
}
