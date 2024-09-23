from typing import Optional, TypedDict


class WebSocket:
    def send(self, message: str) -> None: ...
    def receive(self) -> None: ...


class QueueType(TypedDict):
    playerId: str
    socket: WebSocket


class GameRoomType(TypedDict):
    white: Optional[WebSocket]
    black: Optional[WebSocket]


Queue: list[QueueType] = []
PlayersInActiveGames: set[str] = set()
GameRooms: dict[str, GameRoomType] = {}
