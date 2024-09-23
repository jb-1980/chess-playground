from enum import StrEnum
from typing import Literal, Optional, TypedDict


class RequestMessageTypes(StrEnum):
    MOVE = "move"
    JOIN_GAME = "join-game"
    GET_GAME = "get-game"
    TIMEOUT = "timeout"
    RESIGN = "resign"
    DRAW = "draw"
    OFFER_DRAW = "offer-draw"
    ABANDON = "abandon"


class JoinGamePayload(TypedDict):
    playerId: str


class JoinGameMessage(TypedDict):
    type: Literal[RequestMessageTypes.JOIN_GAME]
    payload: JoinGamePayload


class GetGamePayload(TypedDict):
    gameId: str
    playerId: str


class GetGameMessage(TypedDict):
    type: Literal[RequestMessageTypes.GET_GAME]
    payload: GetGamePayload


class MovePayload(TypedDict):
    gameId: str
    playerId: str
    move: dict
    status: str
    pgn: str


class MoveMessage(TypedDict):
    type: Literal[RequestMessageTypes.MOVE]
    payload: MovePayload


class ErrorMessagePayload(TypedDict):
    message: str


class ErrorMessage(TypedDict):
    type: Literal["error"]
    payload: ErrorMessagePayload


def make_error_message(message: str) -> ErrorMessage:
    return {
        "type": "error",
        "payload": {
            "message": message,
        },
    }


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
