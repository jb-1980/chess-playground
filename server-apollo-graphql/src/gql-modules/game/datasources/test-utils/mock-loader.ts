import DataLoader from "dataloader"
import { MongoGameDocument, GameOutcomes } from "../data-schema"
import { DBGameLoader } from "../types"
import { getTestOutcomes } from "./mock-game"

export class MockGameLoader implements DBGameLoader {
  private _gamesById: Map<string, MongoGameDocument>
  private _gamesByPlayerId: Map<string, MongoGameDocument[]>
  constructor(game?: MongoGameDocument[]) {
    this._gamesById = new Map(game?.map((game) => [game._id, game]))

    const gamesByPlayerId = new Map<string, MongoGameDocument[]>()
    game?.forEach((game) => {
      gamesByPlayerId.set(game.whitePlayer._id, [
        ...(gamesByPlayerId.get(game.whitePlayer._id) ?? []),
        game, // white player
      ])
      gamesByPlayerId.set(game.blackPlayer._id, [
        ...(gamesByPlayerId.get(game.blackPlayer._id) ?? []),
        game, // black player
      ])
    })
    this._gamesByPlayerId = gamesByPlayerId
  }

  batchGames = new DataLoader<string, MongoGameDocument | null>(async (ids) => {
    return ids.map((id) => this._gamesById.get(id) ?? null)
  })

  batchGamesForPlayer = new DataLoader<string, MongoGameDocument[]>(
    async (ids) => {
      return ids.map((id) => this._gamesByPlayerId.get(id) ?? [])
    },
  )

  batchGameOutcomes = new DataLoader<string, GameOutcomes>(async (ids) => {
    return ids.map(() => getTestOutcomes())
  })
}
