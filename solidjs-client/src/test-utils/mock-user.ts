import { faker } from "@faker-js/faker"
import { User } from "../types/user"

export const getMockUser = (overrides?: Partial<User>): User => ({
  id: faker.database.mongodbObjectId(),
  username: faker.internet.username(),
  rating: faker.number.int({ min: 1000, max: 2000 }),
  ...overrides,
})
