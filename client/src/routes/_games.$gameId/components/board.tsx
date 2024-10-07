import { Square } from "chess.js"
import { useGameContext } from "../context/useContext"
import { GameOverDialog } from "../components/game-over-dialog"
import { Piece } from "react-chessboard/dist/chessboard/types"
import { GameBoard } from "../../../components/GameBoard"

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
    <div style={{ width: 800, height: 800 }}>
      <GameOverDialog />
      <GameBoard
        fen={fen}
        whitePlayer={whitePlayer}
        blackPlayer={blackPlayer}
        myColor={myColor}
        onPieceDrop={onDrop}
      />
    </div>
  ) : (
    <div>Loading... </div>
  )
}
