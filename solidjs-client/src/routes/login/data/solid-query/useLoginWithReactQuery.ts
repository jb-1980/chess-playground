import { createMutation } from "@tanstack/solid-query"

type LoginResponseObject = {
  token: string
}

export const useLoginWithReactQuery = () => {
  const mutation = createMutation<
    LoginResponseObject,
    Error,
    { username: string; password: string }
  >(() => ({
    mutationFn: (data) =>
      fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) {
            const status = res.status
            if (status === 401) {
              throw new Error("Invalid credentials")
            }
            throw new Error("Invalid login")
          }
          return res
        })
        .then((res) => res.json() as Promise<LoginResponseObject>),
  }))

  return mutation
}
