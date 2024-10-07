type AsyncResult<T, E> = import("../lib/result").AsyncResult<T, E>
type User = import("../domain/user").User
type Game = import("../domain/game").Game
type GameOutcome = import("../domain/game").GameOutcome

export class UserLoader implements UserLoaderInterface {
  validateUser(
    username: string,
    password: string,
  ): AsyncResult<User, "DB_ERR_FAILED_TO_GET_USER" | "BAD_CREDENTIALS">
  getUsersByIds(
    ids: string[],
  ): AsyncResult<User[], "DB_ERR_FAILED_TO_GET_USERS_BY_IDS">
}

export class UserMutator {
  createUser(
    username: string,
    password: string,
  ): AsyncResult<User, "DB_ERR_FAILED_TO_CREATE_USER" | "USER_ALREADY_EXISTS">
  updateUserRating(
    userId: string,
    newRating: number,
  ): AsyncResult<boolean, "DB_ERR_FAILED_TO_UPDATE_USER_RATING">
}

export class GameLoader {
  getGameById(
    id: string,
  ): AsyncResult<Game | null, "DB_ERROR_WHILE_GETTING_GAME">
  getGamesForPlayerId(
    playerId: string,
  ): AsyncResult<Game[], "DB_ERR_GET_GAMES_FOR_USER_ID">
  getGameOutcomes(
    gameId: string,
  ): AsyncResult<GameOutcome, "DB_ERR_GET_GAME_OUTCOMES">
}

export class GameMutator {
  createGame(
    whiteUser: User,
    blackUser: User,
  ): AsyncResult<string, "DB_ERR_FAILED_TO_CREATE_GAME">
  addMoveToGame(args: {
    gameId: string
    move: Move
    status: GameStatus
    pgn: string
  }): AsyncResult<boolean, "DB_ERROR_ADDING_MOVE_TO_GAME" | "INVALID_MOVE">
  setOutcome(
    gameId: string,
    winner: string | null,
    draw: boolean,
  ): AsyncResult<boolean, "DB_ERR_SET_OUTCOME">
}
