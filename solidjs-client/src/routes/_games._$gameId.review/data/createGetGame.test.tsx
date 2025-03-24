import { waitFor } from "@solidjs/testing-library"
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest"
import { createGetGame, GetGameError } from "./createGetGame"
import { faker } from "@faker-js/faker"
import {
  gameHandlers,
  getMockGame,
  mockServer,
  renderApiHook,
} from "@test-utils"

describe("createGetGame", () => {
  beforeAll(async () => {
    mockServer.listen()
  })

  afterEach(() => {
    mockServer.resetHandlers()
  })

  afterAll(async () => {
    mockServer.close()
  })

  it("should successfully fetch a game", async () => {
    // arrange
    const game = getMockGame()
    mockServer.use(
      gameHandlers.getGameById({
        data: game,
        status: 200,
      }),
    )

    // act
    const { result } = renderApiHook(() => createGetGame(game.id))

    // assert
    await waitFor(
      () => {
        expect(result().data).toEqual(game)
        expect(result().isLoading).toBe(false)
        expect(result().error).toBeUndefined()
      },
      { timeout: 1000 },
    )
  })

  it("should handle GAME_NOT_FOUND error", async () => {
    // arrange
    mockServer.use(
      gameHandlers.getGameById({
        data: GetGameError.GAME_NOT_FOUND,
        status: 404,
      }),
    )

    // act
    const { result } = renderApiHook(() =>
      createGetGame(faker.database.mongodbObjectId()),
    )

    // assert
    await waitFor(
      () => {
        expect(result().data).toBeNull()
        expect(result().isLoading).toBe(false)
        expect(result().error).toBe(GetGameError.GAME_NOT_FOUND)
      },
      { timeout: 1000 },
    )
  })

  it("should handle UNKNOWN_SERVER_ERROR error", async () => {
    // arrange
    mockServer.use(
      gameHandlers.getGameById({
        data: GetGameError.UNKNOWN_SERVER_ERROR,
        status: 500,
      }),
    )

    // act
    const { result } = renderApiHook(() =>
      createGetGame(faker.database.mongodbObjectId()),
    )

    // assert
    await waitFor(
      () => {
        expect(result().data).toBeNull()
        expect(result().isLoading).toBe(false)
        expect(result().error).toBe(GetGameError.UNKNOWN_SERVER_ERROR)
      },
      { timeout: 1000 },
    )
  })
})
