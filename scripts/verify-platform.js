#!/usr/bin/env node
'use strict';

/**
 * Verification gate for platform development objective:
 * - aerys_platform core components importable and ready
 * - project-state.json reflects platform.status = "ready", platform.developed = true
 * - pytest suite passes
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'project-state.json');
const EXPECTED_STATUS = 'ready';

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

  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch (err) {
    fail(`project-state.json is invalid JSON: ${err.message}`);
  }
}

function verifyProjectState(state) {
  const status = state?.platform?.status;
  if (status !== EXPECTED_STATUS) {
    fail(
      `platform.status expected "${EXPECTED_STATUS}", got ${JSON.stringify(status)}.`,
    );
  }
  ok(`platform.status = ${status}`);

  if (state.platform?.developed !== true) {
    fail(
      `platform.developed expected true, got ${JSON.stringify(state.platform?.developed)}.`,
    );
  }
  ok('platform.developed = true');
}

function verifyPythonCore() {
  const result = spawnSync(
    process.env.PYTHON || 'python3',
    [
      '-c',
      [
        'from aerys_platform.core import verify_core_components',
        'from aerys_platform.status import PLATFORM_STATUS_READY',
        'assert verify_core_components()',
        'print(PLATFORM_STATUS_READY)',
      ].join('; '),
    ],
    { cwd: ROOT, encoding: 'utf8' },
  );

  if (result.status !== 0) {
    fail(`Python core verification failed: ${result.stderr || result.stdout}`);
  }

  ok(`aerys_platform core components verified (${result.stdout.trim()}).`);
}

function runPytest() {
  const pip = spawnSync(
    process.env.PYTHON || 'python3',
    ['-m', 'pip', 'install', '-q', '-r', 'requirements-dev.txt'],
    { cwd: ROOT, encoding: 'utf8' },
  );

  if (pip.status !== 0) {
    fail(`Failed to install Python test dependencies: ${pip.stderr || pip.stdout}`);
  }

  const result = spawnSync(
    process.env.PYTHON || 'python3',
    ['-m', 'pytest', 'tests/test_platform_status.py', '-q'],
    { cwd: ROOT, encoding: 'utf8' },
  );

  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);

  if (result.status !== 0) {
    fail('pytest platform.status suite failed.');
  }

  ok('pytest platform.status suite passed.');
}

function runPostDeploymentHooks() {
  const hooksPath = path.join(ROOT, 'scripts', 'platform-post-deploy.js');
  if (!fs.existsSync(hooksPath)) {
    console.log('ℹ No post-deployment hooks registered — skipping.');
    return;
  }

  const result = spawnSync(process.execPath, [hooksPath], {
    cwd: ROOT,
    encoding: 'utf8',
  });

  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);

  if (result.status !== 0) {
    fail('Post-deployment hooks failed.');
  }

  ok('Post-deployment hooks executed.');
}

function emitSuccessEvent(state) {
  const event = {
    event: 'PlatformStatusReady',
    message: 'platform.status now matches goal target "ready"',
    platform: state.platform,
    mission_status: 'SUCCESS',
    work_node_status: 'COMPLETED',
  };
  console.log('\nEVENT:', JSON.stringify(event));
}

function emitMetrics(state) {
  const metrics = {
    platform: {
      status: state.platform.status,
      developed: state.platform.developed,
    },
  };
  console.log('METRICS:', JSON.stringify(metrics));
}

function main() {
  console.log('Platform verification — core, state, pytest\n');

  verifyPythonCore();
  const state = loadProjectState();
  verifyProjectState(state);
  runPytest();
  runPostDeploymentHooks();
  emitSuccessEvent(state);
  emitMetrics(state);

  console.log('\nPlatform — verification OK (platform.status reaches target "ready").');
}

main();
