'use strict';

const { spawnSync } = require('child_process');
const assert = require('assert');
const path = require('path');

const SCRIPT = path.join(__dirname, '..', 'scripts', 'verify-contributor-guide.js');

function runVerify() {
  return spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
}

{
  const result = runVerify();
  assert.strictEqual(result.status, 0, result.stderr);
  assert.match(result.stdout, /Contributor guide — verification OK/);
  assert.match(result.stdout, /publish_date verified: 2026-09-10/);
  assert.match(result.stdout, /guide_published verified: true/);
  assert.match(result.stdout, /guide_structure\.points verified: 3/);
  assert.match(result.stdout, /AERYS_METRICS/);
}

console.log('All verify-contributor-guide tests passed');
