import { Chessboard } from "react-chessboard"
import { Square, WHITE } from "chess.js"

import { useGetPieces } from "./hooks/useGetPieces"
import { useGameContext } from "./context/useContext"
import { GameContextProvider } from "./context/context"
import { GameStatus } from "./context"
import Dialog from "@mui/material/Dialog/Dialog"

export const Index = () => {
  return (
    <GameContextProvider>
      <Board />
    </GameContextProvider>
  )
}

const Board = () => {
  const customPieces = useGetPieces()
  const { fen, onMove } = useGameContext()

  function onDrop(sourceSquare: Square, targetSquare: Square) {
    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    }
    const result = onMove(move)
    return result !== null
  }

  return (
    <div style={{ width: 800, height: 800 }}>
      <GameOverDialog />
      <Chessboard
        customDarkSquareStyle={{ backgroundColor: "#4e7837" }}
        customLightSquareStyle={{ backgroundColor: "#eeeed2" }}
        customPieces={customPieces}
        onPieceDrop={onDrop}
        position={fen}
      />
    </div>
  )
}

const GameOverDialog = () => {
  const { status, turn } = useGameContext()
  const open = status !== GameStatus.PLAYING
  const winner = turn === WHITE ? "Black" : "White"
  return (
    <Dialog open={open}>
      {
        <div>
          {status === GameStatus.CHECKMATE && `${winner} wins!`}
          {status === GameStatus.STALEMATE && "Stalemate!"}
          {status === GameStatus.THREE_MOVE_REPETITION &&
            "Three move repetition!"}
          {status === GameStatus.INSUFFICIENT_MATERIAL &&
            "Insufficient material!"}
          {status === GameStatus.FIFTY_MOVE_RULE && "Fifty move rule!"}
        </div>
      }
      <div>
        {status === GameStatus.CHECKMATE && "Checkmate!"}
        {status === GameStatus.STALEMATE && "Stalemate!"}
        {status === GameStatus.THREE_MOVE_REPETITION &&
          "Three move repetition!"}
        {status === GameStatus.INSUFFICIENT_MATERIAL &&
          "Insufficient material!"}
        {status === GameStatus.FIFTY_MOVE_RULE && "Fifty move rule!"}
      </div>
    </Dialog>
  )
}
