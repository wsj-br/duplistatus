#!/usr/bin/env tsx
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import chalk from "chalk";
import { loadConfig } from "./config";
import { TranslationCache } from "./cache";
import { isIgnoredDocFile, loadTranslateIgnoreFile } from "./ignore";

// Status constants
const STATUS_UP_TO_DATE = "✓" as const;
const STATUS_NOT_TRANSLATED = "-" as const;
const STATUS_OUTDATED = "●" as const;
const STATUS_ORPHANED = "□" as const;
const STATUS_IGNORED = "i" as const;

// Type definition derived from constants
type TranslationStatus =
  | typeof STATUS_UP_TO_DATE
  | typeof STATUS_NOT_TRANSLATED
  | typeof STATUS_OUTDATED
  | typeof STATUS_ORPHANED
  | typeof STATUS_IGNORED;

interface FileStatus {
  filename: string;
  ignored?: boolean;
  statuses: Record<string, TranslationStatus>;
}

/**
 * Get all markdown files recursively from a directory
 */
function getAllDocFiles(docsDir: string): string[] {
  const files: string[] = [];

  function walk(dir: string) {
    if (!fs.existsSync(dir)) {
      return;
    }
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
  return files.sort();
}

/**
 * Get relative path from docs directory
 */
function getRelativePath(fullPath: string, docsDir: string): string {
  return path.relative(docsDir, fullPath);
}

/**
 * Get translation file path for a source file and locale
 */
function getTranslationPath(
  sourceRelativePath: string,
  locale: string,
  i18nDir: string
): string {
  return path.join(
    i18nDir,
    locale,
    "docusaurus-plugin-content-docs",
    "current",
    sourceRelativePath
  );
}

/**
 * Get all translation files for a locale (to find orphaned files)
 */
function getAllTranslationFiles(
  i18nDir: string,
  locale: string
): Map<string, string> {
  const files = new Map<string, string>();
  const localeDir = path.join(
    i18nDir,
    locale,
    "docusaurus-plugin-content-docs",
    "current"
  );

  if (!fs.existsSync(localeDir)) {
    return files;
  }

  function walk(dir: string, baseDir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath, baseDir);
      } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
        const relativePath = path.relative(baseDir, fullPath);
        files.set(relativePath, fullPath);
      }
    }
  }

  walk(localeDir, localeDir);
  return files;
}

/**
 * Check translation status for a file
 */
function checkFileStatus(
  sourcePath: string,
  sourceHash: string,
  locale: string,
  i18nDir: string,
  docsDir: string
): TranslationStatus {
  const relativePath = getRelativePath(sourcePath, docsDir);
  const translationPath = getTranslationPath(relativePath, locale, i18nDir);

  if (!fs.existsSync(translationPath)) {
    return STATUS_NOT_TRANSLATED;
  }

  try {
    const translationContent = fs.readFileSync(translationPath, "utf-8");
    const { data: frontMatter } = matter(translationContent);
    const translationHash = frontMatter.source_file_hash;

    if (!translationHash) {
      // File exists but no hash in frontmatter - treat as outdated
      return STATUS_OUTDATED;
    }

    if (translationHash === sourceHash) {
      return STATUS_UP_TO_DATE;
    } else {
      return STATUS_OUTDATED;
    }
  } catch (error) {
    // Error reading file - treat as outdated
    return STATUS_OUTDATED;
  }
}

/**
 * Get colored status symbol
 */
function getColoredStatus(status: TranslationStatus): string {
  switch (status) {
    case STATUS_UP_TO_DATE:
      return chalk.green(STATUS_UP_TO_DATE);
    case STATUS_NOT_TRANSLATED:
      return chalk.gray(STATUS_NOT_TRANSLATED);
    case STATUS_OUTDATED:
      return chalk.yellow(STATUS_OUTDATED);
    case STATUS_ORPHANED:
      return chalk.red(STATUS_ORPHANED);
    case STATUS_IGNORED:
      return chalk.gray(STATUS_IGNORED);
    default:
      return status;
  }
}

/**
 * Get filename color based on file status
 */
function getFilenameColor(file: FileStatus, locales: string[]): (text: string) => string {
  if (file.ignored) {
    return chalk.gray;
  }
  const statuses = locales.map((locale) => file.statuses[locale] || STATUS_NOT_TRANSLATED);
  const allUpToDate = statuses.every((s) => s === STATUS_UP_TO_DATE);
  const hasOutdated = statuses.some((s) => s === STATUS_OUTDATED);
  const hasOrphaned = statuses.some((s) => s === STATUS_ORPHANED);

  if (hasOrphaned) {
    return chalk.red;
  } else if (allUpToDate) {
    return chalk.green;
  } else if (hasOutdated) {
    return chalk.yellow;
  } else {
    return (text: string) => text; // Default color
  }
}

/**
 * Format table output
 */
function formatTable(
  files: FileStatus[],
  locales: string[]
): string {
  if (files.length === 0) {
    return "No files found.";
  }

  // Calculate column widths (without ANSI codes)
  const filenameWidth = Math.max(
    "Filename".length,
    ...files.map((f) => f.filename.length)
  );
  const localeWidth = Math.max(
    ...locales.map((l) => l.length),
    2 // Minimum width for status symbols (they're single characters)
  );

  // Build header
  const header = [
    "Filename".padEnd(filenameWidth),
    ...locales.map((locale) => locale.padEnd(localeWidth)),
  ].join(" | ");

  const separator = [
    "-".repeat(filenameWidth),
    ...locales.map(() => "-".repeat(localeWidth)),
  ].join(" | ");

  // Build rows with colors
  const rows = files.map((file) => {
    const filenameColor = getFilenameColor(file, locales);
    const coloredFilename = filenameColor(file.filename);
    const filenameCell = coloredFilename + " ".repeat(Math.max(0, filenameWidth - file.filename.length));

      const statusCells = locales.map((locale) => {
        const status = file.statuses[locale] || STATUS_NOT_TRANSLATED;
        const coloredStatus = getColoredStatus(status);
        return coloredStatus + " ".repeat(Math.max(0, localeWidth - 1)); // Status symbols are 1 char wide
      });

    return [filenameCell, ...statusCells].join(" | ");
  });

  return [header, separator, ...rows].join("\n");
}

function main() {
  try {
    const config = loadConfig();
    const { docs, i18n } = config.paths;
    const locales = config.locales.targets;
    const ignoreMatcher = loadTranslateIgnoreFile(process.cwd());

    if (!fs.existsSync(docs)) {
      console.error(chalk.red(`Error: Docs directory not found: ${docs}`));
      process.exit(1);
    }

    // Get all source files
    const sourceFiles = getAllDocFiles(docs);
    console.log(chalk.gray(`Found ${sourceFiles.length} source files\n`));

    // Compute hashes for all source files
    const sourceHashes = new Map<string, string>();
    for (const sourceFile of sourceFiles) {
      const content = fs.readFileSync(sourceFile, "utf-8");
      const hash = TranslationCache.computeHash(content);
      const relativePath = getRelativePath(sourceFile, docs);
      sourceHashes.set(relativePath, hash);
    }

    // Check status for each file
    const fileStatuses: FileStatus[] = [];
    for (const sourceFile of sourceFiles) {
      const relativePath = getRelativePath(sourceFile, docs);
      const statuses: Record<string, TranslationStatus> = {};
      const ignored = !!ignoreMatcher && isIgnoredDocFile(sourceFile, docs, ignoreMatcher);

      if (ignored) {
        for (const locale of locales) {
          statuses[locale] = STATUS_IGNORED;
        }
      } else {
        const sourceHash = sourceHashes.get(relativePath)!;
        for (const locale of locales) {
          statuses[locale] = checkFileStatus(
            sourceFile,
            sourceHash,
            locale,
            i18n,
            docs
          );
        }
      }

      fileStatuses.push({
        filename: relativePath,
        ignored,
        statuses,
      });
    }

    // Find orphaned translation files (files in translation folders but not in source)
    const orphanedFiles = new Map<string, Set<string>>(); // locale -> Set<relativePath>
    for (const locale of locales) {
      const translationFiles = getAllTranslationFiles(i18n, locale);
      for (const [relativePath] of translationFiles) {
        if (!sourceHashes.has(relativePath)) {
          if (!orphanedFiles.has(locale)) {
            orphanedFiles.set(locale, new Set());
          }
          orphanedFiles.get(locale)!.add(relativePath);
        }
      }
    }

    // Add orphaned files to the table
    for (const [locale, paths] of orphanedFiles) {
      for (const orphanPath of paths) {
        // Check if we already have this file (shouldn't happen, but be safe)
        const existing = fileStatuses.find((f) => f.filename === orphanPath);
        if (existing) {
          existing.statuses[locale] = STATUS_ORPHANED;
        } else {
          const statuses: Record<string, TranslationStatus> = {};
          for (const loc of locales) {
            statuses[loc] = loc === locale ? STATUS_ORPHANED : STATUS_NOT_TRANSLATED;
          }
          fileStatuses.push({
            filename: orphanPath,
            statuses,
          });
        }
      }
    }

    // Sort by filename
    fileStatuses.sort((a, b) => a.filename.localeCompare(b.filename));

    // Print table
    console.log(chalk.bold("Translation Status:\n"));
    console.log(formatTable(fileStatuses, locales));

    // Print legend
    console.log(chalk.gray("\nLegend:"));
    console.log(chalk.green(`  ${STATUS_UP_TO_DATE}`) + " = Translated and up-to-date");
    console.log(chalk.gray(`  ${STATUS_NOT_TRANSLATED}`) + " = Not translated");
    console.log(chalk.yellow(`  ${STATUS_OUTDATED}`) + " = Translated but outdated (source changed)");
    console.log(chalk.red(`  ${STATUS_ORPHANED}`) + " = Orphaned (exists in translation but not in source)");
    console.log(chalk.gray(`  ${STATUS_IGNORED}`) + " = Ignored (skipped by .translate-ignore)");

    // Print summary table
    console.log(chalk.bold("\nSummary:"));
    const totals: Record<
      string,
      { translated: number; outdated: number; missing: number; orphaned: number; ignored: number }
    > = {};
    for (const locale of locales) {
      totals[locale] = { translated: 0, outdated: 0, missing: 0, orphaned: 0, ignored: 0 };
    }

    for (const file of fileStatuses) {
      for (const locale of locales) {
        const status = file.statuses[locale];
        if (status === STATUS_UP_TO_DATE) {
          totals[locale].translated++;
        } else if (status === STATUS_OUTDATED) {
          totals[locale].outdated++;
        } else if (status === STATUS_NOT_TRANSLATED) {
          totals[locale].missing++;
        } else if (status === STATUS_ORPHANED) {
          totals[locale].orphaned++;
        } else if (status === STATUS_IGNORED) {
          totals[locale].ignored++;
        }
      }
    }

    // Format summary as table
    const summaryHeaders = ["Locale", "Up-to-date", "Outdated", "Missing", "Orphaned", "Ignored"];
    const summaryRows: string[][] = [];
    
    for (const locale of locales) {
      const stats = totals[locale];
      summaryRows.push([
        locale,
        stats.translated.toString(),
        stats.outdated.toString(),
        stats.missing.toString(),
        stats.orphaned.toString(),
        stats.ignored.toString(),
      ]);
    }

    // Calculate column widths for summary table (based on actual content, not ANSI codes)
    const summaryColWidths = summaryHeaders.map((header, idx) => {
      const maxContentWidth = Math.max(
        header.length,
        ...summaryRows.map((row) => row[idx].length)
      );
      return Math.max(maxContentWidth, 8); // Minimum width
    });

    // Build summary table
    const summaryHeaderRow = summaryHeaders
      .map((header, idx) => header.padEnd(summaryColWidths[idx]))
      .join(" | ");
    const summarySeparator = summaryColWidths.map((width) => "-".repeat(width)).join(" | ");
    
    const summaryDataRows = summaryRows.map((row) => {
      const cells: string[] = [];
      for (let idx = 0; idx < row.length; idx++) {
        const cell = row[idx];
        const num = parseInt(cell, 10);
        let formattedCell: string;
        const targetWidth = summaryColWidths[idx];
        
        if (idx === 0) {
          formattedCell = cell.padEnd(targetWidth);
        } else {
          // Apply color if needed
          let coloredCell: string;
          if (idx === 1 && num > 0) {
            coloredCell = chalk.green(cell);
          } else if (idx === 2 && num > 0) {
            coloredCell = chalk.yellow(cell);
          } else if (idx === 3 && num > 0) {
            coloredCell = chalk.gray(cell);
          } else if (idx === 4 && num > 0) {
            coloredCell = chalk.red(cell);
          } else if (idx === 5 && num > 0) {
            coloredCell = chalk.gray(cell);
          } else {
            coloredCell = cell;
          }
          
          // Calculate padding: target width minus actual content width (not ANSI code width)
          const actualContentWidth = cell.length;
          const paddingNeeded = targetWidth - actualContentWidth;
          formattedCell = coloredCell + " ".repeat(Math.max(0, paddingNeeded));
        }
        cells.push(formattedCell);
      }
      return cells.join(" | ");
    });

    console.log(summaryHeaderRow);
    console.log(summarySeparator);
    for (const row of summaryDataRows) {
      console.log(row);
    }
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error}`));
    process.exit(1);
  }
}

main();
