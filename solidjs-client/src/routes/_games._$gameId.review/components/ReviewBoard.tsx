import { createSignal } from "solid-js"
import { Game } from "../../../types/game"
import { useUserContext } from "../../Root/context"
import { BLACK, DEFAULT_POSITION, WHITE } from "chess.js"
import { GameBoard } from "../../../components/GameBoard"
import { MobileMovesCard, MovesCard } from "./MovesCard"
import { Stack } from "@/ui"

export const ReviewBoard = (props: { game: Game }) => {
  const { game } = props
  const user = useUserContext()

  const myColor = game.whitePlayer.id === user.id ? WHITE : BLACK
  const [moveIndex, setMoveIndex] = createSignal(game.moves.length - 1)

  return (
    <Stack
      gap={4}
      class="md:flex-col lg:flex-row md:items-center lg:items-start"
      justifyContent="center"
    >
      <div class="md:w-full lg:w-3/4 max-w-[800px]">
        <GameBoard
          myColor={myColor}
          fen={game.moves[moveIndex()]?.after || DEFAULT_POSITION}
          whitePlayer={game.whitePlayer}
          blackPlayer={game.blackPlayer}
        />
      </div>
      <div class="md:hidden">
        <MobileMovesCard
          game={game}
          moveIndex={moveIndex()}
          setMoveIndex={setMoveIndex}
        />
      </div>
      <div class="max-md:hidden">
        <MovesCard
          game={game}
          moveIndex={moveIndex()}
          setMoveIndex={setMoveIndex}
        />
      </div>
    </Stack>
  )
}
