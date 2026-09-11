"""Platform status helpers — ProjectState evidence for platform readiness."""

from __future__ import annotations

from typing import Any

PLATFORM_STATUS_READY = 'ready'


def read_platform_status(state: dict[str, Any] | None) -> str | None:
    """Return platform.status from project state (or None)."""
    if not isinstance(state, dict):
        return None
    platform = state.get('platform')
    if isinstance(platform, dict):
        status = platform.get('status')
        return str(status) if status is not None else None
    return None


def is_platform_developed(state: dict[str, Any] | None) -> bool:
    """Return whether platform.developed is true in project state."""
    if not isinstance(state, dict):
        return False
    platform = state.get('platform')
    if isinstance(platform, dict):
        return platform.get('developed') is True
    return False


def is_platform_ready(state: dict[str, Any] | None) -> bool:
    """Return True when platform.status equals the ready target."""
    return read_platform_status(state) == PLATFORM_STATUS_READY


def build_ready_platform_patch(*, developed: bool = True) -> dict[str, Any]:
    """Canonical patch when the platform development goal is satisfied."""
    return {
        'platform': {
            'status': PLATFORM_STATUS_READY,
            'developed': developed,
        },
    }
