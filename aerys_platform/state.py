"""Project state schema with platform.developed and platform.status."""

from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
STATE_PATH = ROOT / 'project-state.json'

DEFAULT_PLATFORM_STATE: dict[str, Any] = {
    'status': 'pending',
    'developed': False,
}


def default_project_state() -> dict[str, Any]:
    return {
        'publish_date': '2026-09-10',
        'guide_published': True,
        'guide_structure': {'points': 3},
        'guide_url': (
            'https://github.com/Lucid-Project-Official/aerys-eval-sandbox'
            '/blob/main/CONTRIBUTING.md'
        ),
        'platform': deepcopy(DEFAULT_PLATFORM_STATE),
    }


def normalize_project_state(state: dict[str, Any]) -> dict[str, Any]:
    """Ensure platform fields exist with defaults."""
    platform = state.setdefault('platform', {})
    if 'status' not in platform:
        platform['status'] = DEFAULT_PLATFORM_STATE['status']
    if 'developed' not in platform:
        platform['developed'] = DEFAULT_PLATFORM_STATE['developed']
    return state


def load_project_state(path: Path | None = None) -> dict[str, Any]:
    state_path = path or STATE_PATH
    if not state_path.exists():
        return default_project_state()

    with state_path.open(encoding='utf-8') as handle:
        state = json.load(handle)

    return normalize_project_state(state)


def save_project_state(state: dict[str, Any], path: Path | None = None) -> None:
    state_path = path or STATE_PATH
    normalized = normalize_project_state(state)
    with state_path.open('w', encoding='utf-8') as handle:
        json.dump(normalized, handle, indent=2)
        handle.write('\n')
