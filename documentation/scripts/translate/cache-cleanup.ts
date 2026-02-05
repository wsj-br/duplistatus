/**
 * Clean up translation cache and orphaned translation files:
 * 1. Orphaned cache entries: remove rows for source files that no longer exist
 * 2. Stale cache entries: remove rows where last_hit_at IS NULL or filepath IS NULL
 * 3. Orphaned translation files: delete i18n files whose source was removed from docs/
 *
 * Run from documentation/: pnpm exec tsx scripts/translate/cache-cleanup.ts [-c config-path] [--dry-run]
 *
 * Writes a log file cleanup_YYYY-MM-DD_HH-MM-SS.log with all deleted items.
 * With --dry-run, no changes are made; the log reports what would be deleted.
 */

import { Command } from "commander";
import fs from "fs";
import path from "path";
import * as readline from "readline";
import chalk from "chalk";
import { loadConfig } from "./config";
import { TranslationCache } from "./cache";
import {
  buildExistingSegmentsSnapshot,
  getAllDocFiles,
  toPosixPath,
} from "./file-utils";
import { TranslationConfig } from "./types";

const program = new Command();

function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(/^y(es)?$/i.test(answer.trim()));
    });
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timestampForLogfile(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${d}_${h}-${min}-${s}`;
}

/**
 * Get all translation file paths for a locale (relative path -> full path)
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
        const relativePath = toPosixPath(path.relative(baseDir, fullPath));
        files.set(relativePath, fullPath);
      }
    }
  }

  walk(localeDir, localeDir);
  return files;
}

/**
 * Find and delete orphaned translation files (exist in i18n but source was deleted)
 */
function cleanupOrphanedTranslationFiles(
  config: TranslationConfig,
  cwd: string,
  dryRun: boolean,
  log: (msg: string) => void
): { deleted: number; paths: string[] } {
  const docsDir = path.resolve(cwd, config.paths.docs);
  const i18nDir = path.resolve(cwd, config.paths.i18n);

  // Use null ignore so we include ALL source files (including ignored).
  // Orphaned = translation exists but source was deleted. Ignored files still have sources.
  const docFiles = getAllDocFiles(docsDir, null);
  const sourceRelativePaths = new Set<string>();
  for (const fullPath of docFiles) {
    sourceRelativePaths.add(toPosixPath(path.relative(docsDir, fullPath)));
  }

  const deletedPaths: string[] = [];
  for (const locale of config.locales.targets) {
    const translationFiles = getAllTranslationFiles(i18nDir, locale);
    for (const [relativePath, fullPath] of translationFiles) {
      if (!sourceRelativePaths.has(relativePath)) {
        deletedPaths.push(fullPath);
        if (!dryRun) {
          fs.unlinkSync(fullPath);
        }
      }
    }
  }

  return { deleted: deletedPaths.length, paths: deletedPaths };
}

async function main() {
  program
    .option("-c, --config <path>", "Path to config file")
    .option("--dry-run", "Report what would be deleted without making changes")
    .parse(process.argv);

  const options = program.opts();
  const dryRun = !!options.dryRun;
  const config = loadConfig(options.config);
  const cachePath = path.resolve(config.paths.cache);
  const cwd = process.cwd();

  console.log(
    chalk.yellow(
      "\n⚠️  Before running cleanup, run `pnpm translate --force` to ensure last_hit_at timestamps are updated. \n   Otherwise valid cache entries may be deleted as stale.\n"
    )
  );

  if (!dryRun) {
    const confirmed = await askConfirmation(
      "Proceed with cleanup? This will delete cache rows and orphaned translation files. [y/N] "
    );
    if (!confirmed) {
      console.log(chalk.gray("Cleanup cancelled."));
      process.exit(0);
    }
  }

  const logFilename = `cleanup_${timestampForLogfile()}.log`;
  const logPath = path.join(cachePath, logFilename);
  const logLines: string[] = [];

  function log(msg: string) {
    logLines.push(msg);
  }

  console.log(chalk.blue("\n📋 Scanning docs and SVGs…"));
  const { existingFilepaths, hashToFilepath } = buildExistingSegmentsSnapshot(config, cwd);
  console.log(
    chalk.gray(
      `   Found ${existingFilepaths.size} files, ${hashToFilepath.size} segments in current docs`
    )
  );

  const cache = new TranslationCache(cachePath);
  const statsBefore = cache.getStats();
  const cacheDbPath = path.join(cachePath, "cache.db");
  const cacheSizeBytes = fs.existsSync(cacheDbPath)
    ? fs.statSync(cacheDbPath).size
    : 0;

  console.log(
    chalk.gray(
      `   Cache: ${statsBefore.totalSegments} translation rows, ${statsBefore.totalFiles} tracked files, ${formatBytes(cacheSizeBytes)}`
    )
  );

  log(`Cleanup started at ${new Date().toISOString()}${dryRun ? " (DRY RUN - no changes made)" : ""}`);
  log(`Cache: ${statsBefore.totalSegments} translation rows, ${statsBefore.totalFiles} tracked files`);
  log("");

  console.log(
    chalk.blue(
      `\n🧹 Cleaning orphaned entries (deleted files)…${dryRun ? chalk.yellow(" [dry-run]") : ""}`
    )
  );
  const orphanedResult = cache.cleanupOrphanedFileTranslations(
    existingFilepaths,
    hashToFilepath,
    dryRun
  );
  const { deleted: orphanedDeleted, updated: orphanedUpdated } = orphanedResult;

  log(`=== Orphaned entries (deleted files)${dryRun ? " [would be]" : ""} ===`);
  log(
    `${dryRun ? "Would delete" : "Deleted"}: ${orphanedDeleted} translation rows, ${dryRun ? "Would update" : "Updated"}: ${orphanedUpdated} rows`
  );
  log("");
  if (orphanedResult.deletedFilepaths.length > 0) {
    log(`Filepaths ${dryRun ? "that would be " : ""}removed from file_tracking:`);
    for (const fp of orphanedResult.deletedFilepaths.sort()) {
      log(`  - ${fp}`);
    }
    log("");
  }
  if (orphanedResult.deletedTranslations.length > 0) {
    log(
      `Translation rows ${dryRun ? "that would be " : ""}deleted (source_hash, locale, filepath):`
    );
    for (const row of orphanedResult.deletedTranslations) {
      log(`  - ${row.source_hash} | ${row.locale} | ${row.filepath}`);
    }
    log("");
  }

  console.log(
    chalk.blue(
      `🧹 Cleaning stale entries (last_hit_at or filepath NULL)…${dryRun ? chalk.yellow(" [dry-run]") : ""}`
    )
  );
  const staleResult = cache.cleanupStaleTranslations(dryRun);
  cache.close();

  log(`=== Stale entries ${dryRun ? "that would be " : ""}deleted ===`);
  log(`Count: ${staleResult.count}`);
  log("");
  if (staleResult.deletedRows.length > 0) {
    log(
      `${dryRun ? "Rows that would be deleted" : "Deleted rows"} (source_hash, locale, filepath):`
    );
    for (const row of staleResult.deletedRows) {
      log(`  - ${row.source_hash} | ${row.locale} | ${row.filepath ?? "(null)"}`);
    }
  }
  log("");

  // Phase 3: Orphaned translation files on disk (exist in i18n but source was deleted)
  console.log(
    chalk.blue(
      `🧹 Cleaning orphaned translation files…${dryRun ? chalk.yellow(" [dry-run]") : ""}`
    )
  );
  const orphanedFilesResult = cleanupOrphanedTranslationFiles(
    config,
    cwd,
    dryRun,
    log
  );

  log(`=== Orphaned translation files ${dryRun ? "that would be " : ""}deleted ===`);
  log(`Count: ${orphanedFilesResult.deleted}`);
  if (orphanedFilesResult.paths.length > 0) {
    log(`${dryRun ? "Files that would be deleted" : "Deleted files"}:`);
    for (const fp of orphanedFilesResult.paths.sort()) {
      log(`  - ${fp}`);
    }
  }

  fs.writeFileSync(logPath, logLines.join("\n") + "\n", "utf8");
  console.log(chalk.gray(`\n   Log written to ${logPath}`));
  const summary = dryRun
    ? `Would delete ${orphanedDeleted} orphaned cache rows, would update ${orphanedUpdated}; would delete ${staleResult.count} stale; would delete ${orphanedFilesResult.deleted} orphaned files. (dry-run, no changes made)`
    : `Orphaned cache: ${orphanedDeleted} deleted, ${orphanedUpdated} updated; Stale: ${staleResult.count} deleted; Orphaned files: ${orphanedFilesResult.deleted} deleted.`;
  console.log(chalk.green(`\n✅ ${summary}`));
}

main().catch((err) => {
  console.error(chalk.red(`\n❌ Error: ${err}`));
  process.exit(1);
});
