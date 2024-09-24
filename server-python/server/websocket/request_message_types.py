from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, Field
from server.domain.game import Move


class RequestMessageTypes(StrEnum):
    MOVE = "move"
    JOIN_GAME = "join-game"
    GET_GAME = "get-game"
    TIMEOUT = "timeout"
    RESIGN = "resign"
    DRAW = "draw"
    OFFER_DRAW = "offer-draw"
    ABANDON = "abandon"


class JoinGamePayload(BaseModel):
    playerId: str


class JoinGameMessage(BaseModel):
    type: Literal[RequestMessageTypes.JOIN_GAME]
    payload: JoinGamePayload


class GetGamePayload(BaseModel):
    gameId: str
    playerId: str


class GetGameMessage(BaseModel):
    type: Literal[RequestMessageTypes.GET_GAME]
    payload: GetGamePayload


class MovePayload(BaseModel):
    gameId: str
    playerId: str
    move: Move
    status: str
    pgn: str


class MoveMessage(BaseModel):
    type: Literal[RequestMessageTypes.MOVE]
    payload: MovePayload


class RequestMessage(BaseModel):
    data: JoinGameMessage | GetGameMessage | MoveMessage = Field(discriminator="type")
