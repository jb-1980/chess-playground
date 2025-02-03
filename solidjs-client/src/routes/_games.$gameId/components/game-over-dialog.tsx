import { WHITE } from "chess.js"
import { useGameContext } from "../context"
import { match, P } from "ts-pattern"
import { GameStatus } from "../../../types/game"
import CloseIcon from "@suid/icons-material/Close"
import { A, useParams } from "@solidjs/router"
import { createSignal } from "solid-js"
import { Button, Dialog, IconButton, Stack, Typography } from "@suid/material"

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
    <Dialog
      open={gameOver() && !dismissed}
      PaperProps={{
        style: { padding: "20px", "text-align": "center", width: "300px" },
      }}
      onClose={() => setDismissed(true)}
    >
      <IconButton
        aria-label="close"
        onClick={() => setDismissed(true)}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      {match(contextValues().status)
        .with(GameStatus.CHECKMATE, () => (
          <>
            <Typography variant="h4">{winner()} Wins!</Typography>
            <Typography variant="body1" textAlign="center">
              {/* TODO: By timeout, by resignation */}
              by Checkmate
            </Typography>
          </>
        ))
        .with(GameStatus.STALEMATE, () => (
          <>
            <Typography variant="h4">Draw!</Typography>
            <Typography variant="body1" textAlign="center">
              by Stalemate
            </Typography>
          </>
        ))
        .with(GameStatus.THREE_MOVE_REPETITION, () => (
          <>
            <Typography variant="h4">Draw!</Typography>
            <Typography variant="body1" textAlign="center">
              by Three Move Repetition
            </Typography>
          </>
        ))
        .with(GameStatus.INSUFFICIENT_MATERIAL, () => (
          <>
            <Typography variant="h4">Draw!</Typography>
            <Typography variant="body1" textAlign="center">
              by Insufficient Material
            </Typography>
          </>
        ))
        .with(GameStatus.FIFTY_MOVE_RULE, () => (
          <>
            <Typography variant="h4">Draw!</Typography>
            <Typography variant="body1" textAlign="center">
              by Fifty Move Rule
            </Typography>
          </>
        ))
        .otherwise(() => "Game Over")}
      <Stack spacing={2} justifyContent="center">
        <Stack spacing={2} direction="row" justifyContent="center">
          <Button
            variant="contained"
            component={A}
            href={`/games/${gameId}/review`}
            style={{ flex: 1 }}
          >
            Review
          </Button>
          <Button
            variant="contained"
            component={A}
            href="/games"
            style={{ flex: 1 }}
          >
            My Games
          </Button>
        </Stack>
        <Button variant="contained" component={A} href="/games/join">
          New Game
        </Button>
      </Stack>
    </Dialog>
  )
}
