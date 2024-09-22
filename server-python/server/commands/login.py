from datetime import timedelta

from flask import jsonify, make_response, request
from flask_jwt_extended import create_access_token
from pydantic import BaseModel

from server.domain.user import make_user_dto
from server.models.user import UserLoader


def command_login_user(username: str, password: str) -> str:
    user_loader = UserLoader()
    user = user_loader.get_user_by_username(username)
    if not user:
        return "BAD_CREDENTIALS"

    password_match = user_loader.validate_password(password, user["passwordHash"])

    if not password_match:
        return "BAD_CREDENTIALS"

    parsedUser = make_user_dto(user)
    additional_claims = {
        "id": parsedUser["id"],
        "username": parsedUser["username"],
        "rating": parsedUser["rating"],
        "sub": None,
    }
    token = create_access_token(
        parsedUser, expires_delta=timedelta(days=1), additional_claims=additional_claims
    )
    return token


class Payload(BaseModel):
    username: str
    password: str


def handle_login_user():
    try:
        payload = Payload(**request.json)
    except Exception:
        return make_response(jsonify({"message": "Invalid payload"}), 400)

    token = command_login_user(payload.username, payload.password)

    if token == "BAD_CREDENTIALS":
        return make_response(jsonify({"error": "Bad credentials"}), 401)

    return make_response(jsonify({"token": token}), 200)
