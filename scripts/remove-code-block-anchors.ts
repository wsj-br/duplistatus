#!/usr/bin/env -S pnpm exec tsx
/**
 * remove-code-block-anchors.ts
 *
 * Removes incorrectly added Docusaurus heading anchors ({#anchor-id}) from
 * lines inside fenced code blocks in Markdown files. These anchors belong on
 * headings, not inside code comments.
 *
 * Only processes .md files under documentation/docs/.
 * Usage: pnpm exec tsx scripts/remove-code-block-anchors.ts [--dry-run]
 */

import * as fs from "fs";
import * as path from "path";

const DOCS_DIR = path.join(process.cwd(), "documentation", "docs");
/** Matches space + Docusaurus anchor {#id} - remove entire match inside code blocks. */
const ANCHOR_IN_CODE_REGEX = /\s\{#[^}]+\}/g;

function* walkMdFiles(dir: string): Generator<string> {
  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    return;
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walkMdFiles(full);
    } else if (e.isFile() && e.name.endsWith(".md")) {
      yield full;
    }
  }
}

function processFile(filePath: string, dryRun: boolean): boolean {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  let inCodeBlock = false;
  let changed = false;
  const out: string[] = [];

  for (const line of lines) {
    const trimmed = line.trimEnd();
    if (trimmed.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      out.push(line);
      continue;
    }
    if (inCodeBlock) {
      const fixed = trimmed.replace(ANCHOR_IN_CODE_REGEX, "");
      if (fixed !== trimmed) {
        out.push(line.replace(trimmed, fixed));
        changed = true;
      } else {
        out.push(line);
      }
    } else {
      out.push(line);
    }
  }

  if (changed && !dryRun) {
    fs.writeFileSync(filePath, out.join("\n"), "utf-8");
  }
  return changed;
}

function main(): void {
  const dryRun = process.argv.includes("--dry-run");
  if (dryRun) {
    console.log("Dry run: no files will be modified.\n");
  }

  let totalFixed = 0;
  for (const filePath of walkMdFiles(DOCS_DIR)) {
    const rel = path.relative(process.cwd(), filePath);
    const changed = processFile(filePath, dryRun);
    if (changed) {
      totalFixed += 1;
      console.log(dryRun ? `Would fix: ${rel}` : `Fixed: ${rel}`);
    }
  }

  if (totalFixed === 0) {
    console.log("No files needed changes.");
  } else {
    console.log(
      `\n${totalFixed} file(s) ${dryRun ? "would be " : ""}updated.`
    );
  }
}

main();
