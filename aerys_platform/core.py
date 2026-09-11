"""Core platform modules initialized during development."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / 'aerys_platform' / 'data'


def initialize_core_modules() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def populate_sample_data() -> None:
    sample_file = DATA_DIR / 'sample.json'
    if not sample_file.exists():
        sample_file.write_text('{"modules": ["auth", "api", "storage"], "seeded": true}\n')
