import { Chessboard } from "react-chessboard"
import { Square } from "chess.js"
import { useGetPieces } from "../hooks/useGetPieces"
import { useGameContext } from "../context/useContext"
import { GameStatus } from "../types"
import { GameOverDialog } from "../components/game-over-dialog"
import { Piece } from "react-chessboard/dist/chessboard/types"
import { NameLabel } from "./name-label"

export const Board = () => {
  const customPieces = useGetPieces()
  const { fen, onMove, status, myColor, whitePlayer, blackPlayer } =
    useGameContext()

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

  const boardOrientation = myColor === "w" ? "white" : "black"

  return ![GameStatus.NOT_STARTED, GameStatus.JOINING].includes(status) &&
    fen ? (
    <div style={{ width: 800, height: 800 }}>
      <GameOverDialog />
      <NameLabel
        name={
          boardOrientation === "white"
            ? blackPlayer?.username ?? ""
            : whitePlayer?.username ?? ""
        }
        rating={
          boardOrientation === "white"
            ? blackPlayer?.rating ?? 0
            : whitePlayer?.rating ?? 0
        }
      />
      <Chessboard
        customDarkSquareStyle={{ backgroundColor: "#4e7837" }}
        customLightSquareStyle={{ backgroundColor: "#eeeed2" }}
        customPieces={customPieces}
        onPieceDrop={onDrop}
        position={fen}
        boardOrientation={boardOrientation}
      />
      <NameLabel
        name={
          boardOrientation === "white"
            ? whitePlayer?.username ?? ""
            : blackPlayer?.username ?? ""
        }
        rating={
          boardOrientation === "white"
            ? whitePlayer?.rating ?? 0
            : blackPlayer?.rating ?? 0
        }
      />
    </div>
  ) : (
    <div>Loading... </div>
  )
}
