import DataLoader from "dataloader"
import { UserDocument } from "../data-schema"
import { DBUserLoader } from "../types"

export class MockUserLoader implements DBUserLoader {
  private _userNameMap: Map<string, UserDocument>
  private _userIdMap: Map<string, UserDocument>
  constructor(users?: UserDocument[]) {
    this._userNameMap = new Map(users?.map((user) => [user.username, user]))
    this._userIdMap = new Map(users?.map((user) => [user._id, user]))
  }

  batchUsersById = new DataLoader<string, UserDocument | null>(async (ids) => {
    return ids.map((id) => this._userIdMap.get(id) ?? null)
  })

  batchUsersByUsername = new DataLoader<string, UserDocument | null>(
    async (usernames) =>
      usernames.map((username) => this._userNameMap.get(username) ?? null),
  )
}
