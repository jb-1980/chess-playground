import { makeUserDto } from "../domain/user"
import { signToken } from "../middleware/auth"
import { getTestUser } from "../repository/test-utils/seed-user"

export const getTestToken = () => {
  const user = getTestUser()
  return signToken(makeUserDto(user))
}
