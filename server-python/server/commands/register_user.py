from datetime import timedelta

from flask import jsonify, make_response, request
from flask_jwt_extended import create_access_token
from pydantic import BaseModel
from result import Err, Ok, Result, is_err, is_ok

from server.models.user import UserMutator, make_user_dto


def command_register_user(username: str, password: str) -> Result[str, str]:
    userResult = UserMutator().create_user(username, password)

    if is_ok(userResult):
        user = userResult.ok_value
        parsed_user = make_user_dto(user)
        additional_claims = {
            "id": parsed_user.id,
            "username": parsed_user.username,
            "rating": parsed_user.rating,
        }
        token = create_access_token(
            parsed_user.id,
            expires_delta=timedelta(days=1),
            additional_claims=additional_claims,
        )
        return Ok(token)
    elif is_err(userResult):
        if userResult.err_value == "USER_ALREADY_EXISTS":
            return Err("USER_ALREADY_EXISTS")
        return Err("FAILED_TO_REGISTER_USER")
    return Err("FAILED_TO_REGISTER_USER")


class Payload(BaseModel):
    username: str
    password: str


def handle_register_user():
    try:
        payload = Payload(**request.json)
    except Exception:
        return make_response(jsonify({"message": "Invalid payload"}), 400)

    tokenResult = command_register_user(payload.username, payload.password)

    if is_err(tokenResult):
        token = tokenResult.err_value
        if token == "USER_ALREADY_EXISTS":
            return make_response(
                jsonify({"error": "username {} is taken".format(payload.username)}), 401
            )

        if token == "FAILED_TO_REGISTER_USER":
            return make_response(jsonify({"error": "Failed to register user"}), 500)

    token = tokenResult.ok_value
    return make_response(jsonify({"token": token}), 200)
