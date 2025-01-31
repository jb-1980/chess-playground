import { createMutation } from "@tanstack/solid-query"

type SignupResponseObject = {
  token: string
}

interface SignupError extends Error {
  message: "Incorrect username or password" | "Unknown server error"
}

export const useSignupWithReactQuery = () => {
  const mutation = createMutation<
    SignupResponseObject,
    SignupError,
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
              throw new Error("Incorrect username or password")
            } else if (status === 500) {
              throw new Error("Unknown server error")
            }
          }
          return res
        })
        .then((res) => res.json()),
    onError: (error) => {
      if (error.message === "Incorrect username or password") {
        return "Incorrect username or password"
      }
      return "Unknown server error"
    },
    onSuccess: (data) => {
      console.log({ data })
    },
  }))

  return mutation
}
