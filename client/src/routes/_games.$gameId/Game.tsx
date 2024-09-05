import { GameContextProvider } from "./context/context"
import { Board } from "./components/board"

export const Game = () => {
  return (
    <GameContextProvider>
      <Board />
    </GameContextProvider>
  )
}
