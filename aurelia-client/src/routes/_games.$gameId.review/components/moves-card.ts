import { bindable, IEventAggregator, resolve, watch } from "aurelia"
import { Move } from "../../../types/game"

type PlayerMove = {
  san: string
  index: number
  style: { background: string; color: string }
}

type CardMove = {
  number: number
  white: PlayerMove
  black: PlayerMove
}

export class MovesCard {
  @bindable gameMoves: Move[]
  @bindable moveIndex: number
  public moves: CardMove[] = []

  readonly eventAggregator = resolve(IEventAggregator)

  binding() {
    this.setMoves()
  }

  moveClicked(index: number | "PLUS_ONE" | "MINUS_ONE" | "FIRST" | "LAST") {
    const lastMove = this.gameMoves.length - 1
    if (index === "PLUS_ONE") {
      index = this.moveIndex === lastMove ? lastMove : this.moveIndex + 1
    } else if (index === "MINUS_ONE") {
      index = this.moveIndex < 0 ? -1 : this.moveIndex - 1
    } else if (index === "FIRST") {
      index = -1
    } else if (index === "LAST") {
      index = lastMove
    }
    this.eventAggregator.publish("MOVE_CLICKED", index)
  }

  @watch("moveIndex")
  setMoves() {
    const moves = []
    this.gameMoves.forEach((move, index, _moves) => {
      if (index % 2 === 0) {
        const whiteSan = move.san
        const blackSan = _moves[index + 1]?.san

        moves.push({
          number: index / 2 + 1,
          white: {
            index,
            san: whiteSan,
            style:
              index === this.moveIndex
                ? { background: "#4e7837", color: "white" }
                : { background: "inherit", color: "inherit" },
          },
          black: {
            index: index + 1,
            san: blackSan,
            style:
              index + 1 === this.moveIndex
                ? { background: "#4e7837", color: "white" }
                : { background: "inherit", color: "inherit" },
          },
        })
      }
    })
    this.moves = moves
  }
}
