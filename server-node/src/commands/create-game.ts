import { AsyncResult, isFailure, Result } from "../lib/result"
import { makeUserDto, User } from "../domain/user"
import { Context } from "../middleware/context"

export const command_CreateGame = async (
  playerIds: [string, string],
  { Mutator, Loader }: Context
): AsyncResult<
  {
    gameId: string
    whitePlayer: User
    blackPlayer: User
  },
  | "DB_ERR_FAILED_TO_GET_USERS_BY_IDS"
  | "USERS_NOT_FOUND"
  | "DB_ERR_FAILED_TO_CREATE_GAME"
> => {
  const usersResult = await Loader.UserLoader.getUsersByIds(playerIds)
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

  const createGameResult = await Mutator.GameMutator.createGame(
    whitePlayer,
    blackPlayer
  )

  if (createGameResult.success) {
    return Result.Success({
      gameId: createGameResult.data,
      whitePlayer: makeUserDto(whitePlayer),
      blackPlayer: makeUserDto(blackPlayer),
    })
  }

  return createGameResult
}
