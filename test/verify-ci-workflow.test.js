'use strict';

const { spawnSync } = require('child_process');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const SCRIPT = path.join(__dirname, '..', 'scripts', 'verify-ci-workflow.js');
const WORKFLOW = path.join(__dirname, '..', '.github', 'workflows', 'ci.yml');

function runVerifyCiWorkflow() {
  return spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
}

// Current workflow passes validation.
{
  const result = runVerifyCiWorkflow();
  assert.strictEqual(result.status, 0, result.stderr);
  assert.match(result.stdout, /CI workflow verification complete/);
}

// Missing verify-ci step should fail.
{
  const original = fs.readFileSync(WORKFLOW, 'utf8');
  const tampered = original.replace(
    'node scripts/verify-ci-workflow.js',
    'node scripts/verify-ci-workflow-disabled.js',
  );
  fs.writeFileSync(WORKFLOW, tampered);
  try {
    const result = runVerifyCiWorkflow();
    assert.notStrictEqual(result.status, 0);
    assert.match(result.stderr + result.stdout, /missing required step/i);
  } finally {
    fs.writeFileSync(WORKFLOW, original);
  }
}

console.log('All verify-ci-workflow tests passed');
