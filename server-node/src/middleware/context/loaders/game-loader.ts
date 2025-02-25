import { Game, GameOutcome } from "../../../domain/game"
import { Result } from "../../../lib/result"
import { AsyncResult, DBGameLoader } from "../../../repository"

export class GameLoader {
  constructor(private loader: DBGameLoader) {}

  async getGameById(
    id: string,
  ): AsyncResult<Game | null, "DB_ERROR_WHILE_GETTING_GAME"> {
    try {
      const game = await this.loader.batchGames.load(id)
      if (!game) {
        return Result.Success(null)
      }
      return Result.Success(game)
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERROR_WHILE_GETTING_GAME", error)
    }
  }

  async getGamesForPlayerId(
    playerId: string,
  ): AsyncResult<Game[], "DB_ERR_GET_GAMES_FOR_USER_ID"> {
    try {
      const games = await this.loader.batchGamesForPlayer.load(playerId)
      return Result.Success(games)
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERR_GET_GAMES_FOR_USER_ID", error)
    }
  }

  async getGameOutcomes(
    gameId: string,
  ): AsyncResult<GameOutcome, "DB_ERR_GET_GAME_OUTCOMES"> {
    try {
      const outcomes = await this.loader.batchGameOutcomes.load(gameId)
      if (!outcomes) {
        return Result.Fail("DB_ERR_GET_GAME_OUTCOMES")
      }
      return Result.Success({
        whiteWins: outcomes.whiteWins,
        blackWins: outcomes.blackWins,
        draw: outcomes.draw,
      })
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERR_GET_GAME_OUTCOMES", error)
    }
  }
}
