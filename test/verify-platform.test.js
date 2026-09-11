'use strict';

const { spawnSync } = require('child_process');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts', 'verify-platform.js');
const STATE_PATH = path.join(ROOT, 'project-state.json');
const PATCH_PATH = path.join(ROOT, '.aerys', 'project_state_patch.json');

function runVerify() {
  return spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
}

{
  const result = runVerify();
  assert.strictEqual(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Platform — verification OK/);
  assert.match(result.stdout, /platform\.status = ready/);
  assert.match(result.stdout, /platform\.developed = true/);
  assert.match(result.stdout, /METRICS:/);
  assert.match(result.stdout, /GoalSuccess:/);
  assert.match(result.stdout, /"work_node_status":"COMPLETED"/);
}

{
  const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  assert.strictEqual(state.platform.status, 'ready');
  assert.strictEqual(state.platform.developed, true);
}

{
  const patch = JSON.parse(fs.readFileSync(PATCH_PATH, 'utf8'));
  assert.strictEqual(patch.platform.status, 'ready');
  assert.strictEqual(patch.platform.developed, true);
}

console.log('All verify-platform tests passed');
