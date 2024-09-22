from datetime import timedelta

from flask import jsonify, make_response, request
from flask_jwt_extended import create_access_token
from pydantic import BaseModel

from server.domain.user import make_user_dto
from server.models.user import UserMutator


def command_register_user(username: str, password: str) -> str:
    user = UserMutator().create_user(username, password)

    if type(user) is str:
        return "USER_ALREADY_EXISTS"
    elif isinstance(user, dict):
        parsedUser = make_user_dto(user)
        token = create_access_token(parsedUser, expires_delta=timedelta(days=1))
        return token

    return "FAILED_TO_REGISTER_USER"


class Payload(BaseModel):
    username: str
    password: str


def handle_register_user():
    try:
        payload = Payload(**request.json)
    except Exception:
        return make_response(jsonify({"message": "Invalid payload"}), 400)

    token = command_register_user(payload.username, payload.password)

    if token == "USER_ALREADY_EXISTS":
        return make_response(
            jsonify({"error": "username {} is taken".format(payload.username)}), 401
        )

    if token == "FAILED_TO_REGISTER_USER":
        return make_response(jsonify({"error": "Failed to register user"}), 500)

    return make_response(jsonify({"token": token}), 200)
