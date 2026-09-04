'use strict';

const { spawnSync } = require('child_process');
const assert = require('assert');
const path = require('path');

const SCRIPT = path.join(__dirname, '..', 'scripts', 'audit-milan-ci.js');

function runAudit(env = {}) {
  return spawnSync(process.execPath, [SCRIPT], {
    env: { ...process.env, ...env },
    encoding: 'utf8',
  });
}

{
  const result = runAudit();
  assert.strictEqual(result.status, 0, result.stderr);
  assert.match(result.stdout, /Audit complete — CI gate OK/);
  assert.match(result.stdout, /validate-secrets passed/);
  assert.match(result.stdout, /verify-milan passed/);
  assert.match(result.stdout, /verify-ci passed/);
  assert.match(result.stdout, /Erreur E005/);
}

console.log('All audit-milan-ci tests passed');
