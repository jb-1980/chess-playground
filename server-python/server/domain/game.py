from datetime import datetime
from typing import TypedDict

from server.domain.user import User

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

Game = TypedDict(
    "Game",
    {
        "id": str,
        "moves": list[Move],
        "pgn": str,
        "whitePlayer": User,
        "blackPlayer": User,
        "status": str,
    },
)
