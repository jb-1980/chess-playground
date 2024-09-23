from typing import Optional, TypedDict

User = TypedDict(
    "User",
    {
        "id": str,
        "username": str,
        "rating": int,
        "avatarUrl": Optional[str],
    },
)
