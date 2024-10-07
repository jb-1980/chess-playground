import { Request, Response } from "express"
import { z, ZodError } from "zod"
import { AsyncResult, isFailure, Result } from "../lib/result"
import { Context } from "../middleware/context"
import { Color, GameStatus, Move, moveSchema } from "../domain/game"
import { createPgnFromMoves, getStatus, validateMove } from "../lib/chess"
import { pubsub } from "../server/websocket"
import {
  makeObserveGameResponseMessage,
  PlayersInActiveGames,
} from "../lib/pubsub"

const MoveSchema = z.object({
  gameId: z.string(),
  move: moveSchema,
})

export const handle_Move = async (
  req: Request,
  res: Response<{ newPGN: string } | ZodError | { error: string }>,
) => {
  const requestBody = req.body
  const parsedBody = MoveSchema.safeParse(requestBody)

  if (!parsedBody.success) {
    return res.status(400).json(parsedBody.error)
  }

  const moveResult = await command_Move(parsedBody.data, req.context)
  if (isFailure(moveResult)) {
    return res.status(401).json({ error: moveResult.message })
  }
  return res.status(200).json({ newPGN: moveResult.data })
}

export enum MoveError {
  /** 500 error when trying to update game with the new move in the DB */
  FAILED_TO_ADD_MOVE = "FAILED_TO_ADD_MOVE",
  /** 500 error when trying to get game from DB */
  FAILED_TO_GET_GAME = "FAILED_TO_GET_GAME",
  /** Failed to find a game with the given ID */
  GAME_NOT_FOUND = "GAME_NOT_FOUND",
  /** Move is invalid */
  INVALID = "INVALID",
  /** Can only move pieces of your own color */
  NOT_YOUR_MOVE = "NOT_YOUR_MOVE",
}

export const command_Move = async (
  args: {
    gameId: string
    move: Move
  },
  { Loader, Mutator, user }: Context,
): AsyncResult<string, MoveError> => {
  const { gameId, move } = args
  const isValidMove = validateMove(move.before, move.san)
  if (!isValidMove) {
    return Result.Fail(MoveError.INVALID)
  }

  const status = getStatus(move.after)

  const gameResult = await Loader.GameLoader.getGameById(gameId)
  if (isFailure(gameResult)) {
    return Result.Fail(MoveError.FAILED_TO_GET_GAME)
  }

  const game = gameResult.data
  if (!game) {
    return Result.Fail(MoveError.GAME_NOT_FOUND)
  }

  const whitePlayerId = game.whitePlayer.id
  const blackPlayerId = game.blackPlayer.id
  const color = move.color
  if (color === Color.WHITE && user?.id !== whitePlayerId) {
    return Result.Fail(MoveError.NOT_YOUR_MOVE)
  } else if (color === Color.BLACK && user?.id !== blackPlayerId) {
    return Result.Fail(MoveError.NOT_YOUR_MOVE)
  }

  const headers: { [key: string]: string } = {
    Event: "Live Chess",
    Site: "chess-app",
    White: game.whitePlayer.username,
    Black: game.blackPlayer.username,
    UTCDate: game.createdAt.toISOString().split("T")[0],
    UTCTime: game.createdAt.toISOString().split("T")[1].split(".")[0],
    WhiteElo: game.whitePlayer.rating.toString(),
    BlackElo: game.blackPlayer.rating.toString(),
    Result: "*",
  }
  if (status === GameStatus.CHECKMATE) {
    headers.Result = move.color === Color.WHITE ? "1-0" : "0-1"
  } else if (status === GameStatus.STALEMATE) {
    headers.Result = "1/2-1/2"
  }
  const newMove = {
    ...move,
    createdAt: new Date(),
  }
  const newMoves = [...game.moves, newMove]
  let pgn: string
  try {
    pgn = createPgnFromMoves(
      newMoves.map((m) => m.san),
      headers,
    )
  } catch (e) {
    return Result.Fail(MoveError.INVALID)
  }

  const addMoveResult = await Mutator.GameMutator.addMoveToGame({
    gameId,
    move,
    status,
    pgn,
  })

  if (isFailure(addMoveResult)) {
    return Result.Fail(MoveError.FAILED_TO_ADD_MOVE)
  }

  const gameOverOutcomes = [
    GameStatus.CHECKMATE,
    GameStatus.STALEMATE,
    GameStatus.THREE_MOVE_REPETITION,
    GameStatus.INSUFFICIENT_MATERIAL,
    GameStatus.FIFTY_MOVE_RULE,
  ]
  if (gameOverOutcomes.includes(status)) {
    const newRatings = {
      whiteRating: game.whitePlayer.rating,
      blackRating: game.blackPlayer.rating,
    }
    const outcome = {
      winner: status === GameStatus.CHECKMATE ? move.color : null,
      draw: status !== GameStatus.CHECKMATE,
    }
    const whiteWins = move.color === Color.WHITE
    const outcomesResult = await Loader.GameLoader.getGameOutcomes(game.id)
    if (isFailure(outcomesResult)) {
      return Result.Fail(MoveError.FAILED_TO_GET_GAME)
    }
    const outcomes = outcomesResult.data
    if (status === GameStatus.CHECKMATE) {
      newRatings.whiteRating = whiteWins
        ? outcomes.whiteWins.whiteRating
        : outcomes.blackWins.whiteRating
      newRatings.blackRating = whiteWins
        ? outcomes.whiteWins.blackRating
        : outcomes.blackWins.blackRating
    } else {
      newRatings.whiteRating = outcomes.draw.whiteRating
      newRatings.blackRating = outcomes.draw.blackRating
    }

    await Promise.all([
      Mutator.GameMutator.setOutcome(gameId, outcome.winner, outcome.draw),
      Mutator.UserMutator.updateUserRating(
        game.whitePlayer.id,
        newRatings.whiteRating,
      ),
      Mutator.UserMutator.updateUserRating(
        game.blackPlayer.id,
        newRatings.blackRating,
      ),
    ])

    PlayersInActiveGames.delete(game.whitePlayer.id)
    PlayersInActiveGames.delete(game.blackPlayer.id)
  }

  pubsub.publish(
    {
      topic: `OBSERVE_GAME.${gameId}`,
      payload: makeObserveGameResponseMessage({
        ...game,
        moves: newMoves,
        pgn,
        status,
      }),
    },
    (ws) => ws.id !== user?.id,
  )

  return Result.Success(pgn)
}
