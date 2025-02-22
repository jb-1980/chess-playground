import { faker } from "@faker-js/faker"
import { isSuccess, SuccessType } from "../../lib/result"
import { getTestGame } from "../../test-utils/game"
import { MockGameLoader } from "../../repository/test-utils"
import { GameLoader } from "./game-loader"

describe("GameLoader", () => {
  it("should get a game when given a valid id", async () => {
    // arrange
    const game = getTestGame()
    const loader = new GameLoader(new MockGameLoader([game]))

    // act
    const result = await loader.getGameById(game.id)

    // assert
    expect(result).toSatisfy(isSuccess)
    const successResult = result as SuccessType<typeof result>
    expect(successResult.data).toBeObject()
    expect(successResult.data?.id).toEqual(game.id)
  })

  it("should return null when given an invalid id", async () => {
    // arrange
    const loader = new GameLoader(new MockGameLoader())

    // act
    const result = await loader.getGameById(faker.string.uuid())

    // assert
    expect(result).toSatisfy(isSuccess)
    const successResult = result as SuccessType<typeof result>
    expect(successResult.data).toBe(null)
  })

  it("should get all games for a player", async () => {
    // arrange
    const game = getTestGame()
    const loader = new GameLoader(new MockGameLoader([game]))

    // act
    const result = await loader.getGamesForPlayerId(game.whitePlayer.id)

    // assert
    expect(result).toSatisfy(isSuccess)
    const successResult = result as SuccessType<typeof result>
    expect(successResult.data).toBeArrayOfSize(1)
    expect(successResult.data[0].id).toEqual(game.id)
  })

  it("should get the game outcomes for a game", async () => {
    // arrange
    const game = getTestGame()
    const loader = new GameLoader(new MockGameLoader([game]))

    // act
    const result = await loader.getGameOutcomes(game.id)

    // assert
    expect(result).toSatisfy(isSuccess)
    const successResult = result as SuccessType<typeof result>
    expect(successResult.data).toContainAllEntries([
      [
        "whiteWins",
        expect.objectContaining({
          whiteRating: expect.any(Number),
          blackRating: expect.any(Number),
        }),
      ],
      [
        "blackWins",
        expect.objectContaining({
          whiteRating: expect.any(Number),
          blackRating: expect.any(Number),
        }),
      ],

      [
        "draw",
        expect.objectContaining({
          whiteRating: expect.any(Number),
          blackRating: expect.any(Number),
        }),
      ],
    ])
  })
})
