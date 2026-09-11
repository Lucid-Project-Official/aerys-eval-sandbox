"""Tests for platform deployment validation hook."""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from aerys_platform.state import load_project_state, save_project_state  # noqa: E402
from aerys_platform.validation import PlatformNotReadyError, validate_platform_ready_for_next_stage  # noqa: E402


@pytest.fixture
def temp_state(tmp_path: Path) -> Path:
    state_path = tmp_path / 'project-state.json'
    base = load_project_state(ROOT / 'project-state.json')
    save_project_state(base, state_path)
    return state_path


def test_validation_blocks_when_developed_false(temp_state: Path):
    state = load_project_state(temp_state)
    state['platform'] = {'developed': False, 'status': 'ready'}
    save_project_state(state, temp_state)

    with pytest.raises(PlatformNotReadyError, match='platform.developed'):
        validate_platform_ready_for_next_stage(state)


def test_validation_blocks_when_status_not_ready(temp_state: Path):
    state = load_project_state(temp_state)
    state['platform'] = {'developed': True, 'status': 'pending'}
    save_project_state(state, temp_state)

    with pytest.raises(PlatformNotReadyError, match='platform.status'):
        validate_platform_ready_for_next_stage(state)


def test_validation_passes_when_ready_and_developed(temp_state: Path):
    state = load_project_state(temp_state)
    state['platform'] = {'developed': True, 'status': 'ready'}
    save_project_state(state, temp_state)

    validate_platform_ready_for_next_stage(state)


def test_validate_platform_deployment_script_blocks_when_false(temp_state: Path):
    state = load_project_state(temp_state)
    state['platform'] = {'developed': False, 'status': 'pending'}
    save_project_state(state, temp_state)

    env = {**os.environ, 'PYTHONPATH': str(ROOT), 'PROJECT_STATE_PATH': str(temp_state)}
    result = subprocess.run(
        [sys.executable, str(ROOT / 'scripts' / 'validate_platform_deployment.py')],
        cwd=ROOT,
        env=env,
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode != 0
    assert 'platform.developed' in result.stderr


def test_validate_platform_deployment_script_passes_when_ready(temp_state: Path):
    state = load_project_state(temp_state)
    state['platform'] = {'developed': True, 'status': 'ready'}
    save_project_state(state, temp_state)

    env = {**os.environ, 'PYTHONPATH': str(ROOT), 'PROJECT_STATE_PATH': str(temp_state)}
    result = subprocess.run(
        [sys.executable, str(ROOT / 'scripts' / 'validate_platform_deployment.py')],
        cwd=ROOT,
        env=env,
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode == 0, result.stderr
    assert 'platform.developed = True' in result.stdout
    assert 'ready for next stage' in result.stdout
