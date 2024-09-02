import { Chessboard } from "react-chessboard"
import { Square, WHITE } from "chess.js"

import { useGetPieces } from "./hooks/useGetPieces"
import { useGameContext } from "./context/useContext"
import { GameContextProvider } from "./context/context"
import Dialog from "@mui/material/Dialog/Dialog"
import { GameStatus } from "./types"
import { match } from "ts-pattern"
import { Button, Typography } from "@mui/material"
import { Link } from "react-router-dom"

export const Game = () => {
  return (
    <GameContextProvider>
      <Board />
    </GameContextProvider>
  )
}

const Board = () => {
  const customPieces = useGetPieces()
  const { fen, onMove, status, myColor } = useGameContext()

  function onDrop(sourceSquare: Square, targetSquare: Square) {
    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    }
    const result = onMove(move)
    return result !== null
  }

  console.log({ fen })
  return ![GameStatus.NOT_STARTED, GameStatus.JOINING].includes(status) &&
    fen ? (
    <div style={{ width: 800, height: 800 }}>
      <GameOverDialog />
      <Chessboard
        customDarkSquareStyle={{ backgroundColor: "#4e7837" }}
        customLightSquareStyle={{ backgroundColor: "#eeeed2" }}
        customPieces={customPieces}
        onPieceDrop={onDrop}
        position={fen}
        boardOrientation={myColor === "w" ? "white" : "black"}
      />
    </div>
  ) : (
    <div>Loading... </div>
  )
}

const GameOverDialog = () => {
  const { status, turn } = useGameContext()
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
      <Button variant="contained" component={Link} to="/games/new">
        New Game
      </Button>
    </Dialog>
  )
}
