import { useMutation } from "@tanstack/react-query"

type SignupResponseObject = {
  token: string
}

export const useSignupWithReactQuery = () => {
  const mutation = useMutation({
    mutationFn: (data: { username: string; password: string }) =>
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
            if (status === 400) {
              throw new Error("Incorrect username or password")
            } else if (status === 500) {
              throw new Error("Unknown server error")
            }
          }
          return res
        })
        .then((res) => res.json() as Promise<SignupResponseObject>),
  })

  return mutation
}
