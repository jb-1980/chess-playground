import { faker } from "@faker-js/faker"
import {
  MongoUserDocument,
  UserDocument,
} from "../gql-modules/user/datasources/data-schema"
import { Users } from "../gql-modules/user/datasources/user-collection"
import { User } from "../gql-modules/types.generated"

export const getTestUserDocument = (
  overrides: Partial<UserDocument> = {},
): MongoUserDocument => {
  return {
    _id: faker.database.mongodbObjectId(),
    username: faker.internet.username(),
    passwordHash: faker.internet.password(),
    rating: 1500,
    avatarUrl: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export const seedUser = async (
  overrides: Partial<UserDocument> = {},
): Promise<MongoUserDocument> => {
  const user = getTestUserDocument(overrides)
  await Users.insertOne(user)
  return await Users.findOne({ _id: user._id })
}

export const makeUserDTO = (user: MongoUserDocument): User => ({
  __typename: "User",
  id: user._id,
  username: user.username,
  rating: user.rating,
  avatarUrl: user.avatarUrl,
})
