from random import randint
from typing import Literal, TypedDict

from result import Err, Ok, Result, is_err, is_ok

from server.domain.user import User
from server.models.game import GameMutator
from server.models.user import UserLoader, make_user_dto


class CreateGameResult(TypedDict):
    gameId: str
    whitePlayer: User
    blackPlayer: User


def command_create_game(
    player_ids: tuple[str, str],
) -> Result[
    CreateGameResult,
    Literal["DB_ERR_FAILED_TO_GET_USERS_BY_IDS", "DB_ERR_FAILED_TO_CREATE_GAME"],
]:
    usersResult = UserLoader().get_users_by_ids(list(player_ids))
    if is_err(usersResult):
        return Err("DB_ERR_FAILED_TO_GET_USERS_BY_IDS")
    elif is_ok(usersResult):
        users = usersResult.ok_value
        white_player = users[randint(0, 1)]
        black_player = next(
            (user for user in users if user["username"] != white_player["username"])
        )
        create_game_result = GameMutator().create_game(white_player, black_player)
        if is_ok(create_game_result):
            return Ok(
                {
                    "gameId": create_game_result.ok_value,
                    "whitePlayer": make_user_dto(white_player),
                    "blackPlayer": make_user_dto(black_player),
                }
            )
        return Err("DB_ERR_FAILED_TO_CREATE_GAME")

    return Err("DB_ERR_FAILED_TO_CREATE_GAME")
