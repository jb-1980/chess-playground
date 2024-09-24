from flask import jsonify, make_response, request
from pydantic import BaseModel
from result import is_ok

from server.domain.game import Game
from server.models.game import GameLoader, make_game_dto


def query_get_game_by_id(gameId: str) -> Game | None:
    gameResult = GameLoader().get_game_by_id(gameId)
    if is_ok(gameResult):
        game = gameResult.ok_value
        if game is None:
            return None
        return make_game_dto(game)

    return None


class Payload(BaseModel):
    gameId: str


def handle_get_game_by_id():
    try:
        payload = Payload(**request.json)
    except Exception:
        return make_response(jsonify({"message": "Invalid payload"}), 400)

    game = query_get_game_by_id(payload.gameId)
    return make_response(game.model_dump_json(), 200)
