#!/usr/bin/env node
'use strict';

/**
 * Verification gate for platform.developed objective:
 * - aerys_platform modules exist (auth, data, api)
 * - pytest suite passes
 * - project-state.json reflects platform.developed, architecture.status, tests metrics
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'project-state.json');
const PLATFORM_DIR = path.join(ROOT, 'aerys_platform');
const REQUIRED_MODULES = ['auth.py', 'data.py', 'api.py', '__init__.py'];

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`✓ ${message}`);
}

function loadProjectState() {
  if (!fs.existsSync(STATE_PATH)) {
    fail('project-state.json missing — cannot verify platform.developed.');
  }

  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch (err) {
    fail(`project-state.json is invalid JSON: ${err.message}`);
  }
}

function verifyPlatformModules() {
  if (!fs.existsSync(PLATFORM_DIR)) {
    fail('aerys_platform/ directory missing.');
  }

  for (const module of REQUIRED_MODULES) {
    const modulePath = path.join(PLATFORM_DIR, module);
    if (!fs.existsSync(modulePath)) {
      fail(`Missing platform module: aerys_platform/${module}`);
    }
  }

  ok(`Platform modules present: ${REQUIRED_MODULES.join(', ')}`);
}

function runPytest() {
  const pipInstall = spawnSync('pip', ['install', '-q', 'pytest'], {
    cwd: ROOT,
    encoding: 'utf8',
    shell: true,
  });

  if (pipInstall.status !== 0) {
    fail(`Failed to install pytest: ${pipInstall.stderr || pipInstall.stdout}`);
  }

  const result = spawnSync('python3', ['-m', 'pytest', 'tests/', '-v', '--tb=short'], {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, PYTHONPATH: ROOT },
  });

  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);

  if (result.status !== 0) {
    fail('pytest suite failed.');
  }

  const passedMatch = result.stdout.match(/(\d+) passed/);
  const passed = passedMatch ? Number(passedMatch[1]) : 0;
  ok(`pytest: ${passed} tests passed`);
  return { passed, failed: 0 };
}

function verifyProjectState(state, testMetrics) {
  const developed = state?.platform?.developed;
  if (developed !== true) {
    fail(`platform.developed expected true, got ${JSON.stringify(developed)}.`);
  }
  ok('platform.developed = true');

  const platformStatus = state?.platform?.status;
  if (platformStatus !== 'ready') {
    fail(`platform.status expected "ready", got ${JSON.stringify(platformStatus)}.`);
  }
  ok('platform.status = ready');

  const archStatus = state?.architecture?.status;
  if (archStatus !== 'ready') {
    fail(`architecture.status expected "ready", got ${JSON.stringify(archStatus)}.`);
  }
  ok('architecture.status = ready');

  const completed = state?.completed_work ?? [];
  const hasCompleted = completed.some(
    (entry) => typeof entry === 'string' && entry.includes('platform.developed'),
  );
  if (!hasCompleted) {
    fail('completed_work must include "platform.developed = True".');
  }
  ok('completed_work includes platform.developed');

  const tests = state?.tests ?? {};
  if (typeof tests.passed !== 'number' || tests.passed < 1) {
    fail(`project_state.tests.passed expected >= 1, got ${JSON.stringify(tests.passed)}.`);
  }
  if (tests.passed !== testMetrics.passed) {
    fail(
      `State/tests mismatch: project_state.tests.passed=${tests.passed}, pytest=${testMetrics.passed}.`,
    );
  }
  ok(`project_state.tests.passed = ${tests.passed}`);
}

function emitMetrics(state, testMetrics) {
  const metrics = {
    platform: state.platform,
    architecture: state.architecture,
    tests: state.tests,
    completed_work: state.completed_work,
    known_issues: state.known_issues ?? [],
    pytest_passed: testMetrics.passed,
  };
  console.log('\nMETRICS:', JSON.stringify(metrics));
}

function main() {
  console.log('Platform developed verification — modules, pytest, project-state\n');

  verifyPlatformModules();
  const testMetrics = runPytest();
  const state = loadProjectState();
  verifyProjectState(state, testMetrics);
  emitMetrics(state, testMetrics);

  console.log('\nPlatform developed — verification OK.');
}

main();
