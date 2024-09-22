from config import MONGO_CONNECTION_STRING
from pymongo import MongoClient

client: MongoClient = MongoClient(MONGO_CONNECTION_STRING)
mongoDB = client.get_default_database()
