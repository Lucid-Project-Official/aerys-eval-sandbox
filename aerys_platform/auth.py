"""Authentication service for the Aerys platform."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping


@dataclass(frozen=True)
class Token:
    subject: str
    scopes: tuple[str, ...]


class AuthService:
    """Minimal token-based authentication for platform API access."""

    def __init__(self, credentials: Mapping[str, str] | None = None) -> None:
        self._credentials = dict(credentials or {})

    def register(self, username: str, password: str) -> None:
        if not username or not password:
            raise ValueError("username and password are required")
        self._credentials[username] = password

    def authenticate(self, username: str, password: str) -> Token:
        expected = self._credentials.get(username)
        if expected is None or expected != password:
            raise PermissionError("invalid credentials")
        return Token(subject=username, scopes=("read", "write"))

    def authorize(self, token: Token, scope: str) -> bool:
        return scope in token.scopes
