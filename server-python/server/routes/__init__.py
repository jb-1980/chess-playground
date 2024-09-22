from flask import Blueprint

from server.commands.login import handle_login_user
from server.commands.register_user import handle_register_user
from server.routes.commands import commands
from server.routes.queries import queries

routes = Blueprint("root", __name__, url_prefix="/")
api = Blueprint("api", __name__, url_prefix="/api")
routes.register_blueprint(
    api,
)
api.register_blueprint(
    queries,
)
api.register_blueprint(
    commands,
)


@routes.route("/login", methods=["POST"])
def login():
    return handle_login_user()


@routes.route("/register-user", methods=["POST"])
def register_user():
    return handle_register_user()
