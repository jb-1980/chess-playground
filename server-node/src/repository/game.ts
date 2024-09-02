import { ObjectId } from "mongodb"
import { MongoCollection } from "./collection"

type MoveDocument = {
  /** SAN representation of the move */
  move: string
  number: number
  player: "w" | "b"
  promotion: string
  fen: string
  createdAt: Date
}

export enum GameStatus {
  PLAYING = "PLAYING",
  CHECKMATE = "CHECKMATE",
  STALEMATE = "STALEMATE",
  THREE_MOVE_REPETITION = "THREE_MOVE_REPETITION",
  INSUFFICIENT_MATERIAL = "INSUFFICIENT_MATERIAL",
  FIFTY_MOVE_RULE = "FIFTY_MOVE_RULE",
}

type GameUser = {
  _id: ObjectId
  username: string
}

type GameDocument = {
  _id: ObjectId
  moves: MoveDocument[]
  pgn: string
  whitePlayer: GameUser
  blackPlayer: GameUser
  status: GameStatus
}

const Game = MongoCollection<GameDocument>("games")

export const createGame = async (
  whitePlayer: GameUser,
  blackPlayer: GameUser
): Promise<string> => {
  const response = await Game.insertOne({
    whitePlayer,
    blackPlayer,
    moves: [],
    pgn: "",
    status: GameStatus.PLAYING,
  })
  console.log({ response })
  return response.insertedId.toString()
}

export const getGameById = async (id: string): Promise<GameDocument | null> => {
  return Game.findOne({ _id: new ObjectId(id) })
}

export const addMoveToGame = async (args: {
  gameId: string
  move: MoveDocument
  status: GameStatus
  pgn: string
}): Promise<GameDocument | null> => {
  const { gameId, move, status, pgn } = args
  await Game.updateOne(
    { _id: new ObjectId(gameId) },
    {
      $push: { moves: move },
      $set: { status, pgn },
    }
  )

  return Game.findOne({ _id: new ObjectId(gameId) })
}
