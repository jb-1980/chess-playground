import { UserDocument } from "../data-schema"
import { DBUserMutator } from "../types"
import { Result } from "../../../../lib/result"
import { getTestUserDocument } from "./mock-user"

export class MockUserMutator implements DBUserMutator {
  private _users: Map<string, UserDocument>
  constructor(users?: UserDocument[]) {
    this._users = users
      ? new Map(users.map((user) => [user.username, user]))
      : new Map()
  }
  get users() {
    return this._users
  }
  createUser = async (username: string, _passwordHash: string) => {
    const user = this.users.get(username)
    if (user) {
      return Result.Fail("USER_ALREADY_EXISTS" as const)
    }
    return Result.Success(
      getTestUserDocument({
        username,
      }),
    )
  }
  updateUserRating = async () => {
    return Result.Success(true)
  }
}
