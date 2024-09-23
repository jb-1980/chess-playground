from datetime import datetime

from bson import ObjectId
from pymongo.collection import Collection

from server.domain.chess import calculate_new_ratings
from server.domain.game import Game
from server.models import mongoDB
from server.models.game_types import GameDocument, GameUser
from server.models.user import make_user_dto
from server.models.user_types import UserDocument


class GameLoader:
    collection: Collection[GameDocument]

    def __init__(self) -> None:
        self.collection = mongoDB.games

    def get_games_for_player_id(self, playerId: str) -> list[GameDocument]:
        games = self.collection.find(
            {
                "$or": [
                    {"whitePlayer._id": ObjectId(playerId)},
                    {"blackPlayer._id": ObjectId(playerId)},
                ],
            }
        )
        return games.to_list()

    def get_game_by_id(self, gameId: str) -> GameDocument | None:
        return self.collection.find_one({"_id": ObjectId(gameId)})


def to_game_user_from_user_document(user: UserDocument) -> GameUser:
    return {
        "_id": user["_id"],
        "username": user["username"],
        "rating": user["rating"],
        "avatarUrl": user.get("avatarUrl", None),
    }


class GameMutator:
    collection: Collection[GameDocument]

    def __init__(self) -> None:
        self.collection = mongoDB.games

    def create_game(self, white_user: UserDocument, black_user: UserDocument) -> str:
        white_player = to_game_user_from_user_document(white_user)
        black_player = to_game_user_from_user_document(black_user)
        white_wins_outcome = calculate_new_ratings(
            white_player["rating"], black_player["rating"], 1
        )
        black_wins_outcome = calculate_new_ratings(
            white_player["rating"], black_player["rating"], 0
        )
        draw_outcome = calculate_new_ratings(
            white_player["rating"], black_player["rating"], 0.5
        )
        response = self.collection.insert_one(
            {
                "whitePlayer": white_player,
                "blackPlayer": black_player,
                "moves": [],
                "pgn": "",
                "status": "PLAYING",
                "createdAt": datetime.now(),
                "outcome": {
                    "winner": None,
                    "draw": False,
                },
                "outcomes": {
                    "whiteWins": white_wins_outcome,
                    "blackWins": black_wins_outcome,
                    "draw": draw_outcome,
                },
            }
        )
        return str(response.inserted_id)


#   public async addMoveToGame(args: {
#     gameId: string
#     move: Move
#     status: GameStatus
#     pgn: string
#   }): AsyncResult<boolean, "DB_ERROR_ADDING_MOVE_TO_GAME" | "INVALID_MOVE"> {
#     const { gameId, move, status, pgn } = args
#     try {
#       const { acknowledged } = await Games.updateOne(
#         { _id: new ObjectId(gameId) },
#         {
#           $push: {
#             moves: {
#               ...move,
#               createdAt: new Date(),
#             },
#           },
#           $set: { status, pgn },
#         },
#         {
#           ignoreUndefined: true,
#         }
#       )

#       return Result.Success(acknowledged)
#     } catch (error) {
#       console.error(error)
#       return Result.Fail("DB_ERROR_ADDING_MOVE_TO_GAME", error)
#     }
#   }

#   public async setOutcome(
#     gameId: string,
#     winner: string | null,
#     draw: boolean
#   ): AsyncResult<boolean, "DB_ERR_SET_OUTCOME"> {
#     try {
#       const { acknowledged } = await Games.updateOne(
#         { _id: new ObjectId(gameId) },
#         {
#           $set: {
#             outcome: {
#               winner,
#               draw,
#             },
#           },
#         }
#       )
#       return Result.Success(acknowledged)
#     } catch (error) {
#       console.error(error)
#       return Result.Fail("DB_ERR_SET_OUTCOME", error)
#     }
#   }
# }


def make_game_dto(game: GameDocument) -> Game:
    return Game(
        id=str(game["_id"]),
        moves=game["moves"],
        pgn=game["pgn"],
        whitePlayer=make_user_dto(game["whitePlayer"]),
        blackPlayer=make_user_dto(game["blackPlayer"]),
        status=game["status"],
    )
