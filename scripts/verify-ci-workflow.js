#!/usr/bin/env node
'use strict';

/**
 * Validates .github/workflows/ci.yml structure and required steps.
 * Ensures unit tests, lint, secrets validation and Milan setup checks
 * are present — the full CI/deployment gate for this sandbox.
 */

const fs = require('fs');
const path = require('path');

const WORKFLOW_PATH = path.join(__dirname, '..', '.github', 'workflows', 'ci.yml');

const REQUIRED_STEP_PATTERNS = [
  /validate-secrets\.js/,
  /verify-milan-setup\.js/,
  /verify-ci-workflow\.js/,
  /- run: npm test/,
  /- run: npm run lint/,
];

const REQUIRED_PERMISSIONS = ['contents: read', 'actions: read'];

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`✓ ${message}`);
}

function main() {
  if (!fs.existsSync(WORKFLOW_PATH)) {
    fail(`Workflow file not found: ${WORKFLOW_PATH}`);
  }

  const content = fs.readFileSync(WORKFLOW_PATH, 'utf8');

  if (!content.includes("branches: [main]")) {
    fail('CI workflow must trigger on main branch.');
  }

  if (!content.includes("node-version: '24'")) {
    fail('CI workflow must use Node.js 24.');
  }

  for (const pattern of REQUIRED_STEP_PATTERNS) {
    if (!pattern.test(content)) {
      fail(`CI workflow missing required step matching: ${pattern}`);
    }
  }
  ok(`All ${REQUIRED_STEP_PATTERNS.length} required CI steps present.`);

  for (const perm of REQUIRED_PERMISSIONS) {
    if (!content.includes(perm)) {
      fail(`CI workflow missing permission: ${perm}`);
    }
  }
  ok('Workflow permissions minimal (contents + actions read).');

  if (!content.match(/^\s*test:\s*$/m)) {
    fail('CI workflow must define a "test" job.');
  }
  ok('CI job "test" defined.');

  console.log('\nCI workflow verification complete — ready for deployment gate.');
}

main();
