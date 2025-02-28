import { GameMutator } from "./game-mutator"
import { faker } from "@faker-js/faker"
import { isSuccess, SuccessType } from "../../../lib/result"
import { getTestUser } from "../../../test-utils/user"
import { getTestGame, getTestMoveValues } from "../../../test-utils/game"
import { MockGameMutator } from "../../../test-utils/db-injectors"

describe("GameMutator", () => {
  it("should create a game", async () => {
    // arrange
    const game = getTestGame()

    const mutator = new GameMutator(new MockGameMutator(game))

    const whiteUser = getTestUser()
    const blackUser = getTestUser()

    // act
    const result = await mutator.createGame(whiteUser, blackUser)

    // assert
    expect(result).toSatisfy(isSuccess)
    const successResult = result as SuccessType<typeof result>
    expect(successResult.data).toBe(game.id)
  })

  it("should add a move to a game", async () => {
    // arrange
    const mutator = new GameMutator(new MockGameMutator())
    const moveValues = getTestMoveValues(4)

    // act
    const result = await mutator.addMoveToGame({
      gameId: faker.string.uuid(),
      ...moveValues,
    })

    // assert
    expect(result).toSatisfy(isSuccess)
    const successResult = result as SuccessType<typeof result>
    expect(successResult.data).toBe(true)
  })

  it("should set the outcome of a game", async () => {
    // arrange
    const mutator = new GameMutator(new MockGameMutator())

    // act
    const result = await mutator.setOutcome(faker.string.uuid(), "white", false)

    // assert
    expect(result).toSatisfy(isSuccess)
    const successResult = result as SuccessType<typeof result>
    expect(successResult.data).toBe(true)
  })
})
