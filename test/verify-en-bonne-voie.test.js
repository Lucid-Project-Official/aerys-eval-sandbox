'use strict';

const { spawnSync } = require('child_process');
const assert = require('assert');
const path = require('path');

const SCRIPT = path.join(__dirname, '..', 'scripts', 'verify-en-bonne-voie.js');

function runQualityGate() {
  return spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
}

{
  const result = runQualityGate();
  assert.strictEqual(result.status, 0, result.stderr);
  assert.match(result.stdout, /EN_BONNE_VOIE — quality gate OK/);
  assert.match(result.stdout, /Lint passed/);
  assert.match(result.stdout, /All unit tests passed/);
  assert.match(result.stdout, /Script test coverage/);
}

console.log('All verify-en-bonne-voie tests passed');
