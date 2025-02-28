import { ObjectId } from "mongodb"
import { MongoCollection } from "../../collection"
import { AsyncResult, Result } from "../../../../lib/result"
import { makeUserDto } from "../user/user"
import { Game, GameOutcome, GameStatus, Move } from "../../../../domain/game"
import DataLoader from "dataloader"
import { DBGameMutator, DBGameLoader } from "../../../loaders"
import { User } from "../../../../domain/user"

type GameUser = Pick<Omit<User, "id">, "username" | "rating" | "avatarUrl"> & {
  _id: ObjectId
}

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

export const Games = MongoCollection<GameDocument>("games")

const toGameUserFromUser = (user: User): GameUser => ({
  _id: new ObjectId(user.id),
  username: user.username,
  rating: user.rating,
  avatarUrl: user.avatarUrl,
})

/** function to convert a game document into a Game model
 * NOTE: this function is only exported for testing purposes, so it should not
 * be used outside of this file except in tests
 * @param game - the game document
 * @returns Game
 */
export const makeGameDTO = (game: GameDocument): Game => ({
  id: game._id.toHexString(),
  moves: game.moves,
  pgn: game.pgn,
  whitePlayer: makeUserDto(game.whitePlayer),
  blackPlayer: makeUserDto(game.blackPlayer),
  status: game.status,
  createdAt: game.createdAt,
})

export class MongoDBGameLoader implements DBGameLoader {
  batchGames = new DataLoader<string, Game | null>(async (ids) => {
    const games = await Games.find({
      _id: { $in: ids.map((id) => new ObjectId(id)) },
    }).toArray()

    const gamesMap = games.reduce(
      (map, game) => {
        map[game._id.toString()] = makeGameDTO(game)

        return map
      },
      {} as Record<string, Game>,
    )

    return ids.map((id) => gamesMap[id] || null)
  })

  batchGamesForPlayer = new DataLoader<string, Game[]>(async (ids) => {
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
        map[whitePlayerId].push(makeGameDTO(game))
        map[blackPlayerId].push(makeGameDTO(game))
        return map
      },
      {} as Record<string, Game[]>,
    )

    return ids.map((id) => gamesMap[id] || [])
  })

  batchGameOutcomes = new DataLoader<string, GameOutcome>(async (ids) => {
    const games = await Games.find({
      _id: { $in: ids.map((id) => new ObjectId(id)) },
    }).toArray()

    const outcomesMap = games.reduce(
      (map, game) => {
        map[game._id.toString()] = {
          whiteWins: game.outcomes.whiteWins,
          blackWins: game.outcomes.blackWins,
          draw: game.outcomes.draw,
        }

        return map
      },
      {} as Record<string, GameOutcome>,
    )

    return ids.map((id) => outcomesMap[id])
  })
}

export class MongoDBGameMutator implements DBGameMutator {
  async insertGame(
    whitePlayer: User,
    blackPlayer: User,
    outcomes: GameOutcome,
  ): AsyncResult<string, "DB_ERR_FAILED_TO_CREATE_GAME"> {
    try {
      const response = await Games.insertOne({
        whitePlayer: toGameUserFromUser(whitePlayer),
        blackPlayer: toGameUserFromUser(blackPlayer),
        moves: [],
        pgn: "",
        status: GameStatus.PLAYING,
        createdAt: new Date(),
        outcome: {
          winner: null,
          draw: false,
        },
        outcomes,
      })
      return Result.Success(response.insertedId.toHexString())
    } catch (error) {
      console.dir(error, { depth: 6 })
      return Result.Fail("DB_ERR_FAILED_TO_CREATE_GAME", error)
    }
  }
  async addMoveToGame(args: {
    gameId: string
    move: Move
    status: GameStatus
    pgn: string
  }): AsyncResult<boolean, "DB_ERROR_ADDING_MOVE_TO_GAME"> {
    const { gameId, move, status, pgn } = args
    try {
      const { acknowledged } = await Games.updateOne(
        { _id: new ObjectId(gameId) },
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
      console.dir(error, { depth: 6 })
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
        { _id: new ObjectId(gameId) },
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
