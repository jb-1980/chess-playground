export class ResultFromPgnValueConverter {
  toView(pgn: string, params: { player: "w" | "b" }) {
    const regex = /\[Result "(.*)"\]/
    const match = pgn.match(regex)
    if (!match) {
      return [null, null]
    }
    return params.player === "w"
      ? match[1].split("-")[0]
      : match[1].split("-")[1]
  }
}
