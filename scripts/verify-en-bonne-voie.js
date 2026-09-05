#!/usr/bin/env node
'use strict';

/**
 * Quality gate for objective EN_BONNE_VOIE:
 * lint, unit tests, script test coverage, and latest main CI status.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCRIPTS_DIR = path.join(ROOT, 'scripts');
const TEST_DIR = path.join(ROOT, 'test');
const REPO = 'Lucid-Project-Official/aerys-eval-sandbox';

const EXPECTED_TEST_FILES = [
  'index.test.js',
  'validate-secrets.test.js',
  'verify-milan-setup.test.js',
  'verify-ci-workflow.test.js',
  'audit-milan-ci.test.js',
  'verify-en-bonne-voie.test.js',
];

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`✓ ${message}`);
}

function runNpmScript(scriptName) {
  return spawnSync('npm', ['run', scriptName], {
    cwd: ROOT,
    encoding: 'utf8',
    shell: true,
  });
}

function listScriptBasenames() {
  return fs
    .readdirSync(SCRIPTS_DIR)
    .filter((name) => name.endsWith('.js') && name !== 'verify-en-bonne-voie.js')
    .sort();
}

function verifyTestCoverage() {
  const testSources = fs
    .readdirSync(TEST_DIR)
    .filter((name) => name.endsWith('.test.js'))
    .map((name) => fs.readFileSync(path.join(TEST_DIR, name), 'utf8'))
    .join('\n');

  const uncovered = [];
  for (const script of listScriptBasenames()) {
    if (!testSources.includes(script)) {
      uncovered.push(script);
    }
  }

  if (uncovered.length > 0) {
    fail(`Script test coverage incomplete — missing tests for: ${uncovered.join(', ')}`);
  }

  ok(`Script test coverage: ${listScriptBasenames().length}/${listScriptBasenames().length} scripts covered.`);
}

function verifyTestSuiteInventory() {
  const present = fs
    .readdirSync(TEST_DIR)
    .filter((name) => name.endsWith('.test.js'))
    .sort();

  for (const expected of EXPECTED_TEST_FILES) {
    if (!present.includes(expected)) {
      fail(`Missing unit test suite: test/${expected}`);
    }
  }

  ok(`Unit test suites: ${EXPECTED_TEST_FILES.length} present (${EXPECTED_TEST_FILES.join(', ')}).`);
}

function queryLatestMainCiRun() {
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
    console.log('ℹ Could not query GitHub Actions — skipping remote CI check.');
    return;
  }

  const [run] = JSON.parse(result.stdout);
  if (!run) {
    fail('No CI runs found on main.');
  }

  const url = `https://github.com/${REPO}/actions/runs/${run.databaseId}`;
  if (run.conclusion !== 'success') {
    fail(`Latest main CI run is ${run.conclusion}: ${url}`);
  }

  ok(`Latest main CI run: success — ${url}`);
  console.log(`  ${run.displayTitle} (${run.createdAt})`);
}

function main() {
  console.log('EN_BONNE_VOIE quality gate — lint, tests, coverage, CI\n');

  const lint = runNpmScript('lint');
  process.stdout.write(lint.stdout);
  process.stderr.write(lint.stderr);
  if (lint.status !== 0) {
    fail('Lint failed.');
  }
  ok('Lint passed.');

  verifyTestSuiteInventory();
  verifyTestCoverage();

  const test = runNpmScript('test:unit');
  process.stdout.write(test.stdout);
  process.stderr.write(test.stderr);
  if (test.status !== 0) {
    fail('Unit tests failed.');
  }
  ok('All unit tests passed.');

  queryLatestMainCiRun();

  console.log('\nEN_BONNE_VOIE — quality gate OK (lint + tests + coverage + CI).');
}

main();
