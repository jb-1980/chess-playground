import { getTestContext, resetDatabase } from "@test-utils"
import { afterEach, assert, describe, expect, it } from "vitest"
import { createGame } from "./createGame"

describe("Game Resolvers::createGame mutation", () => {
  afterEach(async () => {
    await resetDatabase()
  })
  it("should create a game", async () => {
    // arrange
    const player1Context = getTestContext()
    const player2Context = getTestContext()

    // act
    const player1JoinsGame = await createGame(
      null,
      { playerId: player1Context.user.id },
      player1Context,
      null,
    )
    const player2JoinsGame = await createGame(
      null,
      { playerId: player2Context.user.id },
      player2Context,
      null,
    )
    // assert
    expect(player1JoinsGame).toBeNull()
    assert(player2JoinsGame.__typename === "CreateGameSuccessResult")
    expect(player2JoinsGame.gameId).toBeString()
  })

  it("should respond with a PLAYER_IN_ACTIVE game error if user already in game", async () => {
    // arrange
    const context = getTestContext()
    const user = context.user

    // act
    const firstGameResult = await createGame(
      null,
      { playerId: user.id },
      context,
      null,
    )
    const secondGameResult = await createGame(
      null,
      { playerId: user.id },
      context,
      null,
    )

    // assert
    assert(firstGameResult.__typename === "CreateGameSuccessResult")
    assert(secondGameResult.__typename === "CreateGameErrorResult")
    expect(secondGameResult.message).toBe("PLAYER_IN_ACTIVE_GAME")
  })
})
