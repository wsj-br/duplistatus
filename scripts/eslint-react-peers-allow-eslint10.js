#!/usr/bin/env node
/**
 * Queries the npm registry (via pnpm) for eslint-plugin-react and
 * eslint-plugin-react-hooks peerDependencies.eslint and tests whether ESLint 10.x
 * satisfies those ranges. Used by upgrade-dependencies.sh to decide whether to pass
 * -x eslint,... to npm-check-updates.
 *
 * Exit codes: 0 = both plugins allow ESLint 10, 1 = at least one does not, 2 = error
 * (missing peer, parse failure, pnpm view failed).
 */
'use strict';

import { execSync } from 'child_process';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const requireFromRoot = createRequire(path.join(root, 'package.json'));
const eslintPkgJson = requireFromRoot.resolve('eslint/package.json');
const requireFromEslint = createRequire(eslintPkgJson);
const semver = requireFromEslint('semver');

const PACKAGES = ['eslint-plugin-react', 'eslint-plugin-react-hooks'];
const ESLINT_10 = '10.0.0';

function peerEslintRange(pkg) {
  const raw = execSync(`pnpm view ${JSON.stringify(pkg)} peerDependencies --json`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const deps = JSON.parse(raw);
  return deps && deps.eslint;
}

function main() {
  let hadError = false;
  for (const pkg of PACKAGES) {
    let range;
    try {
      range = peerEslintRange(pkg);
    } catch (e) {
      console.error(`eslint10-peer-check: ${pkg}: ${e.message}`);
      process.exit(2);
    }
    if (!range || typeof range !== 'string') {
      console.error(`eslint10-peer-check: ${pkg}: missing peerDependencies.eslint`);
      process.exit(2);
    }
    const ok = semver.satisfies(ESLINT_10, range, { includePrerelease: true });
    console.error(
      `eslint10-peer-check: ${pkg} peer eslint "${range}" -> ESLint ${ESLINT_10} ${ok ? 'ok' : 'no'}`
    );
    if (!ok) hadError = true;
  }
  process.exit(hadError ? 1 : 0);
}

main();
