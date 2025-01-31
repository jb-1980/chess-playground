import { Square } from "chess.js"
import { useGameContext } from "../context/useContext"
import { GameOverDialog } from "../components/game-over-dialog"
import { Piece } from "react-chessboard/dist/chessboard/types"
import { GameBoard } from "../../../components/GameBoard"
import { Stack } from "@mui/material"

export const Board = () => {
  const { fen, onMove, myColor, whitePlayer, blackPlayer } = useGameContext()

  function onDrop(sourceSquare: Square, targetSquare: Square, piece: Piece) {
    const promotion = piece.toLowerCase()[1]
    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion,
    }
    const result = onMove(move)
    return result !== null
  }

  return fen ? (
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
      <GameBoard
        fen={fen}
        whitePlayer={whitePlayer}
        blackPlayer={blackPlayer}
        myColor={myColor}
        onPieceDrop={onDrop}
      />
    </Stack>
  ) : (
    <div>Loading... </div>
  )
}
