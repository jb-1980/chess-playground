import { createQuery } from "@tanstack/solid-query"
import { Game } from "../../../../types/game"

type GetGameResponseObject = Game

export const useGetGameWithSolidQuery = (gameId: string) => {
  return createQuery<GetGameResponseObject>(() => ({
    queryKey: ["game", gameId],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/queries/get-game-by-id`,
        {
          method: "POST",
          body: JSON.stringify({ gameId }),
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )
      return response.json()
    },
  }))
}
