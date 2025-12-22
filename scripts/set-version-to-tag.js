#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rawArg = process.argv[2];
if (!rawArg) {
  console.error('Usage: node ./scripts/set-version-to-tag.js <version>');
  process.exit(1);
}
const version = rawArg.startsWith('v') ? rawArg.slice(1) : rawArg;

const files = [
  'package.json',
  'server/package.json',
  'app-rn/package.json',
  'app-web/package.json'
];

let changed = [];
for (const rel of files) {
  const p = path.resolve(__dirname, '..', rel);
  if (!fs.existsSync(p)) {
    console.warn(`Skipped ${rel} (not found)`);
    continue;
  }
  let raw;
  try {
    raw = fs.readFileSync(p, 'utf8');
  } catch (err) {
    console.error(`Failed to read ${rel}: ${err.message}`);
    process.exit(1);
  }

  let pkg;
  try {
    pkg = JSON.parse(raw);
  } catch (err) {
    console.error(`Could not parse ${rel}: ${err.message}`);
    process.exit(1);
  }

  if (pkg.version === version) {
    console.log(`${rel} already at ${version}`);
    continue;
  }

  pkg.version = version;
  try {
    fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  } catch (err) {
    console.error(`Failed to write ${rel}: ${err.message}`);
    process.exit(1);
  }
  console.log(`Updated ${rel} -> ${version}`);
  changed.push(rel);
}

if (changed.length === 0) {
  console.log('No files changed.');
} else {
  console.log('Version files updated:', changed.join(', '));
}

process.exit(0);
