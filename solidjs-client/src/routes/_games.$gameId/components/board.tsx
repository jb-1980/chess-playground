import { useGameContext } from "../context/useContext"
import { GameOverDialog } from "../components/game-over-dialog"
import { GameBoard } from "../../../components/GameBoard"
import { Stack } from "@suid/material"
import { Key } from "chessground/types"
import { Show } from "solid-js"

export const Board = () => {
  const gameContext = useGameContext()

  function onDrop(orig: Key, dest: Key) {
    console.log("onDrop", orig, dest)
    const move = {
      from: orig,
      to: dest,
      // promotion: "Q",
    }
    const result = gameContext().onMove(move)
    console.log("result", result)
    return result !== null
  }

  return (
    <Show when={gameContext().fen} fallback={<div>Loading...</div>}>
      <Stack
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          maxHeight: "100vw",
          width: "100%",
          maxWidth: 800,
          boxSizing: "border-box",
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
