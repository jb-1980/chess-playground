import { ObjectId } from "mongodb"
import { MongoCollection } from "./collection"
import { AsyncResult, Result } from "../../lib/result"
import { makeUserDto } from "./user"
import { Game, GameOutcome, GameStatus, Move } from "../../domain/game"
import { calculateNewRatings } from "../../lib/chess"
import DataLoader from "dataloader"
import { GameLoaderInterface, GameMutatorInterface } from "../loaders"
import { User } from "../../domain/user"

type GameUser = Pick<Omit<User, "id">, "username" | "rating" | "avatarUrl"> & {
  _id: string
}

export type GameDocument = {
  _id: string
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

export const Games = MongoCollection<GameDocument>("games")

const toGameUserFromUser = (user: User): GameUser => ({
  _id: user.id,
  username: user.username,
  rating: user.rating,
  avatarUrl: user.avatarUrl,
})

export const makeGameDTO = (game: GameDocument): Game => ({
  id: game._id,
  moves: game.moves,
  pgn: game.pgn,
  whitePlayer: makeUserDto(game.whitePlayer),
  blackPlayer: makeUserDto(game.blackPlayer),
  status: game.status,
  createdAt: game.createdAt,
})

export class GameLoader implements GameLoaderInterface {
  private _batchGames = new DataLoader<string, GameDocument | null>(
    async (ids) => {
      const games = await Games.find({
        _id: { $in: ids },
      }).toArray()

      const gamesMap = games.reduce(
        (map, game) => {
          map[game._id.toString()] = game
          return map
        },
        {} as Record<string, GameDocument>,
      )

      return ids.map((id) => gamesMap[id] || null)
    },
  )

  private _batchGamesForPlayer = new DataLoader<string, GameDocument[]>(
    async (ids) => {
      const games = await Games.find({
        $or: [
          { "whitePlayer._id": { $in: ids.map((id) => new ObjectId(id)) } },
          { "blackPlayer._id": { $in: ids.map((id) => new ObjectId(id)) } },
        ],
      }).toArray()

      const gamesMap = games.reduce(
        (map, game) => {
          const whitePlayerId = game.whitePlayer._id.toString()
          const blackPlayerId = game.blackPlayer._id.toString()
          map[whitePlayerId] = map[whitePlayerId] || []
          map[blackPlayerId] = map[blackPlayerId] || []
          map[whitePlayerId].push(game)
          map[blackPlayerId].push(game)
          return map
        },
        {} as Record<string, GameDocument[]>,
      )

      return ids.map((id) => gamesMap[id] || [])
    },
  )

  async getGameById(
    id: string,
  ): AsyncResult<Game | null, "DB_ERROR_WHILE_GETTING_GAME"> {
    try {
      const game = await this._batchGames.load(id)
      if (!game) {
        return Result.Success(null)
      }
      return Result.Success(makeGameDTO(game))
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERROR_WHILE_GETTING_GAME", error)
    }
  }

  async getGamesForPlayerId(
    playerId: string,
  ): AsyncResult<Game[], "DB_ERR_GET_GAMES_FOR_USER_ID"> {
    try {
      const games = await this._batchGamesForPlayer.load(playerId)
      return Result.Success(games.map(makeGameDTO))
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERR_GET_GAMES_FOR_USER_ID", error)
    }
  }

  async getGameOutcomes(
    gameId: string,
  ): AsyncResult<GameOutcome, "DB_ERR_GET_GAME_OUTCOMES"> {
    try {
      const game = await this._batchGames.load(gameId)
      if (!game) {
        return Result.Fail("DB_ERR_GET_GAME_OUTCOMES")
      }
      return Result.Success({
        whiteWins: game.outcomes.whiteWins,
        blackWins: game.outcomes.blackWins,
        draw: game.outcomes.draw,
      })
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERR_GET_GAME_OUTCOMES", error)
    }
  }
}

export class GameMutator implements GameMutatorInterface {
  public async createGame(
    whiteUser: User,
    blackUser: User,
  ): AsyncResult<string, "DB_ERR_FAILED_TO_CREATE_GAME"> {
    const whiteWinsOutcome = calculateNewRatings(
      whiteUser.rating,
      blackUser.rating,
      1,
    )
    const blackWinsOutcome = calculateNewRatings(
      whiteUser.rating,
      blackUser.rating,
      0,
    )
    const drawOutcome = calculateNewRatings(
      whiteUser.rating,
      blackUser.rating,
      0.5,
    )
    try {
      const response = await Games.insertOne({
        _id: new ObjectId().toHexString(),
        whitePlayer: toGameUserFromUser(whiteUser),
        blackPlayer: toGameUserFromUser(blackUser),
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
      console.dir(error, { depth: null })
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
      const { acknowledged } = await Games.updateOne(
        { _id: gameId },
        {
          $push: {
            moves: {
              ...move,
              createdAt: new Date(),
            },
          },
          $set: { status, pgn },
        },
        {
          ignoreUndefined: true,
        },
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
    draw: boolean,
  ): AsyncResult<boolean, "DB_ERR_SET_OUTCOME"> {
    try {
      const { acknowledged } = await Games.updateOne(
        { _id: gameId },
        {
          $set: {
            outcome: {
              winner,
              draw,
            },
          },
        },
      )
      return Result.Success(acknowledged)
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERR_SET_OUTCOME", error)
    }
  }
}
