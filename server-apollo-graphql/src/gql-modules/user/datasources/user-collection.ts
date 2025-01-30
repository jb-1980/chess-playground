import { MongoCollection } from "../../../database/collection"
import { UserDocument } from "./data-schema"

export const Users = new MongoCollection<UserDocument>("users")

await Users.initialize({
  indexes: {
    indexSpecs: [
      { name: "username", key: { username: 1 }, unique: true },
      { name: "rating", key: { rating: -1 } },
    ],
  },
  validator: {
    jsonSchema: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "username", "passwordHash", "rating", "avatarUrl"],
        properties: {
          _id: {
            bsonType: "string",
          },
          username: {
            bsonType: "string",
          },
          passwordHash: {
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
    },
  },
})
