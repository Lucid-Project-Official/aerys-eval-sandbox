#!/usr/bin/env node
'use strict';

/**
 * Quality gate for contributor welcome guide objective:
 * CONTRIBUTING.md published with 3 sections and project-state.json updated.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GUIDE_PATH = path.join(ROOT, 'CONTRIBUTING.md');
const STATE_PATH = path.join(ROOT, 'project-state.json');
const MAX_GUIDE_LENGTH = 2000;
const EXPECTED_POINTS = 3;
const EXPECTED_PUBLISH_DATE = '2026-09-10';

const REQUIRED_SECTIONS = [
  /^##\s+1\.\s+Intégration/m,
  /^##\s+2\.\s+Standards de code/m,
  /^##\s+3\.\s+Workflow de contribution/m,
];

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`✓ ${message}`);
}

function verifyGuideFile() {
  if (!fs.existsSync(GUIDE_PATH)) {
    fail('CONTRIBUTING.md not found — guide must be published at repository root.');
  }

  const content = fs.readFileSync(GUIDE_PATH, 'utf8');

  if (content.length > MAX_GUIDE_LENGTH) {
    fail(
      `CONTRIBUTING.md exceeds ${MAX_GUIDE_LENGTH} characters (${content.length}).`,
    );
  }
  ok(`CONTRIBUTING.md present (${content.length}/${MAX_GUIDE_LENGTH} characters).`);

  for (const pattern of REQUIRED_SECTIONS) {
    if (!pattern.test(content)) {
      fail(`CONTRIBUTING.md missing required section matching: ${pattern}`);
    }
  }
  ok(`Guide structure: ${REQUIRED_SECTIONS.length} sections present.`);
}

function verifyProjectState() {
  if (!fs.existsSync(STATE_PATH)) {
    fail('project-state.json not found.');
  }

  let state;
  try {
    state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch (err) {
    fail(`project-state.json is not valid JSON: ${err.message}`);
  }

  if (state.guide_published !== true) {
    fail('project-state.json: guide_published must be true.');
  }
  ok('project-state.json: guide_published = true.');

  const points = state.guide_structure && state.guide_structure.points;
  if (points !== EXPECTED_POINTS) {
    fail(
      `project-state.json: guide_structure.points must be ${EXPECTED_POINTS}, got ${points}.`,
    );
  }
  ok(`project-state.json: guide_structure.points = ${EXPECTED_POINTS}.`);

  if (state.publish_date !== EXPECTED_PUBLISH_DATE) {
    fail(
      `project-state.json: publish_date must be ${EXPECTED_PUBLISH_DATE}, got ${state.publish_date}.`,
    );
  }
  ok(`project-state.json: publish_date = ${EXPECTED_PUBLISH_DATE}.`);
}

function main() {
  console.log('Contributor welcome guide gate — structure, length, project state\n');

  verifyGuideFile();
  verifyProjectState();

  console.log('\nContributor guide — publication gate OK.');
}

main();
