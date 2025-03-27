import { assert, describe, expect, it } from "vitest"
import { getTestMongoDBGame, getTestMoveValues } from "./test-utils/mock-game"
import { GameMutator } from "./mutator"
import { MockGameMutator } from "./test-utils/mock-mutator"
import { getTestUserDocument } from "../../user/datasources/test-utils/mock-user"
import { isSuccess } from "../../../lib/result"
import { faker } from "@faker-js/faker"

describe("GameMutator", () => {
  it("should create a game", async () => {
    // arrange
    const game = getTestMongoDBGame()

    const mutator = new GameMutator(new MockGameMutator(game))

    const whiteUser = getTestUserDocument()
    const blackUser = getTestUserDocument()

    // act
    const result = await mutator.createGame(whiteUser, blackUser)

    // assert
    assert(isSuccess(result))
    expect(result.data).toBe(game._id)
  })

  it("should add a move to a game", async () => {
    // arrange
    const mutator = new GameMutator(new MockGameMutator())
    const moveValues = getTestMoveValues(4)

    // act
    const result = await mutator.addMoveToGame({
      gameId: faker.database.mongodbObjectId(),
      ...moveValues,
    })

    // assert
    assert(isSuccess(result))
    expect(result.data).toBe(true)
  })

  it("should set the outcome of a game", async () => {
    // arrange
    const mutator = new GameMutator(new MockGameMutator())

    // act
    const result = await mutator.setOutcome(
      faker.database.mongodbObjectId(),
      "white",
      false,
    )

    // assert
    assert(isSuccess(result))
    expect(result.data).toBe(true)
  })
})
