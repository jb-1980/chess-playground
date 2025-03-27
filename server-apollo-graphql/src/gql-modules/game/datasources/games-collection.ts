import DataLoader from "dataloader"
import { MongoCollection, TDocument } from "../../../database/collection"
import { GameStatus, Move } from "../../types.generated"
import { GameDocument, GameUserDocument } from "./data-schema"
import { DBGameLoader, DBGameMutator } from "./types"
import { WithId } from "mongodb"
import { UserDocument } from "../../user/datasources"
import { AsyncResult, Result } from "../../../lib/result"

export const Games = new MongoCollection<GameDocument>("games")

await Games.initialize({
  indexes: {
    indexSpecs: [
      { name: "whitePlayer", key: { "whitePlayer._id": 1 } },
      { name: "blackPlayer", key: { "blackPlayer._id": 1 } },
    ],
  },
  validator: {
    jsonSchema: {
      $jsonSchema: {
        bsonType: "object",
        required: [
          "moves",
          "pgn",
          "whitePlayer",
          "blackPlayer",
          "status",
          "outcome",
          "outcomes",
        ],
        properties: {
          moves: {
            bsonType: "array",
            items: {
              bsonType: "object",
              required: [
                "color",
                "from",
                "to",
                "piece",
                "flags",
                "san",
                "lan",
                "before",
                "after",
                "createdAt",
              ],
              properties: {
                color: {
                  bsonType: "string",
                },
                from: {
                  bsonType: "string",
                },
                to: {
                  bsonType: "string",
                },
                piece: {
                  bsonType: "string",
                },
                captured: {
                  bsonType: ["string", "null"],
                },
                promotion: {
                  bsonType: ["string", "null"],
                },
                flags: {
                  bsonType: "string",
                },
                san: {
                  bsonType: "string",
                },
                lan: {
                  bsonType: "string",
                },
                before: {
                  bsonType: "string",
                },
                after: {
                  bsonType: "string",
                },
                createdAt: {
                  bsonType: "date",
                },
              },
            },
          },
          blackPlayer: {
            bsonType: "object",
            properties: {
              _id: {
                bsonType: "string",
              },
              username: {
                bsonType: "string",
              },
              rating: {
                bsonType: "int",
              },
              avatarUrl: {
                bsonType: "string",
              },
            },
          },
          whitePlayer: {
            bsonType: "object",
            properties: {
              _id: {
                bsonType: "string",
              },
              username: {
                bsonType: "string",
              },
              rating: {
                bsonType: "int",
              },
              avatarUrl: {
                bsonType: "string",
              },
            },
          },
          pgn: {
            bsonType: "string",
          },
          status: {
            enum: Object.values(GameStatus),
          },
          outcome: {
            bsonType: "object",
            required: ["winner", "draw"],
            properties: {
              winner: {
                bsonType: ["string", "null"],
              },
              draw: {
                bsonType: "bool",
              },
            },
          },
          outcomes: {
            bsonType: "object",
            required: ["whiteWins", "blackWins", "draw"],
            properties: {
              whiteWins: {
                bsonType: "object",
                required: ["whiteRating", "blackRating"],
                properties: {
                  whiteRating: {
                    bsonType: "int",
                  },
                  blackRating: {
                    bsonType: "int",
                  },
                },
              },
              blackWins: {
                bsonType: "object",
                required: ["whiteRating", "blackRating"],
                properties: {
                  whiteRating: {
                    bsonType: "int",
                  },
                  blackRating: {
                    bsonType: "int",
                  },
                },
              },
              draw: {
                bsonType: "object",
                required: ["whiteRating", "blackRating"],
                properties: {
                  whiteRating: {
                    bsonType: "int",
                  },
                  blackRating: {
                    bsonType: "int",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
})

export class MongoDBGameLoader implements DBGameLoader {
  batchGames = new DataLoader<string, WithId<TDocument<GameDocument>> | null>(
    async (ids) => {
      const games = await Games.find({
        _id: { $in: ids },
      }).toArray()

      const gamesMap = games.reduce(
        (map, game) => {
          map[game._id.toString()] = game
          return map
        },
        {} as Record<string, WithId<TDocument<GameDocument>>>,
      )

      return ids.map((id) => gamesMap[id] || null)
    },
  )

  batchGamesForPlayer = new DataLoader<
    string,
    WithId<TDocument<GameDocument>>[]
  >(async (ids) => {
    const games = await Games.find({
      $or: [
        { "whitePlayer._id": { $in: ids } },
        { "blackPlayer._id": { $in: ids } },
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
      {} as Record<string, WithId<TDocument<GameDocument>>[]>,
    )

    return ids.map((id) => gamesMap[id] || [])
  })
}

const toGameUserFromUserDocument = (user: UserDocument): GameUserDocument => ({
  _id: user._id,
  username: user.username,
  rating: user.rating,
  avatarUrl: user.avatarUrl ?? "",
})

export class MongoDBGameMutator implements DBGameMutator {
  async insertGame(
    whitePlayer: UserDocument,
    blackPlayer: UserDocument,
    outcomes: GameDocument["outcomes"],
  ): AsyncResult<string, "DB_ERR_FAILED_TO_CREATE_GAME"> {
    try {
      const response = await Games.insertOne({
        whitePlayer: toGameUserFromUserDocument(whitePlayer),
        blackPlayer: toGameUserFromUserDocument(blackPlayer),
        moves: [],
        pgn: "",
        status: GameStatus.PLAYING,
        outcome: {
          winner: null,
          draw: false,
        },
        outcomes,
      })
      return Result.Success(response.insertedId.toString())
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
