import { AsyncResult, Result } from "../../lib/result"
import { Game, GameOutcome, GameStatus, Move } from "../../domain/game"
import { calculateNewRatings } from "../../lib/chess"
import DataLoader from "dataloader"
import {
  Game as GameDB,
  Outcome,
  User as UserDB,
  Move as MoveDB,
} from "@prisma/client"
import prisma from "./client"
import { GameLoaderInterface, GameMutatorInterface } from "../loaders"
import { makeUserDto } from "./user"
import { User } from "../../domain/user"

type FullGame = GameDB & {
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

export class GameLoader implements GameLoaderInterface {
  private _batchGames = new DataLoader<string, Game | null>(async (ids) => {
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

  private _batchGamesForPlayer = new DataLoader<string, Game[]>(async (ids) => {
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

  async getGameById(
    id: string,
  ): AsyncResult<Game | null, "DB_ERROR_WHILE_GETTING_GAME"> {
    try {
      const game = await this._batchGames.load(id)
      if (!game) {
        return Result.Success(null)
      }
      return Result.Success(game)
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERROR_WHILE_GETTING_GAME", error)
    }
  }

  async getGamesForPlayerId(
    playerId: string,
  ): AsyncResult<Game[], "DB_ERR_GET_GAMES_FOR_USER_ID"> {
    try {
      const games = await this._batchGamesForPlayer.load(playerId)
      return Result.Success(games)
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERR_GET_GAMES_FOR_USER_ID", error)
    }
  }

  async getGameOutcomes(
    gameId: string,
  ): AsyncResult<GameOutcome, "DB_ERR_GET_GAME_OUTCOMES"> {
    try {
      const outcomes = await prisma.gameOutcomes.findUnique({
        where: { gameId },
      })
      if (!outcomes) {
        return Result.Fail("DB_ERR_GET_GAME_OUTCOMES")
      }
      return Result.Success({
        whiteWins: {
          whiteRating: outcomes.whiteWinsWhiteRating,
          blackRating: outcomes.whiteWinsBlackRating,
        },
        blackWins: {
          whiteRating: outcomes.blackWinsWhiteRating,
          blackRating: outcomes.blackWinsBlackRating,
        },
        draw: {
          whiteRating: outcomes.drawWhiteRating,
          blackRating: outcomes.drawBlackRating,
        },
      })
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERR_GET_GAME_OUTCOMES", error)
    }
  }
}

export class GameMutator implements GameMutatorInterface {
  public async createGame(
    whiteUser: User,
    blackUser: User,
  ): AsyncResult<string, "DB_ERR_FAILED_TO_CREATE_GAME"> {
    const whiteWinsOutcome = calculateNewRatings(
      whiteUser.rating,
      blackUser.rating,
      1,
    )
    const blackWinsOutcome = calculateNewRatings(
      whiteUser.rating,
      blackUser.rating,
      0,
    )
    const drawOutcome = calculateNewRatings(
      whiteUser.rating,
      blackUser.rating,
      0.5,
    )
    try {
      const gameId = await prisma.$transaction(async (tx) => {
        const game = await tx.game.create({
          data: {
            whitePlayerId: whiteUser.id,
            blackPlayerId: blackUser.id,
            pgn: "",
            status: GameStatus.PLAYING,
            outcome: null,
            createdAt: new Date(),
          },
        })
        tx.gameOutcomes.create({
          data: {
            gameId: game.id,
            whiteWinsWhiteRating: whiteWinsOutcome.whiteRating,
            whiteWinsBlackRating: whiteWinsOutcome.blackRating,
            blackWinsWhiteRating: blackWinsOutcome.whiteRating,
            blackWinsBlackRating: blackWinsOutcome.blackRating,
            drawWhiteRating: drawOutcome.whiteRating,
            drawBlackRating: drawOutcome.blackRating,
          },
        })
        return game.id
      })

      return Result.Success(gameId)
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERR_FAILED_TO_CREATE_GAME", error)
    }
  }

  public async addMoveToGame(args: {
    gameId: string
    move: Move
    status: GameStatus
    pgn: string
  }): AsyncResult<boolean, "DB_ERROR_ADDING_MOVE_TO_GAME" | "INVALID_MOVE"> {
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
      console.error(error)
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
      console.error(error)
      return Result.Fail("DB_ERR_SET_OUTCOME", error)
    }
  }
}
