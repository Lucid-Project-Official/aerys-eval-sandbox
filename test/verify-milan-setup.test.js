'use strict';

const { spawnSync } = require('child_process');
const assert = require('assert');
const path = require('path');

const SCRIPT = path.join(__dirname, '..', 'scripts', 'verify-milan-setup.js');

function runVerifyMilan(env) {
  return spawnSync(process.execPath, [SCRIPT], {
    env: { ...process.env, ...env },
    encoding: 'utf8',
  });
}

const validRepoMap =
  '{"eval-autonomie":"https://github.com/Lucid-Project-Official/aerys-eval-sandbox"}';

// CI default — no VPS secrets required.
{
  const result = runVerifyMilan({
    CURSOR_REPO_MAP: '',
    CURSOR_API_KEY: '',
    CONNECTOR_ENCRYPTION_KEY: '',
  });
  assert.strictEqual(result.status, 0, result.stderr);
  assert.match(result.stdout, /Verification complete/);
}

// E005: raw URL instead of JSON object for CURSOR_REPO_MAP.
{
  const result = runVerifyMilan({
    CURSOR_REPO_MAP: 'https://github.com/Lucid-Project-Official/aerys-eval-sandbox',
  });
  assert.notStrictEqual(result.status, 0);
  assert.match(
    result.stderr + result.stdout,
    /dictionary update sequence element #0 has length 1; 2 is required/,
  );
}

// Valid VPS configuration accepted.
{
  const result = runVerifyMilan({
    CURSOR_REPO_MAP: validRepoMap,
    CURSOR_API_KEY: 'cursor_test_key_123',
    CONNECTOR_ENCRYPTION_KEY: 'test-encryption-key',
  });
  assert.strictEqual(result.status, 0, result.stderr);
  assert.match(result.stdout, /CURSOR_REPO_MAP alias "eval-autonomie"/);
  assert.match(result.stdout, /CURSOR_API_KEY present/);
  assert.match(result.stdout, /CONNECTOR_ENCRYPTION_KEY present/);
}

console.log('All verify-milan-setup tests passed');
