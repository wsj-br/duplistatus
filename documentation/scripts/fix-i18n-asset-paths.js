#!/usr/bin/env node

/**
 * Fix image paths in i18n translated docs (and optionally source docs) so they
 * use relative paths and thus load locale-specific assets from
 * i18n/{locale}/.../current/assets/ instead of the global static/assets/.
 *
 * Docusaurus resolves relative paths in markdown relative to the current file.
 * So "assets/foo.png" in current/intro.md → current/assets/foo.png (locale).
 * "/assets/foo.png" always → static/assets/ (same for all locales).
 *
 * Usage (from documentation/):
 *   node scripts/fix-i18n-asset-paths.js        # fix i18n (de, es, fr, pt-BR)
 *   node scripts/fix-i18n-asset-paths.js --docs # fix source docs/ and use docs/assets/
 *
 * Does not change /img/ paths (shared static images).
 */

const fs = require('fs');
const path = require('path');

const LOCALES = ['de', 'es', 'fr', 'pt-BR'];
const CURRENT_BASE = 'docusaurus-plugin-content-docs/current';

function walkDir(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walkDir(full, fileList);
    } else if (e.isFile() && e.name.endsWith('.md')) {
      fileList.push(full);
    }
  }
  return fileList;
}

/**
 * From a file path like .../current/user-guide/settings/foo.md, return the
 * relative prefix to reach current/assets/ (e.g. "../../").
 */
function assetPrefixFromFile(relativePathFromCurrent) {
  const dir = path.dirname(relativePathFromCurrent);
  if (dir === '.') return '';
  const depth = dir.split(path.sep).length;
  return '../'.repeat(depth);
}

function processFile(filePath, baseDir) {
  const relativeFromCurrent = path.relative(baseDir, filePath);
  const prefix = assetPrefixFromFile(relativeFromCurrent);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace absolute /assets/ with relative path so locale assets are used
  let newContent = content.replace(/\]\(\/assets\//g, () => `](${prefix}assets/`);
  // Also fix <img src="/assets/..."> in HTML
  newContent = newContent.replace(/src="\/assets\//g, () => `src="${prefix}assets/`);

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    return true;
  }
  return false;
}

function fixDir(baseDir, label) {
  if (!fs.existsSync(baseDir)) {
    console.warn(`Skipping ${label}: ${baseDir} not found`);
    return 0;
  }
  const files = walkDir(baseDir);
  let count = 0;
  for (const filePath of files) {
    if (processFile(filePath, baseDir)) count++;
  }
  return count;
}

function main() {
  const docRoot = path.resolve(__dirname, '..');
  const i18nDir = path.join(docRoot, 'i18n');
  const docsDir = path.join(docRoot, 'docs');
  const fixDocs = process.argv.includes('--docs');
  let totalFixed = 0;

  if (fixDocs) {
    const count = fixDir(docsDir, 'docs');
    if (count > 0) {
      console.log(`docs: updated ${count} file(s)`);
      totalFixed += count;
    }
  } else {
    for (const locale of LOCALES) {
      const currentDir = path.join(i18nDir, locale, CURRENT_BASE);
      const count = fixDir(currentDir, locale);
      if (count > 0) {
        console.log(`${locale}: updated ${count} file(s)`);
        totalFixed += count;
      }
    }
  }

  if (totalFixed > 0) {
    console.log(`Done. Updated ${totalFixed} file(s) to use relative asset paths.`);
  } else {
    console.log('No files needed updates.');
  }
}

main();
