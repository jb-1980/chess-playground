import { getUsersByIds } from "../repository/user"
import { AsyncResult, isFailure, Result } from "../lib/result"
import { createGame } from "../repository/game"
import { makeUserDto, User } from "../domain/user"

export const command_CreateGame = async (
  playerIds: [string, string]
): AsyncResult<
  {
    gameId: string
    whitePlayer: User
    blackPlayer: User
    pgn: string
  },
  | "DB_ERR_FAILED_TO_GET_USERS_BY_IDS"
  | "USERS_NOT_FOUND"
  | "DB_ERR_FAILED_TO_CREATE_GAME"
> => {
  const usersResult = await getUsersByIds(playerIds)
  if (isFailure(usersResult)) {
    return usersResult
  }
  const users = usersResult.data
  // randomly choose a player to be white
  const whitePlayer = users[Math.round(Math.random())]
  const blackPlayer = users.find(
    (user) => user.username !== whitePlayer.username
  )

  if (!whitePlayer || !blackPlayer) {
    return Result.Fail("USERS_NOT_FOUND")
  }

  const createGameResult = await createGame(whitePlayer, blackPlayer)

  if (createGameResult.success) {
    return Result.Success({
      gameId: createGameResult.data.gameId,
      whitePlayer: makeUserDto(whitePlayer),
      blackPlayer: makeUserDto(blackPlayer),
      pgn: createGameResult.data.pgn,
    })
  }

  return createGameResult
}
