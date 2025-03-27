import { AsyncResult, Result } from "../../../lib/result"
import { GameDocument, MongoGameDocument } from "./data-schema"
import { DBGameLoader } from "./types"

export class GameLoader {
  constructor(private loader: DBGameLoader) {}

  async getGameById(
    id: string,
    clearCache = false,
  ): AsyncResult<MongoGameDocument | null, "DB_ERROR_WHILE_GETTING_GAME"> {
    try {
      if (clearCache) {
        this.loader.batchGames.clear(id)
      }
      const game = await this.loader.batchGames.load(id)

      return Result.Success(game)
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERROR_WHILE_GETTING_GAME", error)
    }
  }

  async getGamesForPlayerId(
    playerId: string,
  ): AsyncResult<MongoGameDocument[], "DB_ERR_GET_GAMES_FOR_USER_ID"> {
    try {
      const games = await this.loader.batchGamesForPlayer.load(playerId)
      return Result.Success(games)
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERR_GET_GAMES_FOR_USER_ID", error)
    }
  }
}
