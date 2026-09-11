#!/usr/bin/env python3
"""Deployment stage gate: requires platform.developed and platform.status ready."""

from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from aerys_platform.state import load_project_state  # noqa: E402
from aerys_platform.validation import PlatformNotReadyError, validate_platform_ready_for_next_stage  # noqa: E402


def main(state_path: Path | None = None) -> int:
    path = state_path or Path(os.environ.get('PROJECT_STATE_PATH', ROOT / 'project-state.json'))
    state = load_project_state(path)
    try:
        validate_platform_ready_for_next_stage(state)
    except PlatformNotReadyError as exc:
        print(f'::error::{exc}', file=sys.stderr)
        return 1

    platform = state['platform']
    print(f'✓ platform.developed = {platform["developed"]}')
    print(f'✓ platform.status = {platform["status"]}')
    print('\nPlatform deployment gate — ready for next stage.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
