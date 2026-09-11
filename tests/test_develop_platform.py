"""Tests for develop_platform.py and platform state updates."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import develop_platform  # noqa: E402
from aerys_platform.core import DATA_DIR, initialize_core_modules, populate_sample_data  # noqa: E402
from aerys_platform.state import load_project_state, save_project_state  # noqa: E402


@pytest.fixture
def temp_state(tmp_path: Path) -> Path:
    state_path = tmp_path / 'project-state.json'
    base = load_project_state(ROOT / 'project-state.json')
    base['platform'] = {'status': 'pending', 'developed': False}
    save_project_state(base, state_path)
    return state_path


def test_default_platform_state_has_developed_false():
    state = load_project_state(ROOT / 'project-state.json')
    assert state['platform']['developed'] is False
    assert state['platform']['status'] == 'pending'


def test_initialize_core_modules_creates_data_dir(tmp_path, monkeypatch):
    monkeypatch.setattr('aerys_platform.core.DATA_DIR', tmp_path / 'data')
    initialize_core_modules()
    assert (tmp_path / 'data').is_dir()


def test_populate_sample_data_writes_seed(tmp_path, monkeypatch):
    data_dir = tmp_path / 'data'
    data_dir.mkdir()
    monkeypatch.setattr('aerys_platform.core.DATA_DIR', data_dir)
    populate_sample_data()
    sample = json.loads((data_dir / 'sample.json').read_text())
    assert sample['seeded'] is True
    assert 'auth' in sample['modules']


def test_mark_platform_developed_sets_true(temp_state: Path):
    state = develop_platform.mark_platform_developed(temp_state)
    assert state['platform']['developed'] is True
    assert state['platform']['status'] == 'ready'

    persisted = json.loads(temp_state.read_text())
    assert persisted['platform']['developed'] is True
    assert persisted['platform']['status'] == 'ready'


def test_develop_platform_sets_developed_true(temp_state: Path, monkeypatch):
    monkeypatch.setattr(develop_platform, 'run_unit_tests', lambda: None)
    data_dir = temp_state.parent / 'platform-data'
    monkeypatch.setattr('aerys_platform.core.DATA_DIR', data_dir)

    state = develop_platform.develop_platform(temp_state)
    assert state['platform']['developed'] is True
    assert state['platform']['status'] == 'ready'
    assert (data_dir / 'sample.json').exists()


def test_develop_platform_script_exits_zero(temp_state: Path, monkeypatch):
    monkeypatch.setattr(develop_platform, 'run_unit_tests', lambda: None)
    data_dir = temp_state.parent / 'script-data'
    monkeypatch.setattr('aerys_platform.core.DATA_DIR', data_dir)

    original_load = develop_platform.load_project_state

    def load_from_temp(path=None):
        return original_load(temp_state)

    monkeypatch.setattr(develop_platform, 'load_project_state', load_from_temp)

    def save_to_temp(state, path=None):
        save_project_state(state, temp_state)

    monkeypatch.setattr(develop_platform, 'save_project_state', save_to_temp)

    result = develop_platform.main()
    assert result == 0
    state = json.loads(temp_state.read_text())
    assert state['platform']['developed'] is True


def test_run_unit_tests_invokes_pytest():
    result = subprocess.run(
        [sys.executable, '-m', 'pytest', 'tests/test_platform_validation.py', '-q'],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode == 0, result.stdout + result.stderr
