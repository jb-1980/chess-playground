import { AsyncResult, Result } from "../../../../lib/result"
import { Game, GameOutcome, GameStatus, Move } from "../../../../domain/game"
import DataLoader from "dataloader"
import {
  Game as GameDB,
  Outcome,
  User as UserDB,
  Move as MoveDB,
} from "@prisma/client"
import prisma from "../../client"
import { DBGameLoader, DBGameMutator } from "../../../loaders"
import { makeUserDto } from "../user/user"
import { User } from "../../../../domain/user"

export type FullGame = GameDB & {
  whitePlayer: UserDB
  blackPlayer: UserDB
  moves: MoveDB[]
}

export const makeGameDTO = (game: FullGame): Game => ({
  id: game.id,
  whitePlayer: makeUserDto(game.whitePlayer),
  blackPlayer: makeUserDto(game.blackPlayer),
  pgn: game.pgn,
  status: game.status as GameStatus,
  moves: game.moves as Move[],
  createdAt: game.createdAt,
})

export class PostgresGameLoader implements DBGameLoader {
  batchGames = new DataLoader<string, Game | null>(async (ids) => {
    const games = await prisma.game.findMany({
      select: {
        id: true,
        pgn: true,
        status: true,
        outcome: true,
        createdAt: true,
        moves: true,
        whitePlayer: true,
        blackPlayer: true,
        whitePlayerId: true,
        blackPlayerId: true,
      },
      where: {
        id: { in: [...ids] },
      },
    })

    const gamesMap = games.reduce(
      (map, game) => {
        map[game.id] = makeGameDTO(game)
        return map
      },
      {} as Record<string, Game>,
    )

    return ids.map((id) => gamesMap[id] || null)
  })

  batchGamesForPlayer = new DataLoader<string, Game[]>(async (ids) => {
    const games = await prisma.game.findMany({
      where: {
        OR: [
          { whitePlayerId: { in: [...ids] } },
          { blackPlayerId: { in: [...ids] } },
        ],
      },
      select: {
        id: true,
        pgn: true,
        status: true,
        outcome: true,
        createdAt: true,
        moves: true,
        whitePlayer: true,
        blackPlayer: true,
        whitePlayerId: true,
        blackPlayerId: true,
      },
    })

    const gamesMap = games.reduce(
      (map, game) => {
        const whitePlayerId = game.whitePlayerId
        const blackPlayerId = game.blackPlayerId
        map[whitePlayerId] = map[whitePlayerId] || []
        map[blackPlayerId] = map[blackPlayerId] || []
        map[whitePlayerId].push(makeGameDTO(game))
        map[blackPlayerId].push(makeGameDTO(game))
        return map
      },
      {} as Record<string, Game[]>,
    )

    return ids.map((id) => gamesMap[id] || [])
  })

  batchGameOutcomes = new DataLoader<string, GameOutcome>(async (ids) => {
    const outcomes = await prisma.gameOutcomes.findMany({
      where: {
        gameId: { in: [...ids] },
      },
    })

    const outcomesMap = outcomes.reduce(
      (map, outcome) => {
        map[outcome.gameId] = {
          whiteWins: {
            whiteRating: outcome.whiteWinsWhiteRating,
            blackRating: outcome.whiteWinsBlackRating,
          },
          blackWins: {
            whiteRating: outcome.blackWinsWhiteRating,
            blackRating: outcome.blackWinsBlackRating,
          },
          draw: {
            whiteRating: outcome.drawWhiteRating,
            blackRating: outcome.drawBlackRating,
          },
        }
        return map
      },
      {} as Record<string, GameOutcome>,
    )

    return ids.map((id) => outcomesMap[id] || null)
  })
}

export class PostgresGameMutator implements DBGameMutator {
  public async insertGame(
    whitePlayer: User,
    blackPlayer: User,
    outcomes: GameOutcome,
  ): AsyncResult<string, "DB_ERR_FAILED_TO_CREATE_GAME"> {
    try {
      const gameId = await prisma.$transaction(async (tx) => {
        const game = await tx.game.create({
          data: {
            whitePlayerId: whitePlayer.id,
            blackPlayerId: whitePlayer.id,
            pgn: "",
            status: GameStatus.PLAYING,
            outcome: null,
            createdAt: new Date(),
          },
        })
        tx.gameOutcomes.create({
          data: {
            gameId: game.id,
            whiteWinsWhiteRating: outcomes.whiteWins.whiteRating,
            whiteWinsBlackRating: outcomes.whiteWins.blackRating,
            blackWinsWhiteRating: outcomes.blackWins.whiteRating,
            blackWinsBlackRating: outcomes.blackWins.blackRating,
            drawWhiteRating: outcomes.draw.whiteRating,
            drawBlackRating: outcomes.draw.blackRating,
          },
        })
        return game.id
      })

      return Result.Success(gameId)
    } catch (error) {
      console.dir(error, { depth: 6 })
      return Result.Fail("DB_ERR_FAILED_TO_CREATE_GAME", error)
    }
  }

  public async addMoveToGame(args: {
    gameId: string
    move: Move
    status: GameStatus
    pgn: string
  }): AsyncResult<boolean, "DB_ERROR_ADDING_MOVE_TO_GAME"> {
    const { gameId, move, status, pgn } = args
    try {
      const result = await prisma.$transaction(async (tx) => {
        await tx.move.create({
          data: {
            ...move,
            gameId,
            createdAt: new Date(),
          },
        })
        await tx.game.update({
          where: { id: gameId },
          data: {
            status,
            pgn,
          },
        })
        return true
      })

      return Result.Success(result)
    } catch (error) {
      console.dir(error, { depth: 6 })
      return Result.Fail("DB_ERROR_ADDING_MOVE_TO_GAME", error)
    }
  }

  public async setOutcome(
    gameId: string,
    winner: string | null,
    draw: boolean,
  ): AsyncResult<boolean, "DB_ERR_SET_OUTCOME"> {
    try {
      const result = await prisma.game.update({
        where: { id: gameId },
        data: {
          outcome: draw
            ? Outcome.DRAW
            : winner === "white"
              ? Outcome.WHITE_WINS
              : Outcome.BLACK_WINS,
        },
      })
      return Result.Success(result.outcome !== null)
    } catch (error) {
      console.dir(error, { depth: 6 })
      return Result.Fail("DB_ERR_SET_OUTCOME", error)
    }
  }
}
