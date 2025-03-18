import { createMutation } from "@tanstack/solid-query"

type SignupResponseObject = {
  token: string
}

export enum SignupError {
  IncorrectUsername = "Incorrect username or password",
  ServerError = "Unknown server error",
}

interface SignupErrorObject extends Error {
  message: SignupError
}

type MutationFn = (
  data: { username: string; password: string },
  options: {
    onSuccess?: (data: SignupResponseObject) => void
    onError?: (error: SignupErrorObject) => void
  },
) => void

export const useSignup = (): (() => {
  mutate: MutationFn
  data: SignupResponseObject | undefined
  isLoading: boolean
  error: SignupErrorObject | null
}) => {
  const mutation = createMutation<
    SignupResponseObject,
    SignupErrorObject,
    { username: string; password: string }
  >(() => ({
    mutationFn: (data) =>
      fetch(`${import.meta.env.VITE_API_URL}/register-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      })
        .then(async (res) => {
          if (!res.ok) {
            const status = res.status
            if (status === 409) {
              throw new Error(SignupError.IncorrectUsername)
            } else if (status === 500) {
              throw new Error(SignupError.ServerError)
            }
          }
          return res
        })
        .then((res) => res.json()),
    onError: (error) => {
      return error.message
    },
    // onSuccess: (data) => {
    //   console.log({ data })
    // },
  }))

  return () => ({
    data: mutation.data,
    mutate: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  })
}
