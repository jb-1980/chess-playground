import { Button, Dialog, IconButton, Stack, Typography } from "@mui/material"
import { WHITE } from "chess.js"
import { useGameContext } from "../context"
import { match, P } from "ts-pattern"
import { Link, useParams } from "react-router-dom"
import { GameStatus } from "../../../types/game"
import { useState } from "react"
import CloseIcon from "@mui/icons-material/Close"

export const GameOverDialog = () => {
  const { gameId } = useParams()
  const { status, turn } = useGameContext()
  const [dismissed, setDismissed] = useState(false)
  const gameOver = match(status)
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

  const winner = turn === WHITE ? "Black" : "White"
  return (
    <Dialog
      open={gameOver && !dismissed}
      PaperProps={{ style: { padding: 20, textAlign: "center", width: 300 } }}
      onClose={() => setDismissed(true)}
    >
      <IconButton
        aria-label="close"
        onClick={() => setDismissed(true)}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      {match(status)
        .with(GameStatus.CHECKMATE, () => (
          <>
            <Typography variant="h4">{winner} Wins!</Typography>
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
            component={Link}
            to={`/games/${gameId}/review`}
            style={{ flex: 1 }}
          >
            Review
          </Button>
          <Button
            variant="contained"
            component={Link}
            to="/games"
            style={{ flex: 1 }}
          >
            My Games
          </Button>
        </Stack>
        <Button variant="contained" component={Link} to="/games/join">
          New Game
        </Button>
      </Stack>
    </Dialog>
  )
}
