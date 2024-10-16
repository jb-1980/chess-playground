import { bindable, watch } from "aurelia"
import { Chessground } from "chessground"
import { User } from "../types/user"

export class Chessboard {
  private board: ReturnType<typeof Chessground>
  @bindable fen: string
  @bindable orientation: "white" | "black" = "white"
  @bindable whitePlayer: User
  @bindable blackPlayer: User
  attaching() {
    const element = document.getElementById("chessboard")
    this.board = Chessground(element, {
      fen: this.fen,
      orientation: this.orientation,
    })
  }
  detaching() {
    this.board.destroy()
  }

  @watch("fen")
  fenChanged() {
    this.board.set({ fen: this.fen })
  }
}
