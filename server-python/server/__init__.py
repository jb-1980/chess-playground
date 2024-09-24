from config import JWT_SECRET, WHITELIST_URLS
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from server.routes import routes
from server.websocket import sock

if not JWT_SECRET:
    raise Exception("JWT_SECRET not set")

if not WHITELIST_URLS:
    raise Exception("WHITELIST_URLS not set")

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = JWT_SECRET
app.config["SOCK_SERVER_OPTIONS"] = {
    "subprotocols": ["Bearer"],
}
JWTManager(app)

CORS(app, origins=WHITELIST_URLS.split(","), supports_credentials=True)

app.register_blueprint(routes)
sock.init_app(app)
print(app.url_map)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
