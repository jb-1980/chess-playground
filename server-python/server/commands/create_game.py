# import { AsyncResult, isFailure, Result } from "../lib/result"
# import { makeUserDto, User } from "../domain/user"
# import { Context } from "../middleware/context"

# export const command_CreateGame = async (
#   playerIds: [string, string],
#   { Mutator, Loader }: Context
# ): AsyncResult<
#   {
#     gameId: string
#     whitePlayer: User
#     blackPlayer: User
#   },
#   | "DB_ERR_FAILED_TO_GET_USERS_BY_IDS"
#   | "USERS_NOT_FOUND"
#   | "DB_ERR_FAILED_TO_CREATE_GAME"
# > => {
#   const usersResult = await Loader.UserLoader.getUsersByIds(playerIds)
#   if (isFailure(usersResult)) {
#     return usersResult
#   }
#   const users = usersResult.data
#   // randomly choose a player to be white
#   const whitePlayer = users[Math.round(Math.random())]
#   const blackPlayer = users.find(
#     (user) => user.username !== whitePlayer.username
#   )

#   if (!whitePlayer || !blackPlayer) {
#     return Result.Fail("USERS_NOT_FOUND")
#   }

#   const createGameResult = await Mutator.GameMutator.createGame(
#     whitePlayer,
#     blackPlayer
#   )

#   if (createGameResult.success) {
#     return Result.Success({
#       gameId: createGameResult.data,
#       whitePlayer: makeUserDto(whitePlayer),
#       blackPlayer: makeUserDto(blackPlayer),
#     })
#   }

#   return createGameResult
# }
from random import randint
from typing import TypedDict

from server.domain.user import User
from server.models.game import GameMutator
from server.models.user import UserLoader, make_user_dto


class CreateGameResult(TypedDict):
    gameId: str
    whitePlayer: User
    blackPlayer: User


def command_create_game(player_ids: tuple[str, str]) -> CreateGameResult:
    users = UserLoader().get_users_by_ids(list(player_ids))
    white_player = users[randint(0, 1)]
    black_player = next(
        (user for user in users if user["username"] != white_player["username"])
    )
    game_id = GameMutator().create_game(white_player, black_player)
    return {
        "gameId": game_id,
        "whitePlayer": make_user_dto(white_player),
        "blackPlayer": make_user_dto(black_player),
    }
