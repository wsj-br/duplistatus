#!/usr/bin/env node
/**
 * Generates the top-level NOTICES file: one block per third-party `name@version`
 * in the production dependency tree of this package.
 *
 * Dependency resolution is delegated to `pnpm licenses list --prod --json`, which
 * returns each package's resolved versions and on-disk install paths. We then pick
 * the license body ourselves so we keep full control over which text is used, in
 * priority order:
 *
 *   1. a per-package override from `write-third-party-notices.json` `packageOverrides`
 *      (matched by name + semver range), else
 *   2. a real license file in the package directory (LICENSE/LICENCE/COPYING/
 *      UNLICENSE, including suffixed variants like `LICENSE.MIT`), never README.md, else
 *   3. the standard license text for the package's SPDX id from
 *      `write-third-party-notices.json` `spdxLicenseTexts` — with the copyright line
 *      filled from the package's `author` (and omitted entirely when no author is
 *      declared), else
 *   4. nothing (just the SPDX identifier).
 *
 * Add an `spdxLicenseTexts` entry for a new SPDX id, or a `packageOverrides` entry,
 * when a package ships no usable license file.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import semver from "semver";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const requireFromRoot = createRequire(path.join(root, "package.json"));

/**
 * First-party packages. Each name is used both to scope a
 * `pnpm --filter <name> licenses list` scan and to drop the packages themselves
 * from the output. The Docusaurus docs package (`docs`) is intentionally excluded.
 */
const FIRST_PARTY_PACKAGES = ["duplistatus"];
const FIRST_PARTY = new Set(FIRST_PARTY_PACKAGES);

/** Real license files (incl. suffixed variants like `LICENSE.MIT`, `COPYING.LESSER`). */
const LICENSE_FILE_RE = /^((un)?licen[cs]e|copying|mit-licen[cs]e)([._-][a-z0-9.+]+)*$/i;
/** Source/data files that can collide with the license name (e.g. `license-key.js`). */
const NON_LICENSE_EXT_RE = /\.(js|cjs|mjs|jsx|ts|tsx|json|map|sh|py)$/i;
const COPYRIGHT_TOKEN = "{{COPYRIGHT_HOLDER}}";

function getModuleNameForLicenseTextHeader(moduleName) {
  const i = moduleName.lastIndexOf("@");
  return `${moduleName.slice(0, i)} ${moduleName.slice(i + 1)}\n`;
}

function licenseTitleLine(moduleData) {
  const { licenses } = moduleData;
  if (Array.isArray(licenses) && licenses.length > 0) {
    return licenses
      .map((m) => {
        if (typeof m === "object" && m) return m.type || m.name;
        if (typeof m === "string") return m;
        return "";
      })
      .join("");
  }
  if (typeof licenses === "object" && licenses && (licenses.type || licenses.name)) {
    return licenses.type || licenses.name;
  }
  if (typeof licenses === "string") return licenses;
  return "";
}

/**
 * Resolves the on-disk package directory. `pnpm licenses list` reports virtual-store
 * paths under `node_modules/.pnpm/…`, which do not exist when `nodeLinker: hoisted`
 * (or a flat install) is in use — fall back to `require.resolve` / top-level
 * `node_modules/<name>`.
 */
function resolvePkgDir(name, reportedPath) {
  if (reportedPath && fs.existsSync(reportedPath)) return reportedPath;
  try {
    return path.dirname(requireFromRoot.resolve(`${name}/package.json`));
  } catch {
    // Some packages block `./package.json` via `exports`; try the flat path.
  }
  const flat = path.join(root, "node_modules", ...name.split("/"));
  if (fs.existsSync(flat)) return flat;
  return reportedPath ?? "";
}

/** Reads the first real license file in a package directory, or "" if none exists. */
function readLicenseFile(pkgDir) {
  let entries;
  try {
    entries = fs.readdirSync(pkgDir, { withFileTypes: true });
  } catch {
    return "";
  }
  const match = entries
    .filter((e) => e.isFile() && LICENSE_FILE_RE.test(e.name) && !NON_LICENSE_EXT_RE.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b, "en"))[0];
  if (!match) return "";
  try {
    return fs.readFileSync(path.join(pkgDir, match), "utf8").trimEnd();
  } catch {
    return "";
  }
}

/** Normalizes a package `author` (string or object) to a bare display name, or "". */
function normalizeAuthor(author) {
  let name = "";
  if (typeof author === "string") name = author;
  else if (author && typeof author === "object" && typeof author.name === "string")
    name = author.name;
  return name
    .replace(/\s*<[^>]*>/g, "")
    .replace(/\s*\([^)]*\)/g, "")
    .trim();
}

/**
 * Parses overrides keys of the form `name@range` (e.g. `esrecurse@^4.3.0` or
 * `@jsonjoy.com/json-pointer@>=1.0.0 <2.0.0`). The range never contains `@`, so the
 * last `@` is always the separator.
 */
function parseOverrideKey(key) {
  const at = key.lastIndexOf("@");
  if (at <= 0) return null;
  return { name: key.slice(0, at), range: key.slice(at + 1) };
}

function overrideTextFor(name, version, packageOverrides) {
  for (const [key, value] of Object.entries(packageOverrides)) {
    const parsed = parseOverrideKey(key);
    if (!parsed || parsed.name !== name) continue;
    if (typeof value.licenseText !== "string") continue;
    if (semver.satisfies(version, parsed.range, { includePrerelease: true, loose: true })) {
      return value.licenseText;
    }
  }
  return undefined;
}

/**
 * Resolves the standard text lines for an SPDX id. Falls back to the first operand
 * of an `OR` expression that has a template (e.g. `(MIT OR CC0-1.0)` -> `MIT`).
 */
function spdxLinesFor(licenseId, spdxLicenseTexts) {
  if (typeof licenseId !== "string" || licenseId.length === 0) return null;
  if (spdxLicenseTexts[licenseId]) return spdxLicenseTexts[licenseId];
  const operands = licenseId
    .replace(/[()]/g, "")
    .split(/\s+OR\s+/i)
    .map((part) => part.split(/\s+AND\s+/i)[0].trim());
  for (const id of operands) {
    if (spdxLicenseTexts[id]) return spdxLicenseTexts[id];
  }
  return null;
}

function renderSpdxText(lines, author) {
  const joined = author
    ? lines.map((l) => l.split(COPYRIGHT_TOKEN).join(author)).join("\n")
    : lines.filter((l) => !l.includes(COPYRIGHT_TOKEN)).join("\n");
  return joined.replace(/\n{3,}/g, "\n\n").trim();
}

function bodyFor(name, version, licenseId, author, pkgDir, clarifications) {
  const override = overrideTextFor(name, version, clarifications.packageOverrides);
  if (typeof override === "string" && override.length > 0) return override;

  const fromFile = readLicenseFile(pkgDir);
  if (fromFile.length > 0) return fromFile;

  const lines = spdxLinesFor(licenseId, clarifications.spdxLicenseTexts);
  if (lines) return renderSpdxText(lines, author);

  return "";
}

function parseJsonOutput(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1));
    throw new Error("Unable to parse `pnpm licenses list --json` output");
  }
}

function runLicensesListForRoot(packageName) {
  const raw = execFileSync(
    "pnpm",
    ["--filter", packageName, "licenses", "list", "--prod", "--json"],
    { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
  );
  return parseJsonOutput(raw);
}

function asPlainVertical(sorted) {
  return Object.entries(sorted)
    .map(([moduleName, moduleData]) => {
      let out = getModuleNameForLicenseTextHeader(moduleName);
      out += licenseTitleLine(moduleData);
      out += "\n";
      out += moduleData.licenseText;
      return out;
    })
    .map((block) => `---\n\n${block}`)
    .join("\n\n");
}

const outFile = path.join(root, "NOTICES");
const clarificationsFile = path.join(__dirname, "write-third-party-notices.json");
const clarifications = JSON.parse(fs.readFileSync(clarificationsFile, "utf8"));
clarifications.spdxLicenseTexts ??= {};
clarifications.packageOverrides ??= {};

/** Map of `name@version` -> { licenses, licenseText }. */
const modules = {};
for (const packageName of FIRST_PARTY_PACKAGES) {
  console.error(`Scanning ${packageName}…`);
  const grouped = runLicensesListForRoot(packageName);
  for (const group of Object.values(grouped)) {
    for (const entry of group) {
      const { name, license, versions = [], paths = [] } = entry;
      if (!name || FIRST_PARTY.has(name)) continue;
      const author = normalizeAuthor(entry.author);
      versions.forEach((version, i) => {
        const key = `${name}@${version}`;
        if (modules[key]) return;
        const pkgDir = resolvePkgDir(name, paths[i] ?? paths[0]);
        modules[key] = {
          licenses: license,
          licenseText: bodyFor(name, version, license, author, pkgDir, clarifications),
        };
      });
    }
  }
}

const sortedKeys = Object.keys(modules).sort((a, b) => a.localeCompare(b, "en"));
const sorted = {};
for (const key of sortedKeys) sorted[key] = modules[key];

const preamble = ["Third-party notices for Duplistatus.", ""].join("\n");

const body = asPlainVertical(sorted);
fs.writeFileSync(outFile, `${preamble}\n${body}`, "utf8");
console.log(`Wrote ${path.relative(root, outFile)} (${sortedKeys.length} packages)`);
