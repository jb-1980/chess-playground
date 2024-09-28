import { User } from "../types.generated"
import { UserMapper } from "./domain.mappers"

export const makeUserDto = (user: UserMapper): User => {
  return {
    id: user._id.toHexString(),
    username: user.username,
    rating: user.rating,
    avatarUrl: user.avatarUrl,
  }
}
