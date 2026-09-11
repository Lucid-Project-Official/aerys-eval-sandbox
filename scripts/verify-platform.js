#!/usr/bin/env node
'use strict';

/**
 * Verification gate for platform development objective:
 * - project-state.json reflects platform.developed and platform.status
 * - Emits measurable METRICS for Aerys ProjectState verifier
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
    fail('platform key missing from project-state.json.');
  }

  if (platform.developed !== true) {
    fail(`platform.developed expected true, got ${JSON.stringify(platform.developed)}.`);
  }
  ok('platform.developed = true');

  if (platform.status !== EXPECTED_STATUS) {
    fail(
      `platform.status expected "${EXPECTED_STATUS}", got ${JSON.stringify(platform.status)}.`,
    );
  }
  ok(`platform.status = ${platform.status}`);
}

function verifyStatePatch(state) {
  if (!fs.existsSync(PATCH_PATH)) {
    console.log('ℹ .aerys/project_state_patch.json absent — state file is authoritative.');
    return;
  }

  let patch;
  try {
    patch = JSON.parse(fs.readFileSync(PATCH_PATH, 'utf8'));
  } catch (err) {
    fail(`.aerys/project_state_patch.json is invalid JSON: ${err.message}`);
  }

  if (patch?.platform?.status !== state.platform.status) {
    fail(
      `State patch mismatch: patch platform.status=${JSON.stringify(patch?.platform?.status)}, state=${JSON.stringify(state.platform.status)}.`,
    );
  }

  if (patch?.platform?.developed !== state.platform.developed) {
    fail(
      `State patch mismatch: patch platform.developed=${JSON.stringify(patch?.platform?.developed)}, state=${JSON.stringify(state.platform.developed)}.`,
    );
  }

  ok('.aerys/project_state_patch.json matches project-state.json platform keys.');
}

function emitMetrics(state) {
  const metrics = {
    platform: {
      developed: state.platform.developed,
      status: state.platform.status,
    },
    state_store: 'project-state.json',
    platform_status_ready: state.platform.status === EXPECTED_STATUS,
  };
  console.log('\nMETRICS:', JSON.stringify(metrics));
}

function main() {
  console.log('Platform verification — developed flag, status, state store\n');

  const state = loadProjectState();
  verifyPlatformState(state);
  verifyStatePatch(state);
  emitMetrics(state);

  console.log('\nPlatform status set to ready — verification OK.');
}

main();
