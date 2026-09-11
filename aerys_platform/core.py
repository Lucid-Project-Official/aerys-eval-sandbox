"""Platform core component readiness checks."""

from __future__ import annotations

from aerys_platform.status import PLATFORM_STATUS_READY, build_ready_platform_patch


def verify_core_components() -> bool:
    """Verify platform core modules load and expose the ready status contract."""
    patch = build_ready_platform_patch()
    platform = patch.get('platform', {})
    return (
        platform.get('status') == PLATFORM_STATUS_READY
        and platform.get('developed') is True
    )
