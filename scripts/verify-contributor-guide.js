#!/usr/bin/env node
'use strict';

/**
 * Quality gate for contributor welcome guide objective:
 * publish_date, guide_published, and 3-point structure.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'state', 'contributor-guide.json');
const GUIDE_PATH = path.join(ROOT, 'docs', 'GUIDE_ACCUEIL_CONTRIBUTEUR.md');

const TARGET_PUBLISH_DATE = '2026-09-10';
const TARGET_POINTS = 3;

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`✓ ${message}`);
}

function loadState() {
  if (!fs.existsSync(STATE_PATH)) {
    fail(`Missing state file: state/contributor-guide.json`);
  }

  let state;
  try {
    state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch (err) {
    fail(`Invalid JSON in state/contributor-guide.json: ${err.message}`);
  }

  return state;
}

function verifyGuideContent() {
  if (!fs.existsSync(GUIDE_PATH)) {
    fail(`Missing guide: docs/GUIDE_ACCUEIL_CONTRIBUTEUR.md`);
  }

  const content = fs.readFileSync(GUIDE_PATH, 'utf8');

  const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontMatterMatch) {
    fail('Guide missing YAML front-matter with publish_date.');
  }

  if (!frontMatterMatch[1].includes(`publish_date: ${TARGET_PUBLISH_DATE}`)) {
    fail(`Front-matter publish_date must be ${TARGET_PUBLISH_DATE}.`);
  }
  ok(`Front-matter publish_date: ${TARGET_PUBLISH_DATE}`);

  if (!content.includes(`Published on ${TARGET_PUBLISH_DATE}`)) {
    fail(`Guide missing publish tag: "Published on ${TARGET_PUBLISH_DATE}"`);
  }

  const headings = content.match(/^## \d+\./gm) || [];
  if (headings.length !== TARGET_POINTS) {
    fail(`Guide must have ${TARGET_POINTS} numbered sections, found ${headings.length}.`);
  }

  ok(`Guide present with ${TARGET_POINTS} points and publish tag.`);
}

function verifyState(state) {
  if (state.guide_published !== true) {
    fail(`guide_published must be true, got ${JSON.stringify(state.guide_published)}`);
  }
  ok('guide_published: true');

  if (state.publish_date !== TARGET_PUBLISH_DATE) {
    fail(
      `publish_date must be "${TARGET_PUBLISH_DATE}", got ${JSON.stringify(state.publish_date)}`,
    );
  }
  ok(`publish_date: ${TARGET_PUBLISH_DATE}`);

  const points = state.guide_structure && state.guide_structure.points;
  if (points !== TARGET_POINTS) {
    fail(`guide_structure.points must be ${TARGET_POINTS}, got ${JSON.stringify(points)}`);
  }
  ok(`guide_structure.points: ${TARGET_POINTS}`);
}

function main() {
  console.log('Contributor guide gate — publish_date, guide_published, structure\n');

  const state = loadState();
  verifyState(state);
  verifyGuideContent();

  console.log(
    `\nContributor guide OK — published ${TARGET_PUBLISH_DATE}, ${TARGET_POINTS} points.`,
  );
}

main();
