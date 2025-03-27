import DataLoader from "dataloader"
import { MongoGameDocument } from "./data-schema"
import { UserDocument } from "../../user/datasources"
import { AsyncResult } from "../../../lib/result"
import { GameStatus, Move } from "../../types.generated"

export abstract class DBGameLoader {
  abstract batchGames: DataLoader<string, MongoGameDocument | null>
  abstract batchGamesForPlayer: DataLoader<string, MongoGameDocument[]>
}

export abstract class DBGameMutator {
  abstract insertGame(
    whitePlayer: UserDocument,
    blackPlayer: UserDocument,
    outcomes: MongoGameDocument["outcomes"],
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
