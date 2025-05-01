import { WHITE } from "chess.js"
import { useGameContext } from "../context"
import { match, P } from "ts-pattern"
import { GameStatus } from "../../../types/game"
import { A, useParams } from "@solidjs/router"
import { createSignal } from "solid-js"
import { Button, Dialog, Stack, Typography } from "@/ui"

export const GameOverDialog = () => {
  const { gameId } = useParams()
  const contextValues = useGameContext()
  const [dismissed, setDismissed] = createSignal(false)
  const gameOver = () =>
    match(contextValues().status)
      .with(
        P.union(
          GameStatus.CHECKMATE,
          GameStatus.STALEMATE,
          GameStatus.THREE_MOVE_REPETITION,
          GameStatus.INSUFFICIENT_MATERIAL,
          GameStatus.FIFTY_MOVE_RULE,
        ),
        () => true,
      )
      .otherwise(() => false)

  const winner = () => (contextValues().turn === WHITE ? "Black" : "White")
  return (
    <Dialog open={gameOver() && !dismissed} onOpenChange={setDismissed}>
      {match(contextValues().status)
        .with(GameStatus.CHECKMATE, () => (
          <>
            <Typography variant="h4">{winner()} Wins!</Typography>
            <Typography variant="body1" class="text-center">
              {/* TODO: By timeout, by resignation */}
              by Checkmate
            </Typography>
          </>
        ))
        .with(GameStatus.STALEMATE, () => (
          <>
            <Typography variant="h4">Draw!</Typography>
            <Typography variant="body1" class="text-center">
              by Stalemate
            </Typography>
          </>
        ))
        .with(GameStatus.THREE_MOVE_REPETITION, () => (
          <>
            <Typography variant="h4">Draw!</Typography>
            <Typography variant="body1" class="text-center">
              by Three Move Repetition
            </Typography>
          </>
        ))
        .with(GameStatus.INSUFFICIENT_MATERIAL, () => (
          <>
            <Typography variant="h4">Draw!</Typography>
            <Typography variant="body1" class="text-center">
              by Insufficient Material
            </Typography>
          </>
        ))
        .with(GameStatus.FIFTY_MOVE_RULE, () => (
          <>
            <Typography variant="h4">Draw!</Typography>
            <Typography variant="body1" class="text-center">
              by Fifty Move Rule
            </Typography>
          </>
        ))
        .otherwise(() => "Game Over")}
      <Stack gap={2} justifyContent="center">
        <Stack gap={2} direction="row" justifyContent="center">
          <Button as={A} href={`/games/${gameId}/review`} style={{ flex: 1 }}>
            Review
          </Button>
          <Button as={A} href="/games" style={{ flex: 1 }}>
            My Games
          </Button>
        </Stack>
        <Button as={A} href="/games/join">
          New Game
        </Button>
      </Stack>
    </Dialog>
  )
}
