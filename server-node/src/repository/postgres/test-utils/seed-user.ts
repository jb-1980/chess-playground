import prisma from "../client"
import { User } from "@prisma/client"
import { faker } from "@faker-js/faker"

export const getTestUserDocument = (overrides: Partial<User> = {}): User => {
  return {
    id: faker.string.uuid(),
    username: faker.internet.userName(),
    passwordHash: faker.internet.password(),
    rating: 1500,
    avatarUrl: "",
    ...overrides,
  }
}

export const seedUser = async (
  overrides: Partial<User> = {},
): Promise<User> => {
  const user = getTestUserDocument(overrides)
  await prisma.user.create({ data: user })
  return user
}
