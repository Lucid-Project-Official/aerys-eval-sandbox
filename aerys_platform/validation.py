"""Validation hook before advancing to the next deployment stage."""

from __future__ import annotations

from typing import Any


class PlatformNotReadyError(Exception):
    """Raised when platform.developed or platform.status block deployment."""


def validate_platform_ready_for_next_stage(state: dict[str, Any]) -> None:
    platform = state.get('platform') or {}
    developed = platform.get('developed')
    status = platform.get('status')

    if developed is not True:
        raise PlatformNotReadyError(
            f'platform.developed must be true before next stage (got {developed!r}).',
        )

    if status != 'ready':
        raise PlatformNotReadyError(
            f'platform.status must be "ready" before next stage (got {status!r}).',
        )
