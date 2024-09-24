from enum import StrEnum


class ResponseMessageTypes(StrEnum):
    FETCH_GAME_RESPONSE = "fetch-game-response"
    JOIN_GAME_RESPONSE = "join-game-response"
    MOVE_RESPONSE = "move-response"
    ERROR = "error"
