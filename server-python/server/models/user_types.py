from typing import NotRequired, TypedDict

from bson import ObjectId

UserDocument = TypedDict(
    "UserDocument",
    {
        "_id": NotRequired[ObjectId],
        "username": str,
        "passwordHash": str,
        "rating": int,
        "avatarUrl": str,
    },
)
