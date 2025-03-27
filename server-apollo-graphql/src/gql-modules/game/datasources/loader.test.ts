import { assert, describe, expect, it } from "vitest"
import { getTestMongoDBGame } from "./test-utils/mock-game"
import { MockGameLoader } from "./test-utils/mock-loader"
import { GameLoader } from "./loader"
import { isSuccess } from "../../../lib/result"

describe("GameLoader", () => {
  it("should getGameById", async () => {
    // arrange
    const game = getTestMongoDBGame()
    const loader = new GameLoader(new MockGameLoader([game]))
    // act
    const result = await loader.getGameById(game._id)
    // assert
    assert(isSuccess(result))
    expect(result.data).toEqual(game)
  })

  it("should return null when no game is found", async () => {
    // arrange
    const loader = new GameLoader(new MockGameLoader([]))
    // act
    const result = await loader.getGameById("test")
    // assert
    assert(isSuccess(result))
    expect(result.data).toBeNull()
  })

  it("should getGamesForPlayerId", async () => {
    // arrange
    const game = getTestMongoDBGame()
    const loader = new GameLoader(new MockGameLoader([game]))
    // act
    const result = await loader.getGamesForPlayerId(game.whitePlayer._id)
    // assert
    assert(isSuccess(result))
    expect(result.data[0]).toEqual(game)
  })
})
