import os

from dotenv import load_dotenv

load_dotenv()

MONGO_CONNECTION_STRING = os.getenv("MONGO_CONNECTION_STRING")
JWT_SECRET = os.getenv("JWT_SECRET")
WHITELIST_URLS = os.getenv("WHITELIST_URLS")
