'use strict';

const { spawnSync } = require('child_process');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts', 'verify-platform-developed.js');
const STATE_PATH = path.join(ROOT, 'project-state.json');

function runVerify() {
  return spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
}

{
  const result = runVerify();
  assert.strictEqual(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Platform developed — verification OK/);
  assert.match(result.stdout, /platform\.developed = true/);
  assert.match(result.stdout, /architecture\.status = ready/);
  assert.match(result.stdout, /METRICS:/);
}

{
  const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  assert.strictEqual(state.platform.developed, true);
  assert.strictEqual(state.platform.status, 'ready');
  assert.strictEqual(state.architecture.status, 'ready');
  assert.ok(state.tests.passed >= 1);
  assert.ok(
    state.completed_work.some((entry) => entry.includes('platform.developed')),
  );
}

console.log('All verify-platform-developed tests passed');
