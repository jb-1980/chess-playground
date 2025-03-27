import { UserDocument } from "../data-schema"
import { Users } from "../user-collection"
import { getTestUserDocument } from "./mock-user"

export const seedUser = async (
  overrides: Partial<UserDocument> = {},
): Promise<UserDocument> => {
  const user = getTestUserDocument(overrides)
  await Users.insertOne(user)
  return await Users.findOne({ _id: user._id })
}
