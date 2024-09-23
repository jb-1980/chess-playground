from typing import TypedDict

import bcrypt
from bson import ObjectId
from flask_jwt_extended import create_access_token
from pymongo.collection import Collection

from server.domain.user import User
from server.models import mongoDB
from server.models.game_types import GameUser
from server.models.user_types import UserDocument


class UserLoader:
    collection: Collection[UserDocument]

    def __init__(self) -> None:
        self.collection = mongoDB.users

    def get_user_by_username(self, username: str) -> UserDocument | None:
        return self.collection.find_one({"username": username})

    def get_users_by_ids(self, ids: list[str]) -> list[UserDocument]:
        users = self.collection.find({"_id": {"$in": [ObjectId(id) for id in ids]}})
        return users.to_list()

    def validate_password(self, password: str, password_hash: str) -> bool:
        return bcrypt.checkpw(password.encode(), password_hash.encode())

    def sign_token(self, user: UserDocument) -> str:
        return create_access_token(user)


class UserMutator:
    collection: Collection[UserDocument]

    def __init__(self) -> None:
        self.collection = mongoDB.users

    def create_user(self, username: str, password: str) -> UserDocument | str:
        user = self.collection.find_one({"username": username})
        if user:
            return "USER_ALREADY_EXISTS"

        password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt(10)).decode()

        userDocument = UserDocument(
            username=username,
            passwordHash=password_hash,
            rating=1200,
            avatarUrl="",
        )
        inserted_id = self.collection.insert_one(userDocument).inserted_id
        return {
            "_id": inserted_id,
            "username": username,
            "passwordHash": password_hash,
            "rating": 1200,
            "avatarUrl": "",
        }

    def update_user_rating(self, user_id: str, new_rating: int) -> bool:
        result = self.collection.update_one(
            {"_id": ObjectId(user_id)}, {"$set": {"rating": new_rating}}
        )
        return result.modified_count == 1


UserInput = TypedDict(
    "UserInput",
    {
        "_id": ObjectId,
        "username": str,
        "rating": int,
        "avatarUrl": str,
    },
)


def make_user_dto(user: UserDocument | UserInput | GameUser) -> User:
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "rating": user["rating"],
        "avatarUrl": user.get("avatarUrl"),
    }
