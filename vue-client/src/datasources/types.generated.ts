export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
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
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
  LocalDate: { input: string; output: string }
}

export type Color =
  /** BLACK */
  | "b"
  /** WHITE */
  | "w"

export type Error = {
  message: Scalars["String"]["output"]
}

export type Game = {
  __typename?: "Game"
  blackPlayer: GameUser
  id: Scalars["ID"]["output"]
  moves: Array<Move>
  pgn: Scalars["String"]["output"]
  status: GameStatus
  whitePlayer: GameUser
}

export type GameStatus =
  | "ABANDONED"
  | "AGREED_DRAW"
  | "CHECKMATE"
  | "FIFTY_MOVE_RULE"
  | "INSUFFICIENT_MATERIAL"
  | "JOINING"
  | "NOT_STARTED"
  | "PLAYING"
  | "RESIGNATION"
  | "STALEMATE"
  | "THREE_MOVE_REPETITION"
  | "TIMEOUT"

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

export type GetGameErrorType =
  | "DB_ERROR_WHILE_GETTING_GAME"
  | "DB_ERR_GET_GAMES_FOR_USER_ID"
  | "GAME_NOT_FOUND"

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

export type JoinGameError =
  /** There was an error while creating the game for the players */
  | "ERROR_CREATING_GAME"
  /** The player has been waiting in the queue for too long */
  | "NO_MATCH_FOUND"

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

export type MoveError =
  /** 500 error when trying to update game with the new move in the DB */
  | "FAILED_TO_ADD_MOVE"
  /** 500 error when trying to get game from DB */
  | "FAILED_TO_GET_GAME"
  /** Failed to find a game with the given ID */
  | "GAME_NOT_FOUND"
  /** Move is invalid */
  | "INVALID"
  /** Can only move pieces of your own color */
  | "NOT_YOUR_MOVE"

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

export type MutationCreateGameArgs = {
  playerId: Scalars["ID"]["input"]
}

export type MutationLoginArgs = {
  password: Scalars["String"]["input"]
  username: Scalars["String"]["input"]
}

export type MutationMoveArgs = {
  gameId: Scalars["ID"]["input"]
  move: MoveInput
}

export type MutationRegisterArgs = {
  password: Scalars["String"]["input"]
  username: Scalars["String"]["input"]
}

export type ObserveGameMsg = {
  __typename?: "ObserveGameMsg"
  /** The pgn of the resulting move */
  game: Game
}

export type Piece =
  /** Bishop */
  | "b"
  /** King */
  | "k"
  /** Knight */
  | "n"
  /** Pawn */
  | "p"
  /** Queen */
  | "q"
  /** Rook */
  | "r"

export type Query = {
  __typename?: "Query"
  game: GetGameResult
  gamesForPlayerId: GetGamesForPlayerIdResult
}

export type QueryGameArgs = {
  id: Scalars["ID"]["input"]
}

export type QueryGamesForPlayerIdArgs = {
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

export type Square =
  | "a1"
  | "a2"
  | "a3"
  | "a4"
  | "a5"
  | "a6"
  | "a7"
  | "a8"
  | "b1"
  | "b2"
  | "b3"
  | "b4"
  | "b5"
  | "b6"
  | "b7"
  | "b8"
  | "c1"
  | "c2"
  | "c3"
  | "c4"
  | "c5"
  | "c6"
  | "c7"
  | "c8"
  | "d1"
  | "d2"
  | "d3"
  | "d4"
  | "d5"
  | "d6"
  | "d7"
  | "d8"
  | "e1"
  | "e2"
  | "e3"
  | "e4"
  | "e5"
  | "e6"
  | "e7"
  | "e8"
  | "f1"
  | "f2"
  | "f3"
  | "f4"
  | "f5"
  | "f6"
  | "f7"
  | "f8"
  | "g1"
  | "g2"
  | "g3"
  | "g4"
  | "g5"
  | "g6"
  | "g7"
  | "g8"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "h7"
  | "h8"

export type Subscription = {
  __typename?: "Subscription"
  /** Get into the queue to join a new game, responds with the game id */
  joinGame: JoinMsg
  /** Observe a game */
  observeGame: ObserveGameMsg
}

export type SubscriptionJoinGameArgs = {
  playerId: Scalars["ID"]["input"]
}

export type SubscriptionObserveGameArgs = {
  gameId: Scalars["ID"]["input"]
}

export type User = {
  __typename?: "User"
  avatarUrl?: Maybe<Scalars["String"]["output"]>
  id: Scalars["ID"]["output"]
  rating: Scalars["Float"]["output"]
  username: Scalars["String"]["output"]
}
