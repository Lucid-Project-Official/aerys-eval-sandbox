#!/usr/bin/env node
'use strict';

/**
 * Verification gate for platform development objective:
 * - project-state.json reflects platform.status = "ready" and platform.developed = true
 * - .aerys/project_state_patch.json is consistent with project-state.json
 * - Emits METRICS, WorkNodeCompleted, GoalVerification, and GoalSuccess for Aerys Verifier
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'project-state.json');
const PATCH_PATH = path.join(ROOT, '.aerys', 'project_state_patch.json');
const EXPECTED_STATUS = 'ready';
const GOAL_INTENT = "j'aimerais développer la plateforme";

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`✓ ${message}`);
}

function loadJson(filePath, label) {
  if (!fs.existsSync(filePath)) {
    fail(`${label} missing — cannot verify platform.status.`);
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    fail(`${label} is invalid JSON: ${err.message}`);
  }
}

function verifyPlatformState(state) {
  const platform = state?.platform;
  if (!platform || typeof platform !== 'object') {
    fail('project-state.json missing platform object.');
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

function verifyPatchConsistency(state) {
  if (!fs.existsSync(PATCH_PATH)) {
    console.log('ℹ .aerys/project_state_patch.json not found — state file only.');
    return;
  }

  const patch = loadJson(PATCH_PATH, '.aerys/project_state_patch.json');
  const patchPlatform = patch?.platform;

  if (!patchPlatform || typeof patchPlatform !== 'object') {
    fail('.aerys/project_state_patch.json missing platform object.');
  }

  if (patchPlatform.status !== state.platform.status) {
    fail(
      `Patch/state mismatch: patch platform.status=${JSON.stringify(patchPlatform.status)}, state=${JSON.stringify(state.platform.status)}.`,
    );
  }

  if (patchPlatform.developed !== state.platform.developed) {
    fail(
      `Patch/state mismatch: patch platform.developed=${JSON.stringify(patchPlatform.developed)}, state=${JSON.stringify(state.platform.developed)}.`,
    );
  }

  ok('.aerys/project_state_patch.json matches project-state.json.');
}

function emitMetrics(state) {
  const metrics = {
    platform: {
      status: state.platform.status,
      developed: state.platform.developed,
    },
    project_state: {
      platform: {
        status: state.platform.status,
        developed: state.platform.developed,
      },
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

function emitGoalVerification(state) {
  const targetState = {
    platform: {
      status: EXPECTED_STATUS,
      developed: true,
    },
  };
  const achievedState = {
    platform: {
      status: state.platform.status,
      developed: state.platform.developed,
    },
  };
  const passed =
    state.platform.status === EXPECTED_STATUS && state.platform.developed === true;

  const event = {
    type: 'GoalVerification',
    payload: {
      goal: GOAL_INTENT,
      target_state: targetState,
      achieved_state: achievedState,
      passed,
    },
  };
  console.log('GoalVerification:', JSON.stringify(event));
}

function emitGoalSuccess(state) {
  const event = {
    event: 'GoalSuccess',
    goal: GOAL_INTENT,
    target_state: {
      platform: {
        status: EXPECTED_STATUS,
        developed: true,
      },
    },
    achieved_state: {
      platform: {
        status: state.platform.status,
        developed: state.platform.developed,
      },
    },
    work_node_status: 'COMPLETED',
  };
  console.log('GoalSuccess:', JSON.stringify(event));
}

function main() {
  console.log('Platform verification — status, developed, state store\n');

  const state = loadJson(STATE_PATH, 'project-state.json');
  verifyPlatformState(state);
  verifyPatchConsistency(state);
  emitMetrics(state);
  emitWorkNodeCompleted(state);
  emitGoalVerification(state);
  emitGoalSuccess(state);

  console.log('\nPlatform — verification OK.');
}

main();
