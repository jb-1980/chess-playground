import json
from pprint import pprint

from flask_sock import Sock
from pydantic import ValidationError
from server.websocket.handle_error import handle_error
from server.websocket.handle_get_game import handle_get_game
from server.websocket.handle_join_game import handle_join_game
from server.websocket.handle_move import handle_move
from server.websocket.request_message_types import (RequestMessage,
                                                    RequestMessageTypes)

sock = Sock()


@sock.route("/")
def websocket(ws):
    while True:
        try:
            request = ws.receive()
            pprint({"request": request})
        except Exception as e:
            print("error: ", e)
            return handle_error("Invalid request", ws)
        try:
            request_json = json.loads(request)
        except json.JSONDecodeError:
            print(request)
            return handle_error("Invalid JSON", ws)
        try:
            data = RequestMessage(data=request_json)
        except ValidationError as e:
            pprint(e)
            return handle_error("Invalid payload", ws)

        message = data.data
        match message.type:
            case RequestMessageTypes.JOIN_GAME:
                handle_join_game(message, ws)
            case RequestMessageTypes.GET_GAME:
                handle_get_game(message.payload, ws)
            case RequestMessageTypes.MOVE:
                handle_move(message.payload, ws)
            case _:
                pprint(message)
