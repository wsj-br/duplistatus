#!/usr/bin/env tsx
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import chalk from "chalk";
import { loadConfig } from "./config";
import { TranslationCache } from "./cache";
import { isIgnoredDocFile, isIgnoredJsonFile, isIgnoredSvgFile, loadTranslateIgnoreFile } from "./ignore";
import { getAllJsonFiles, getAllSvgFiles, toPosixPath } from "./file-utils";

// Status constants
const STATUS_UP_TO_DATE = "✓" as const;
const STATUS_NOT_TRANSLATED = "-" as const;
const STATUS_OUTDATED = "●" as const;
const STATUS_ORPHANED = "□" as const;
const STATUS_IGNORED = "i" as const;

type TranslationStatus =
  | typeof STATUS_UP_TO_DATE
  | typeof STATUS_NOT_TRANSLATED
  | typeof STATUS_OUTDATED
  | typeof STATUS_ORPHANED
  | typeof STATUS_IGNORED;

interface FileStatus {
  filename: string;
  type: "doc" | "json" | "svg";
  ignored?: boolean;
  statuses: Record<string, TranslationStatus>;
}

/**
 * Get all markdown files recursively from a directory
 */
function getAllDocFiles(docsDir: string): string[] {
  const files: string[] = [];
  function walk(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) files.push(fullPath);
    }
  }
  walk(docsDir);
  return files.sort();
}

/**
 * Get all JSON source files from i18n/en/
 */
function getAllJsonSourceFiles(jsonSourceDir: string): string[] {
  return getAllJsonFiles(jsonSourceDir, null);
}

/**
 * Get all SVG source files from static/img/
 */
function getAllSvgSourceFiles(staticImgDir: string): string[] {
  if (!fs.existsSync(staticImgDir)) return [];
  const files: string[] = [];
  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else if (entry.name.endsWith(".svg") && path.basename(entry.name).startsWith("duplistatus")) {
        files.push(fullPath);
      }
    }
  }
  walk(staticImgDir);
  return files.sort();
}

/**
 * Compute hash for a file
 */
function computeFileHash(filePath: string): string {
  const content = fs.readFileSync(filePath, "utf-8");
  return TranslationCache.computeHash(content);
}

/**
 * Check translation status for a file using cache file_tracking.
 * Returns status, and also provides fallback if no tracking entry exists.
 */
function checkFileStatus(
  info: { type: "doc" | "json" | "svg"; fullPath: string; hash: string; cacheKey: string },
  locale: string,
  config: ReturnType<typeof loadConfig>,
  cache: TranslationCache
): TranslationStatus {
  // Primary: check file_tracking
  const trackedHash = cache.getFileStatus(info.cacheKey, locale);
  if (trackedHash) {
    return trackedHash === info.hash ? STATUS_UP_TO_DATE : STATUS_OUTDATED;
  }

  // Fallback: no tracking entry. Check if translation file exists and compare content hash.
  let translationPath: string | undefined;
  const i18n = config.paths?.i18n ?? "./i18n";
  if (info.type === "doc") {
    translationPath = path.join(i18n, locale, "docusaurus-plugin-content-docs", "current", info.cacheKey);
  } else if (info.type === "json") {
    translationPath = path.join(i18n, locale, info.cacheKey);
  } else {
    // SVG: cacheKey is "static/img/filename.svg", we need just filename for assets/
    const filename = path.basename(info.cacheKey);
    translationPath = path.join(i18n, locale, "docusaurus-plugin-content-docs", "current", "assets", filename);
  }

  if (!translationPath) {
    return STATUS_OUTDATED;
  }

  if (!fs.existsSync(translationPath)) {
    return STATUS_NOT_TRANSLATED;
  }

  try {
    const transContent = fs.readFileSync(translationPath, "utf-8");
    const transHash = TranslationCache.computeHash(transContent);
    return transHash === info.hash ? STATUS_UP_TO_DATE : STATUS_OUTDATED;
  } catch {
    return STATUS_OUTDATED;
  }
}

/**
 * Get all translation files for a locale (to find orphaned files)
 * Returns map: relativePath -> fullPath
 */
function getAllTranslationFiles(
  i18nDir: string,
  locale: string
): Map<string, string> {
  const files = new Map<string, string>();
  const localeDir = path.join(i18nDir, locale, "docusaurus-plugin-content-docs", "current");
  const localeRootDir = path.join(i18nDir, locale);

  // Scan current/ for .md, .mdx, .svg
  function walkCurrent(dir: string, baseDir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) walkCurrent(fullPath, baseDir);
      else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx") || entry.name.endsWith(".svg")) {
        files.set(path.relative(baseDir, fullPath), fullPath);
      }
    }
  }
  walkCurrent(localeDir, localeDir);

  // Scan locale root for JSON (excluding docusaurus-plugin-content-docs)
  if (fs.existsSync(localeRootDir)) {
    function walkLocaleRoot(dir: string, baseDir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== "docusaurus-plugin-content-docs") {
          walkLocaleRoot(fullPath, baseDir);
        } else if (entry.name.endsWith(".json")) {
          files.set(path.relative(baseDir, fullPath), fullPath);
        }
      }
    }
    walkLocaleRoot(localeRootDir, localeRootDir);
  }

  return files;
}

function main() {
  try {
    const config = loadConfig();
    // Use nullish coalescing to ensure all paths have defaults
    const paths = config.paths || {};
    const docs = paths.docs ?? "./docs";
    const i18n = paths.i18n ?? "./i18n";
    const jsonSource = paths.jsonSource ?? "./i18n/en";
    const staticImg = paths.staticImg ?? "./static/img";
    const locales = config.locales?.targets ?? [];
    const ignoreMatcher = loadTranslateIgnoreFile(process.cwd());

    if (!fs.existsSync(docs)) {
      console.error(chalk.red(`Error: Docs directory not found: ${docs}`));
      process.exit(1);
    }
    if (!fs.existsSync(jsonSource)) {
      console.error(chalk.red(`Error: JSON source directory not found: ${jsonSource}`));
      process.exit(1);
    }

    // Gather source files
    const docFiles = getAllDocFiles(docs);
    const jsonFiles = getAllJsonSourceFiles(jsonSource);
    const svgFiles = staticImg ? getAllSvgSourceFiles(staticImg) : [];

    console.log(chalk.gray(`Found ${docFiles.length} documentation files`));
    console.log(chalk.gray(`Found ${jsonFiles.length} JSON UI files`));
    console.log(chalk.gray(`Found ${svgFiles.length} SVG files\n`));

    // Build sourceInfo map: cacheKey -> { type, fullPath, hash, cacheKey }
    const sourceInfo = new Map<string, { type: "doc" | "json" | "svg"; fullPath: string; hash: string; cacheKey: string }>();

    // Docs: cacheKey = relative path from docs (POSIX)
    for (const file of docFiles) {
      const cacheKey = toPosixPath(path.relative(docs, file));
      sourceInfo.set(cacheKey, { type: "doc", fullPath: file, hash: computeFileHash(file), cacheKey });
    }

    // JSON: cacheKey = relative path from jsonSource (POSIX)
    for (const file of jsonFiles) {
      const cacheKey = toPosixPath(path.relative(jsonSource, file));
      sourceInfo.set(cacheKey, { type: "json", fullPath: file, hash: computeFileHash(file), cacheKey });
    }

    // SVG: cacheKey = "static/img/<filename>"
    for (const file of svgFiles) {
      const filename = path.basename(file);
      const cacheKey = `static/img/${filename}`;
      sourceInfo.set(cacheKey, { type: "svg", fullPath: file, hash: computeFileHash(file), cacheKey });
    }

    // Open cache
    const cache = new TranslationCache(config.paths.cache);

    // Check status for each source file
    const fileStatuses: FileStatus[] = [];
    for (const [cacheKey, info] of sourceInfo) {
      // Determine ignored
      let ignored = false;
      try {
        if (info.type === "doc") {
          ignored = !!ignoreMatcher && isIgnoredDocFile(info.fullPath, docs, ignoreMatcher);
        } else if (info.type === "json") {
          ignored = !!ignoreMatcher && isIgnoredJsonFile(info.fullPath, jsonSource, ignoreMatcher);
        } else {
          ignored = !!ignoreMatcher && isIgnoredSvgFile(info.fullPath, staticImg, ignoreMatcher);
        }
      } catch (err: any) {
        if (err.message?.includes("Received undefined") || err.message?.includes("must be of type string")) {
          console.error(`Error checking ignore for ${info.type} file: ${info.fullPath}`);
          console.error(`  docs=${docs} jsonSource=${jsonSource} staticImg=${staticImg}`);
          console.error(`  stack: ${err.stack}`);
          process.exit(1);
        }
      }

      const statuses: Record<string, TranslationStatus> = {};
      if (ignored) {
        for (const locale of locales) statuses[locale] = STATUS_IGNORED;
      } else {
        for (const locale of locales) {
          statuses[locale] = checkFileStatus(info, locale, config, cache);
        }
      }

      // Display name
      let display = cacheKey;
      if (info.type === "json") display = `[JSON] ${cacheKey}`;
      else if (info.type === "svg") display = `[SVG] ${path.basename(cacheKey)}`;

      fileStatuses.push({ filename: display, type: info.type, ignored, statuses });
    }

    // Find orphaned translation files
    const orphanedFiles = new Map<string, Set<string>>(); // locale -> Set<relativePath>
    for (const locale of locales) {
      const translationFiles = getAllTranslationFiles(i18n, locale);
      for (const [transRelativePath, fullPath] of translationFiles) {
        // Determine the source cacheKey that would produce this translation
        let expectedCacheKey: string | null = null;
        if (fullPath.endsWith(".svg")) {
          const filename = path.basename(fullPath);
          expectedCacheKey = `static/img/${filename}`;
        } else if (fullPath.endsWith(".json")) {
          expectedCacheKey = transRelativePath; // JSON stored directly under locale
        } else {
          // Docs: translation file under current/ matches cacheKey (relative from docs)
          expectedCacheKey = transRelativePath;
        }

        if (expectedCacheKey && !sourceInfo.has(expectedCacheKey)) {
          if (!orphanedFiles.has(locale)) orphanedFiles.set(locale, new Set());
          orphanedFiles.get(locale)!.add(transRelativePath);
        }
      }
    }

    // Add orphaned entries to table
    for (const [locale, paths] of orphanedFiles) {
      for (const orphanPath of paths) {
        const existing = fileStatuses.find(f => f.filename === orphanPath);
        if (existing) {
          existing.statuses[locale] = STATUS_ORPHANED;
        } else {
          const statuses: Record<string, TranslationStatus> = {};
          for (const loc of locales) {
            statuses[loc] = loc === locale ? STATUS_ORPHANED : STATUS_NOT_TRANSLATED;
          }
          let type: "doc" | "json" | "svg" = "doc";
          if (orphanPath.endsWith(".json")) type = "json";
          if (orphanPath.endsWith(".svg")) type = "svg";
          fileStatuses.push({ filename: orphanPath, type, statuses });
        }
      }
    }

    // Sort and print
    fileStatuses.sort((a, b) => a.filename.localeCompare(b.filename));
    console.log(chalk.bold("\nTranslation Status:\n"));
    // (print table code - same as before, using formatTable function)
    // We'll keep formatTable function as previously written, it works with FileStatus[]
    console.log(formatTable(fileStatuses, locales));

    // Legend and summary (same as before)
    console.log(chalk.gray("\nLegend:"));
    console.log(chalk.green(`  ${STATUS_UP_TO_DATE}`) + " = Translated and up-to-date");
    console.log(chalk.gray(`  ${STATUS_NOT_TRANSLATED}`) + " = Not translated");
    console.log(chalk.yellow(`  ${STATUS_OUTDATED}`) + " = Translated but outdated (source changed)");
    console.log(chalk.red(`  ${STATUS_ORPHANED}`) + " = Orphaned (exists in translation but not in source)");
    console.log(chalk.gray(`  ${STATUS_IGNORED}`) + " = Ignored (skipped by .translate-ignore)");

    console.log(chalk.bold("\nSummary:"));
    const totals: Record<string, { translated: number; outdated: number; missing: number; orphaned: number; ignored: number }> = {};
    for (const locale of locales) totals[locale] = { translated: 0, outdated: 0, missing: 0, orphaned: 0, ignored: 0 };
    for (const file of fileStatuses) {
      for (const locale of locales) {
        const s = file.statuses[locale];
        if (s === STATUS_UP_TO_DATE) totals[locale].translated++;
        else if (s === STATUS_OUTDATED) totals[locale].outdated++;
        else if (s === STATUS_NOT_TRANSLATED) totals[locale].missing++;
        else if (s === STATUS_ORPHANED) totals[locale].orphaned++;
        else if (s === STATUS_IGNORED) totals[locale].ignored++;
      }
    }

    printSummaryTable(locales, totals);
    cache.close();
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error}`));
    process.exit(1);
  }
}

// formatTable function (same as previous)
function getColoredStatus(status: TranslationStatus): string {
  switch (status) {
    case STATUS_UP_TO_DATE: return chalk.green(STATUS_UP_TO_DATE);
    case STATUS_NOT_TRANSLATED: return chalk.gray(STATUS_NOT_TRANSLATED);
    case STATUS_OUTDATED: return chalk.yellow(STATUS_OUTDATED);
    case STATUS_ORPHANED: return chalk.red(STATUS_ORPHANED);
    case STATUS_IGNORED: return chalk.gray(STATUS_IGNORED);
    default: return status;
  }
}

function getFilenameColor(file: FileStatus, locales: string[]): (text: string) => string {
  if (file.ignored) return chalk.gray;
  const statuses = locales.map(l => file.statuses[l] || STATUS_NOT_TRANSLATED);
  if (statuses.some(s => s === STATUS_ORPHANED)) return chalk.red;
  if (statuses.every(s => s === STATUS_UP_TO_DATE)) return chalk.green;
  if (statuses.some(s => s === STATUS_OUTDATED)) return chalk.yellow;
  return (text: string) => text;
}

function formatTable(files: FileStatus[], locales: string[]): string {
  if (files.length === 0) return "No files found.";
  const filenameWidth = Math.max("Filename".length, ...files.map(f => f.filename.length));
  const localeWidth = Math.max(...locales.map(l => l.length), 2);
  const header = ["Filename".padEnd(filenameWidth), ...locales.map(l => l.padEnd(localeWidth))].join(" | ");
  const separator = ["-".repeat(filenameWidth), ...locales.map(() => "-".repeat(localeWidth))].join(" | ");
  const rows = files.map(file => {
    const color = getFilenameColor(file, locales);
    const nameCell = color(file.filename) + " ".repeat(Math.max(0, filenameWidth - file.filename.length));
    const cells = locales.map(locale => {
      const status = file.statuses[locale] || STATUS_NOT_TRANSLATED;
      return getColoredStatus(status) + " ".repeat(Math.max(0, localeWidth - 1));
    });
    return [nameCell, ...cells].join(" | ");
  });
  return [header, separator, ...rows].join("\n");
}

// Summary table printing (same as previous version)
function printSummaryTable(locales: string[], totals: Record<string, { translated: number; outdated: number; missing: number; orphaned: number; ignored: number }>) {
  const headers = ["Locale", "Up-to-date", "Outdated", "Missing", "Orphaned", "Ignored"];
  const rows: string[][] = locales.map(locale => {
    const t = totals[locale];
    return [locale, t.translated.toString(), t.outdated.toString(), t.missing.toString(), t.orphaned.toString(), t.ignored.toString()];
  });

  const colWidths = headers.map((h, i) => Math.max(h.length, ...rows.map(r => r[i].length), 8));
  const headerRow = headers.map((h, i) => h.padEnd(colWidths[i])).join(" | ");
  const sep = colWidths.map(w => "-".repeat(w)).join(" | ");
  const dataRows = rows.map(row => {
    return row.map((cell, i) => {
      if (i === 0) return cell.padEnd(colWidths[i]);
      const num = parseInt(cell, 10);
      let colored: string;
      if (i === 1 && num > 0) colored = chalk.green(cell);
      else if (i === 2 && num > 0) colored = chalk.yellow(cell);
      else if (i === 3 && num > 0) colored = chalk.gray(cell);
      else if (i === 4 && num > 0) colored = chalk.red(cell);
      else if (i === 5 && num > 0) colored = chalk.gray(cell);
      else colored = cell;
      return colored + " ".repeat(Math.max(0, colWidths[i] - cell.length));
    }).join(" | ");
  });

  console.log(headerRow);
  console.log(sep);
  dataRows.forEach(r => console.log(r));
}

main();
