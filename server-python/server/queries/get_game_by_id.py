from flask import jsonify, make_response, request
from pydantic import BaseModel

from server.domain.game import Game
from server.models.game import GameLoader, make_game_dto


def query_get_game_by_id(gameId: str) -> Game | None:
    game = GameLoader().get_game_by_id(gameId)
    if game is None:
        return None
    return make_game_dto(game)


class Payload(BaseModel):
    gameId: str


def handle_get_game_by_id():
    try:
        payload = Payload(**request.json)
    except Exception:
        return make_response(jsonify({"message": "Invalid payload"}), 400)

    return make_response(jsonify(query_get_game_by_id(payload.gameId)), 200)
