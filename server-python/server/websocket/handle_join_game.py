import json

from result import is_ok

from server.commands.create_game import command_create_game
from server.websocket.domain import GameRooms, PlayersInActiveGames, Queue, WebSocket
from server.websocket.handle_error import handle_error
from server.websocket.request_message_types import JoinGameMessage


def handle_join_game(message: JoinGameMessage, ws: WebSocket) -> None:
    player_id = message.payload.playerId
    if player_id in PlayersInActiveGames:
        return handle_error("Player is already in an active game", ws)

    already_waiting = next(
        (player for player in Queue if player["playerId"] == player_id), None
    )
    if not already_waiting:
        if not Queue:
            Queue.append({"playerId": player_id, "socket": ws})
            return

        new_player_id = player_id
        waiting_player = Queue.pop(0)

        if waiting_player:
            PlayersInActiveGames.add(waiting_player["playerId"])
            PlayersInActiveGames.add(new_player_id)

            create_game_result = command_create_game(
                (waiting_player["playerId"], new_player_id)
            )

            if create_game_result.is_err():
                Queue.insert(0, waiting_player)
                Queue.append({"playerId": new_player_id, "socket": ws})
                PlayersInActiveGames.remove(waiting_player["playerId"])
                PlayersInActiveGames.remove(new_player_id)
                return handle_error("Failed to create game", ws)

            if is_ok(create_game_result):
                create_game_data = create_game_result.ok_value
                game_id = create_game_data["gameId"]
                white_player = create_game_data["whitePlayer"]
                black_player = create_game_data["blackPlayer"]

                GameRooms[game_id] = {
                    "white": waiting_player["socket"]
                    if waiting_player["playerId"] == white_player["id"]
                    else ws,
                    "black": waiting_player["socket"]
                    if waiting_player["playerId"] == black_player["id"]
                    else ws,
                }
                response = json.dumps(
                    {
                        "type": "join-game-response",
                        "payload": {"gameId": game_id},
                    }
                )

                ws.send(response)

                waiting_player["socket"].send(response)
