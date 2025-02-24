import {
  DataLoader,
  DBGameLoader,
  DBGameMutator,
  DBUserLoader,
  DBUserMutator,
  UserWithPasswordHash,
} from "./loaders"
import { User } from "../domain/user"
import { Result } from "../lib/result"
import { getTestUser } from "../test-utils/user"
import { Game, GameOutcome } from "../domain/game"
import { getTestGame } from "../test-utils/game"
import { faker } from "@faker-js/faker"
import { getTestOutcomes } from "./mongodb/test-utils/seed-game"

export class MockUserMutator implements DBUserMutator {
  private _users: Map<string, User>
  constructor(users?: User[]) {
    this._users = users
      ? new Map(users.map((user) => [user.username, user]))
      : new Map()
  }
  get users() {
    return this._users
  }
  createUser = async (username: string, _passwordHash: string) => {
    return Result.Success(
      this.users.get(username) ??
        getTestUser({
          username,
        }),
    )
  }
  updateUserRating = async () => {
    return Result.Success(true)
  }
}

export class MockUserLoader implements DBUserLoader {
  private _userNameMap: Map<string, User>
  private _userIdMap: Map<string, User>
  constructor(users?: User[]) {
    this._userNameMap = new Map(users?.map((user) => [user.username, user]))
    this._userIdMap = new Map(users?.map((user) => [user.id, user]))
  }

  batchUsersById = new DataLoader<string, User | null>(async (ids) => {
    return ids.map((id) => this._userIdMap.get(id) ?? null)
  })

  batchUsersByUsername = new DataLoader<string, UserWithPasswordHash | null>(
    async (usernames) => {
      return usernames.map((username) => {
        const user = this._userNameMap.get(username)
        return user
          ? { ...user, passwordHash: faker.internet.password() }
          : null
      })
    },
  )
}

export class MockGameMutator implements DBGameMutator {
  private _game: Game | null = null

  constructor(game?: Game) {
    this._game = game ?? null
  }

  get game() {
    return this._game
  }

  insertGame = async () => {
    return Result.Success(this.game ? this.game.id : faker.string.uuid())
  }
  addMoveToGame = async () => {
    return Result.Success(true)
  }
  setOutcome = async () => {
    return Result.Success(true)
  }
}

export class MockGameLoader implements DBGameLoader {
  private _gamesById: Map<string, Game>
  private _gamesByPlayerId: Map<string, Game[]>
  constructor(game?: Game[]) {
    this._gamesById = new Map(game?.map((game) => [game.id, game]))

    const gamesByPlayerId = new Map<string, Game[]>()
    game?.forEach((game) => {
      gamesByPlayerId.set(game.whitePlayer.id, [
        ...(gamesByPlayerId.get(game.whitePlayer.id) ?? []),
        game, // white player
      ])
      gamesByPlayerId.set(game.blackPlayer.id, [
        ...(gamesByPlayerId.get(game.blackPlayer.id) ?? []),
        game, // black player
      ])
    })
    this._gamesByPlayerId = gamesByPlayerId
  }

  batchGames = new DataLoader<string, Game | null>(async (ids) => {
    return ids.map((id) => this._gamesById.get(id) ?? null)
  })

  batchGamesForPlayer = new DataLoader<string, Game[]>(async (ids) => {
    return ids.map((id) => this._gamesByPlayerId.get(id) ?? [])
  })

  batchGameOutcomes = new DataLoader<string, GameOutcome>(async (ids) => {
    return ids.map(() => getTestOutcomes())
  })
}
