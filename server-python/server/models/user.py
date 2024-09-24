from typing import Literal, TypedDict

import bcrypt
from bson import ObjectId
from flask_jwt_extended import create_access_token
from pymongo.collection import Collection
from result import Err, Ok, Result
from server.domain.user import User
from server.models import mongoDB
from server.models.game_types import GameUser
from server.models.user_types import UserDocument


class UserLoader:
    collection: Collection[UserDocument]

    def __init__(self) -> None:
        self.collection = mongoDB.users

    def get_user_by_username(
        self, username: str
    ) -> Result[UserDocument | None, Literal["DB_ERR_FAILED_TO_GET_USER"]]:
        try:
            return Ok(self.collection.find_one({"username": username}))
        except Exception:
            return Err("DB_ERR_FAILED_TO_GET_USER")

    def get_users_by_ids(
        self, ids: list[str]
    ) -> Result[list[UserDocument], Literal["DB_ERR_FAILED_TO_GET_USERS_BY_IDS"]]:
        try:
            users = self.collection.find({"_id": {"$in": [ObjectId(id) for id in ids]}})
            return Ok(users.to_list())
        except Exception:
            return Err("DB_ERR_FAILED_TO_GET_USERS_BY_IDS")

    def validate_password(self, password: str, password_hash: str) -> bool:
        return bcrypt.checkpw(password.encode(), password_hash.encode())

    def sign_token(self, user: UserDocument) -> str:
        return create_access_token(user)


class UserMutator:
    collection: Collection[UserDocument]

    def __init__(self) -> None:
        self.collection = mongoDB.users

    def create_user(
        self, username: str, password: str
    ) -> Result[
        UserDocument,
        Literal["USER_ALREADY_EXISTS"]
        | Literal["DB_ERR_FAILED_TO_CHECK_USER"]
        | Literal["DB_ERR_FAILED_TO_CREATE_USER"],
    ]:
        try:
            user = self.collection.find_one({"username": username})
            if user:
                return Err("USER_ALREADY_EXISTS")
        except Exception:
            return Err("DB_ERR_FAILED_TO_CHECK_USER")

        password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt(10)).decode()

        userDocument = UserDocument(
            username=username,
            passwordHash=password_hash,
            rating=1200,
            avatarUrl="",
        )
        try:
            result = self.collection.insert_one(userDocument)

            return Ok(
                {
                    "_id": result.inserted_id,
                    "username": username,
                    "passwordHash": password_hash,
                    "rating": 1200,
                    "avatarUrl": "",
                }
            )
        except Exception:
            return Err("DB_ERR_FAILED_TO_CREATE_USER")

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
    return User(
        id = str(user["_id"]),
        username = user["username"],
        rating = user["rating"],
        avatarUrl = user.get("avatarUrl"),
    )
