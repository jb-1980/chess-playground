import {
  Color,
  GameStatus,
  Piece,
  Square,
  type GameResolvers,
} from "./../../types.generated"
export const Game: GameResolvers = {
  /* Implement Game resolver logic here */

  id: async ({ _id }) => _id.toHexString(),
  moves: ({ moves }, _arg, _ctx) => {
    /* Game.moves resolver is required because Game.moves and GameMapper.moves are not compatible */
    return moves.map((move) => ({
      ...move,
      from: Square[move.from],
      to: Square[move.to],
      color: move.color === "w" ? Color.w : Color.b,
      captured: Piece[move.captured],
      piece: Piece[move.piece],
      promotion: Piece[move.promotion],
    }))
  },
  status: ({ status }, _arg, _ctx) => {
    /* Game.status resolver is required because Game.status and GameMapper.status are not compatible */
    return GameStatus[status]
  },
  blackPlayer: ({ blackPlayer }, _arg, _ctx) => {
    /* Game.blackPlayer resolver is required because Game.blackPlayer and GameMapper.blackPlayer are not compatible */
    return { ...blackPlayer, id: blackPlayer._id.toHexString() }
  },
  whitePlayer: ({ whitePlayer }, _arg, _ctx) => {
    /* Game.whitePlayer resolver is required because Game.whitePlayer and GameMapper.whitePlayer are not compatible */
    return { ...whitePlayer, id: whitePlayer._id.toHexString() }
  },
  date: async ({ createdAt }) => createdAt.toISOString().slice(0, 10),
}
