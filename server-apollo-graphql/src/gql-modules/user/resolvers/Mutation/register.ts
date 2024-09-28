import { isFailure } from "../../../../lib/result"
import { signToken } from "../../../../middleware/auth"
import type { MutationResolvers } from "./../../../types.generated"
export const register: NonNullable<MutationResolvers["register"]> = async (
  _parent,
  { username, password },
  { dataSources: { UserMutator } },
) => {
  const userResult = await UserMutator.createUser(username, password)

  if (isFailure(userResult)) {
    return {
      __typename: "RegisterError",
      message: userResult.message,
    }
  }

  const user = userResult.data
  const parsedUser = {
    id: user._id.toHexString(),
    username: user.username,
    rating: user.rating,
    avatarUrl: user.avatarUrl,
  }
  return {
    __typename: "RegisterSuccess",
    token: signToken(parsedUser),
  }
}
