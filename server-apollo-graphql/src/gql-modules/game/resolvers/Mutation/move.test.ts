import { assert, describe, expect, it, vi } from "vitest"
import {
  getTestMongoDBGame,
  getTestMoveValues,
} from "../../datasources/test-utils/mock-game"
import { getMockContext } from "../../../../test-utils/mock-context"
import { move } from "./move"
import { getTestUserDocument } from "../../../user/datasources/test-utils/mock-user"
import { DEFAULT_POSITION } from "chess.js"
import { MoveError } from "../../../types.generated"
import { faker } from "@faker-js/faker"
import { pubsub } from "../../../../pubsub"

describe("Game Resolvers::move mutation", () => {
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
    const context = getMockContext({
      games: [game],
      users: [user],
    })

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
    const context = getMockContext()
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
    const game = getTestMongoDBGame({
      moves: moveValues.moveHistory.slice(0, -1).map((move) => ({
        ...move,
        createdAt: new Date(),
      })),
      whitePlayer: whiteTurn ? undefined : user,
      blackPlayer: whiteTurn ? user : undefined,
    })
    const context = getMockContext({
      games: [game],
      users: [user],
      authUser: { id: user._id, ...user },
    })

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
    const game = getTestMongoDBGame({
      moves: moveValues.moveHistory.slice(0, -1).map((move) => ({
        ...move,
        createdAt: new Date(),
      })),
      whitePlayer: whiteTurn ? user : undefined,
      blackPlayer: whiteTurn ? undefined : user,
    })
    const context = getMockContext({
      games: [game],
      users: [user],
      authUser: { id: user._id, ...user },
    })

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
    const game = getTestMongoDBGame({
      moves: moveValues.moveHistory.slice(0, -1).map((move) => ({
        ...move,
        createdAt: new Date(),
      })),
      whitePlayer: whiteTurn ? user : undefined,
      blackPlayer: whiteTurn ? undefined : user,
    })
    const context = getMockContext({
      games: [game],
      users: [user],
      authUser: { id: user._id, ...user },
    })

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
