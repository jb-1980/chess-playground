import { signToken } from "../middleware/auth"
import { getTestUser } from "./user"

export const getTestToken = () => {
  const user = getTestUser()
  return signToken(user)
}
