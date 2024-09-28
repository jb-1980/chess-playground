/* This file was automatically generated. DO NOT UPDATE MANUALLY. */
import type { Resolvers } from "./../gql-modules/types.generated"
import { game as Query_game } from "./../gql-modules/game/resolvers/Query/game"
import { gamesForPlayerId as Query_gamesForPlayerId } from "./../gql-modules/game/resolvers/Query/gamesForPlayerId"
import { createGame as Mutation_createGame } from "./../gql-modules/game/resolvers/Mutation/createGame"
import { login as Mutation_login } from "./../gql-modules/user/resolvers/Mutation/login"
import { move as Mutation_move } from "./../gql-modules/game/resolvers/Mutation/move"
import { register as Mutation_register } from "./../gql-modules/user/resolvers/Mutation/register"
import { joinGame as Subscription_joinGame } from "./../gql-modules/game/resolvers/Subscription/joinGame"
import { observeGame as Subscription_observeGame } from "./../gql-modules/game/resolvers/Subscription/observeGame"
import { Game } from "./../gql-modules/game/resolvers/Game"
import { GameUser } from "./../gql-modules/game/resolvers/GameUser"
import { GetGameError } from "./../gql-modules/game/resolvers/GetGameError"
import { GetGamesForPlayer } from "./../gql-modules/game/resolvers/GetGamesForPlayer"
import { GetGamesForPlayerIdError } from "./../gql-modules/game/resolvers/GetGamesForPlayerIdError"
import { JoinGameErrorMsg } from "./../gql-modules/game/resolvers/JoinGameErrorMsg"
import { JoinGameMsg } from "./../gql-modules/game/resolvers/JoinGameMsg"
import { LoginError } from "./../gql-modules/user/resolvers/LoginError"
import { LoginSuccess } from "./../gql-modules/user/resolvers/LoginSuccess"
import { Move } from "./../gql-modules/game/resolvers/Move"
import { MoveErrorResult } from "./../gql-modules/game/resolvers/MoveErrorResult"
import { MoveSuccessResult } from "./../gql-modules/game/resolvers/MoveSuccessResult"
import { ObserveGameMsg } from "./../gql-modules/game/resolvers/ObserveGameMsg"
import { RegisterError } from "./../gql-modules/user/resolvers/RegisterError"
import { RegisterSuccess } from "./../gql-modules/user/resolvers/RegisterSuccess"
import { User } from "./../gql-modules/user/resolvers/User"
import { LocalDateResolver } from "graphql-scalars"
export const resolvers: Resolvers = {
  Query: { game: Query_game, gamesForPlayerId: Query_gamesForPlayerId },
  Mutation: {
    createGame: Mutation_createGame,
    login: Mutation_login,
    move: Mutation_move,
    register: Mutation_register,
  },
  Subscription: {
    joinGame: Subscription_joinGame,
    observeGame: Subscription_observeGame,
  },
  Game: Game,
  GameUser: GameUser,
  GetGameError: GetGameError,
  GetGamesForPlayer: GetGamesForPlayer,
  GetGamesForPlayerIdError: GetGamesForPlayerIdError,
  JoinGameErrorMsg: JoinGameErrorMsg,
  JoinGameMsg: JoinGameMsg,
  LoginError: LoginError,
  LoginSuccess: LoginSuccess,
  Move: Move,
  MoveErrorResult: MoveErrorResult,
  MoveSuccessResult: MoveSuccessResult,
  ObserveGameMsg: ObserveGameMsg,
  RegisterError: RegisterError,
  RegisterSuccess: RegisterSuccess,
  User: User,
  LocalDate: LocalDateResolver,
}
