'use strict';

const { spawnSync } = require('child_process');
const assert = require('assert');
const path = require('path');

const SCRIPT = path.join(__dirname, '..', 'scripts', 'verify-contributing-guide.js');

function runVerifyGuide() {
  return spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
}

{
  const result = runVerifyGuide();
  assert.strictEqual(result.status, 0, result.stderr);
  assert.match(result.stdout, /CONTRIBUTING guide — verification OK/);
  assert.match(result.stdout, /"guide_structure\.points":3/);
}

console.log('All verify-contributing-guide tests passed');
