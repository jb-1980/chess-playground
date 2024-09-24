from datetime import timedelta

from flask import jsonify, make_response, request
from flask_jwt_extended import create_access_token
from pydantic import BaseModel
from result import Err, Ok, Result, is_ok

from server.models.user import UserLoader, make_user_dto


def command_login_user(username: str, password: str) -> Result[str, str]:
    user_loader = UserLoader()
    userResult = user_loader.get_user_by_username(username)
    if is_ok(userResult):
        user = userResult.ok_value
        if user is None:
            return Ok("BAD_CREDENTIALS")
        password_match = user_loader.validate_password(password, user["passwordHash"])

        if not password_match:
            return Ok("BAD_CREDENTIALS")

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
    return Err("DB_ERR_FAILED_TO_GET_USER")


class Payload(BaseModel):
    username: str
    password: str


def handle_login_user():
    try:
        payload = Payload(**request.json)
    except Exception:
        return make_response(jsonify({"message": "Invalid payload"}), 400)

    tokenResult = command_login_user(payload.username, payload.password)

    if is_ok(tokenResult):
        token = tokenResult.ok_value
        if token == "BAD_CREDENTIALS":
            return make_response(jsonify({"error": "Bad credentials"}), 401)

        return make_response(jsonify({"token": token}), 200)
    return make_response(jsonify({"error": "Failed to login"}), 500)
