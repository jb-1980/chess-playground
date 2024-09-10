import { Button, Dialog, Typography } from "@mui/material"
import { WHITE } from "chess.js"
import { useGameContext } from "../context"
import { GameStatus } from "../types"
import { match } from "ts-pattern"
import { Link } from "react-router-dom"

export const GameOverDialog = () => {
  const { status, turn, startNewGame } = useGameContext()
  const open = ![
    GameStatus.PLAYING,
    GameStatus.NOT_STARTED,
    GameStatus.JOINING,
  ].includes(status)
  const winner = turn === WHITE ? "Black" : "White"
  return (
    <Dialog
      open={open}
      PaperProps={{ style: { padding: 20, textAlign: "center" } }}
    >
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
      <Button
        variant="contained"
        component={Link}
        to="/games/new"
        onClick={() => startNewGame()}
      >
        New Game
      </Button>
    </Dialog>
  )
}
