import json
import os
import threading
from datetime import datetime, timezone

DATA_DIR = "./data"
os.makedirs(DATA_DIR, exist_ok=True)


class JSONStore:
    def __init__(self, filename):
        self.path = os.path.join(DATA_DIR, filename)
        self._lock = threading.Lock()
        self._data = self._load()

    def _load(self):
        if os.path.exists(self.path):
            with open(self.path) as f:
                return json.load(f)
        return []

    def _save(self):
        with open(self.path, "w") as f:
            json.dump(self._data, f, default=str, indent=2)

    def all(self):
        with self._lock:
            return list(self._data)

    def get(self, id):
        with self._lock:
            return next((x for x in self._data if x["id"] == id), None)

    def insert(self, item):
        with self._lock:
            new_id = max((x["id"] for x in self._data), default=0) + 1
            item["id"] = new_id
            item["created_at"] = datetime.now(timezone.utc).isoformat()
            self._data.append(item)
            self._save()
            return dict(item)

    def update(self, id, updates):
        with self._lock:
            item = next((x for x in self._data if x["id"] == id), None)
            if item:
                item.update(updates)
                self._save()
                return dict(item)
            return None

    def delete(self, id):
        with self._lock:
            self._data = [x for x in self._data if x["id"] != id]
            self._save()

    def filter(self, **kwargs):
        with self._lock:
            result = self._data
            for key, value in kwargs.items():
                result = [x for x in result if x.get(key) == value]
            return list(result)


assistants_store = JSONStore("assistants.json")
documents_store = JSONStore("documents.json")
conversations_store = JSONStore("conversations.json")
messages_store = JSONStore("messages.json")
