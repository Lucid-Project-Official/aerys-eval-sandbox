"""HTTP-style API layer composing auth and data services."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from aerys_platform.auth import AuthService, Token
from aerys_platform.data import DataStore


@dataclass(frozen=True)
class APIResponse:
    status: int
    body: dict[str, Any]


class PlatformAPI:
    """Facade exposing authenticated CRUD operations over the data store."""

    def __init__(self, auth: AuthService | None = None, store: DataStore | None = None) -> None:
        self.auth = auth or AuthService()
        self.store = store or DataStore()

    def login(self, username: str, password: str) -> APIResponse:
        token = self.auth.authenticate(username, password)
        return APIResponse(status=200, body={"token": token.subject, "scopes": list(token.scopes)})

    def create_record(self, token: Token, key: str, payload: dict[str, Any]) -> APIResponse:
        if not self.auth.authorize(token, "write"):
            return APIResponse(status=403, body={"error": "forbidden"})
        record = self.store.put(key, payload)
        return APIResponse(status=201, body={"key": record.key, "payload": record.payload})

    def fetch_record(self, token: Token, key: str) -> APIResponse:
        if not self.auth.authorize(token, "read"):
            return APIResponse(status=403, body={"error": "forbidden"})
        record = self.store.get(key)
        if record is None:
            return APIResponse(status=404, body={"error": "not found"})
        return APIResponse(status=200, body={"key": record.key, "payload": record.payload})

    def list_records(self, token: Token) -> APIResponse:
        if not self.auth.authorize(token, "read"):
            return APIResponse(status=403, body={"error": "forbidden"})
        keys = self.store.list_keys()
        return APIResponse(status=200, body={"keys": keys, "count": len(keys)})
