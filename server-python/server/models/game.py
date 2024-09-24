from datetime import datetime
from typing import Literal

from bson import ObjectId
from pymongo.collection import Collection
from result import Err, Ok, Result
from server.domain.chess import GameStatus, calculate_new_ratings
from server.domain.game import Game, Move
from server.models import mongoDB
from server.models.game_types import GameDocument, GameUser
from server.models.user import make_user_dto
from server.models.user_types import UserDocument


class GameLoader:
    collection: Collection[GameDocument]

    def __init__(self) -> None:
        self.collection = mongoDB.games

    def get_games_for_player_id(
        self, playerId: str
    ) -> Result[list[GameDocument], Literal["DB_ERR_GET_GAMES_FOR_USER_ID"]]:
        try:
            games = self.collection.find(
                {
                    "$or": [
                        {"whitePlayer._id": ObjectId(playerId)},
                        {"blackPlayer._id": ObjectId(playerId)},
                    ],
                }
            )
            return Ok(games.to_list())
        except Exception:
            return Err("DB_ERR_GET_GAMES_FOR_USER_ID")

    def get_game_by_id(
        self, gameId: str
    ) -> Result[GameDocument | None, Literal["DB_ERROR_WHILE_GETTING_GAME"]]:
        try:
            return Ok(self.collection.find_one({"_id": ObjectId(gameId)}))
        except Exception:
            return Err("DB_ERROR_WHILE_GETTING_GAME")


def to_game_user_from_user_document(user: UserDocument) -> GameUser:
    return {
        "_id": user["_id"],
        "username": user["username"],
        "rating": user["rating"],
        "avatarUrl": user.get("avatarUrl", None),
    }


class GameMutator:
    collection: Collection[GameDocument]

    def __init__(self) -> None:
        self.collection = mongoDB.games

    def create_game(
        self, white_user: UserDocument, black_user: UserDocument
    ) -> Result[str, Literal["DB_ERR_FAILED_TO_CREATE_GAME"]]:
        white_player = to_game_user_from_user_document(white_user)
        black_player = to_game_user_from_user_document(black_user)
        white_wins_outcome = calculate_new_ratings(
            white_player["rating"], black_player["rating"], 1
        )
        black_wins_outcome = calculate_new_ratings(
            white_player["rating"], black_player["rating"], 0
        )
        draw_outcome = calculate_new_ratings(
            white_player["rating"], black_player["rating"], 0.5
        )

        try:
            response = self.collection.insert_one(
                {
                    "whitePlayer": white_player,
                    "blackPlayer": black_player,
                    "moves": [],
                    "pgn": "",
                    "status": "PLAYING",
                    "createdAt": datetime.now(),
                    "outcome": {
                        "winner": None,
                        "draw": False,
                    },
                    "outcomes": {
                        "whiteWins": white_wins_outcome,
                        "blackWins": black_wins_outcome,
                        "draw": draw_outcome,
                    },
                }
            )
            return Ok(str(response.inserted_id))
        except Exception:
            return Err("DB_ERR_FAILED_TO_CREATE_GAME")

    def add_move_to_game(
        self, gameId: str, move: Move, status: GameStatus, pgn: str
    ) -> Result[bool, Literal["DB_ERROR_ADDING_MOVE_TO_GAME"]]:
        try:
            response = self.collection.update_one(
                {"_id": ObjectId(gameId)},
                {
                    "$push": {
                        "moves": {
                            **move,
                            "createdAt": datetime.now(),
                        },
                    },
                    "$set": {"status": status, "pgn": pgn},
                },
            )
            return Ok(response.acknowledged)
        except Exception:
            return Err("DB_ERROR_ADDING_MOVE_TO_GAME")

    def set_outcome(
        self, gameId: str, winner: str | None, draw: bool
    ) -> Result[bool, Literal["DB_ERR_SET_OUTCOME"]]:
        try:
            response = self.collection.update_one(
                {"_id": ObjectId(gameId)},
                {
                    "$set": {
                        "outcome": {
                            "winner": winner,
                            "draw": draw,
                        },
                    },
                },
            )
            return Ok(response.acknowledged)
        except Exception:
            return Err("DB_ERR_SET_OUTCOME")


def make_game_dto(game: GameDocument) -> Game:
    return Game(
        id=str(game["_id"]),
        moves=game["moves"],
        pgn=game["pgn"],
        whitePlayer=make_user_dto(game["whitePlayer"]),
        blackPlayer=make_user_dto(game["blackPlayer"]),
        status=game["status"],
    )
