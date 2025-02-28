import { MongoCollection } from "../../../database/collection"
import { GameStatus } from "../../types.generated"
import { GameDocument } from "./data-schema"

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
