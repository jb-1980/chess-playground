from flask import Blueprint
from flask_jwt_extended import jwt_required

from server.queries.get_game_by_id import handle_get_game_by_id
from server.queries.get_games import handle_get_games

queries = Blueprint("queries", __name__, url_prefix="/queries")


@queries.route("/get-games", methods=["POST"])
@jwt_required()
def get_games():
    return handle_get_games()


@queries.route("/get-game-by-id", methods=["POST"])
@jwt_required()
def get_game_by_id():
    return handle_get_game_by_id()
