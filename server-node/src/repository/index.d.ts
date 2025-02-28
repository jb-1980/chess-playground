// This is type helper file that you would not normally need. It is reproducing
// what is in the ./loaders.ts, but because this is experimenting with being
// able to use two different databases and exploring how to keep the database
// layer as separate as possible, this is needed to be able to import the
// loaders and mutators from the repository.
//

type AsyncResult<T, E> = import("../lib/result").AsyncResult<T, E>
type User = import("../domain/user").User
type Game = import("../domain/game").Game
type GameOutcome = import("../domain/game").GameOutcome
type DataLoader<K, V, C = K> = import("./loaders").DataLoader<K, V, C>

export class DBGameLoader {
  batchGames: DataLoader<string, Game | null>
  batchGamesForPlayer: DataLoader<string, Game[]>
  batchGameOutcomes: DataLoader<string, GameOutcome>
}

export class DBGameMutator {
  insertGame(
    whitePlayer: User,
    blackPlayer: User,
    outcomes: GameOutcome,
  ): AsyncResult<string, "DB_ERR_FAILED_TO_CREATE_GAME">
  addMoveToGame(args: {
    gameId: string
    move: Move
    status: GameStatus
    pgn: string
  }): AsyncResult<boolean, "DB_ERROR_ADDING_MOVE_TO_GAME">
  setOutcome(
    gameId: string,
    winner: string | null,
    draw: boolean,
  ): AsyncResult<boolean, "DB_ERR_SET_OUTCOME">
}

export class DBUserLoader {
  batchUsersById: DataLoader<string, User | null>
  batchUsersByUsername: DataLoader<
    string,
    (User & { passwordHash: string }) | null
  >
}

export class DBUserMutator {
  createUser(
    username: string,
    passwordHash: string,
  ): AsyncResult<User, "DB_ERR_FAILED_TO_CREATE_USER">
  updateUserRating(
    userId: string,
    newRating: number,
  ): AsyncResult<boolean, "DB_ERR_FAILED_TO_UPDATE_USER_RATING">
}
