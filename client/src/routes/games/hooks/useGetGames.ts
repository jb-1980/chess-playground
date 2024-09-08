import { useQuery } from "@tanstack/react-query"
import { Game } from "../../_games.$gameId/types"

type GetGameResponseObject = Game[]

export const useGetGames = (playerId: string) => {
  return useQuery<GetGameResponseObject>({
    queryKey: ["games", playerId],
    queryFn: async () => {
      console.log("fetching games")
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/games`,
        {
          method: "POST",
          body: JSON.stringify({ playerId }),
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      return response.json()
    },
  })
}
