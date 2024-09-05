import { ObjectId } from "mongodb"
import { MongoCollection } from "./collection"
import { AsyncResult, Result } from "../lib/result"
import { UserDocument } from "./user"
import { User } from "../domain/user"
import { Move } from "../domain/game"

export enum GameStatus {
  PLAYING = "PLAYING",
  CHECKMATE = "CHECKMATE",
  STALEMATE = "STALEMATE",
  THREE_MOVE_REPETITION = "THREE_MOVE_REPETITION",
  INSUFFICIENT_MATERIAL = "INSUFFICIENT_MATERIAL",
  FIFTY_MOVE_RULE = "FIFTY_MOVE_RULE",
}

export type GameUser = Omit<User, "id"> & {
  _id: ObjectId
}

export type GameDocument = {
  _id: ObjectId
  moves: (Move & { createdAt: Date })[]
  pgn: string
  whitePlayer: GameUser
  blackPlayer: GameUser
  status: GameStatus
}

const Game = MongoCollection<GameDocument>("games")

const toGameUserFromUser = (user: UserDocument): GameUser => ({
  _id: user._id,
  username: user.username,
  rating: user.rating,
  avatarUrl: user.avatarUrl,
})

const initializePgn = (
  whitePlayer: GameUser,
  blackPlayer: GameUser
): string => {
  return `[Event "Live Chess"]
[Site "chess-app"]
[White "${whitePlayer.username}"]
[Black "${blackPlayer.username}"]
[UTCDate "${new Date().toISOString().split("T")[0]}"]
[UTCTime "${new Date().toISOString().split("T")[1].split(".")[0]}"]
[WhiteElo "${whitePlayer.rating}"]
[BlackElo "${blackPlayer.rating}"]
[Result "*"]
`
}

export const createGame = async (
  whiteUser: UserDocument,
  blackUser: UserDocument
): AsyncResult<
  {
    gameId: string
    pgn: string
  },
  "DB_ERR_FAILED_TO_CREATE_GAME"
> => {
  const whitePlayer = toGameUserFromUser(whiteUser)
  const blackPlayer = toGameUserFromUser(blackUser)
  const pgn = initializePgn(whitePlayer, blackPlayer)
  try {
    const response = await Game.insertOne({
      whitePlayer,
      blackPlayer,
      moves: [],
      pgn,
      status: GameStatus.PLAYING,
    })
    return Result.Success({
      gameId: response.insertedId.toString(),
      pgn,
    })
  } catch (error) {
    console.error(error)
    return Result.Fail("DB_ERR_FAILED_TO_CREATE_GAME", error)
  }
}

export const getGameById = async (
  id: string
): AsyncResult<GameDocument | null, "DB_ERROR_WHILE_GETTING_GAME"> => {
  try {
    const game = await Game.findOne({ _id: new ObjectId(id) })
    return Result.Success(game)
  } catch (error) {
    console.error(error)
    return Result.Fail("DB_ERROR_WHILE_GETTING_GAME", error)
  }
}

export const addMoveToGame = async (args: {
  gameId: string
  move: Move
  status: GameStatus
  pgn: string
}): AsyncResult<GameDocument | null, "DB_ERROR_ADDING_MOVE_TO_GAME"> => {
  const { gameId, move, status, pgn } = args
  try {
    await Game.updateOne(
      { _id: new ObjectId(gameId) },
      {
        $push: {
          moves: {
            ...move,
            createdAt: new Date(),
          },
        },
        $set: { status, pgn },
      }
    )

    const game = await Game.findOne({ _id: new ObjectId(gameId) })
    return Result.Success(game)
  } catch (error) {
    console.error(error)
    return Result.Fail("DB_ERROR_ADDING_MOVE_TO_GAME", error)
  }
}
