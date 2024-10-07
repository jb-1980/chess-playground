import { ObjectId } from "mongodb"
import { UserDocument, Users } from "../user"
import { faker } from "@faker-js/faker"

export const getTestUserDocument = (
  overrides: Partial<UserDocument> = {},
): UserDocument => {
  return {
    _id: new ObjectId(),
    username: faker.internet.userName(),
    passwordHash: faker.internet.password(),
    rating: 1500,
    avatarUrl: "",
    ...overrides,
  }
}

export const seedUser = async (
  overrides: Partial<UserDocument> = {},
): Promise<UserDocument> => {
  const user = getTestUserDocument(overrides)
  await Users.insertOne(user)
  return user
}
