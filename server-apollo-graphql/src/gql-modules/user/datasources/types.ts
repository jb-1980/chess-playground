import DataLoader from "dataloader"
import { UserDocument } from "./data-schema"
import { AsyncResult } from "../../../lib/result"

export abstract class DBUserLoader {
  abstract batchUsersById: DataLoader<string, UserDocument | null>
  abstract batchUsersByUsername: DataLoader<string, UserDocument | null>
}

export abstract class DBUserMutator {
  abstract createUser(
    username: string,
    passwordHash: string,
  ): AsyncResult<
    UserDocument,
    "DB_ERR_FAILED_TO_CREATE_USER" | "USER_ALREADY_EXISTS"
  >
  abstract updateUserRating(
    userId: string,
    newRating: number,
  ): AsyncResult<boolean, "DB_ERR_FAILED_TO_UPDATE_USER_RATING">
}
