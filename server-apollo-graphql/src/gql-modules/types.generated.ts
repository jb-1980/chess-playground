import {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from "graphql"
import { GameMapper } from "./game/domain.mappers"
import { UserMapper } from "./user/domain.mappers"
import { ApolloContextType } from "../server-config/context"
export type Maybe<T> = T | null | undefined
export type InputMaybe<T> = T | null | undefined
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>
}
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never }
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never
    }
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export type EnumResolverSignature<T, AllowedValues = any> = {
  [key in keyof T]?: AllowedValues
}
export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>
}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string | number }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
  LocalDate: { input: string; output: string }
}

export enum Color {
  /** BLACK */
  b = "b",
  /** WHITE */
  w = "w",
}

export type Error = {
  message: Scalars["String"]["output"]
}

export type Game = {
  __typename?: "Game"
  blackPlayer: GameUser
  date: Scalars["LocalDate"]["output"]
  id: Scalars["ID"]["output"]
  moves: Array<Move>
  pgn: Scalars["String"]["output"]
  status: GameStatus
  whitePlayer: GameUser
}

export enum GameStatus {
  ABANDONED = "ABANDONED",
  AGREED_DRAW = "AGREED_DRAW",
  CHECKMATE = "CHECKMATE",
  FIFTY_MOVE_RULE = "FIFTY_MOVE_RULE",
  INSUFFICIENT_MATERIAL = "INSUFFICIENT_MATERIAL",
  JOINING = "JOINING",
  NOT_STARTED = "NOT_STARTED",
  PLAYING = "PLAYING",
  RESIGNATION = "RESIGNATION",
  STALEMATE = "STALEMATE",
  THREE_MOVE_REPETITION = "THREE_MOVE_REPETITION",
  TIMEOUT = "TIMEOUT",
}

export type GameUser = {
  __typename?: "GameUser"
  avatarUrl?: Maybe<Scalars["String"]["output"]>
  id: Scalars["ID"]["output"]
  rating: Scalars["Int"]["output"]
  username: Scalars["String"]["output"]
}

export type GetGameError = {
  __typename?: "GetGameError"
  message: GetGameErrorType
}

export enum GetGameErrorType {
  DB_ERROR_WHILE_GETTING_GAME = "DB_ERROR_WHILE_GETTING_GAME",
  DB_ERR_GET_GAMES_FOR_USER_ID = "DB_ERR_GET_GAMES_FOR_USER_ID",
  GAME_NOT_FOUND = "GAME_NOT_FOUND",
}

export type GetGameResult = Game | GetGameError

export type GetGamesForPlayer = {
  __typename?: "GetGamesForPlayer"
  games: Array<Game>
}

export type GetGamesForPlayerIdError = {
  __typename?: "GetGamesForPlayerIdError"
  message: GetGameErrorType
}

export type GetGamesForPlayerIdResult =
  | GetGamesForPlayer
  | GetGamesForPlayerIdError

export enum JoinGameError {
  /** There was an error while creating the game for the players */
  ERROR_CREATING_GAME = "ERROR_CREATING_GAME",
  /** The player has been waiting in the queue for too long */
  NO_MATCH_FOUND = "NO_MATCH_FOUND",
}

export type JoinGameErrorMsg = {
  __typename?: "JoinGameErrorMsg"
  /** Error message */
  message: JoinGameError
}

export type JoinGameMsg = {
  __typename?: "JoinGameMsg"
  /** Game ID */
  gameId: Scalars["ID"]["output"]
}

export type JoinMsg = JoinGameErrorMsg | JoinGameMsg

export type LoginError = {
  __typename?: "LoginError"
  message: Scalars["String"]["output"]
}

export type LoginResult = LoginError | LoginSuccess

export type LoginSuccess = {
  __typename?: "LoginSuccess"
  token: Scalars["String"]["output"]
}

export type Move = {
  __typename?: "Move"
  /** FEN after the move */
  after: Scalars["String"]["output"]
  /** FEN before the move */
  before: Scalars["String"]["output"]
  /** Piece being captured */
  captured?: Maybe<Piece>
  /** Color of the player making the move */
  color: Color
  /** Flags for the move */
  flags: Scalars["String"]["output"]
  /** Square the piece is moving from */
  from: Square
  /** Long Algebraic Notation */
  lan: Scalars["String"]["output"]
  /** Piece being moved */
  piece: Piece
  /** Piece being promoted to */
  promotion?: Maybe<Piece>
  /** Standard Algebraic Notation */
  san: Scalars["String"]["output"]
  /** Square the piece is moving to */
  to: Square
}

export enum MoveError {
  /** 500 error when trying to update game with the new move in the DB */
  FAILED_TO_ADD_MOVE = "FAILED_TO_ADD_MOVE",
  /** 500 error when trying to get game from DB */
  FAILED_TO_GET_GAME = "FAILED_TO_GET_GAME",
  /** Failed to find a game with the given ID */
  GAME_NOT_FOUND = "GAME_NOT_FOUND",
  /** Move is invalid */
  INVALID = "INVALID",
  /** Can only move pieces of your own color */
  NOT_YOUR_MOVE = "NOT_YOUR_MOVE",
}

export type MoveErrorResult = {
  __typename?: "MoveErrorResult"
  /** Error message */
  message: MoveError
}

export type MoveInput = {
  /** FEN after the move */
  after: Scalars["String"]["input"]
  /** FEN before the move */
  before: Scalars["String"]["input"]
  /** Piece being captured */
  captured?: InputMaybe<Piece>
  /** Color of the player making the move */
  color: Color
  /** Flags for the move */
  flags: Scalars["String"]["input"]
  /** Square the piece is moving from */
  from: Square
  /** Long Algebraic Notation */
  lan: Scalars["String"]["input"]
  /** Piece being moved */
  piece: Piece
  /** Piece being promoted to */
  promotion?: InputMaybe<Piece>
  /** Standard Algebraic Notation */
  san: Scalars["String"]["input"]
  /** Square the piece is moving to */
  to: Square
}

export type MoveResult = MoveErrorResult | MoveSuccessResult

export type MoveSuccessResult = {
  __typename?: "MoveSuccessResult"
  /** Game ID */
  newPGN: Scalars["String"]["output"]
}

export type Mutation = {
  __typename?: "Mutation"
  createGame?: Maybe<Scalars["ID"]["output"]>
  login: LoginResult
  move?: Maybe<MoveResult>
  register: RegisterResult
}

export type MutationcreateGameArgs = {
  playerId: Scalars["ID"]["input"]
}

export type MutationloginArgs = {
  password: Scalars["String"]["input"]
  username: Scalars["String"]["input"]
}

export type MutationmoveArgs = {
  gameId: Scalars["ID"]["input"]
  move: MoveInput
}

export type MutationregisterArgs = {
  password: Scalars["String"]["input"]
  username: Scalars["String"]["input"]
}

export type ObserveGameMsg = {
  __typename?: "ObserveGameMsg"
  /** The pgn of the resulting move */
  game: Game
}

export enum Piece {
  /** Bishop */
  b = "b",
  /** King */
  k = "k",
  /** Knight */
  n = "n",
  /** Pawn */
  p = "p",
  /** Queen */
  q = "q",
  /** Rook */
  r = "r",
}

export type Query = {
  __typename?: "Query"
  game: GetGameResult
  gamesForPlayerId: GetGamesForPlayerIdResult
}

export type QuerygameArgs = {
  id: Scalars["ID"]["input"]
}

export type QuerygamesForPlayerIdArgs = {
  id: Scalars["ID"]["input"]
}

export type RegisterError = {
  __typename?: "RegisterError"
  message: Scalars["String"]["output"]
}

export type RegisterResult = RegisterError | RegisterSuccess

export type RegisterSuccess = {
  __typename?: "RegisterSuccess"
  token: Scalars["String"]["output"]
}

export enum Square {
  a1 = "a1",
  a2 = "a2",
  a3 = "a3",
  a4 = "a4",
  a5 = "a5",
  a6 = "a6",
  a7 = "a7",
  a8 = "a8",
  b1 = "b1",
  b2 = "b2",
  b3 = "b3",
  b4 = "b4",
  b5 = "b5",
  b6 = "b6",
  b7 = "b7",
  b8 = "b8",
  c1 = "c1",
  c2 = "c2",
  c3 = "c3",
  c4 = "c4",
  c5 = "c5",
  c6 = "c6",
  c7 = "c7",
  c8 = "c8",
  d1 = "d1",
  d2 = "d2",
  d3 = "d3",
  d4 = "d4",
  d5 = "d5",
  d6 = "d6",
  d7 = "d7",
  d8 = "d8",
  e1 = "e1",
  e2 = "e2",
  e3 = "e3",
  e4 = "e4",
  e5 = "e5",
  e6 = "e6",
  e7 = "e7",
  e8 = "e8",
  f1 = "f1",
  f2 = "f2",
  f3 = "f3",
  f4 = "f4",
  f5 = "f5",
  f6 = "f6",
  f7 = "f7",
  f8 = "f8",
  g1 = "g1",
  g2 = "g2",
  g3 = "g3",
  g4 = "g4",
  g5 = "g5",
  g6 = "g6",
  g7 = "g7",
  g8 = "g8",
  h1 = "h1",
  h2 = "h2",
  h3 = "h3",
  h4 = "h4",
  h5 = "h5",
  h6 = "h6",
  h7 = "h7",
  h8 = "h8",
}

export type Subscription = {
  __typename?: "Subscription"
  /** Get into the queue to join a new game, responds with the game id */
  joinGame: JoinMsg
  /** Observe a game */
  observeGame: ObserveGameMsg
}

export type SubscriptionjoinGameArgs = {
  playerId: Scalars["ID"]["input"]
}

export type SubscriptionobserveGameArgs = {
  gameId: Scalars["ID"]["input"]
}

export type User = {
  __typename?: "User"
  avatarUrl?: Maybe<Scalars["String"]["output"]>
  id: Scalars["ID"]["output"]
  rating: Scalars["Float"]["output"]
  username: Scalars["String"]["output"]
}

export type ResolverTypeWrapper<T> = Promise<T> | T

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>
}
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => Promise<TResult> | TResult

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {},
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo,
) => Maybe<TTypes> | Promise<Maybe<TTypes>>

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo,
) => boolean | Promise<boolean>

export type NextResolverFn<T> = () => Promise<T>

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {},
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>

/** Mapping of union types */
export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
  GetGameResult:
    | (GameMapper & { __typename: "Game" })
    | (Omit<GetGameError, "message"> & {
        message: _RefType["GetGameErrorType"]
      } & { __typename: "GetGameError" })
  GetGamesForPlayerIdResult:
    | (Omit<GetGamesForPlayer, "games"> & { games: Array<_RefType["Game"]> } & {
        __typename: "GetGamesForPlayer"
      })
    | (Omit<GetGamesForPlayerIdError, "message"> & {
        message: _RefType["GetGameErrorType"]
      } & { __typename: "GetGamesForPlayerIdError" })
  JoinMsg:
    | (Omit<JoinGameErrorMsg, "message"> & {
        message: _RefType["JoinGameError"]
      } & { __typename: "JoinGameErrorMsg" })
    | (JoinGameMsg & { __typename: "JoinGameMsg" })
  LoginResult:
    | (LoginError & { __typename: "LoginError" })
    | (LoginSuccess & { __typename: "LoginSuccess" })
  MoveResult:
    | (Omit<MoveErrorResult, "message"> & { message: _RefType["MoveError"] } & {
        __typename: "MoveErrorResult"
      })
    | (MoveSuccessResult & { __typename: "MoveSuccessResult" })
  RegisterResult:
    | (RegisterError & { __typename: "RegisterError" })
    | (RegisterSuccess & { __typename: "RegisterSuccess" })
}

/** Mapping of interface types */
export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> =
  {
    Error: never
  }

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Color: ResolverTypeWrapper<"w" | "b">
  Error: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>["Error"]>
  String: ResolverTypeWrapper<Scalars["String"]["output"]>
  Game: ResolverTypeWrapper<GameMapper>
  ID: ResolverTypeWrapper<Scalars["ID"]["output"]>
  GameStatus: ResolverTypeWrapper<
    | "NOT_STARTED"
    | "JOINING"
    | "PLAYING"
    | "CHECKMATE"
    | "STALEMATE"
    | "THREE_MOVE_REPETITION"
    | "INSUFFICIENT_MATERIAL"
    | "FIFTY_MOVE_RULE"
    | "RESIGNATION"
    | "AGREED_DRAW"
    | "TIMEOUT"
    | "ABANDONED"
  >
  GameUser: ResolverTypeWrapper<GameUser>
  Int: ResolverTypeWrapper<Scalars["Int"]["output"]>
  GetGameError: ResolverTypeWrapper<
    Omit<GetGameError, "message"> & {
      message: ResolversTypes["GetGameErrorType"]
    }
  >
  GetGameErrorType: ResolverTypeWrapper<
    | "GAME_NOT_FOUND"
    | "DB_ERROR_WHILE_GETTING_GAME"
    | "DB_ERR_GET_GAMES_FOR_USER_ID"
  >
  GetGameResult: ResolverTypeWrapper<
    ResolversUnionTypes<ResolversTypes>["GetGameResult"]
  >
  GetGamesForPlayer: ResolverTypeWrapper<
    Omit<GetGamesForPlayer, "games"> & { games: Array<ResolversTypes["Game"]> }
  >
  GetGamesForPlayerIdError: ResolverTypeWrapper<
    Omit<GetGamesForPlayerIdError, "message"> & {
      message: ResolversTypes["GetGameErrorType"]
    }
  >
  GetGamesForPlayerIdResult: ResolverTypeWrapper<
    ResolversUnionTypes<ResolversTypes>["GetGamesForPlayerIdResult"]
  >
  JoinGameError: ResolverTypeWrapper<"NO_MATCH_FOUND" | "ERROR_CREATING_GAME">
  JoinGameErrorMsg: ResolverTypeWrapper<
    Omit<JoinGameErrorMsg, "message"> & {
      message: ResolversTypes["JoinGameError"]
    }
  >
  JoinGameMsg: ResolverTypeWrapper<JoinGameMsg>
  JoinMsg: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>["JoinMsg"]>
  LocalDate: ResolverTypeWrapper<Scalars["LocalDate"]["output"]>
  LoginError: ResolverTypeWrapper<LoginError>
  LoginResult: ResolverTypeWrapper<
    ResolversUnionTypes<ResolversTypes>["LoginResult"]
  >
  LoginSuccess: ResolverTypeWrapper<LoginSuccess>
  Move: ResolverTypeWrapper<
    Omit<Move, "captured" | "color" | "from" | "piece" | "promotion" | "to"> & {
      captured?: Maybe<ResolversTypes["Piece"]>
      color: ResolversTypes["Color"]
      from: ResolversTypes["Square"]
      piece: ResolversTypes["Piece"]
      promotion?: Maybe<ResolversTypes["Piece"]>
      to: ResolversTypes["Square"]
    }
  >
  MoveError: ResolverTypeWrapper<
    | "INVALID"
    | "FAILED_TO_GET_GAME"
    | "GAME_NOT_FOUND"
    | "FAILED_TO_ADD_MOVE"
    | "NOT_YOUR_MOVE"
  >
  MoveErrorResult: ResolverTypeWrapper<
    Omit<MoveErrorResult, "message"> & { message: ResolversTypes["MoveError"] }
  >
  MoveInput: MoveInput
  MoveResult: ResolverTypeWrapper<
    ResolversUnionTypes<ResolversTypes>["MoveResult"]
  >
  MoveSuccessResult: ResolverTypeWrapper<MoveSuccessResult>
  Mutation: ResolverTypeWrapper<{}>
  ObserveGameMsg: ResolverTypeWrapper<
    Omit<ObserveGameMsg, "game"> & { game: ResolversTypes["Game"] }
  >
  Piece: ResolverTypeWrapper<"p" | "n" | "b" | "r" | "q" | "k">
  Query: ResolverTypeWrapper<{}>
  RegisterError: ResolverTypeWrapper<RegisterError>
  RegisterResult: ResolverTypeWrapper<
    ResolversUnionTypes<ResolversTypes>["RegisterResult"]
  >
  RegisterSuccess: ResolverTypeWrapper<RegisterSuccess>
  Square: ResolverTypeWrapper<
    | "a8"
    | "b8"
    | "c8"
    | "d8"
    | "e8"
    | "f8"
    | "g8"
    | "h8"
    | "a7"
    | "b7"
    | "c7"
    | "d7"
    | "e7"
    | "f7"
    | "g7"
    | "h7"
    | "a6"
    | "b6"
    | "c6"
    | "d6"
    | "e6"
    | "f6"
    | "g6"
    | "h6"
    | "a5"
    | "b5"
    | "c5"
    | "d5"
    | "e5"
    | "f5"
    | "g5"
    | "h5"
    | "a4"
    | "b4"
    | "c4"
    | "d4"
    | "e4"
    | "f4"
    | "g4"
    | "h4"
    | "a3"
    | "b3"
    | "c3"
    | "d3"
    | "e3"
    | "f3"
    | "g3"
    | "h3"
    | "a2"
    | "b2"
    | "c2"
    | "d2"
    | "e2"
    | "f2"
    | "g2"
    | "h2"
    | "a1"
    | "b1"
    | "c1"
    | "d1"
    | "e1"
    | "f1"
    | "g1"
    | "h1"
  >
  Subscription: ResolverTypeWrapper<{}>
  User: ResolverTypeWrapper<UserMapper>
  Float: ResolverTypeWrapper<Scalars["Float"]["output"]>
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]["output"]>
}

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Error: ResolversInterfaceTypes<ResolversParentTypes>["Error"]
  String: Scalars["String"]["output"]
  Game: GameMapper
  ID: Scalars["ID"]["output"]
  GameUser: GameUser
  Int: Scalars["Int"]["output"]
  GetGameError: GetGameError
  GetGameResult: ResolversUnionTypes<ResolversParentTypes>["GetGameResult"]
  GetGamesForPlayer: Omit<GetGamesForPlayer, "games"> & {
    games: Array<ResolversParentTypes["Game"]>
  }
  GetGamesForPlayerIdError: GetGamesForPlayerIdError
  GetGamesForPlayerIdResult: ResolversUnionTypes<ResolversParentTypes>["GetGamesForPlayerIdResult"]
  JoinGameErrorMsg: JoinGameErrorMsg
  JoinGameMsg: JoinGameMsg
  JoinMsg: ResolversUnionTypes<ResolversParentTypes>["JoinMsg"]
  LocalDate: Scalars["LocalDate"]["output"]
  LoginError: LoginError
  LoginResult: ResolversUnionTypes<ResolversParentTypes>["LoginResult"]
  LoginSuccess: LoginSuccess
  Move: Move
  MoveErrorResult: MoveErrorResult
  MoveInput: MoveInput
  MoveResult: ResolversUnionTypes<ResolversParentTypes>["MoveResult"]
  MoveSuccessResult: MoveSuccessResult
  Mutation: {}
  ObserveGameMsg: Omit<ObserveGameMsg, "game"> & {
    game: ResolversParentTypes["Game"]
  }
  Query: {}
  RegisterError: RegisterError
  RegisterResult: ResolversUnionTypes<ResolversParentTypes>["RegisterResult"]
  RegisterSuccess: RegisterSuccess
  Subscription: {}
  User: UserMapper
  Float: Scalars["Float"]["output"]
  Boolean: Scalars["Boolean"]["output"]
}

export type ColorResolvers = EnumResolverSignature<
  { b?: any; w?: any },
  ResolversTypes["Color"]
>

export type ErrorResolvers<
  ContextType = ApolloContextType,
  ParentType extends
    ResolversParentTypes["Error"] = ResolversParentTypes["Error"],
> = {
  __resolveType?: TypeResolveFn<null, ParentType, ContextType>
  message?: Resolver<ResolversTypes["String"], ParentType, ContextType>
}

export type GameResolvers<
  ContextType = ApolloContextType,
  ParentType extends
    ResolversParentTypes["Game"] = ResolversParentTypes["Game"],
> = {
  blackPlayer?: Resolver<ResolversTypes["GameUser"], ParentType, ContextType>
  date?: Resolver<ResolversTypes["LocalDate"], ParentType, ContextType>
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>
  moves?: Resolver<Array<ResolversTypes["Move"]>, ParentType, ContextType>
  pgn?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  status?: Resolver<ResolversTypes["GameStatus"], ParentType, ContextType>
  whitePlayer?: Resolver<ResolversTypes["GameUser"], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type GameStatusResolvers = EnumResolverSignature<
  {
    ABANDONED?: any
    AGREED_DRAW?: any
    CHECKMATE?: any
    FIFTY_MOVE_RULE?: any
    INSUFFICIENT_MATERIAL?: any
    JOINING?: any
    NOT_STARTED?: any
    PLAYING?: any
    RESIGNATION?: any
    STALEMATE?: any
    THREE_MOVE_REPETITION?: any
    TIMEOUT?: any
  },
  ResolversTypes["GameStatus"]
>

export type GameUserResolvers<
  ContextType = ApolloContextType,
  ParentType extends
    ResolversParentTypes["GameUser"] = ResolversParentTypes["GameUser"],
> = {
  avatarUrl?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>
  rating?: Resolver<ResolversTypes["Int"], ParentType, ContextType>
  username?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type GetGameErrorResolvers<
  ContextType = ApolloContextType,
  ParentType extends
    ResolversParentTypes["GetGameError"] = ResolversParentTypes["GetGameError"],
> = {
  message?: Resolver<
    ResolversTypes["GetGameErrorType"],
    ParentType,
    ContextType
  >
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type GetGameErrorTypeResolvers = EnumResolverSignature<
  {
    DB_ERROR_WHILE_GETTING_GAME?: any
    DB_ERR_GET_GAMES_FOR_USER_ID?: any
    GAME_NOT_FOUND?: any
  },
  ResolversTypes["GetGameErrorType"]
>

export type GetGameResultResolvers<
  ContextType = ApolloContextType,
  ParentType extends
    ResolversParentTypes["GetGameResult"] = ResolversParentTypes["GetGameResult"],
> = {
  __resolveType?: TypeResolveFn<
    "Game" | "GetGameError",
    ParentType,
    ContextType
  >
}

export type GetGamesForPlayerResolvers<
  ContextType = ApolloContextType,
  ParentType extends
    ResolversParentTypes["GetGamesForPlayer"] = ResolversParentTypes["GetGamesForPlayer"],
> = {
  games?: Resolver<Array<ResolversTypes["Game"]>, ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type GetGamesForPlayerIdErrorResolvers<
  ContextType = ApolloContextType,
  ParentType extends
    ResolversParentTypes["GetGamesForPlayerIdError"] = ResolversParentTypes["GetGamesForPlayerIdError"],
> = {
  message?: Resolver<
    ResolversTypes["GetGameErrorType"],
    ParentType,
    ContextType
  >
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type GetGamesForPlayerIdResultResolvers<
  ContextType = ApolloContextType,
  ParentType extends
    ResolversParentTypes["GetGamesForPlayerIdResult"] = ResolversParentTypes["GetGamesForPlayerIdResult"],
> = {
  __resolveType?: TypeResolveFn<
    "GetGamesForPlayer" | "GetGamesForPlayerIdError",
    ParentType,
    ContextType
  >
}

export type JoinGameErrorResolvers = EnumResolverSignature<
  { ERROR_CREATING_GAME?: any; NO_MATCH_FOUND?: any },
  ResolversTypes["JoinGameError"]
>

export type JoinGameErrorMsgResolvers<
  ContextType = ApolloContextType,
  ParentType extends
    ResolversParentTypes["JoinGameErrorMsg"] = ResolversParentTypes["JoinGameErrorMsg"],
> = {
  message?: Resolver<ResolversTypes["JoinGameError"], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type JoinGameMsgResolvers<
  ContextType = ApolloContextType,
  ParentType extends
    ResolversParentTypes["JoinGameMsg"] = ResolversParentTypes["JoinGameMsg"],
> = {
  gameId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type JoinMsgResolvers<
  ContextType = ApolloContextType,
  ParentType extends
    ResolversParentTypes["JoinMsg"] = ResolversParentTypes["JoinMsg"],
> = {
  __resolveType?: TypeResolveFn<
    "JoinGameErrorMsg" | "JoinGameMsg",
    ParentType,
    ContextType
  >
}

export interface LocalDateScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["LocalDate"], any> {
  name: "LocalDate"
}

export type LoginErrorResolvers<
  ContextType = ApolloContextType,
  ParentType extends
    ResolversParentTypes["LoginError"] = ResolversParentTypes["LoginError"],
> = {
  message?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type LoginResultResolvers<
  ContextType = ApolloContextType,
  ParentType extends
    ResolversParentTypes["LoginResult"] = ResolversParentTypes["LoginResult"],
> = {
  __resolveType?: TypeResolveFn<
    "LoginError" | "LoginSuccess",
    ParentType,
    ContextType
  >
}

export type LoginSuccessResolvers<
  ContextType = ApolloContextType,
  ParentType extends
    ResolversParentTypes["LoginSuccess"] = ResolversParentTypes["LoginSuccess"],
> = {
  token?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type MoveResolvers<
  ContextType = ApolloContextType,
  ParentType extends
    ResolversParentTypes["Move"] = ResolversParentTypes["Move"],
> = {
  after?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  before?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  captured?: Resolver<Maybe<ResolversTypes["Piece"]>, ParentType, ContextType>
  color?: Resolver<ResolversTypes["Color"], ParentType, ContextType>
  flags?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  from?: Resolver<ResolversTypes["Square"], ParentType, ContextType>
  lan?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  piece?: Resolver<ResolversTypes["Piece"], ParentType, ContextType>
  promotion?: Resolver<Maybe<ResolversTypes["Piece"]>, ParentType, ContextType>
  san?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  to?: Resolver<ResolversTypes["Square"], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type MoveErrorResolvers = EnumResolverSignature<
  {
    FAILED_TO_ADD_MOVE?: any
    FAILED_TO_GET_GAME?: any
    GAME_NOT_FOUND?: any
    INVALID?: any
    NOT_YOUR_MOVE?: any
  },
  ResolversTypes["MoveError"]
>

export type MoveErrorResultResolvers<
  ContextType = ApolloContextType,
  ParentType extends
    ResolversParentTypes["MoveErrorResult"] = ResolversParentTypes["MoveErrorResult"],
> = {
  message?: Resolver<ResolversTypes["MoveError"], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type MoveResultResolvers<
  ContextType = ApolloContextType,
  ParentType extends
    ResolversParentTypes["MoveResult"] = ResolversParentTypes["MoveResult"],
> = {
  __resolveType?: TypeResolveFn<
    "MoveErrorResult" | "MoveSuccessResult",
    ParentType,
    ContextType
  >
}

export type MoveSuccessResultResolvers<
  ContextType = ApolloContextType,
  ParentType extends
    ResolversParentTypes["MoveSuccessResult"] = ResolversParentTypes["MoveSuccessResult"],
> = {
  newPGN?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type MutationResolvers<
  ContextType = ApolloContextType,
  ParentType extends
    ResolversParentTypes["Mutation"] = ResolversParentTypes["Mutation"],
> = {
  createGame?: Resolver<
    Maybe<ResolversTypes["ID"]>,
    ParentType,
    ContextType,
    RequireFields<MutationcreateGameArgs, "playerId">
  >
  login?: Resolver<
    ResolversTypes["LoginResult"],
    ParentType,
    ContextType,
    RequireFields<MutationloginArgs, "password" | "username">
  >
  move?: Resolver<
    Maybe<ResolversTypes["MoveResult"]>,
    ParentType,
    ContextType,
    RequireFields<MutationmoveArgs, "gameId" | "move">
  >
  register?: Resolver<
    ResolversTypes["RegisterResult"],
    ParentType,
    ContextType,
    RequireFields<MutationregisterArgs, "password" | "username">
  >
}

export type ObserveGameMsgResolvers<
  ContextType = ApolloContextType,
  ParentType extends
    ResolversParentTypes["ObserveGameMsg"] = ResolversParentTypes["ObserveGameMsg"],
> = {
  game?: Resolver<ResolversTypes["Game"], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type PieceResolvers = EnumResolverSignature<
  { b?: any; k?: any; n?: any; p?: any; q?: any; r?: any },
  ResolversTypes["Piece"]
>

export type QueryResolvers<
  ContextType = ApolloContextType,
  ParentType extends
    ResolversParentTypes["Query"] = ResolversParentTypes["Query"],
> = {
  game?: Resolver<
    ResolversTypes["GetGameResult"],
    ParentType,
    ContextType,
    RequireFields<QuerygameArgs, "id">
  >
  gamesForPlayerId?: Resolver<
    ResolversTypes["GetGamesForPlayerIdResult"],
    ParentType,
    ContextType,
    RequireFields<QuerygamesForPlayerIdArgs, "id">
  >
}

export type RegisterErrorResolvers<
  ContextType = ApolloContextType,
  ParentType extends
    ResolversParentTypes["RegisterError"] = ResolversParentTypes["RegisterError"],
> = {
  message?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type RegisterResultResolvers<
  ContextType = ApolloContextType,
  ParentType extends
    ResolversParentTypes["RegisterResult"] = ResolversParentTypes["RegisterResult"],
> = {
  __resolveType?: TypeResolveFn<
    "RegisterError" | "RegisterSuccess",
    ParentType,
    ContextType
  >
}

export type RegisterSuccessResolvers<
  ContextType = ApolloContextType,
  ParentType extends
    ResolversParentTypes["RegisterSuccess"] = ResolversParentTypes["RegisterSuccess"],
> = {
  token?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type SquareResolvers = EnumResolverSignature<
  {
    a1?: any
    a2?: any
    a3?: any
    a4?: any
    a5?: any
    a6?: any
    a7?: any
    a8?: any
    b1?: any
    b2?: any
    b3?: any
    b4?: any
    b5?: any
    b6?: any
    b7?: any
    b8?: any
    c1?: any
    c2?: any
    c3?: any
    c4?: any
    c5?: any
    c6?: any
    c7?: any
    c8?: any
    d1?: any
    d2?: any
    d3?: any
    d4?: any
    d5?: any
    d6?: any
    d7?: any
    d8?: any
    e1?: any
    e2?: any
    e3?: any
    e4?: any
    e5?: any
    e6?: any
    e7?: any
    e8?: any
    f1?: any
    f2?: any
    f3?: any
    f4?: any
    f5?: any
    f6?: any
    f7?: any
    f8?: any
    g1?: any
    g2?: any
    g3?: any
    g4?: any
    g5?: any
    g6?: any
    g7?: any
    g8?: any
    h1?: any
    h2?: any
    h3?: any
    h4?: any
    h5?: any
    h6?: any
    h7?: any
    h8?: any
  },
  ResolversTypes["Square"]
>

export type SubscriptionResolvers<
  ContextType = ApolloContextType,
  ParentType extends
    ResolversParentTypes["Subscription"] = ResolversParentTypes["Subscription"],
> = {
  joinGame?: SubscriptionResolver<
    ResolversTypes["JoinMsg"],
    "joinGame",
    ParentType,
    ContextType,
    RequireFields<SubscriptionjoinGameArgs, "playerId">
  >
  observeGame?: SubscriptionResolver<
    ResolversTypes["ObserveGameMsg"],
    "observeGame",
    ParentType,
    ContextType,
    RequireFields<SubscriptionobserveGameArgs, "gameId">
  >
}

export type UserResolvers<
  ContextType = ApolloContextType,
  ParentType extends
    ResolversParentTypes["User"] = ResolversParentTypes["User"],
> = {
  avatarUrl?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>
  rating?: Resolver<ResolversTypes["Float"], ParentType, ContextType>
  username?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type Resolvers<ContextType = ApolloContextType> = {
  Color?: ColorResolvers
  Error?: ErrorResolvers<ContextType>
  Game?: GameResolvers<ContextType>
  GameStatus?: GameStatusResolvers
  GameUser?: GameUserResolvers<ContextType>
  GetGameError?: GetGameErrorResolvers<ContextType>
  GetGameErrorType?: GetGameErrorTypeResolvers
  GetGameResult?: GetGameResultResolvers<ContextType>
  GetGamesForPlayer?: GetGamesForPlayerResolvers<ContextType>
  GetGamesForPlayerIdError?: GetGamesForPlayerIdErrorResolvers<ContextType>
  GetGamesForPlayerIdResult?: GetGamesForPlayerIdResultResolvers<ContextType>
  JoinGameError?: JoinGameErrorResolvers
  JoinGameErrorMsg?: JoinGameErrorMsgResolvers<ContextType>
  JoinGameMsg?: JoinGameMsgResolvers<ContextType>
  JoinMsg?: JoinMsgResolvers<ContextType>
  LocalDate?: GraphQLScalarType
  LoginError?: LoginErrorResolvers<ContextType>
  LoginResult?: LoginResultResolvers<ContextType>
  LoginSuccess?: LoginSuccessResolvers<ContextType>
  Move?: MoveResolvers<ContextType>
  MoveError?: MoveErrorResolvers
  MoveErrorResult?: MoveErrorResultResolvers<ContextType>
  MoveResult?: MoveResultResolvers<ContextType>
  MoveSuccessResult?: MoveSuccessResultResolvers<ContextType>
  Mutation?: MutationResolvers<ContextType>
  ObserveGameMsg?: ObserveGameMsgResolvers<ContextType>
  Piece?: PieceResolvers
  Query?: QueryResolvers<ContextType>
  RegisterError?: RegisterErrorResolvers<ContextType>
  RegisterResult?: RegisterResultResolvers<ContextType>
  RegisterSuccess?: RegisterSuccessResolvers<ContextType>
  Square?: SquareResolvers
  Subscription?: SubscriptionResolvers<ContextType>
  User?: UserResolvers<ContextType>
}
