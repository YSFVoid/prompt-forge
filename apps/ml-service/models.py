import os
from pymongo import MongoClient
from datetime import datetime

_client = None


def get_db():
    global _client
    if _client is None:
        uri = os.getenv("MONGODB_URI", "")
        if not uri:
            return None
        _client = MongoClient(uri)
    return _client.get_default_database()


def get_messages(limit=5000):
    db = get_db()
    if db is None:
        return []
    return list(db.messages.find({}).sort("createdAt", -1).limit(limit))


def get_feedback(limit=5000):
    db = get_db()
    if db is None:
        return []
    return list(db.feedbacks.find({}).sort("createdAt", -1).limit(limit))


def get_conversations(limit=1000):
    db = get_db()
    if db is None:
        return []
    return list(db.conversations.find({}).sort("updatedAt", -1).limit(limit))
