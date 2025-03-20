import { createApiMutation } from "../../../lib/api-handlers"

type SignupResponseObject = {
  token: string
}

export enum SignupError {
  IncorrectUsername = "Username already taken",
  ServerError = "Unknown server error",
}

type MutationFn = (
  data: { username: string; password: string },
  options: {
    onSuccess?: (data: SignupResponseObject) => void
  },
) => void

type SignupHandler = () => {
  mutate: MutationFn
  data: SignupResponseObject | undefined
  isLoading: boolean
  error: SignupError | null
}

export const createSignup = (): SignupHandler => {
  const mutation = createApiMutation<
    { username: string; password: string },
    { token: string }
  >("/commands/register-user")

  return () => ({
    data: mutation.data,
    mutate: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error
      ? mutation.error.status === 409
        ? SignupError.IncorrectUsername
        : SignupError.ServerError
      : null,
  })
}
