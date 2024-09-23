import json

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

            white_player = create_game_result["whitePlayer"]
            black_player = create_game_result["blackPlayer"]

            GameRooms[create_game_result["gameId"]] = {
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
                    "payload": {"gameId": create_game_result["gameId"]},
                }
            )

            ws.send(response)

            waiting_player["socket"].send(response)


#       if (!alreadyWaiting) {

#         if (waitingPlayer) {
#           PlayersInActiveGames.add(waitingPlayer.playerId)
#           PlayersInActiveGames.add(newPlayerId)
#           const createGameResult = await command_CreateGame(
#             [waitingPlayer.playerId, newPlayerId],
#             context
#           )

#           if (isFailure(createGameResult)) {
#             Queue.unshift(waitingPlayer)
#             Queue.push({
#               playerId: newPlayerId,
#               socket: ws,
#             })
#             PlayersInActiveGames.delete(waitingPlayer.playerId)
#             PlayersInActiveGames.delete(newPlayerId)
#             return ws.send(
#               JSON.stringify(
#                 makeErrorMessage(
#                   "Failed to create game",
#                   createGameResult.message
#                 )
#               )
#             )
#           }

#           const { gameId } = createGameResult.data
#           Games.set(gameId, {
#             white: waitingPlayer.socket,
#             black: ws,
#           })
#           const response = JSON.stringify(
#             makeJoinGameResponseMessage({
#               gameId,
#             })
#           )

#           ws.send(response)
#           waitingPlayer.socket.send(response)
#           return
#         }
#       }
#       return
#     })
