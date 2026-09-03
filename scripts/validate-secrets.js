#!/usr/bin/env node
'use strict';

/**
 * Validates optional GitHub Actions secrets format.
 *
 * Prevents the Python error:
 *   ValueError: dictionary update sequence element #0 has length 1; 2 is required
 *
 * That error occurs when a value expected to be a JSON object or KEY=VALUE pairs
 * is stored as a raw string/list and passed to dict() / dict.update().
 */

const OPTIONAL_SECRETS = [
  {
    name: 'CURSOR_REPO_MAP',
    kind: 'json-object',
    description: 'JSON map alias → GitHub repo URL for Aerys DevRun',
  },
  {
    name: 'CURSOR_API_KEY',
    kind: 'raw-token',
    description: 'Cursor Cloud Agents API key (Milan DevRun)',
  },
  {
    name: 'AERYS_CONNECTOR_CONFIG',
    kind: 'key-value-pairs',
    description: 'Semicolon-separated KEY=VALUE pairs for connector overrides',
  },
];

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`::warning::${message}`);
}

function validateJsonObject(name, value) {
  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch (err) {
    fail(
      `${name} must be valid JSON (object). Invalid JSON causes dict(str) → ` +
        '"dictionary update sequence element #0 has length 1; 2 is required". ' +
        `Parse error: ${err.message}`,
    );
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    fail(`${name} must be a JSON object, not ${Array.isArray(parsed) ? 'an array' : typeof parsed}.`);
  }
  for (const [key, url] of Object.entries(parsed)) {
    if (!key || typeof url !== 'string' || !url.startsWith('https://github.com/')) {
      fail(`${name}.${key} must map to a https://github.com/... URL.`);
    }
  }
}

function validateRawToken(name, value) {
  const trimmed = value.trim();
  if (!trimmed) {
    fail(`${name} must not be empty when set.`);
  }
  // Raw tokens must not be mistaken for KEY=VALUE compound secrets.
  if (trimmed.includes(';')) {
    fail(
      `${name} looks like a compound KEY=VALUE secret. Store the raw API key only.`,
    );
  }
  if (/^[^=]+=[^=]+$/.test(trimmed) && !trimmed.startsWith('cursor_')) {
    warn(
      `${name} resembles KEY=VALUE format. Milan expects a raw Cursor API key, not "KEY=value".`,
    );
  }
}

function validateKeyValuePairs(name, value) {
  const segments = value.split(';').map((part) => part.trim()).filter(Boolean);
  if (segments.length === 0) {
    fail(`${name} must contain at least one KEY=VALUE pair when set.`);
  }
  for (const segment of segments) {
    const eqIndex = segment.indexOf('=');
    if (eqIndex <= 0) {
      fail(
        `${name} segment "${segment}" is invalid. Each segment must be KEY=VALUE ` +
          '(dictionary update sequence element #0 has length 1; 2 is required).',
      );
    }
    const key = segment.slice(0, eqIndex).trim();
    const val = segment.slice(eqIndex + 1);
    if (!key) {
      fail(`${name} contains an empty key in segment "${segment}".`);
    }
    if (!val) {
      warn(`${name}.${key} has an empty value.`);
    }
  }
}

function main() {
  let checked = 0;

  for (const spec of OPTIONAL_SECRETS) {
    const value = process.env[spec.name];
    if (!value || !value.trim()) {
      continue;
    }

    checked += 1;
    console.log(`Validating ${spec.name} (${spec.kind})…`);

    switch (spec.kind) {
      case 'json-object':
        validateJsonObject(spec.name, value.trim());
        break;
      case 'raw-token':
        validateRawToken(spec.name, value);
        break;
      case 'key-value-pairs':
        validateKeyValuePairs(spec.name, value);
        break;
      default:
        fail(`Unknown validation kind for ${spec.name}: ${spec.kind}`);
    }
  }

  if (checked === 0) {
    console.log(
      'No optional Aerys/Cursor secrets configured in GitHub Actions — skipping validation.',
    );
    console.log(
      'Milan uses Aerys connector vault (GitHub L3, Cursor L2), not repo secrets for CI.',
    );
  } else {
    console.log(`Validated ${checked} optional secret(s) successfully.`);
  }
}

main();
