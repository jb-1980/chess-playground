import { z } from "zod"
import { makeUserDto, User, userSchema } from "./user"
import { GameDocument } from "../repository/game"

// prettier-ignore
export const Square = z.enum([
  "a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8",
  "a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7",
  "a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6",
  "a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5",
  "a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4",
  "a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3",
  "a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2",
  "a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1",
])

export declare const DEFAULT_POSITION =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

enum Color {
  WHITE = "w",
  BLACK = "b",
}
enum Piece {
  PAWN = "p",
  KNIGHT = "n",
  BISHOP = "b",
  ROOK = "r",
  QUEEN = "q",
  KING = "k",
}

export const moveSchema = z.object({
  color: z.nativeEnum(Color),
  from: Square,
  to: Square,
  piece: z.nativeEnum(Piece),
  captured: z.nativeEnum(Piece).optional(),
  promotion: z.nativeEnum(Piece).optional(),
  flags: z.string(),
  san: z.string(),
  lan: z.string(),
  before: z.string(),
  after: z.string(),
})

export type Move = z.infer<typeof moveSchema>

export enum GameStatus {
  NOT_STARTED = "NOT_STARTED",
  JOINING = "JOINING",
  PLAYING = "PLAYING",
  CHECKMATE = "CHECKMATE",
  STALEMATE = "STALEMATE",
  THREE_MOVE_REPETITION = "THREE_MOVE_REPETITION",
  INSUFFICIENT_MATERIAL = "INSUFFICIENT_MATERIAL",
  FIFTY_MOVE_RULE = "FIFTY_MOVE_RULE",
}

export const gameSchema = z.object({
  id: z.string(),
  moves: z.array(moveSchema),
  pgn: z.string(),
  whitePlayer: userSchema,
  blackPlayer: userSchema,
  status: z.nativeEnum(GameStatus),
})
export type Game = z.infer<typeof gameSchema>

export const makeGameDTO = (game: GameDocument): Game => ({
  id: game._id.toHexString(),
  moves: game.moves,
  pgn: game.pgn,
  whitePlayer: makeUserDto(game.whitePlayer),
  blackPlayer: makeUserDto(game.blackPlayer),
  status: game.status,
})
