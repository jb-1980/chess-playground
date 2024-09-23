from flask import jsonify, make_response, request
from pydantic import BaseModel

from server.domain.game import Game
from server.models.game import GameLoader, make_game_dto


def query_get_games_for_player_id(playerId: str) -> list[Game]:
    games = GameLoader().get_games_for_player_id(playerId)
    return [make_game_dto(g) for g in games]


class Payload(BaseModel):
    playerId: str


def handle_get_games():
    try:
        payload = Payload(**request.json)
    except Exception:
        return make_response(jsonify({"message": "Invalid payload"}), 400)

    return make_response(jsonify(query_get_games_for_player_id(payload.playerId)), 200)
