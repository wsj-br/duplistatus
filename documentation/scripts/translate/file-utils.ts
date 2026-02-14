import fs from "fs";
import path from "path";
import {
  loadTranslateIgnoreFile,
  loadTranslateSvgIgnoreFile,
  isIgnoredDocFile,
  isIgnoredJsonFile,
} from "./ignore";
import { DocumentSplitter } from "./splitter";
import { SvgSplitter } from "./svg-splitter";
import { JsonSplitter } from "./json-splitter";
import { TranslationConfig } from "./types";

const SVG_PREFIX = "duplistatus";

export function toPosixPath(p: string): string {
  return p.split(path.sep).join("/");
}

export function getAllDocFiles(
  docsDir: string,
  ig: ReturnType<typeof loadTranslateIgnoreFile> | null
): string[] {
  const files: string[] = [];

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
        files.push(fullPath);
      }
    }
  }

  walk(docsDir);
  const sorted = files.sort();
  if (!ig) return sorted;

  return sorted.filter((filepath) => !isIgnoredDocFile(filepath, docsDir, ig));
}

export function getAllSvgFiles(
  staticImgDir: string,
  ignoreMatcher: ((basename: string) => boolean) | null
): string[] {
  if (!fs.existsSync(staticImgDir)) return [];
  const files: string[] = [];
  const entries = fs.readdirSync(staticImgDir, { withFileTypes: true });
  for (const entry of entries) {
    if (
      entry.isFile() &&
      entry.name.toLowerCase().endsWith(".svg") &&
      entry.name.startsWith(SVG_PREFIX)
    ) {
      if (ignoreMatcher && ignoreMatcher(entry.name)) continue;
      files.push(path.join(staticImgDir, entry.name));
    }
  }
  return files.sort();
}

/**
 * Get all JSON translation files from the source i18n directory (e.g., i18n/en/)
 * These are Docusaurus-generated UI string files that need translation.
 */
export function getAllJsonFiles(
  jsonSourceDir: string,
  ignoreMatcher: ReturnType<typeof loadTranslateIgnoreFile> | null
): string[] {
  if (!fs.existsSync(jsonSourceDir)) return [];
  const files: string[] = [];

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith(".json")) {
        // Check if this file should be ignored
        if (ignoreMatcher && isIgnoredJsonFile(fullPath, jsonSourceDir, ignoreMatcher)) {
          continue;
        }
        files.push(fullPath);
      }
    }
  }

  walk(jsonSourceDir);
  return files.sort();
}

export interface ExistingSegmentsSnapshot {
  existingFilepaths: Set<string>;
  hashToFilepath: Map<string, string>;
}

export function buildExistingSegmentsSnapshot(
  config: TranslationConfig,
  cwd: string
): ExistingSegmentsSnapshot {
  const existingFilepaths = new Set<string>();
  const hashToFilepath = new Map<string, string>();

  const docsDir = path.resolve(cwd, config.paths.docs);
  const staticImgDir = path.resolve(
    cwd,
    config.paths.staticImg ?? "./static/img"
  );
  const jsonSourceDir = path.resolve(cwd, config.paths.jsonSource);

  const docIgnore = loadTranslateIgnoreFile(cwd);
  const svgIgnore = loadTranslateSvgIgnoreFile(cwd);
  const jsonIgnore = docIgnore; // Use same ignore patterns for JSON

  const docSplitter = new DocumentSplitter();
  const svgSplitter = new SvgSplitter();
  const jsonSplitter = new JsonSplitter();

  // Walk docs
  const docFiles = getAllDocFiles(docsDir, docIgnore);
  for (const filepath of docFiles) {
    const relativePath = toPosixPath(path.relative(docsDir, filepath));
    existingFilepaths.add(relativePath);

    const content = fs.readFileSync(filepath, "utf-8");
    const segments = docSplitter.split(content);
    for (const segment of segments) {
      if (!segment.translatable) continue;
      if (!hashToFilepath.has(segment.hash)) {
        hashToFilepath.set(segment.hash, relativePath);
      }
    }
  }

  // Walk SVGs
  const svgFiles = getAllSvgFiles(staticImgDir, svgIgnore);
  for (const filepath of svgFiles) {
    const filename = path.basename(filepath);
    const relativePath = `static/img/${filename}`;
    existingFilepaths.add(relativePath);

    const content = fs.readFileSync(filepath, "utf-8");
    const segments = svgSplitter.split(content);
    for (const segment of segments) {
      if (!segment.translatable) continue;
      if (!hashToFilepath.has(segment.hash)) {
        hashToFilepath.set(segment.hash, relativePath);
      }
    }
  }

  // Walk JSON files
  const jsonFiles = getAllJsonFiles(jsonSourceDir, jsonIgnore);
  for (const filepath of jsonFiles) {
    const relativePath = toPosixPath(path.relative(jsonSourceDir, filepath));
    existingFilepaths.add(relativePath);

    const content = fs.readFileSync(filepath, "utf-8");
    const segments = jsonSplitter.split(filepath, content);
    for (const segment of segments) {
      if (!segment.translatable) continue;
      if (!hashToFilepath.has(segment.hash)) {
        hashToFilepath.set(segment.hash, relativePath);
      }
    }
  }

  return { existingFilepaths, hashToFilepath };
}
