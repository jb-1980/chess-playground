import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { Game } from "../../../types/game"

export const useGetGame = () => {
  const { gameId } = useParams()

  return useQuery<Game>({
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
        }
      )
      return response.json()
    },
  })
}
