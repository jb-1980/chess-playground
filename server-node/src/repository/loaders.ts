import { Game, GameOutcome, GameStatus, Move } from "../domain/game"
import { User } from "../domain/user"
import { AsyncResult } from "../lib/result"

export abstract class UserLoaderInterface {
  abstract validateUser(
    username: string,
    password: string,
  ): AsyncResult<User, "DB_ERR_FAILED_TO_GET_USER" | "BAD_CREDENTIALS">
  abstract getUsersByIds(
    ids: string[],
  ): AsyncResult<User[], "DB_ERR_FAILED_TO_GET_USERS_BY_IDS">
}

export abstract class UserMutatorInterface {
  abstract createUser(
    username: string,
    password: string,
  ): AsyncResult<User, "DB_ERR_FAILED_TO_CREATE_USER" | "USER_ALREADY_EXISTS">
  abstract updateUserRating(
    userId: string,
    newRating: number,
  ): AsyncResult<boolean, "DB_ERR_FAILED_TO_UPDATE_USER_RATING">
}

export abstract class GameLoaderInterface {
  abstract getGameById(
    id: string,
  ): AsyncResult<Game | null, "DB_ERROR_WHILE_GETTING_GAME">
  abstract getGamesForPlayerId(
    playerId: string,
  ): AsyncResult<Game[], "DB_ERR_GET_GAMES_FOR_USER_ID">
  abstract getGameOutcomes(
    gameId: string,
  ): AsyncResult<GameOutcome, "DB_ERR_GET_GAME_OUTCOMES">
}

export abstract class GameMutatorInterface {
  abstract createGame(
    whiteUser: User,
    blackUser: User,
  ): AsyncResult<string, "DB_ERR_FAILED_TO_CREATE_GAME">
  abstract addMoveToGame(args: {
    gameId: string
    move: Move
    status: GameStatus
    pgn: string
  }): AsyncResult<boolean, "DB_ERROR_ADDING_MOVE_TO_GAME" | "INVALID_MOVE">
  abstract setOutcome(
    gameId: string,
    winner: string | null,
    draw: boolean,
  ): AsyncResult<boolean, "DB_ERR_SET_OUTCOME">
}
