from typing import Optional

from pydantic import BaseModel


class User(BaseModel):
    id: str
    username: str
    rating: int
    avatarUrl: Optional[str]
