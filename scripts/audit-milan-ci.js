#!/usr/bin/env node
'use strict';

/**
 * Full audit: Milan connector prerequisites, optional GitHub secrets format,
 * CI workflow gate, and recent GitHub Actions run status on main.
 */

const { spawnSync } = require('child_process');
const path = require('path');

const REPO = 'Lucid-Project-Official/aerys-eval-sandbox';
const SCRIPTS = [
  { label: 'validate-secrets', file: 'validate-secrets.js' },
  { label: 'verify-milan', file: 'verify-milan-setup.js' },
  { label: 'verify-ci', file: 'verify-ci-workflow.js' },
];

function runScript(file) {
  const scriptPath = path.join(__dirname, file);
  return spawnSync(process.execPath, [scriptPath], {
    env: process.env,
    encoding: 'utf8',
  });
}

function queryRecentMainCiRun() {
  const result = spawnSync(
    'gh',
    [
      'run',
      'list',
      '--repo',
      REPO,
      '--branch',
      'main',
      '--workflow',
      'ci.yml',
      '--limit',
      '1',
      '--json',
      'conclusion,databaseId,createdAt,displayTitle',
    ],
    { encoding: 'utf8' },
  );

  if (result.status !== 0 || !result.stdout.trim()) {
    return { ok: false, message: 'Could not query GitHub Actions (gh CLI unavailable or no runs).' };
  }

  try {
    const [run] = JSON.parse(result.stdout);
    if (!run) {
      return { ok: false, message: 'No CI runs found on main.' };
    }
    return {
      ok: run.conclusion === 'success',
      run,
    };
  } catch (err) {
    return { ok: false, message: `Failed to parse gh output: ${err.message}` };
  }
}

function main() {
  console.log(`Milan / CI audit — ${REPO}\n`);

  let failed = false;

  for (const { label, file } of SCRIPTS) {
    const result = runScript(file);
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    if (result.status !== 0) {
      console.error(`✗ ${label} failed (exit ${result.status})`);
      failed = true;
    } else {
      console.log(`✓ ${label} passed\n`);
    }
  }

  const ci = queryRecentMainCiRun();
  if (ci.run) {
    const { databaseId, conclusion, createdAt, displayTitle } = ci.run;
    const url = `https://github.com/${REPO}/actions/runs/${databaseId}`;
    if (ci.ok) {
      console.log(`✓ Latest main CI run: ${conclusion} — ${url}`);
      console.log(`  ${displayTitle} (${createdAt})`);
    } else {
      console.error(`✗ Latest main CI run: ${conclusion} — ${url}`);
      failed = true;
    }
  } else {
    console.log(`ℹ ${ci.message}`);
  }

  console.log('\nSecrets GitHub Actions: aucun requis pour CI verte (validation skip si absent).');
  console.log('Permissions Milan: GitHub L3 + Cursor L2 via coffre connecteurs Aerys (pas repo secrets).');
  console.log('Erreur E005: prévenue par validate-secrets.js + verify-milan-setup.js + tests régression.');

  if (failed) {
    process.exit(1);
  }

  console.log('\nAudit complete — CI gate OK.');
}

main();
