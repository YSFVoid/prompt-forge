import os
import json
import pickle
from datetime import datetime
from models import get_db

ARTIFACTS_DIR = os.getenv("ARTIFACTS_DIR", "./artifacts")


def save_artifact(name: str, data: dict, metadata: dict = None):
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)

    version = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"{name}_{version}.pkl"
    filepath = os.path.join(ARTIFACTS_DIR, filename)

    with open(filepath, "wb") as f:
        pickle.dump(data, f)

    record = {
        "name": name,
        "version": version,
        "createdAt": datetime.utcnow(),
        "metadata": metadata or {},
        "filePath": filepath,
    }

    db = get_db()
    if db is not None:
        db.artifacts.insert_one(record)

    return record


def load_latest_artifact(name: str):
    artifact_files = []
    if os.path.exists(ARTIFACTS_DIR):
        for f in os.listdir(ARTIFACTS_DIR):
            if f.startswith(name) and f.endswith(".pkl"):
                artifact_files.append(os.path.join(ARTIFACTS_DIR, f))

    if not artifact_files:
        return None

    artifact_files.sort(reverse=True)
    with open(artifact_files[0], "rb") as f:
        return pickle.load(f)
