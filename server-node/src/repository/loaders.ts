import DataLoader from "dataloader"
import { Game, GameOutcome, GameStatus, Move } from "../domain/game"
import { User } from "../domain/user"
import { AsyncResult } from "../lib/result"

export abstract class DBGameLoader {
  abstract batchGames: DataLoader<string, Game | null>
  abstract batchGamesForPlayer: DataLoader<string, Game[]>
  abstract batchGameOutcomes: DataLoader<string, GameOutcome>
}

export abstract class DBGameMutator {
  abstract insertGame(
    whitePlayer: User,
    blackPlayer: User,
    outcomes: GameOutcome,
  ): AsyncResult<string, "DB_ERR_FAILED_TO_CREATE_GAME">
  abstract addMoveToGame(args: {
    gameId: string
    move: Move
    status: GameStatus
    pgn: string
  }): AsyncResult<boolean, "DB_ERROR_ADDING_MOVE_TO_GAME">
  abstract setOutcome(
    gameId: string,
    winner: string | null,
    draw: boolean,
  ): AsyncResult<boolean, "DB_ERR_SET_OUTCOME">
}

export type UserWithPasswordHash = User & { passwordHash: string }

export abstract class DBUserLoader {
  abstract batchUsersById: DataLoader<string, User | null>
  abstract batchUsersByUsername: DataLoader<string, UserWithPasswordHash | null>
}

export abstract class DBUserMutator {
  abstract createUser(
    username: string,
    passwordHash: string,
  ): AsyncResult<User, "DB_ERR_FAILED_TO_CREATE_USER" | "USER_ALREADY_EXISTS">
  abstract updateUserRating(
    userId: string,
    newRating: number,
  ): AsyncResult<boolean, "DB_ERR_FAILED_TO_UPDATE_USER_RATING">
}

// re-exporting it here so that it can be correctly import in index.d.ts.
// You would not really do this if you aren't experimenting with multiple
// databases.
export { DataLoader }
