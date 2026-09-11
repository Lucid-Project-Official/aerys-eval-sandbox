"""Platform status evidence — core components and project-state contract."""

from __future__ import annotations

import json
from pathlib import Path

from aerys_platform.core import verify_core_components
from aerys_platform.status import (
    PLATFORM_STATUS_READY,
    build_ready_platform_patch,
    is_platform_developed,
    is_platform_ready,
    read_platform_status,
)

ROOT = Path(__file__).resolve().parent.parent
STATE_PATH = ROOT / 'project-state.json'


def test_build_ready_platform_patch():
    patch = build_ready_platform_patch()
    assert patch == {'platform': {'status': 'ready', 'developed': True}}


def test_read_platform_status_from_state():
    state = {'platform': {'status': 'ready', 'developed': True}}
    assert read_platform_status(state) == PLATFORM_STATUS_READY


def test_is_platform_ready_true_when_ready():
    assert is_platform_ready({'platform': {'status': 'ready'}}) is True


def test_is_platform_ready_false_when_missing_or_none():
    assert is_platform_ready({'platform': {'status': None}}) is False
    assert is_platform_ready({}) is False
    assert is_platform_ready(None) is False


def test_is_platform_developed():
    assert is_platform_developed({'platform': {'developed': True}}) is True
    assert is_platform_developed({'platform': {'developed': False}}) is False


def test_verify_core_components():
    assert verify_core_components() is True


def test_project_state_platform_status_reaches_ready_target():
    state = json.loads(STATE_PATH.read_text(encoding='utf-8'))
    assert read_platform_status(state) == PLATFORM_STATUS_READY
    assert is_platform_ready(state) is True
    assert is_platform_developed(state) is True
