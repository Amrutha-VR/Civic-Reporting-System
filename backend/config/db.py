from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os

client = None
db = None

def connect_db():
    global client, db
    try:
        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/civic_alert")
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        client.admin.command("ping")
        db = client.get_database("civic_alert")
        print("✅ MongoDB connected successfully")

        # Indexes
        db.users.create_index("username", unique=True)
        db.users.create_index("email", unique=True)
        db.issues.create_index([("location", "2dsphere")])
        db.issues.create_index("status")
        db.issues.create_index("category")
        return db
    except ConnectionFailure as e:
        print(f"❌ MongoDB connection failed: {e}")
        raise

def get_db():
    global db
    if db is None:
        connect_db()
    return db
