import { createQuery } from "@tanstack/solid-query"
import { Game } from "../../../types/game"

type GetGameResponseObject = Game[]

export const useGetGames = (playerId: string) =>
  createQuery<GetGameResponseObject>(() => ({
    queryKey: ["games", playerId],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/queries/get-games`,
        {
          method: "POST",
          body: JSON.stringify({ playerId }),
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )
      return response.json()
    },
  }))
