import { useMutation } from "@tanstack/react-query"
import { Move } from "chess.js"

type MoveResponseObject = {
  newPGN: string
}

export const useMoveWithReactQuery = () => {
  const mutation = useMutation({
    mutationFn: (data: { gameId: string; move: Move }) =>
      fetch(`${import.meta.env.VITE_API_URL}/api/commands/move`, {
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
        .then((res) => res.json() as Promise<MoveResponseObject>),
  })

  return mutation
}
