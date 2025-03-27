import { AsyncResult, Result } from "../../../lib/result"
import { UserDocument } from "./data-schema"
import { DBUserLoader, DBUserMutator } from "./types"
import bcrypt from "bcrypt"

export class UserMutator {
  constructor(
    private mutator: DBUserMutator,
    private loader: DBUserLoader,
  ) {}
  public async createUser(
    username: string,
    password: string,
  ): AsyncResult<
    UserDocument,
    "DB_ERR_FAILED_TO_CREATE_USER" | "USER_ALREADY_EXISTS"
  > {
    try {
      const user = await this.loader.batchUsersByUsername.load(username)

      if (user) {
        return Result.Fail("USER_ALREADY_EXISTS")
      }

      const passwordHash = await bcrypt.hash(password, 10)

      return this.mutator.createUser(username, passwordHash)
    } catch (error) {
      console.dir(error, { depth: null, colors: true })
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
