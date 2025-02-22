import { AsyncResult, User } from "../../repository"
import { Result } from "../../lib/result"
import { DBUserLoader } from "../../repository/loaders"
import bcrypt from "bcrypt"

export class UserLoader {
  constructor(private loader: DBUserLoader) {}

  public async validateUser(
    username: string,
    password: string,
  ): AsyncResult<User, "DB_ERR_FAILED_TO_GET_USER" | "BAD_CREDENTIALS"> {
    try {
      const user = await this.loader.batchUsersByUsername.load(username)
      if (!user) {
        return Result.Fail("BAD_CREDENTIALS")
      }

      const passwordMatch = await bcrypt.compare(password, user.passwordHash)
      if (!passwordMatch) {
        return Result.Fail("BAD_CREDENTIALS")
      }
      const { passwordHash, ...parsedUser } = user

      return Result.Success(parsedUser)
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERR_FAILED_TO_GET_USER", error)
    }
  }

  public async getUsersByIds(
    ids: string[],
  ): AsyncResult<User[], "DB_ERR_FAILED_TO_GET_USERS_BY_IDS"> {
    try {
      const users = await this.loader.batchUsersById.loadMany(ids)
      return Result.Success(
        users.filter((user): user is User => {
          return user !== null && !(user instanceof Error)
        }),
      )
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERR_FAILED_TO_GET_USERS_BY_IDS" as const, error)
    }
  }
}
