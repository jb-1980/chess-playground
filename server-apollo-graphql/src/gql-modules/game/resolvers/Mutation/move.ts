import {
  createPgnFromMoves,
  getStatus,
  validateMove,
} from "../../../../lib/chess"
import { isFailure } from "../../../../lib/result"
import { pubsub } from "../../../../pubsub"
import { PlayersInActiveGames } from "../../utils"
import {
  Color,
  GameStatus,
  MoveError,
  type MutationResolvers,
} from "./../../../types.generated"
export const move: NonNullable<MutationResolvers["move"]> = async (
  _parent,
  { gameId, move },
  { dataSources: { GameLoader, GameMutator, UserMutator }, user },
) => {
  const isValidMove = validateMove(move.before, move.san)
  if (!isValidMove) {
    return {
      __typename: "MoveErrorResult",
      message: MoveError.INVALID,
    }
  }

  const status = getStatus(move.after)

  const gameResult = await GameLoader.getGameById(gameId, true)
  if (isFailure(gameResult)) {
    return {
      __typename: "MoveErrorResult",
      message: MoveError.FAILED_TO_GET_GAME,
    }
  }

  const game = gameResult.data
  if (!game) {
    return {
      __typename: "MoveErrorResult",
      message: MoveError.GAME_NOT_FOUND,
    }
  }

  const whitePlayerId = game.whitePlayer._id.toString()
  const blackPlayerId = game.blackPlayer._id.toString()
  const color = move.color
  if (color === Color.w && user.id !== whitePlayerId) {
    return {
      __typename: "MoveErrorResult",
      message: MoveError.NOT_YOUR_MOVE,
    }
  } else if (color === Color.b && user.id !== blackPlayerId) {
    return {
      __typename: "MoveErrorResult",
      message: MoveError.NOT_YOUR_MOVE,
    }
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
    headers.Result = move.color === Color.w ? "1-0" : "0-1"
  } else if (status === GameStatus.STALEMATE) {
    headers.Result = "1/2-1/2"
  }
  const newMoves = [...game.moves, move]
  let pgn: string
  try {
    pgn = createPgnFromMoves(
      newMoves.map((m) => m.san),
      headers,
    )
  } catch (e) {
    return {
      __typename: "MoveErrorResult",
      message: MoveError.INVALID,
    }
  }

  const addMoveResult = await GameMutator.addMoveToGame({
    gameId,
    move,
    status,
    pgn,
  })

  if (isFailure(addMoveResult)) {
    return {
      __typename: "MoveErrorResult",
      message: MoveError.FAILED_TO_ADD_MOVE,
    }
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
    const whiteWins = move.color === Color.w
    if (status === GameStatus.CHECKMATE) {
      newRatings.whiteRating = whiteWins
        ? game.outcomes.whiteWins.whiteRating
        : game.outcomes.blackWins.whiteRating
      newRatings.blackRating = whiteWins
        ? game.outcomes.whiteWins.blackRating
        : game.outcomes.blackWins.blackRating
    } else {
      newRatings.whiteRating = game.outcomes.draw.whiteRating
      newRatings.blackRating = game.outcomes.draw.blackRating
    }

    await Promise.all([
      GameMutator.setOutcome(gameId, outcome.winner, outcome.draw),
      UserMutator.updateUserRating(
        game.whitePlayer._id,
        newRatings.whiteRating,
      ),
      UserMutator.updateUserRating(
        game.blackPlayer._id,
        newRatings.blackRating,
      ),
    ])

    PlayersInActiveGames.delete(game.whitePlayer._id.toString())
    PlayersInActiveGames.delete(game.blackPlayer._id.toString())
  }

  pubsub.publish(`OBSERVE_GAME${gameId}`, {
    observeGame: {
      __typename: "ObserveGameMsg",
      game: {
        ...game,
        moves: newMoves,
        pgn,
        status,
      },
    },
  })

  return {
    __typename: "MoveSuccessResult",
    newPGN: pgn,
  }
}
