#!/usr/bin/env node
'use strict';

/**
 * Verification gate for contributor welcome guide objective:
 * - CONTRIBUTING.md exists with exactly 3 main points
 * - project-state.json reflects guide_structure.points, guide_published, publish_date
 * - Optional remote accessibility check via GitHub raw URL
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const CONTRIBUTING_PATH = path.join(ROOT, 'CONTRIBUTING.md');
const STATE_PATH = path.join(ROOT, 'project-state.json');
const REPO = 'Lucid-Project-Official/aerys-eval-sandbox';
const EXPECTED_POINTS = 3;
const EXPECTED_PUBLISH_DATE = '2026-09-10';
const RAW_URL = `https://raw.githubusercontent.com/${REPO}/main/CONTRIBUTING.md`;

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`✓ ${message}`);
}

function countGuidePoints(markdown) {
  const matches = markdown.match(/^## \d+\./gm);
  return matches ? matches.length : 0;
}

function loadProjectState() {
  if (!fs.existsSync(STATE_PATH)) {
    fail('project-state.json missing — cannot verify guide_structure.points.');
  }

  let state;
  try {
    state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch (err) {
    fail(`project-state.json is invalid JSON: ${err.message}`);
  }

  return state;
}

function verifyProjectState(state) {
  const points = state?.guide_structure?.points;
  if (points !== EXPECTED_POINTS) {
    fail(
      `guide_structure.points expected ${EXPECTED_POINTS}, got ${JSON.stringify(points)}.`,
    );
  }
  ok(`guide_structure.points = ${points}`);

  if (state.guide_published !== true) {
    fail(`guide_published expected true, got ${JSON.stringify(state.guide_published)}.`);
  }
  ok('guide_published = true');

  if (state.publish_date !== EXPECTED_PUBLISH_DATE) {
    fail(
      `publish_date expected ${EXPECTED_PUBLISH_DATE}, got ${JSON.stringify(state.publish_date)}.`,
    );
  }
  ok(`publish_date = ${state.publish_date}`);
}

function verifyContributingFile() {
  if (!fs.existsSync(CONTRIBUTING_PATH)) {
    fail('CONTRIBUTING.md missing from repository root.');
  }

  const content = fs.readFileSync(CONTRIBUTING_PATH, 'utf8');
  const points = countGuidePoints(content);

  if (points !== EXPECTED_POINTS) {
    fail(`CONTRIBUTING.md has ${points} main points, expected ${EXPECTED_POINTS}.`);
  }
  ok(`CONTRIBUTING.md structure: ${points} main points.`);

  return content;
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'aerys-eval-sandbox-verify' } }, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, body });
        });
      })
      .on('error', reject);
  });
}

async function verifyRemoteAccessibility(localContent) {
  try {
    const { statusCode, body } = await fetchUrl(RAW_URL);
    if (statusCode !== 200) {
      console.log(
        `ℹ Remote CONTRIBUTING.md not yet on main (HTTP ${statusCode}) — local verification only.`,
      );
      return;
    }

    const remotePoints = countGuidePoints(body);
    if (remotePoints !== EXPECTED_POINTS) {
      fail(`Remote CONTRIBUTING.md has ${remotePoints} points, expected ${EXPECTED_POINTS}.`);
    }

    if (!body.includes("Guide d'accueil contributeur")) {
      fail('Remote CONTRIBUTING.md missing expected title.');
    }

    ok(`Remote guide accessible: ${RAW_URL} (${remotePoints} points).`);
  } catch (err) {
    console.log(`ℹ Remote check skipped: ${err.message}`);
  }
}

function emitMetrics(state, pointCount) {
  const metrics = {
    publish_date: state.publish_date,
    guide_published: state.guide_published,
    guide_structure: { points: state.guide_structure.points },
    contributing_points_measured: pointCount,
    guide_url: state.guide_url || `https://github.com/${REPO}/blob/main/CONTRIBUTING.md`,
  };
  console.log('\nMETRICS:', JSON.stringify(metrics));
}

async function main() {
  console.log('Contributor guide verification — structure, state, accessibility\n');

  const content = verifyContributingFile();
  const measuredPoints = countGuidePoints(content);

  const state = loadProjectState();
  verifyProjectState(state);

  if (measuredPoints !== state.guide_structure.points) {
    fail(
      `State/file mismatch: project-state points=${state.guide_structure.points}, measured=${measuredPoints}.`,
    );
  }
  ok('project-state.json matches CONTRIBUTING.md point count.');

  await verifyRemoteAccessibility(content);
  emitMetrics(state, measuredPoints);

  console.log('\nContributor guide — verification OK.');
}

main().catch((err) => fail(err.message));
