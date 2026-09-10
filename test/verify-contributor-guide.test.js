'use strict';

const { spawnSync } = require('child_process');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts', 'verify-contributor-guide.js');
const STATE_PATH = path.join(ROOT, 'state', 'contributor-guide.json');

function runGate() {
  return spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
}

{
  const result = runGate();
  assert.strictEqual(result.status, 0, result.stderr);
  assert.match(result.stdout, /publish_date: 2026-09-10/);
  assert.match(result.stdout, /guide_published: true/);
  assert.match(result.stdout, /Contributor guide OK/);
}

{
  const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  assert.strictEqual(state.publish_date, '2026-09-10');
  assert.strictEqual(state.guide_published, true);
  assert.strictEqual(state.guide_structure.points, 3);
}

console.log('All verify-contributor-guide tests passed');
