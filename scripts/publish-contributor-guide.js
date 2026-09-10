#!/usr/bin/env node
'use strict';

/**
 * Publish contributor welcome guide to the public portal.
 * Emits measurable ProjectState metrics (publish_date, guide_published, guide_structure).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORTAL_DIR = path.join(ROOT, 'portal');
const META_PATH = path.join(PORTAL_DIR, 'guide-contributeur.meta.json');
const GUIDE_PATH = path.join(PORTAL_DIR, 'guide-contributeur.md');
const INDEX_PATH = path.join(PORTAL_DIR, 'index.json');

const EXPECTED_PUBLISH_DATE = '2026-09-10';
const EXPECTED_POINTS = 3;

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`✓ ${message}`);
}

function countGuidePoints(markdown) {
  const matches = markdown.match(/^##\s+\d+\./gm);
  return matches ? matches.length : 0;
}

function loadMeta() {
  if (!fs.existsSync(META_PATH)) {
    fail(`Missing metadata file: ${META_PATH}`);
  }
  try {
    return JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
  } catch (err) {
    fail(`Invalid JSON in ${META_PATH}: ${err.message}`);
  }
}

function writePortalIndex(meta) {
  const index = {
    published_at: meta.publish_date,
    guides: [
      {
        slug: 'guide-contributeur',
        title: meta.title,
        path: 'guide-contributeur.md',
        meta_path: 'guide-contributeur.meta.json',
        publish_date: meta.publish_date,
        guide_published: meta.guide_published,
        guide_structure: meta.guide_structure,
      },
    ],
  };
  fs.writeFileSync(INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
}

function buildMetrics(meta) {
  return {
    publish_date: meta.publish_date,
    guide_published: Boolean(meta.guide_published),
    guide_structure: {
      points: Number(meta.guide_structure?.points ?? 0),
    },
  };
}

function main() {
  console.log('Publishing contributor guide to public portal\n');

  if (!fs.existsSync(GUIDE_PATH)) {
    fail(`Missing guide content: ${GUIDE_PATH}`);
  }

  const guide = fs.readFileSync(GUIDE_PATH, 'utf8');
  const meta = loadMeta();
  const points = countGuidePoints(guide);

  if (meta.publish_date !== EXPECTED_PUBLISH_DATE) {
    fail(`publish_date must be ${EXPECTED_PUBLISH_DATE}, got ${meta.publish_date}`);
  }
  ok(`publish_date: ${meta.publish_date}`);

  if (meta.guide_published !== true) {
    fail('guide_published must be true');
  }
  ok('guide_published: true');

  if (Number(meta.guide_structure?.points) !== EXPECTED_POINTS) {
    fail(`guide_structure.points must be ${EXPECTED_POINTS}`);
  }
  if (points !== EXPECTED_POINTS) {
    fail(`Guide markdown must contain ${EXPECTED_POINTS} numbered sections, found ${points}`);
  }
  ok(`guide_structure.points: ${EXPECTED_POINTS}`);

  writePortalIndex(meta);
  ok(`Portal index written: ${INDEX_PATH}`);

  const metrics = buildMetrics(meta);
  console.log('\nContributor guide published — portal ready.');
  console.log(`AERYS_METRICS ${JSON.stringify({ metrics })}`);
}

main();
