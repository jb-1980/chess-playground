import { describe, expect, it } from "vitest"
import { getTestMongoDBGame } from "../datasources/test-utils/mock-game"
import { Game } from "./Game"

describe("Game Resolvers", () => {
  it("should resolve the id", () => {
    // arrange
    const game = getTestMongoDBGame()
    // act
    const result = Game.id(game, null, null, null)
    // assert
    expect(result).toBe(game._id.toString())
  })
})
