import { afterEach, assert, describe, expect, it, vi } from "vitest"
import { move } from "./move"
import { DEFAULT_POSITION } from "chess.js"
import { MoveError } from "../../../types.generated"
import { faker } from "@faker-js/faker"
import { pubsub } from "../../../../pubsub"
import {
  getTestMongoDBGame,
  getTestMoveValues,
  getTestUserDocument,
  makeUserDTO,
  seedGame,
} from "@test-utils"
import { getApolloContextReturnValue } from "src/server-config/context"
import { mongoDB } from "src/database/connection"

describe("Game Resolvers::move mutation", () => {
  afterEach(async () => {
    await mongoDB.dropDatabase()
  })
  it("should return MoveErrorResult for an invalid move", async () => {
    // arrange
    const user = getTestUserDocument()
    const moveValues = getTestMoveValues()

    const whiteTurn = moveValues.move.color === "w"
    const game = getTestMongoDBGame({
      moves: moveValues.moveHistory.slice(0, -1).map((move) => ({
        ...move,
        createdAt: new Date(),
      })),
      whitePlayer: whiteTurn ? user : undefined,
      blackPlayer: whiteTurn ? undefined : user,
    })
    const context = getApolloContextReturnValue(makeUserDTO(user))

    const invalidMove = {
      ...moveValues.move,
      before: DEFAULT_POSITION,
      san: "Qd4",
    }
    // act
    const result = await move(
      null,
      { gameId: game._id, move: invalidMove },
      context,
      null,
    )
    // assert
    assert(result.__typename === "MoveErrorResult")
    expect(result.message).toBe(MoveError.INVALID)
  })

  it("should return MoveErrorResult when it can't find the game", async () => {
    // arrange
    const user = makeUserDTO(getTestUserDocument())
    const context = getApolloContextReturnValue(user)
    const moveValues = getTestMoveValues()

    // act
    const result = await move(
      null,
      { gameId: faker.database.mongodbObjectId(), move: moveValues.move },
      context,
      null,
    )
    // assert
    assert(result.__typename === "MoveErrorResult")
    expect(result.message).toBe(MoveError.GAME_NOT_FOUND)
  })

  it("should return MoveErrorResult when it is not your move", async () => {
    // arrange
    const user = getTestUserDocument()
    const moveValues = getTestMoveValues()
    const whiteTurn = moveValues.move.color === "w"
    const game = await seedGame({
      moves: moveValues.moveHistory.slice(0, -1).map((move) => ({
        ...move,
        createdAt: new Date(),
      })),
      whitePlayer: whiteTurn ? undefined : user,
      blackPlayer: whiteTurn ? user : undefined,
    })
    const context = getApolloContextReturnValue(makeUserDTO(user))

    // act
    const result = await move(
      null,
      { gameId: game._id, move: moveValues.move },
      context,
      null,
    )
    // assert
    assert(result.__typename === "MoveErrorResult")
    expect(result.message).toBe(MoveError.NOT_YOUR_MOVE)
  })

  it("should return a newPgn for a valid move", async () => {
    // arrange
    const user = getTestUserDocument()
    const moveValues = getTestMoveValues()
    const whiteTurn = moveValues.move.color === "w"
    const game = await seedGame({
      moves: moveValues.moveHistory.slice(0, -1).map((move) => ({
        ...move,
        createdAt: new Date(),
      })),
      whitePlayer: whiteTurn ? user : undefined,
      blackPlayer: whiteTurn ? undefined : user,
    })
    const context = getApolloContextReturnValue(makeUserDTO(user))

    // act
    const result = await move(
      null,
      { gameId: game._id, move: moveValues.move },
      context,
      null,
    )
    // assert
    assert(result.__typename === "MoveSuccessResult")
    expect(result.newPGN).toBeDefined()
  })

  it("should publish a move event when move is successful", async () => {
    // arrange
    const user = getTestUserDocument()
    const moveValues = getTestMoveValues()
    const whiteTurn = moveValues.move.color === "w"
    const game = await seedGame({
      moves: moveValues.moveHistory.slice(0, -1).map((move) => ({
        ...move,
        createdAt: new Date(),
      })),
      whitePlayer: whiteTurn ? user : undefined,
      blackPlayer: whiteTurn ? undefined : user,
    })
    const context = getApolloContextReturnValue(makeUserDTO(user))

    // const pubsubSpy = vi.spyOn(pubsubModule, "publish")
    const pubsubSpy = vi.spyOn(pubsub, "publish").mockResolvedValue(void 0)

    // act
    const result = await move(
      null,
      { gameId: game._id, move: moveValues.move },
      context,
      null,
    )
    // assert
    assert(result.__typename === "MoveSuccessResult")
    expect(pubsubSpy).toHaveBeenCalledOnce()
    expect(pubsubSpy).toHaveBeenCalledWith(`OBSERVE_GAME${game._id}`, {
      observeGame: {
        __typename: "ObserveGameMsg",
        game: expect.any(Object),
      },
    })
  })
})
