'use strict';

const { spawnSync } = require('child_process');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts', 'verify-contributor-guide.js');
const STATE_PATH = path.join(ROOT, 'project-state.json');
const GUIDE_PATH = path.join(ROOT, 'CONTRIBUTING.md');

function runGate() {
  return spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
}

function withTempState(mutator, fn) {
  const originalState = fs.readFileSync(STATE_PATH, 'utf8');
  const originalGuide = fs.readFileSync(GUIDE_PATH, 'utf8');
  try {
    mutator();
    return fn();
  } finally {
    fs.writeFileSync(STATE_PATH, originalState);
    fs.writeFileSync(GUIDE_PATH, originalGuide);
  }
}

{
  const result = runGate();
  assert.strictEqual(result.status, 0, result.stderr);
  assert.match(result.stdout, /publish_date: 2026-09-10/);
  assert.match(result.stdout, /guide_published: true/);
  assert.match(result.stdout, /guide_structure\.points: 3/);
  assert.match(result.stdout, /Contributor guide OK/);
}

withTempState(
  () => {
    const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    state.publish_date = null;
    fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n');
  },
  () => {
    const result = runGate();
    assert.notStrictEqual(result.status, 0);
    assert.match(result.stderr, /publish_date mismatch/);
  },
);

withTempState(
  () => {
    const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    state.guide_published = false;
    fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n');
  },
  () => {
    const result = runGate();
    assert.notStrictEqual(result.status, 0);
    assert.match(result.stderr, /guide_published must be true/);
  },
);

console.log('All verify-contributor-guide tests passed');
