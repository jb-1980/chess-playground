import { useGameContext } from "../context/useContext"
import { GameOverDialog } from "../components/game-over-dialog"
import { GameBoard } from "../../../components/GameBoard"
import { Key } from "chessground/types"
import { Show } from "solid-js"
import { Stack } from "@/ui"

export const Board = () => {
  const gameContext = useGameContext()

  function onDrop(orig: Key, dest: Key) {
    const move = {
      from: orig,
      to: dest,
      // promotion: "Q",
    }
    const result = gameContext().onMove(move)
    return result !== null
  }

  return (
    <Show when={gameContext().fen} fallback={<div>Loading...</div>}>
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{
          display: "flex",
          height: "calc(100vh - 96px)",
          "max-height": "100vw",
          width: "100%",
          "max-width": "800px",
          "box-sizing": "border-box",
        }}
      >
        <GameOverDialog />
        <pre>{gameContext().fen}</pre>
        <GameBoard
          fen={gameContext().fen!}
          whitePlayer={gameContext().whitePlayer}
          blackPlayer={gameContext().blackPlayer}
          myColor={gameContext().myColor}
          onPieceDrop={onDrop}
        />
      </Stack>
    </Show>
  )
}
