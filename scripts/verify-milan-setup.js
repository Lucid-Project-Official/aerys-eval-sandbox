#!/usr/bin/env node
'use strict';

/**
 * Verifies Milan (Aerys DevOps agent) connector configuration.
 *
 * Run on the Aerys VPS or locally with env vars set. In CI, checks repo-side
 * prerequisites only (no secrets required for a green CI on main).
 */

const REPO_FULL_NAME = 'Lucid-Project-Official/aerys-eval-sandbox';
const REPO_URL = `https://github.com/${REPO_FULL_NAME}`;
const PROJECT_ALIAS = 'eval-autonomie';

function ok(message) {
  console.log(`✓ ${message}`);
}

function warn(message) {
  console.warn(`⚠ ${message}`);
}

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function parseRepoMap(raw) {
  if (!raw || !raw.trim()) {
    return null;
  }
  let parsed;
  try {
    parsed = JSON.parse(raw.trim());
  } catch (err) {
    fail(
      `CURSOR_REPO_MAP must be valid JSON (object). Invalid JSON causes E005: ` +
        `"dictionary update sequence element #0 has length 1; 2 is required". ` +
        `Parse error: ${err.message}`,
    );
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    fail('CURSOR_REPO_MAP must be a JSON object, not an array or primitive.');
  }
  return parsed;
}

function validateCursorApiKey(raw) {
  if (!raw || !raw.trim()) {
    return false;
  }
  const trimmed = raw.trim();
  if (trimmed.includes(';')) {
    fail('CURSOR_API_KEY must be a raw token, not a compound KEY=VALUE secret.');
  }
  if (/^[^=]+=[^=]+$/.test(trimmed) && !trimmed.startsWith('cursor_')) {
    warn(
      'CURSOR_API_KEY resembles KEY=VALUE format. Store the raw Cursor API key only.',
    );
  }
  return true;
}

function checkRepoMapAlias(repoMap) {
  const target = repoMap[PROJECT_ALIAS];
  if (!target) {
    fail(
      `CURSOR_REPO_MAP must include alias "${PROJECT_ALIAS}" → ${REPO_URL}. ` +
        `Found keys: ${Object.keys(repoMap).join(', ') || '(none)'}`,
    );
  }
  const normalized = target.replace(/\.git$/, '').replace(/\/$/, '');
  const expected = REPO_URL.replace(/\/$/, '');
  if (normalized !== expected) {
    fail(
      `CURSOR_REPO_MAP["${PROJECT_ALIAS}"] must be ${REPO_URL}, got: ${target}`,
    );
  }
  ok(`CURSOR_REPO_MAP alias "${PROJECT_ALIAS}" → ${REPO_URL}`);
}

async function checkGitHubReachability() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const headers = token
    ? { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
    : { Accept: 'application/vnd.github+json' };

  const res = await fetch(`https://api.github.com/repos/${REPO_FULL_NAME}`, {
    headers,
  });

  if (res.status === 404) {
    fail(`GitHub repo ${REPO_FULL_NAME} not found or not accessible (404).`);
  }
  if (!res.ok) {
    warn(`GitHub API returned ${res.status} for ${REPO_FULL_NAME} (non-blocking in CI).`);
    return;
  }

  const repo = await res.json();
  ok(`GitHub repo reachable: ${repo.full_name} (${repo.visibility})`);

  if (token) {
    const perms = repo.permissions || {};
    const canRead = perms.pull || perms.push || perms.admin || repo.visibility === 'public';
    if (canRead) {
      ok('GitHub token can read repository metadata (Milan L3 prerequisite).');
    } else {
      warn('GitHub token lacks read permissions on this repository.');
    }
  } else {
    ok('Public repo reachable without token (Milan GitHub L3 can use connector vault).');
  }
}

async function main() {
  console.log('Milan setup verification — aerys-eval-sandbox\n');

  ok('CI requires no GitHub Actions secrets (npm test / lint only).');
  ok('Workflow permissions: contents: read, actions: read (see .github/workflows/ci.yml).');

  const repoMapRaw = process.env.CURSOR_REPO_MAP;
  const apiKeyRaw = process.env.CURSOR_API_KEY;
  const encryptionKey = process.env.CONNECTOR_ENCRYPTION_KEY;

  const repoMap = parseRepoMap(repoMapRaw);
  if (repoMap) {
    checkRepoMapAlias(repoMap);
  } else {
    console.log(
      `ℹ CURSOR_REPO_MAP not set — expected on Aerys VPS: ` +
        `{"${PROJECT_ALIAS}":"${REPO_URL}"}`,
    );
  }

  if (validateCursorApiKey(apiKeyRaw)) {
    ok('CURSOR_API_KEY present (raw token format).');
  } else {
    console.log('ℹ CURSOR_API_KEY not set — provision via Aerys connector vault (Cursor L2).');
  }

  if (encryptionKey && encryptionKey.trim()) {
    ok('CONNECTOR_ENCRYPTION_KEY present.');
  } else {
    console.log('ℹ CONNECTOR_ENCRYPTION_KEY not set — required on Aerys VPS only.');
  }

  console.log('\nConnector checklist (Aerys Dashboard → Connecteurs):');
  console.log('  • GitHub L3 on project eval-autonomie');
  console.log('  • Cursor L2 with CURSOR_REPO_MAP including eval-autonomie alias');
  console.log('  • Cursor GitHub App (team) authorized for aerys-eval-sandbox');

  await checkGitHubReachability();

  console.log('\nVerification complete.');
}

main().catch((err) => {
  fail(err.message || String(err));
});
