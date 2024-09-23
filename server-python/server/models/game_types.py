from datetime import datetime
from typing import NotRequired, TypedDict

from bson import ObjectId


class GameUser(TypedDict):
    _id: ObjectId
    username: str
    rating: int
    avatarUrl: str | None


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
    _id: NotRequired[ObjectId]
    moves: list[Move]
    pgn: str
    whitePlayer: GameUser
    blackPlayer: GameUser
    status: str
    createdAt: datetime
    outcome: Outcome
    outcomes: Outcomes
