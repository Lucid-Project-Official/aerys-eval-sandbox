'use strict';

const { spawnSync } = require('child_process');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const SCRIPT = path.join(__dirname, '..', 'scripts', 'publish-contributor-guide.js');
const META_PATH = path.join(__dirname, '..', 'portal', 'guide-contributeur.meta.json');

function runPublish() {
  return spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
}

{
  const result = runPublish();
  assert.strictEqual(result.status, 0, result.stderr);
  assert.match(result.stdout, /Contributor guide published/);
  assert.match(result.stdout, /publish_date: 2026-09-10/);
  assert.match(result.stdout, /guide_published: true/);
  assert.match(result.stdout, /guide_structure\.points: 3/);

  const metricsLine = result.stdout.split('\n').find((line) => line.startsWith('AERYS_METRICS '));
  assert.ok(metricsLine, 'Expected AERYS_METRICS line');
  const payload = JSON.parse(metricsLine.slice('AERYS_METRICS '.length));
  assert.strictEqual(payload.metrics.publish_date, '2026-09-10');
  assert.strictEqual(payload.metrics.guide_published, true);
  assert.strictEqual(payload.metrics.guide_structure.points, 3);

  const meta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
  assert.strictEqual(meta.publish_date, '2026-09-10');
}

console.log('All publish-contributor-guide tests passed');
