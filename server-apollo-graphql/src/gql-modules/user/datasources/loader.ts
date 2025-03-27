import { AsyncResult, Result } from "../../../lib/result"
import { UserDocument } from "./data-schema"
import { DBUserLoader } from "./types"

export class UserLoader {
  constructor(private loader: DBUserLoader) {}

  public async getUserByUsername(
    username: string,
  ): AsyncResult<UserDocument | null, "DB_ERR_FAILED_TO_GET_USER"> {
    try {
      const user = await this.loader.batchUsersByUsername.load(username)
      return Result.Success(user)
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERR_FAILED_TO_GET_USER", error)
    }
  }

  public async getUsersByIds(
    ids: string[],
  ): AsyncResult<UserDocument[], "DB_ERR_FAILED_TO_GET_USERS_BY_IDS"> {
    try {
      const users = await this.loader.batchUsersById.loadMany(ids)
      return Result.Success(
        users.filter((user): user is UserDocument => {
          return user !== null && !(user instanceof Error)
        }),
      )
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERR_FAILED_TO_GET_USERS_BY_IDS" as const, error)
    }
  }
}
