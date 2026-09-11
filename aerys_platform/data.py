"""Data handling layer for the Aerys platform."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class Record:
    key: str
    payload: dict[str, Any] = field(default_factory=dict)


class DataStore:
    """In-memory key-value store with basic validation."""

    def __init__(self) -> None:
        self._records: dict[str, Record] = {}

    def put(self, key: str, payload: dict[str, Any]) -> Record:
        if not key:
            raise ValueError("key is required")
        if not isinstance(payload, dict):
            raise TypeError("payload must be a dict")
        record = Record(key=key, payload=dict(payload))
        self._records[key] = record
        return record

    def get(self, key: str) -> Record | None:
        return self._records.get(key)

    def list_keys(self) -> list[str]:
        return sorted(self._records.keys())

    def delete(self, key: str) -> bool:
        return self._records.pop(key, None) is not None
