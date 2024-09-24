from pprint import pprint
from typing import Literal

from pydantic import BaseModel
from result import is_err, is_ok
from server.domain.game import Game
from server.models.game import GameDocument, GameLoader, make_game_dto
from server.websocket.domain import GameRooms, WebSocket
from server.websocket.handle_error import handle_error
from server.websocket.request_message_types import GetGamePayload
from server.websocket.response_message_types import ResponseMessageTypes


class GetGameResponse(BaseModel):
    type: Literal[ResponseMessageTypes.FETCH_GAME_RESPONSE]
    payload: Game


def make_game_found_response_message(game: GameDocument) -> GetGameResponse:
    return GetGameResponse(
        type=ResponseMessageTypes.FETCH_GAME_RESPONSE,
        payload=make_game_dto(game)
    )


def handle_get_game(payload: GetGamePayload, ws: WebSocket):
    game_id = payload.gameId
    player_id = payload.playerId
    game_sockets = GameRooms.get(game_id)

    white_socket = game_sockets.get("white") if game_sockets else None
    black_socket = game_sockets.get("black") if game_sockets else None

    game_result = GameLoader().get_game_by_id(game_id)
    if is_err(game_result):
        return handle_error("Failed to get game", ws)

    if is_ok(game_result):
        game = game_result.ok_value
        if not game:
            return handle_error("Game not found", ws)

        response = make_game_found_response_message(game)
        stringified_response = response.model_dump_json()
        
        if response.payload.whitePlayer.id == player_id:
            white_socket = ws
        elif response.payload.blackPlayer.id == player_id:
            black_socket = ws

        

        GameRooms[game_id] = {
            "white": white_socket,
            "black": black_socket
        }
        if white_socket:
            white_socket.send(stringified_response)
        if black_socket:
            black_socket.send(stringified_response)
        return



