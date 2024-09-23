import json
from pprint import pprint

from flask_sock import Sock

from server.websocket.handle_join_game import handle_join_game

sock = Sock()


@sock.route("/")
def websocket(ws):
    while True:
        data = ws.receive()
        message = json.loads(data)

        match message["type"]:
            case "join-game":
                handle_join_game(message, ws)

            case _:
                pprint(message)
