#!/usr/bin/env node
'use strict';

/**
 * Verification gate for contributor welcome guide objective:
 * - guide published with publish_date 2026-09-10
 * - guide_structure.points === 3 (three main sections)
 * - total guide length under 2000 characters
 *
 * Emits ProjectState metrics as JSON on stdout for Aerys evaluation.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GUIDE_PATH = path.join(ROOT, 'docs', 'GUIDE-ACCUEIL-CONTRIBUTEUR.md');
const STATE_PATH = path.join(ROOT, 'project-state.json');
const EXPECTED_PUBLISH_DATE = '2026-09-10';
const EXPECTED_POINTS = 3;
const MAX_CHARACTERS = 2000;

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`✓ ${message}`);
}

function loadState() {
  if (!fs.existsSync(STATE_PATH)) {
    fail(`Missing project state file: ${STATE_PATH}`);
  }
  let state;
  try {
    state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch (err) {
    fail(`Invalid JSON in project-state.json: ${err.message}`);
  }
  return state;
}

function loadGuide() {
  if (!fs.existsSync(GUIDE_PATH)) {
    fail(`Missing contributor guide: ${GUIDE_PATH}`);
  }
  return fs.readFileSync(GUIDE_PATH, 'utf8');
}

function countGuidePoints(content) {
  const sectionMatches = content.match(/^##\s+\d+\./gm) || [];
  return sectionMatches.length;
}

function verifyPublishDate(content, state) {
  if (state.publish_date !== EXPECTED_PUBLISH_DATE) {
    fail(
      `project-state.json publish_date must be ${EXPECTED_PUBLISH_DATE}, got ${state.publish_date}`,
    );
  }
  if (!content.includes(EXPECTED_PUBLISH_DATE)) {
    fail(`Guide must mention publish date ${EXPECTED_PUBLISH_DATE}.`);
  }
  ok(`Publish date: ${EXPECTED_PUBLISH_DATE}`);
}

function verifyGuidePublished(state) {
  if (state.guide_published !== true) {
    fail('project-state.json guide_published must be true.');
  }
  ok('Guide marked as published.');
}

function verifyPoints(content, state) {
  const sections = countGuidePoints(content);
  const statePoints = state.guide_structure && state.guide_structure.points;

  if (statePoints !== EXPECTED_POINTS) {
    fail(
      `project-state.json guide_structure.points must be ${EXPECTED_POINTS}, got ${statePoints}`,
    );
  }
  if (sections !== EXPECTED_POINTS) {
    fail(
      `Guide must contain ${EXPECTED_POINTS} numbered sections (## N.), found ${sections}.`,
    );
  }
  ok(`Guide structure: ${sections} points (sections ## 1. … ## ${EXPECTED_POINTS}.)`);
}

function verifyLength(content) {
  const length = content.length;
  if (length >= MAX_CHARACTERS) {
    fail(`Guide exceeds ${MAX_CHARACTERS} characters (${length}).`);
  }
  ok(`Guide length: ${length}/${MAX_CHARACTERS} characters.`);
}

function emitProjectStateMetrics(state, content) {
  const metrics = {
    publish_date: state.publish_date,
    guide_published: state.guide_published,
    guide_structure: {
      points: state.guide_structure.points,
    },
    guide_metrics: {
      character_count: content.length,
      section_count: countGuidePoints(content),
      guide_path: 'docs/GUIDE-ACCUEIL-CONTRIBUTEUR.md',
    },
  };
  console.log('\n--- ProjectState ---');
  console.log(JSON.stringify(metrics, null, 2));
  return metrics;
}

function main() {
  console.log('Contributor welcome guide verification\n');

  const state = loadState();
  const content = loadGuide();

  verifyGuidePublished(state);
  verifyPublishDate(content, state);
  verifyPoints(content, state);
  verifyLength(content);

  const metrics = emitProjectStateMetrics(state, content);

  if (metrics.guide_structure.points !== EXPECTED_POINTS) {
    fail('ProjectState guide_structure.points verification failed.');
  }

  console.log('Contributor guide — verification OK.');
}

main();
