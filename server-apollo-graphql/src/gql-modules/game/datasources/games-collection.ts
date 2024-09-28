import { MongoCollection } from "../../../database/collection"
import { GameDocument } from "./data-schema"

export const Games = MongoCollection<GameDocument>("games")
