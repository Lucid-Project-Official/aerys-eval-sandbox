#!/usr/bin/env node
'use strict';

/**
 * Verification gate for platform development objective:
 * - project-state.json reflects platform.status = "ready" and platform.developed = true
 * - Measurable evidence: CI workflow, npm scripts, test suites, package manifest
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'project-state.json');
const PACKAGE_PATH = path.join(ROOT, 'package.json');
const CI_WORKFLOW_PATH = path.join(ROOT, '.github', 'workflows', 'ci.yml');
const SCRIPTS_DIR = path.join(ROOT, 'scripts');
const TEST_DIR = path.join(ROOT, 'test');

const EXPECTED_STATUS = 'ready';
const MIN_NPM_SCRIPTS = 5;
const MIN_TEST_SUITES = 6;
const MIN_VERIFY_SCRIPTS = 4;

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`✓ ${message}`);
}

function loadProjectState() {
  if (!fs.existsSync(STATE_PATH)) {
    fail('project-state.json missing — cannot verify platform.status.');
  }

  let state;
  try {
    state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch (err) {
    fail(`project-state.json is invalid JSON: ${err.message}`);
  }

  return state;
}

function verifyProjectState(state) {
  const status = state?.platform?.status;
  if (status !== EXPECTED_STATUS) {
    fail(`platform.status expected "${EXPECTED_STATUS}", got ${JSON.stringify(status)}.`);
  }
  ok(`platform.status = "${status}"`);

  if (state.platform?.developed !== true) {
    fail(`platform.developed expected true, got ${JSON.stringify(state.platform?.developed)}.`);
  }
  ok('platform.developed = true');
}

function measurePlatformEvidence() {
  if (!fs.existsSync(PACKAGE_PATH)) {
    fail('package.json missing — platform not developed.');
  }

  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));
  } catch (err) {
    fail(`package.json is invalid JSON: ${err.message}`);
  }

  const npmScripts = Object.keys(pkg.scripts || {});
  if (npmScripts.length < MIN_NPM_SCRIPTS) {
    fail(`Expected at least ${MIN_NPM_SCRIPTS} npm scripts, found ${npmScripts.length}.`);
  }
  ok(`npm scripts: ${npmScripts.length} (min ${MIN_NPM_SCRIPTS}).`);

  if (!fs.existsSync(CI_WORKFLOW_PATH)) {
    fail('CI workflow missing at .github/workflows/ci.yml.');
  }
  ok('CI workflow present (.github/workflows/ci.yml).');

  const testSuites = fs.readdirSync(TEST_DIR).filter((name) => name.endsWith('.test.js'));
  if (testSuites.length < MIN_TEST_SUITES) {
    fail(`Expected at least ${MIN_TEST_SUITES} test suites, found ${testSuites.length}.`);
  }
  ok(`Test suites: ${testSuites.length} (min ${MIN_TEST_SUITES}).`);

  const verifyScripts = fs
    .readdirSync(SCRIPTS_DIR)
    .filter((name) => name.startsWith('verify-') && name.endsWith('.js'));
  if (verifyScripts.length < MIN_VERIFY_SCRIPTS) {
    fail(`Expected at least ${MIN_VERIFY_SCRIPTS} verify-* scripts, found ${verifyScripts.length}.`);
  }
  ok(`Verification scripts: ${verifyScripts.length} (min ${MIN_VERIFY_SCRIPTS}).`);

  return {
    npm_scripts: npmScripts.length,
    test_suites: testSuites.length,
    verify_scripts: verifyScripts.length,
    ci_workflow: true,
    package_name: pkg.name,
  };
}

function emitMetrics(state, evidence) {
  const metrics = {
    platform_status: state.platform.status,
    platform_developed: state.platform.developed,
    npm_scripts: evidence.npm_scripts,
    test_suites: evidence.test_suites,
    verify_scripts: evidence.verify_scripts,
    ci_workflow: evidence.ci_workflow,
    package_name: evidence.package_name,
  };
  console.log('\nMETRICS:', JSON.stringify(metrics));
}

function main() {
  console.log('Platform verification — state, structure, measurable evidence\n');

  const state = loadProjectState();
  verifyProjectState(state);

  const evidence = measurePlatformEvidence();

  if (state.platform.status !== EXPECTED_STATUS || state.platform.developed !== true) {
    fail('Platform state does not meet success criteria.');
  }
  ok('project-state.json platform fields match success criteria.');

  emitMetrics(state, evidence);

  console.log('\nPlatform — verification OK.');
}

main();
