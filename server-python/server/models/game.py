from datetime import datetime
from typing import TypedDict

from bson import ObjectId
from pymongo.collection import Collection

from server.models import mongoDB

GameUser = TypedDict(
    "GameUser",
    {
        "_id": ObjectId,
        "username": str,
        "rating": int,
        "avatarUrl": str,
    },
)

Move = TypedDict(
    "Move",
    {
        "color": str,
        "from": str,
        "to": str,
        "piece": str,
        "captured": str,
        "promotion": str,
        "flags": str,
        "san": str,
        "lan": str,
        "before": str,
        "after": str,
        "createdAt": datetime,
    },
)

Outcome = TypedDict(
    "Outcome",
    {
        "winner": str | None,
        "draw": bool,
    },
)

OutcomeRatings = TypedDict(
    "OutcomeRatings",
    {
        "whiteRating": int,
        "blackRating": int,
    },
)

Outcomes = TypedDict(
    "Outcomes",
    {
        "whiteWins": OutcomeRatings,
        "blackWins": OutcomeRatings,
        "draw": OutcomeRatings,
    },
)


class GameDocument(TypedDict):
    moves: list[Move]
    pgn: str
    whitePlayer: GameUser
    blackPlayer: GameUser
    status: str
    createdAt: datetime
    outcome: Outcome
    outcomes: Outcomes


class GameLoader:
    collection: Collection[GameDocument]

    def __init__(self) -> None:
        self.collection = mongoDB.games

    def get_games_for_player_id(self, playerId: str) -> list[GameDocument]:
        games = self.collection.find(
            {
                "$or": [
                    {"whitePlayer._id": ObjectId(playerId)},
                    {"blackPlayer._id": ObjectId(playerId)},
                ],
            }
        )
        return games.to_list()

    def get_game_by_id(self, gameId: str) -> GameDocument | None:
        return self.collection.find_one({"_id": ObjectId(gameId)})
