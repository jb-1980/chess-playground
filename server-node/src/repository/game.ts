import { ObjectId } from "mongodb"
import { MongoCollection } from "./collection"
import { AsyncResult, Result } from "../lib/result"
import { UserDocument } from "./user"
import { GameStatus, Move } from "../domain/game"
import { calculateNewRatings } from "../lib/chess"
import DataLoader from "dataloader"

type GameUser = Pick<UserDocument, "_id" | "username" | "rating" | "avatarUrl">

export type GameDocument = {
  _id: ObjectId
  moves: (Move & { createdAt: Date })[]
  pgn: string
  whitePlayer: GameUser
  blackPlayer: GameUser
  status: GameStatus
  createdAt: Date
  outcome: {
    winner: string | null
    draw: boolean
  }
  outcomes: {
    whiteWins: {
      whiteRating: number
      blackRating: number
    }
    blackWins: {
      whiteRating: number
      blackRating: number
    }
    draw: {
      whiteRating: number
      blackRating: number
    }
  }
}

const Game = MongoCollection<GameDocument>("games")

const toGameUserFromUserDocument = (user: UserDocument): GameUser => ({
  _id: user._id,
  username: user.username,
  rating: user.rating,
  avatarUrl: user.avatarUrl,
})

export class GameLoader {
  private _batchGames = new DataLoader<string, GameDocument | null>(
    async (ids) => {
      const games = await Game.find({
        _id: { $in: ids.map((id) => new ObjectId(id)) },
      }).toArray()

      const gamesMap = games.reduce((map, game) => {
        map[game._id.toString()] = game
        return map
      }, {} as Record<string, GameDocument>)

      return ids.map((id) => gamesMap[id] || null)
    }
  )

  private _batchGamesForPlayer = new DataLoader<string, GameDocument[]>(
    async (ids) => {
      const games = await Game.find({
        $or: [
          { "whitePlayer._id": { $in: ids.map((id) => new ObjectId(id)) } },
          { "blackPlayer._id": { $in: ids.map((id) => new ObjectId(id)) } },
        ],
      }).toArray()

      const gamesMap = games.reduce((map, game) => {
        const whitePlayerId = game.whitePlayer._id.toString()
        const blackPlayerId = game.blackPlayer._id.toString()
        map[whitePlayerId] = map[whitePlayerId] || []
        map[blackPlayerId] = map[blackPlayerId] || []
        map[whitePlayerId].push(game)
        map[blackPlayerId].push(game)
        return map
      }, {} as Record<string, GameDocument[]>)

      return ids.map((id) => gamesMap[id] || [])
    }
  )

  async getGameById(
    id: string
  ): AsyncResult<GameDocument | null, "DB_ERROR_WHILE_GETTING_GAME"> {
    try {
      const game = await this._batchGames.load(id)
      return Result.Success(game)
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERROR_WHILE_GETTING_GAME", error)
    }
  }

  async getGamesForPlayerId(
    playerId: string
  ): AsyncResult<GameDocument[], "DB_ERR_GET_GAMES_FOR_USER_ID"> {
    try {
      const games = await this._batchGamesForPlayer.load(playerId)
      return Result.Success(games)
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERR_GET_GAMES_FOR_USER_ID", error)
    }
  }
}

export class GameMutator {
  public async createGame(
    whiteUser: UserDocument,
    blackUser: UserDocument
  ): AsyncResult<string, "DB_ERR_FAILED_TO_CREATE_GAME"> {
    const whitePlayer = toGameUserFromUserDocument(whiteUser)
    const blackPlayer = toGameUserFromUserDocument(blackUser)
    const whiteWinsOutcome = calculateNewRatings(
      whitePlayer.rating,
      blackPlayer.rating,
      1
    )
    const blackWinsOutcome = calculateNewRatings(
      whitePlayer.rating,
      blackPlayer.rating,
      0
    )
    const drawOutcome = calculateNewRatings(
      whitePlayer.rating,
      blackPlayer.rating,
      0.5
    )
    try {
      const response = await Game.insertOne({
        whitePlayer,
        blackPlayer,
        moves: [],
        pgn: "",
        status: GameStatus.PLAYING,
        createdAt: new Date(),
        outcome: {
          winner: null,
          draw: false,
        },
        outcomes: {
          whiteWins: whiteWinsOutcome,
          blackWins: blackWinsOutcome,
          draw: drawOutcome,
        },
      })
      return Result.Success(response.insertedId.toString())
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERR_FAILED_TO_CREATE_GAME", error)
    }
  }

  public async addMoveToGame(args: {
    gameId: string
    move: Move
    status: GameStatus
    pgn: string
  }): AsyncResult<boolean, "DB_ERROR_ADDING_MOVE_TO_GAME" | "INVALID_MOVE"> {
    const { gameId, move, status, pgn } = args
    try {
      const { acknowledged } = await Game.updateOne(
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

      return Result.Success(acknowledged)
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERROR_ADDING_MOVE_TO_GAME", error)
    }
  }

  public async setOutcome(
    gameId: string,
    winner: string | null,
    draw: boolean
  ): AsyncResult<boolean, "DB_ERR_SET_OUTCOME"> {
    try {
      const { acknowledged } = await Game.updateOne(
        { _id: new ObjectId(gameId) },
        {
          $set: {
            outcome: {
              winner,
              draw,
            },
          },
        }
      )
      return Result.Success(acknowledged)
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERR_SET_OUTCOME", error)
    }
  }
}
