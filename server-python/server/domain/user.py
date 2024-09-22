from typing import Optional, TypedDict

from server.models.user import UserDocument

User = TypedDict(
    "User",
    {
        "id": str,
        "username": str,
        "rating": int,
        "avatarUrl": Optional[str],
    },
)


def make_user_dto(user: UserDocument) -> User:
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "rating": user["rating"],
        "avatarUrl": user.get("avatarUrl"),
    }
