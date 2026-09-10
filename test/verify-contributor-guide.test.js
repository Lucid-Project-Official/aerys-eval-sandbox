'use strict';

const { spawnSync } = require('child_process');
const assert = require('assert');
const path = require('path');

const SCRIPT = path.join(__dirname, '..', 'scripts', 'verify-contributor-guide.js');

function runGate() {
  return spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
}

{
  const result = runGate();
  assert.strictEqual(result.status, 0, result.stderr);
  assert.match(result.stdout, /Contributor guide — publication gate OK/);
  assert.match(result.stdout, /guide_structure\.points = 3/);
  assert.match(result.stdout, /guide_published = true/);
}

console.log('All verify-contributor-guide tests passed');
