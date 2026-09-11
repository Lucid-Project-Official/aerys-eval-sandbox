"""Unit and integration tests for the Aerys platform modules."""

from __future__ import annotations

import pytest

from aerys_platform import AuthService, DataStore, PlatformAPI, Token


class TestAuthService:
    def test_register_and_authenticate(self) -> None:
        auth = AuthService()
        auth.register("alice", "secret")
        token = auth.authenticate("alice", "secret")
        assert token.subject == "alice"
        assert auth.authorize(token, "read") is True

    def test_authenticate_rejects_invalid_password(self) -> None:
        auth = AuthService({"bob": "pass"})
        with pytest.raises(PermissionError):
            auth.authenticate("bob", "wrong")

    def test_register_requires_credentials(self) -> None:
        auth = AuthService()
        with pytest.raises(ValueError):
            auth.register("", "x")


class TestDataStore:
    def test_put_get_roundtrip(self) -> None:
        store = DataStore()
        store.put("item-1", {"value": 42})
        record = store.get("item-1")
        assert record is not None
        assert record.payload["value"] == 42

    def test_list_and_delete(self) -> None:
        store = DataStore()
        store.put("a", {"n": 1})
        store.put("b", {"n": 2})
        assert store.list_keys() == ["a", "b"]
        assert store.delete("a") is True
        assert store.get("a") is None

    def test_put_rejects_invalid_payload(self) -> None:
        store = DataStore()
        with pytest.raises(TypeError):
            store.put("k", "not-a-dict")  # type: ignore[arg-type]


class TestPlatformAPI:
    def _authenticated_api(self) -> tuple[PlatformAPI, Token]:
        api = PlatformAPI()
        api.auth.register("dev", "devpass")
        token = api.auth.authenticate("dev", "devpass")
        return api, token

    def test_login_success(self) -> None:
        api = PlatformAPI()
        api.auth.register("dev", "devpass")
        response = api.login("dev", "devpass")
        assert response.status == 200
        assert response.body["token"] == "dev"

    def test_create_and_fetch_record(self) -> None:
        api, token = self._authenticated_api()
        created = api.create_record(token, "mission-1", {"goal": "platform.developed"})
        assert created.status == 201
        fetched = api.fetch_record(token, "mission-1")
        assert fetched.status == 200
        assert fetched.body["payload"]["goal"] == "platform.developed"

    def test_fetch_missing_record_returns_404(self) -> None:
        api, token = self._authenticated_api()
        response = api.fetch_record(token, "missing")
        assert response.status == 404

    def test_list_records(self) -> None:
        api, token = self._authenticated_api()
        api.create_record(token, "x", {"a": 1})
        api.create_record(token, "y", {"b": 2})
        response = api.list_records(token)
        assert response.status == 200
        assert response.body["count"] == 2

    def test_integration_auth_data_api(self) -> None:
        """End-to-end: register → login → write → read → list."""
        api = PlatformAPI()
        api.auth.register("operator", "ops-key")
        login = api.login("operator", "ops-key")
        assert login.status == 200
        token = api.auth.authenticate("operator", "ops-key")
        api.create_record(token, "state", {"platform": {"developed": True}})
        listed = api.list_records(token)
        fetched = api.fetch_record(token, "state")
        assert listed.body["keys"] == ["state"]
        assert fetched.body["payload"]["platform"]["developed"] is True
