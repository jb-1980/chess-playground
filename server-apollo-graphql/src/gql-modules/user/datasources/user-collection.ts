import { MongoCollection } from "../../../database/collection"
import { UserDocument } from "./data-schema"

export const Users = MongoCollection<UserDocument>("users")
