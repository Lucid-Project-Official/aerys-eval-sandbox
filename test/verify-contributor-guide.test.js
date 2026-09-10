'use strict';

const { spawnSync } = require('child_process');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts', 'verify-contributor-guide.js');
const STATE_PATH = path.join(ROOT, 'project-state.json');
const CONTRIBUTING_PATH = path.join(ROOT, 'CONTRIBUTING.md');

function runVerify() {
  return spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
}

{
  const result = runVerify();
  assert.strictEqual(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Contributor guide — verification OK/);
  assert.match(result.stdout, /guide_structure\.points = 3/);
  assert.match(result.stdout, /guide_published = true/);
  assert.match(result.stdout, /publish_date = 2026-09-10/);
  assert.match(result.stdout, /METRICS:/);
  assert.match(result.stdout, /--- ProjectState ---/);

  const jsonMatch = result.stdout.match(
    /--- ProjectState ---\n([\s\S]*?)\n\nContributor guide — verification OK/,
  );
  assert.ok(jsonMatch, 'Expected ProjectState JSON block in script output');
  const metrics = JSON.parse(jsonMatch[1]);
  assert.strictEqual(metrics.publish_date, '2026-09-10');
  assert.strictEqual(metrics.guide_published, true);
  assert.strictEqual(metrics.guide_structure.points, 3);
}

{
  const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  assert.strictEqual(state.guide_structure.points, 3);
  assert.strictEqual(state.guide_published, true);
  assert.strictEqual(state.publish_date, '2026-09-10');
}

{
  const content = fs.readFileSync(CONTRIBUTING_PATH, 'utf8');
  const points = (content.match(/^## \d+\./gm) || []).length;
  assert.strictEqual(points, 3);
}

console.log('All verify-contributor-guide tests passed');
