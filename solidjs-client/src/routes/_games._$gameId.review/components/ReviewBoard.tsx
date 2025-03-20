import { createSignal } from "solid-js"
import { Game } from "../../../types/game"
import { useUserContext } from "../../Root/context"
import { BLACK, DEFAULT_POSITION, WHITE } from "chess.js"
import { Stack, Box } from "@suid/material"
import { GameBoard } from "../../../components/GameBoard"
import { MobileMovesCard, MovesCard } from "./MovesCard"

export const ReviewBoard = (props: { game: Game }) => {
  const { game } = props
  const user = useUserContext()

  const myColor = game.whitePlayer.id === user.id ? WHITE : BLACK
  const [moveIndex, setMoveIndex] = createSignal(game.moves.length - 1)

  return (
    <Stack
      direction={{ md: "column", lg: "row" }}
      gap={4}
      sx={{ alignItems: { md: "center", lg: "flex-start" } }}
      justifyContent="center"
    >
      <Box sx={{ width: { md: "100%", lg: "75%" } }} maxWidth={800}>
        <GameBoard
          myColor={myColor}
          fen={game.moves[moveIndex()]?.after || DEFAULT_POSITION}
          whitePlayer={game.whitePlayer}
          blackPlayer={game.blackPlayer}
        />
      </Box>
      <Box sx={{ display: { xs: "inherit", lg: "none" } }}>
        <MobileMovesCard
          game={game}
          moveIndex={moveIndex()}
          setMoveIndex={setMoveIndex}
        />
      </Box>
      <Box sx={{ display: { xs: "none", lg: "inherit" } }}>
        <MovesCard
          game={game}
          moveIndex={moveIndex()}
          setMoveIndex={setMoveIndex}
        />
      </Box>
    </Stack>
  )
}
