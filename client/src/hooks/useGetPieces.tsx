import { useMemo } from "react"
import { CustomPieceFnArgs } from "react-chessboard/dist/chessboard/types"

export const useGetPieces = () =>
  useMemo(() => {
    const pieces = [
      "wP",
      "wN",
      "wB",
      "wR",
      "wQ",
      "wK",
      "bP",
      "bN",
      "bB",
      "bR",
      "bQ",
      "bK",
    ]
    return pieces.reduce<
      Record<string, (props: CustomPieceFnArgs) => JSX.Element>
    >((dict, piece) => {
      dict[piece] = (props: CustomPieceFnArgs) => (
        <div
          style={{
            width: props.squareWidth,
            height: props.squareWidth,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={`/pieces/${piece}.svg`}
            style={{ width: "85%", height: "85%" }}
          />
        </div>
      )
      return dict
    }, {})
  }, [])
