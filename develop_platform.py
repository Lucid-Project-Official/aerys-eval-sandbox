#!/usr/bin/env python3
"""Develop the Aerys platform: init modules, run tests, seed sample data."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from aerys_platform.core import initialize_core_modules, populate_sample_data  # noqa: E402
from aerys_platform.state import load_project_state, save_project_state  # noqa: E402


def run_unit_tests() -> None:
    result = subprocess.run(
        [sys.executable, '-m', 'pytest', 'tests/', '-q'],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        print(result.stdout)
        print(result.stderr, file=sys.stderr)
        raise RuntimeError('Unit tests failed during platform development.')


def mark_platform_developed(state_path: Path | None = None) -> dict:
    state = load_project_state(state_path)
    state['platform']['developed'] = True
    state['platform']['status'] = 'ready'
    save_project_state(state, state_path)
    return state


def develop_platform(state_path: Path | None = None) -> dict:
    print('Platform development — initialize core modules')
    initialize_core_modules()

    print('Platform development — run unit tests')
    run_unit_tests()

    print('Platform development — populate sample data')
    populate_sample_data()

    print('Platform development — mark platform.developed = true')
    state = mark_platform_developed(state_path)
    print('METRICS:', {'platform': state['platform']})
    return state


def main() -> int:
    try:
        develop_platform()
        print('\nPlatform development complete — platform.developed = true')
        return 0
    except Exception as exc:  # noqa: BLE001 - CLI entrypoint
        print(f'::error::{exc}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
