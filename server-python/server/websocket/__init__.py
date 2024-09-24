import json
from pprint import pprint

from flask import request
from flask_jwt_extended import decode_token
from flask_sock import Sock
from jwt import InvalidSignatureError
from pydantic import ValidationError

from server.websocket.handle_error import handle_error
from server.websocket.handle_get_game import handle_get_game
from server.websocket.handle_join_game import handle_join_game
from server.websocket.handle_move import handle_move
from server.websocket.request_message_types import RequestMessage, RequestMessageTypes

sock = Sock()


@sock.route("/")
def websocket(ws):
    token_bearer = request.headers.get("sec-websocket-protocol")
    if not token_bearer:
        handle_error("Missing token", ws)
        return

    try:
        decode_token(token_bearer.split(" ")[1])
    except InvalidSignatureError:
        handle_error("Invalid token", ws)
        return

    while True:
        received_message = ws.receive()

        try:
            request_json = json.loads(received_message)
        except json.JSONDecodeError:
            print(received_message)
            handle_error("Invalid JSON", ws)
            return

        try:
            message = RequestMessage(data=request_json).data
        except ValidationError as e:
            pprint(e)
            handle_error("Invalid payload", ws)
            return

        match message.type:
            case RequestMessageTypes.JOIN_GAME:
                handle_join_game(message, ws)
            case RequestMessageTypes.GET_GAME:
                handle_get_game(message.payload, ws)
            case RequestMessageTypes.MOVE:
                handle_move(message.payload, ws)
            case _:
                pprint(message)
