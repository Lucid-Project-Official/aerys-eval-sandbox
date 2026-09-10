'use strict';

const { spawnSync } = require('child_process');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts', 'verify-contributor-guide.js');
const GUIDE_PATH = path.join(ROOT, 'docs', 'GUIDE-ACCUEIL-CONTRIBUTEUR.md');
const STATE_PATH = path.join(ROOT, 'project-state.json');

function runVerify() {
  return spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
}

{
  const result = runVerify();
  assert.strictEqual(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Contributor guide — verification OK/);
  assert.match(result.stdout, /--- ProjectState ---/);

  const jsonMatch = result.stdout.match(/--- ProjectState ---\n([\s\S]*?)\nContributor guide — verification OK/);
  assert.ok(jsonMatch, 'Expected ProjectState JSON block in script output');
  const metrics = JSON.parse(jsonMatch[1]);

  assert.strictEqual(metrics.publish_date, '2026-09-10');
  assert.strictEqual(metrics.guide_published, true);
  assert.strictEqual(metrics.guide_structure.points, 3);
  assert.strictEqual(metrics.guide_metrics.section_count, 3);
  assert.ok(metrics.guide_metrics.character_count < 2000);
}

{
  const guide = fs.readFileSync(GUIDE_PATH, 'utf8');
  const sections = (guide.match(/^##\s+\d+\./gm) || []).length;
  assert.strictEqual(sections, 3, 'Guide must have exactly 3 numbered sections');
}

{
  const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  assert.strictEqual(state.guide_structure.points, 3);
  assert.strictEqual(state.guide_published, true);
}

console.log('All verify-contributor-guide tests passed');
