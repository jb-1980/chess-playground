import { Chessboard } from "react-chessboard"
import { Color } from "chess.js"
import { ChessboardProps } from "react-chessboard/dist/chessboard/types"
import { useGetPieces } from "../hooks/useGetPieces"
import { Typography } from "@mui/material"
import { User } from "../types/user"

export const GameBoard = (
  props: {
    fen: string
    whitePlayer: User | null
    blackPlayer: User | null
    myColor: Color
  } & Omit<ChessboardProps, "ref">
) => {
  const customPieces = useGetPieces()
  const { fen, myColor, whitePlayer, blackPlayer, ...chessBoardProps } = props

  const boardOrientation = myColor === "w" ? "white" : "black"

  return (
    <div style={{ width: 800 }}>
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
        position={fen}
        boardOrientation={boardOrientation}
        {...chessBoardProps}
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
  )
}

export const NameLabel = (props: { name: string; rating: number }) => {
  return (
    <Typography variant="h6">
      {props.name} ({props.rating})
    </Typography>
  )
}
