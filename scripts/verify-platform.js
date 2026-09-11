#!/usr/bin/env node
'use strict';

/**
 * Verification gate for platform development objective:
 * - project-state.json reflects platform.status = "ready" and platform.developed = true
 * - Emits measurable METRICS and WorkNodeCompleted event for Aerys Verifier
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'project-state.json');
const PATCH_PATH = path.join(ROOT, '.aerys', 'project_state_patch.json');
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

  let state;
  try {
    state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch (err) {
    fail(`project-state.json is invalid JSON: ${err.message}`);
  }

  return state;
}

function verifyPlatformState(state) {
  const platform = state?.platform;
  if (!platform || typeof platform !== 'object') {
    fail('platform section missing from project-state.json.');
  }

  if (platform.status !== EXPECTED_STATUS) {
    fail(
      `platform.status expected "${EXPECTED_STATUS}", got ${JSON.stringify(platform.status)}.`,
    );
  }
  ok(`platform.status = ${platform.status}`);

  if (platform.developed !== true) {
    fail(`platform.developed expected true, got ${JSON.stringify(platform.developed)}.`);
  }
  ok('platform.developed = true');
}

function verifyStatePatch(state) {
  if (!fs.existsSync(PATCH_PATH)) {
    console.log('ℹ .aerys/project_state_patch.json not found — state file verification only.');
    return;
  }

  let patch;
  try {
    patch = JSON.parse(fs.readFileSync(PATCH_PATH, 'utf8'));
  } catch (err) {
    fail(`.aerys/project_state_patch.json is invalid JSON: ${err.message}`);
  }

  if (patch?.platform?.status !== EXPECTED_STATUS) {
    fail(
      `patch platform.status expected "${EXPECTED_STATUS}", got ${JSON.stringify(patch?.platform?.status)}.`,
    );
  }
  if (patch?.platform?.developed !== true) {
    fail(`patch platform.developed expected true, got ${JSON.stringify(patch?.platform?.developed)}.`);
  }
  ok('.aerys/project_state_patch.json matches platform target state.');
}

function emitMetrics(state) {
  const metrics = {
    project_state: {
      platform: {
        status: state.platform.status,
        developed: state.platform.developed,
      },
    },
    platform: {
      status: state.platform.status,
      developed: state.platform.developed,
    },
  };
  console.log('\nMETRICS:', JSON.stringify(metrics));
}

function emitWorkNodeCompleted(state) {
  const event = {
    type: 'WorkNodeCompleted',
    payload: {
      path: 'platform.status',
      platform: {
        status: state.platform.status,
        developed: state.platform.developed,
      },
    },
  };
  console.log('EVENT:', JSON.stringify(event));
}

function main() {
  console.log('Platform status verification — project state evidence\n');

  const state = loadProjectState();
  verifyPlatformState(state);
  verifyStatePatch(state);
  emitMetrics(state);
  emitWorkNodeCompleted(state);

  console.log('\nPlatform — verification OK (platform.status = ready, platform.developed = true).');
}

main();
