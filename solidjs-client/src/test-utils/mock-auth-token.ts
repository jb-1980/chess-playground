import { faker } from "@faker-js/faker"
import { JWT } from "../lib/token"
import { getMockUser } from "./mock-user"

export const getMockToken = (overrides?: Partial<JWT>): string => {
  const { sub, iat, exp, ...userOverrides } = overrides ?? {}
  const mockUser = getMockUser(userOverrides)

  const payload = {
    sub: mockUser.id,
    iat: iat ?? Date.now(),
    exp: exp ?? Date.now() + 1000 * 60 * 60,
    ...mockUser,
  }
  const jwt = faker.internet.jwt({ payload })
  return jwt
}
