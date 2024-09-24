from typing import Literal

from pydantic import BaseModel
from result import is_err, is_ok
from server.domain.chess import (GameStatus, create_pgn_from_moves, get_status,
                                 validate_move)
from server.models.game import GameLoader, GameMutator
from server.models.user import UserMutator
from server.websocket.domain import GameRooms, PlayersInActiveGames, WebSocket
from server.websocket.handle_error import handle_error
from server.websocket.request_message_types import MovePayload
from server.websocket.response_message_types import ResponseMessageTypes


class MoveResponsePayload(BaseModel):
    fen: str
    pgn: str

class MoveResponseMessage(BaseModel):
    type: Literal[ResponseMessageTypes.MOVE_RESPONSE]
    payload: MoveResponsePayload


def make_move_response_message(fen: str, pgn: str) -> MoveResponseMessage:
    return MoveResponseMessage(
        type=ResponseMessageTypes.MOVE_RESPONSE,
        payload=MoveResponsePayload(fen=fen, pgn=pgn)
    )

def handle_move(payload: MovePayload, ws: WebSocket):
  game_id = payload.gameId
  player_id = payload.playerId
  move = payload.move
  is_valid_move = validate_move(move["before"], move["san"])
  if not is_valid_move:
    return handle_error("Invalid move", ws)
  
  status = get_status(move["after"])
  game_result = GameLoader().get_game_by_id(game_id)
  if is_err(game_result):
    return handle_error("Failed to get game", ws)

  if is_ok(game_result):
    game = game_result.ok_value
    if not game:
      return handle_error("Game not found", ws)

    headers = {
      "Event": "Live Chess",
      "Site": "chess-app",
      "White": game["whitePlayer"]["username"],
      "Black": game["blackPlayer"]["username"],
      "UTCDate": game["createdAt"].isoformat().split("T")[0],
      "UTCTime": game["createdAt"].isoformat().split("T")[1].split(".")[0],
      "WhiteElo": str(game["whitePlayer"]["rating"]),
      "BlackElo": str(game["blackPlayer"]["rating"]),
      "Result": "*"
    }
    if status == GameStatus.CHECKMATE:
      headers["Result"] = "1-0" if move["color"] == "w" else "0-1"
    elif status == GameStatus.STALEMATE:
      headers["Result"] = "1/2-1/2"
    
    moves = game["moves"]
    moves.append(move)
    pgn = create_pgn_from_moves(moves, headers)

    add_move_result = GameMutator().add_move_to_game(game_id, move, status, pgn)
    if is_err(add_move_result):
      return handle_error("Failed to add move to game", ws)

    white_player_id = str(game["whitePlayer"]["_id"])
    black_player_id = str(game["blackPlayer"]["_id"])
    other_player = "black" if white_player_id == player_id else "white"

    game_sockets = GameRooms.get(game_id)
    white_socket = game_sockets.get("white") if game_sockets else None
    black_socket = game_sockets.get("black") if game_sockets else None
    
    if white_player_id == player_id:
            white_socket = ws
    elif black_player_id == player_id:
            black_socket = ws

    game_over_outcomes = [
      GameStatus.CHECKMATE,
      GameStatus.STALEMATE,
      GameStatus.THREE_MOVE_REPETITION,
      GameStatus.INSUFFICIENT_MATERIAL,
      GameStatus.FIFTY_MOVE_RULE,
    ]
    if status in game_over_outcomes:
      new_ratings = {
        "whiteRating": game["whitePlayer"]["rating"],
        "blackRating": game["blackPlayer"]["rating"]
      }
      winner = move["color"] if status == GameStatus.CHECKMATE else None
      draw = status != GameStatus.CHECKMATE
      
      white_wins = move["color"] == "w"
      if status == GameStatus.CHECKMATE:
        new_ratings["whiteRating"] = game["outcomes"]["whiteWins"]["whiteRating"] if white_wins else game["outcomes"]["blackWins"]["whiteRating"]
        new_ratings["blackRating"] = game["outcomes"]["whiteWins"]["blackRating"] if white_wins else game["outcomes"]["blackWins"]["blackRating"]
      else:
        new_ratings["whiteRating"] = game["outcomes"]["draw"]["whiteRating"]
        new_ratings["blackRating"] = game["outcomes"]["draw"]["blackRating"]
      
      GameMutator().set_outcome(game_id, winner, draw)
      UserMutator().update_user_rating(white_player_id, new_ratings["whiteRating"])
      UserMutator().update_user_rating(black_player_id, new_ratings["blackRating"])

      PlayersInActiveGames.discard(white_player_id)
      PlayersInActiveGames.discard(black_player_id) 
      
      GameRooms.pop(game_id)

  response = make_move_response_message(move["after"], pgn)

  if other_player == "white" and white_socket:
      white_socket.send(response.model_dump_json())
  elif other_player == "black" and black_socket:
      black_socket.send(response.model_dump_json())














