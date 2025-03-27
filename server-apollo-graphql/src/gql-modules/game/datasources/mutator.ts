import { calculateNewRatings } from "../../../lib/chess"
import { AsyncResult } from "../../../lib/result"
import { GameStatus, Move } from "../../types.generated"
import { UserDocument } from "../../user/datasources"
import { DBGameMutator } from "./types"

export class GameMutator {
  constructor(private mutator: DBGameMutator) {}

  public async createGame(
    whiteUser: UserDocument,
    blackUser: UserDocument,
  ): AsyncResult<string, "DB_ERR_FAILED_TO_CREATE_GAME"> {
    const whiteWinsOutcome = calculateNewRatings(
      whiteUser.rating,
      blackUser.rating,
      1,
    )
    const blackWinsOutcome = calculateNewRatings(
      whiteUser.rating,
      blackUser.rating,
      0,
    )
    const drawOutcome = calculateNewRatings(
      whiteUser.rating,
      blackUser.rating,
      0.5,
    )
    return this.mutator.insertGame(whiteUser, blackUser, {
      whiteWins: whiteWinsOutcome,
      blackWins: blackWinsOutcome,
      draw: drawOutcome,
    })
  }

  public async addMoveToGame(args: {
    gameId: string
    move: Move
    status: GameStatus
    pgn: string
  }): AsyncResult<boolean, "DB_ERROR_ADDING_MOVE_TO_GAME" | "INVALID_MOVE"> {
    return this.mutator.addMoveToGame(args)
  }

  public async setOutcome(
    gameId: string,
    winner: string | null,
    draw: boolean,
  ): AsyncResult<boolean, "DB_ERR_SET_OUTCOME"> {
    return this.mutator.setOutcome(gameId, winner, draw)
  }
}
