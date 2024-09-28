import { useQuery } from "@tanstack/react-query"
import { Game } from "../../../../types/game"

type GetGameResponseObject = Game[]

export const useGetGamesWithReactQuery = (playerId: string) => {
  return useQuery<GetGameResponseObject>({
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
  })
}
