import { faker } from "@faker-js/faker"
import { UserDocument } from "../data-schema"

export const getTestUserDocument = (
  overrides: Partial<UserDocument> = {},
): UserDocument => {
  return {
    _id: faker.database.mongodbObjectId(),
    username: faker.internet.username(),
    passwordHash: faker.internet.password(),
    rating: 1500,
    avatarUrl: "",
    ...overrides,
  }
}
