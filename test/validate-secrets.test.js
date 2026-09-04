'use strict';

const { spawnSync } = require('child_process');
const assert = require('assert');
const path = require('path');

const SCRIPT = path.join(__dirname, '..', 'scripts', 'validate-secrets.js');

function runValidateSecrets(env) {
  return spawnSync(process.execPath, [SCRIPT], {
    env: { ...process.env, ...env },
    encoding: 'utf8',
  });
}

const validRepoMap =
  '{"eval-autonomie":"https://github.com/Lucid-Project-Official/aerys-eval-sandbox"}';

// No secrets configured — skip validation (CI default).
{
  const result = runValidateSecrets({
    CURSOR_REPO_MAP: '',
    CURSOR_API_KEY: '',
    AERYS_CONNECTOR_CONFIG: '',
  });
  assert.strictEqual(result.status, 0, result.stderr);
  assert.match(result.stdout, /skipping validation/i);
}

// E005: raw URL instead of JSON object for CURSOR_REPO_MAP.
{
  const result = runValidateSecrets({
    CURSOR_REPO_MAP: 'https://github.com/Lucid-Project-Official/aerys-eval-sandbox',
  });
  assert.notStrictEqual(result.status, 0);
  assert.match(
    result.stderr + result.stdout,
    /dictionary update sequence element #0 has length 1; 2 is required/,
  );
}

// E005: KEY=VALUE segment missing '=' in AERYS_CONNECTOR_CONFIG.
{
  const result = runValidateSecrets({
    AERYS_CONNECTOR_CONFIG: 'invalid',
  });
  assert.notStrictEqual(result.status, 0);
  assert.match(
    result.stderr + result.stdout,
    /dictionary update sequence element #0 has length 1; 2 is required/,
  );
}

// E005: KEY=VALUE format instead of raw token for CURSOR_API_KEY.
{
  const result = runValidateSecrets({
    CURSOR_API_KEY: 'CURSOR_API_KEY=cursor_test_key_123',
  });
  assert.notStrictEqual(result.status, 0);
  assert.match(result.stderr + result.stdout, /must be a raw API key, not KEY=VALUE format/);
  assert.match(
    result.stderr + result.stdout,
    /dictionary update sequence element #0 has length 1; 2 is required|E005/,
  );
}

// Valid formats accepted.
{
  const result = runValidateSecrets({
    CURSOR_REPO_MAP: validRepoMap,
    CURSOR_API_KEY: 'cursor_test_key_123',
    AERYS_CONNECTOR_CONFIG: 'GITHUB_OWNER=Lucid-Project-Official;GITHUB_REPO=aerys-eval-sandbox',
  });
  assert.strictEqual(result.status, 0, result.stderr);
  assert.match(result.stdout, /Validated 3 optional secret\(s\) successfully/);
}

console.log('All validate-secrets tests passed');
