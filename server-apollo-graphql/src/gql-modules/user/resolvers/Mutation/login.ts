import { isFailure } from "../../../../lib/result"
import bcrypt from "bcrypt"
import type { MutationResolvers } from "./../../../types.generated"
import { signToken } from "../../../../middleware/auth"

export const login: NonNullable<MutationResolvers["login"]> = async (
  _parent,
  { username, password },
  { dataSources: { UserLoader } },
) => {
  const userResult = await UserLoader.getUserByUsername(username)

  if (isFailure(userResult)) {
    return {
      __typename: "LoginError",
      message: userResult.message,
    }
  }

  const user = userResult.data
  if (!user) {
    return {
      __typename: "LoginError",
      message: "BAD_CREDENTIALS",
    }
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatch) {
    return {
      __typename: "LoginError",
      message: "BAD_CREDENTIALS",
    }
  }

  const parsedUser = {
    id: user._id,
    username: user.username,
    rating: user.rating,
    avatarUrl: user.avatarUrl,
  }
  return {
    __typename: "LoginSuccess",
    token: signToken(parsedUser),
  }
}
