"""Aerys platform core — status and readiness helpers."""

from aerys_platform.core import verify_core_components
from aerys_platform.status import (
    PLATFORM_STATUS_READY,
    build_ready_platform_patch,
    is_platform_ready,
    read_platform_status,
)

__all__ = [
    'PLATFORM_STATUS_READY',
    'build_ready_platform_patch',
    'is_platform_ready',
    'read_platform_status',
    'verify_core_components',
]
