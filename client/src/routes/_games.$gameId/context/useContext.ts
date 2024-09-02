import { useContext } from "react"
import { GameContext } from "./context"

export const useGameContext = () => {
  const data = useContext(GameContext)

  if (!data) {
    throw new Error("useGameContext must be used within a GameContextProvider")
  }

  return data
}
