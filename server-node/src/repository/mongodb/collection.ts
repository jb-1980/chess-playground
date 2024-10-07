import { Collection, CollectionOptions, Document, OptionalId } from "mongodb"
import { mongoDB } from "./connection"

/** Implements a mongo collection
 * @param name - The name of the collection
 * @param options - Optional settings for the collection
 * @returns The collection
 * @example
 * const Users = MongoCollection<User>("users")
 * // then use like
 * const getUser = async (_id: string) => {
 *  return await Users.findOne({ _id })
 * }
 */
export const MongoCollection = <TSchema extends Document>(
  name: string,
  options?: CollectionOptions
): Collection<OptionalId<TSchema>> => {
  return mongoDB.collection<OptionalId<TSchema>>(name, options)
}
