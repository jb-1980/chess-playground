import json
from typing import Literal, TypedDict

from server.websocket.domain import WebSocket


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


def handle_error(message: str, ws: WebSocket) -> None:
    response = make_error_message(message)
    ws.send(json.dumps(response))
