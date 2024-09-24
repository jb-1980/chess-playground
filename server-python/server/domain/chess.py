import enum
from typing import TypedDict

import chess
import chess.pgn
from server.domain.game import Move


class GameStatus(enum.StrEnum): 
    NOT_STARTED = "NOT_STARTED"
    JOINING = "JOINING"
    PLAYING = "PLAYING"
    CHECKMATE = "CHECKMATE"
    STALEMATE = "STALEMATE"
    THREE_MOVE_REPETITION = "THREE_MOVE_REPETITION"
    INSUFFICIENT_MATERIAL = "INSUFFICIENT_MATERIAL"
    FIFTY_MOVE_RULE = "FIFTY_MOVE_RULE"
    RESIGNATION = "RESIGNATION"
    AGREED_DRAW = "AGREED_DRAW"
    TIMEOUT = "TIMEOUT"
    ABANDONED = "ABANDONED"


def validate_move(fen: str, move: str) -> bool:
    board = chess.Board()
    board.set_fen(fen)
    try:
        board.push_san(move)
    except ValueError:
        return False
    return True

def get_status(fen: str) -> GameStatus:
    """When a game is not terminated by a non-move event (e.g. timeout, resignation, etc.),
    then check if the game has resulted in a checkmate, stalemate, threefold repetition,
    insufficient material, or fifty-move rule."""
    chess_instance = chess.Board(fen)
    if chess_instance.is_game_over():
        if chess_instance.is_checkmate():
            return GameStatus.CHECKMATE
        if chess_instance.is_stalemate():
            return GameStatus.STALEMATE
        if chess_instance.can_claim_threefold_repetition():
            return GameStatus.THREE_MOVE_REPETITION
        if chess_instance.is_insufficient_material():
            return GameStatus.INSUFFICIENT_MATERIAL
        if chess_instance.is_fifty_moves():
            return GameStatus.FIFTY_MOVE_RULE
    return GameStatus.PLAYING


def create_pgn_from_moves(moves: list[Move], headers: dict[str, str]) -> str:
    game = chess.pgn.Game()
    for key, value in headers.items():
        game.headers[key] = value
    
    def get_move(move: Move) -> chess.Move:
        from_square = chess.SQUARE_NAMES.index(move["from"])
        to_square = chess.SQUARE_NAMES.index(move["to"])
        promotion_piece = None
        promotion = move.get("promotion")
        if promotion:
            match promotion:
                case "q":
                    promotion_piece = chess.QUEEN
                case "r":
                    promotion_piece = chess.ROOK
                case "b":
                    promotion_piece = chess.BISHOP
                case "n":
                    promotion_piece = chess.KNIGHT
                case "p":
                    promotion_piece = chess.PAWN
        return chess.Move(from_square, to_square, promotion_piece)
    
    node = game.add_variation(get_move(moves[0]))
    for move in moves[1:]:
        node = node.add_variation(get_move(move))
    
    return game.__str__()

class Ratings(TypedDict):
    whiteRating: int
    blackRating: int

def calculate_new_ratings(
    white_rating: int,
    black_rating: int,
    outcome: float,
    K: int = 32,
) -> Ratings:
    """calculate a new rating based on the elo rating system"""
    def get_probability(rating_1: int, rating_2: int) -> float:
        return 1 / (1 + 10 ** ((rating_2 - rating_1) / 400))

    white_probability = get_probability(white_rating, black_rating)
    black_probability = get_probability(black_rating, white_rating)
    new_white_rating = round(white_rating + K * (outcome - white_probability))
    new_black_rating = round(black_rating + K * (1 - outcome - black_probability))
    return {
        "whiteRating": new_white_rating,
        "blackRating": new_black_rating,
    }
    
    
    
    
