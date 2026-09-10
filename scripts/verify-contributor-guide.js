#!/usr/bin/env node
'use strict';

/**
 * Gate for contributor welcome guide objective:
 * measurable project-state evidence + published CONTRIBUTING.md with 3 points.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'project-state.json');
const GUIDE_PATH = path.join(ROOT, 'CONTRIBUTING.md');
const EXPECTED_PUBLISH_DATE = '2026-09-10';
const EXPECTED_POINTS = 3;

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`✓ ${message}`);
}

function loadProjectState() {
  if (!fs.existsSync(STATE_PATH)) {
    fail(`Project state file missing: project-state.json`);
  }

  let state;
  try {
    state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch (error) {
    fail(`Invalid JSON in project-state.json: ${error.message}`);
  }

  return state;
}

function verifyProjectState(state) {
  if (state.publish_date !== EXPECTED_PUBLISH_DATE) {
    fail(
      `publish_date mismatch — expected "${EXPECTED_PUBLISH_DATE}", got ${JSON.stringify(state.publish_date)}`,
    );
  }
  ok(`publish_date: ${state.publish_date}`);

  if (state.guide_published !== true) {
    fail(`guide_published must be true, got ${JSON.stringify(state.guide_published)}`);
  }
  ok('guide_published: true');

  const points = state.guide_structure && state.guide_structure.points;
  if (points !== EXPECTED_POINTS) {
    fail(`guide_structure.points must be ${EXPECTED_POINTS}, got ${JSON.stringify(points)}`);
  }
  ok(`guide_structure.points: ${points}`);
}

function extractNumberedHeadings(content) {
  const matches = [];
  const pattern = /^##\s+\d+\.\s+(.+)$/gm;
  let match;
  while ((match = pattern.exec(content)) !== null) {
    matches.push(match[1].trim());
  }
  return matches;
}

function verifyContributingGuide(state) {
  if (!fs.existsSync(GUIDE_PATH)) {
    fail('CONTRIBUTING.md not found — guide not published.');
  }

  const content = fs.readFileSync(GUIDE_PATH, 'utf8');
  const headings = extractNumberedHeadings(content);

  if (headings.length !== EXPECTED_POINTS) {
    fail(
      `CONTRIBUTING.md must contain exactly ${EXPECTED_POINTS} numbered sections (## N. ...), found ${headings.length}.`,
    );
  }
  ok(`CONTRIBUTING.md: ${headings.length} numbered sections present.`);

  const expectedHeadings = (state.contributor_welcome_guide || {}).headings;
  if (Array.isArray(expectedHeadings) && expectedHeadings.length === EXPECTED_POINTS) {
    for (let i = 0; i < EXPECTED_POINTS; i += 1) {
      if (headings[i] !== expectedHeadings[i]) {
        fail(
          `Section ${i + 1} heading mismatch — expected "${expectedHeadings[i]}", got "${headings[i]}".`,
        );
      }
    }
    ok(`Section headings match project-state: ${headings.join(' · ')}`);
  }

  if (!content.includes(EXPECTED_PUBLISH_DATE)) {
    fail(`CONTRIBUTING.md must mention publish date ${EXPECTED_PUBLISH_DATE}.`);
  }
  ok(`CONTRIBUTING.md references publish date ${EXPECTED_PUBLISH_DATE}.`);
}

function main() {
  console.log('Contributor welcome guide gate — project-state + CONTRIBUTING.md\n');

  const state = loadProjectState();
  verifyProjectState(state);
  verifyContributingGuide(state);

  console.log(
    `\nContributor guide OK — publish_date=${EXPECTED_PUBLISH_DATE}, guide_published=true, points=${EXPECTED_POINTS}.`,
  );
}

main();
