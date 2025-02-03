import { Color } from "chess.js"

export const getFancySan = (
  san: string | undefined,
  color: Color
): [string | null, string] => {
  if (!san) return [null, ""]
  let fancySan = san
  if (["Q", "K", "R", "B", "N"].includes(san[0])) {
    fancySan = san
      .replace("Q", color === "w" ? "♕" : "♛")
      .replace("K", color === "w" ? "♔" : "♚")
      .replace("R", color === "w" ? "♖" : "♜")
      .replace("B", color === "w" ? "♗" : "♝")
      .replace("N", color === "w" ? "♘" : "♞")

    return [fancySan[0], fancySan.slice(1)]
  }
  return [null, fancySan]
}
