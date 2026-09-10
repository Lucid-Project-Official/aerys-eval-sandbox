#!/usr/bin/env node
'use strict';

/**
 * Verification gate for contributor guide objective:
 * publish_date, guide_published, guide_structure (3 points).
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORTAL_DIR = path.join(ROOT, 'portal');
const META_PATH = path.join(PORTAL_DIR, 'guide-contributeur.meta.json');
const INDEX_PATH = path.join(PORTAL_DIR, 'index.json');
const PUBLISH_SCRIPT = path.join(ROOT, 'scripts', 'publish-contributor-guide.js');

const EXPECTED_PUBLISH_DATE = '2026-09-10';
const EXPECTED_POINTS = 3;

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`✓ ${message}`);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    fail(`Invalid JSON in ${filePath}: ${err.message}`);
  }
}

function verifyPortalArtifacts() {
  for (const filePath of [META_PATH, INDEX_PATH, path.join(PORTAL_DIR, 'guide-contributeur.md')]) {
    if (!fs.existsSync(filePath)) {
      fail(`Missing portal artifact: ${filePath}`);
    }
  }
  ok('Portal artifacts present (guide, metadata, index).');
}

function verifyMetadata() {
  const meta = readJson(META_PATH);

  if (meta.publish_date !== EXPECTED_PUBLISH_DATE) {
    fail(`publish_date expected ${EXPECTED_PUBLISH_DATE}, got ${meta.publish_date}`);
  }
  ok(`publish_date verified: ${meta.publish_date}`);

  if (meta.guide_published !== true) {
    fail('guide_published must be true');
  }
  ok('guide_published verified: true');

  const points = Number(meta.guide_structure?.points);
  if (points !== EXPECTED_POINTS) {
    fail(`guide_structure.points expected ${EXPECTED_POINTS}, got ${points}`);
  }
  ok(`guide_structure.points verified: ${EXPECTED_POINTS}`);

  return meta;
}

function verifyPortalIndex(meta) {
  const index = readJson(INDEX_PATH);
  const entry = (index.guides || []).find((g) => g.slug === 'guide-contributeur');
  if (!entry) {
    fail('Portal index missing guide-contributeur entry');
  }
  if (entry.publish_date !== EXPECTED_PUBLISH_DATE) {
    fail(`Portal index publish_date mismatch: ${entry.publish_date}`);
  }
  if (entry.guide_published !== true) {
    fail('Portal index guide_published must be true');
  }
  if (Number(entry.guide_structure?.points) !== EXPECTED_POINTS) {
    fail(`Portal index guide_structure.points mismatch: ${entry.guide_structure?.points}`);
  }
  ok('Portal index matches metadata.');
}

function runPublishScript() {
  const result = spawnSync(process.execPath, [PUBLISH_SCRIPT], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  if (result.status !== 0) {
    fail('publish-contributor-guide.js failed.');
  }

  const metricsLine = result.stdout
    .split('\n')
    .find((line) => line.startsWith('AERYS_METRICS '));
  if (!metricsLine) {
    fail('Missing AERYS_METRICS output from publish script.');
  }

  const payload = JSON.parse(metricsLine.slice('AERYS_METRICS '.length));
  const metrics = payload.metrics || {};

  if (metrics.publish_date !== EXPECTED_PUBLISH_DATE) {
    fail(`Metrics publish_date mismatch: ${metrics.publish_date}`);
  }
  if (metrics.guide_published !== true) {
    fail('Metrics guide_published must be true');
  }
  if (Number(metrics.guide_structure?.points) !== EXPECTED_POINTS) {
    fail(`Metrics guide_structure.points mismatch: ${metrics.guide_structure?.points}`);
  }
  ok('Publish script emitted measurable metrics.');
}

function main() {
  console.log('Contributor guide verification gate\n');

  verifyPortalArtifacts();
  const meta = verifyMetadata();
  verifyPortalIndex(meta);
  runPublishScript();

  console.log('\nContributor guide — verification OK (publish_date + guide_published + 3 points).');
}

main();
