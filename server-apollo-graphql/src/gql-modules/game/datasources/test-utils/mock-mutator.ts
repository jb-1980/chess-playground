import { faker } from "@faker-js/faker"
import { Result } from "../../../../lib/result"
import { MongoGameDocument } from "../data-schema"
import { DBGameMutator } from "../types"

export class MockGameMutator implements DBGameMutator {
  private _game: MongoGameDocument | null = null

  constructor(game?: MongoGameDocument) {
    this._game = game ?? null
  }

  get game() {
    return this._game
  }

  insertGame = async () => {
    return Result.Success(
      this.game ? this.game._id : faker.database.mongodbObjectId(),
    )
  }
  addMoveToGame = async () => {
    return Result.Success(true)
  }
  setOutcome = async () => {
    return Result.Success(true)
  }
}
