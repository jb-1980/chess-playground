import { JWT } from "../lib/token"
import { getMockUser } from "./mock-user"

function b64Encode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

export const getMockToken = (
  overrides?: Partial<JWT>,
  secret: string = "secret",
): string => {
  const { sub, iat, exp, ...userOverrides } = overrides ?? {}
  const mockUser = getMockUser(userOverrides)

  const header = {
    alg: "HS256",
    typ: "JWT",
  }
  const payload = {
    sub: mockUser.id,
    iat: iat ?? Date.now(),
    exp: exp ?? Date.now() + 1000 * 60 * 60,
    ...mockUser,
  }
  const jwt = `${b64Encode(JSON.stringify(header))}.${b64Encode(JSON.stringify(payload))}.${b64Encode(secret)}`
  return jwt
}
