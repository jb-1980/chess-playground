from datetime import datetime
from typing import NotRequired, TypedDict

from pydantic import BaseModel
from server.domain.user import User

Move = TypedDict(
    "Move",
    {
        "color": str,
        "from": str,
        "to": str,
        "piece": str,
        "captured": NotRequired[str],
        "promotion": NotRequired[str],
        "flags": str,
        "san": str,
        "lan": str,
        "before": str,
        "after": str,
        "createdAt": NotRequired[datetime],
    },
)


class Game(BaseModel):
    id: str
    moves: list[Move]
    pgn: str
    whitePlayer: User
    blackPlayer: User
    status: str
