import { User } from "../../../domain/user"
import { AsyncResult, Result } from "../../../lib/result"
import { DBUserLoader, DBUserMutator } from "../../../repository"
import bcrypt from "bcrypt"

export class UserMutator {
  constructor(
    private mutator: DBUserMutator,
    private loader: DBUserLoader,
  ) {}

  public async createUser(
    username: string,
    password: string,
  ): AsyncResult<User, "DB_ERR_FAILED_TO_CREATE_USER" | "USER_ALREADY_EXISTS"> {
    try {
      const user = await this.loader.batchUsersByUsername.load(username)

      if (user) {
        return Result.Fail("USER_ALREADY_EXISTS")
      }

      const passwordHash = await bcrypt.hash(password, 10)

      return this.mutator.createUser(username, passwordHash)
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERR_FAILED_TO_CREATE_USER", error)
    }
  }

  public async updateUserRating(
    userId: string,
    newRating: number,
  ): AsyncResult<boolean, "DB_ERR_FAILED_TO_UPDATE_USER_RATING"> {
    return this.mutator.updateUserRating(userId, newRating)
  }
}
