'use strict';

/**
 * Verifies CONTRIBUTING.md structure and emits Aerys state evidence metrics.
 * Used by CI and post-merge verification for guide_structure.points gap closure.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GUIDE_PATH = path.join(ROOT, 'CONTRIBUTING.md');
const STATE_PATH = path.join(ROOT, '.aerys', 'project-state.json');
const PUBLISH_DATE = '2026-09-10';
const EXPECTED_POINTS = 3;

function countGuideSections(markdown) {
  return markdown
    .split('\n')
    .filter((line) => /^##\s+\d+\.\s/.test(line.trim()))
    .length;
}

function main() {
  if (!fs.existsSync(GUIDE_PATH)) {
    console.error('CONTRIBUTING.md not found');
    process.exit(1);
  }

  const markdown = fs.readFileSync(GUIDE_PATH, 'utf8');
  const points = countGuideSections(markdown);

  if (points !== EXPECTED_POINTS) {
    console.error(
      `Expected ${EXPECTED_POINTS} guide sections, found ${points}`,
    );
    process.exit(1);
  }

  if (markdown.length > 2000) {
    console.error(`Guide exceeds 2000 characters (${markdown.length})`);
    process.exit(1);
  }

  const state = {
    publish_date: PUBLISH_DATE,
    guide_published: true,
    guide_structure: { points },
  };

  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`);

  console.log('CONTRIBUTING guide — verification OK');
  console.log(`  sections: ${points}`);
  console.log(`  publish_date: ${PUBLISH_DATE}`);
  console.log(`  guide_published: true`);
  console.log(
    JSON.stringify({
      metrics: {
        'guide_structure.points': points,
        guide_published: true,
        publish_date: PUBLISH_DATE,
      },
    }),
  );
}

main();
