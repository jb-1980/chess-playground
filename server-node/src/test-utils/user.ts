import { faker } from "@faker-js/faker"
import { User } from "../domain/user"

export const getTestUser = (overrides: Partial<User> = {}): User => {
  return {
    id: faker.database.mongodbObjectId(),
    username: faker.internet.userName(),
    rating: 1500,
    avatarUrl: "",
    ...overrides,
  }
}
