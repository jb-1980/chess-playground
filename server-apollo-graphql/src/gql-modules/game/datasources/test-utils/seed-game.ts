import { GameDocument, MongoGameDocument } from "../data-schema"
import { Games } from "../games-collection"
import { getTestMongoDBGame, Overrides } from "./mock-game"

export const seedGame = async (
  overrides: Overrides = {},
): Promise<MongoGameDocument> => {
  const gameDocument = getTestMongoDBGame(overrides)
  const { insertedId } = await Games.insertOne(gameDocument)
  return await Games.findOne({ _id: insertedId })
}
