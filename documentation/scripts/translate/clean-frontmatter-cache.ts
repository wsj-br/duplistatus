#!/usr/bin/env node
/**
 * Script to clean cache entries that contain frontmatter blocks
 * This removes only corrupted cache entries, preserving valid translations
 */

import { Command } from "commander";
import chalk from "chalk";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { loadConfig } from "./config";

const program = new Command();

function isStructuralSingleLineNonTranslatable(sourceText: string): boolean {
  const trimmed = sourceText.trim();
  if (!trimmed) return true;
  if (trimmed.includes("\n")) return false;

  // Any single-line containing HTML tags is structural (e.g. <br/>, <IconButton ... />, <div>).
  if (/<[^>]+>/.test(trimmed)) return true;

  // Markdown thematic break / horizontal rule
  if (/^---+$/.test(trimmed)) return true;

  // If, after stripping common markdown noise, there's no real text, treat as non-translatable.
  const textOnly = trimmed
    .replace(/`[^`]*`/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/[*_#>\-]/g, "")
    .replace(/[()[\]{}<>]/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();

  return !/[A-Za-z0-9]/.test(textOnly);
}

/**
 * Check if a translated text contains frontmatter blocks or appended content from other files
 * Returns an object with the issue type and details for better reporting
 */
function hasFrontmatterIssue(
  translatedText: string,
  sourceText?: string
): { hasIssue: boolean; reason?: string; sourceLines?: number; translatedLines?: number; ratio?: number } {
  // Root cause prevention: we should never have cached translations for structural-only single-line segments
  // (e.g. <br/>, ---). If they exist, they were produced by the model from near-empty prompts and are unsafe.
  if (sourceText && isStructuralSingleLineNonTranslatable(sourceText)) {
    return { hasIssue: true, reason: "Source is structural single-line (should not be translated/cached)" };
  }

  // Pattern: --- on its own line, followed by YAML-like content, ending with ---
  const frontmatterPattern = /(^|\n)---\s*\n([\s\S]*?)\n---\s*(\n|$)/g;
  const matches = [...translatedText.matchAll(frontmatterPattern)];
  
  for (const match of matches) {
    const yamlContent = match[2];
    // Check if it contains frontmatter-like keys
    if (yamlContent.match(/(sidebar_position|slug|translation_|source_file_|title|description)\s*:/)) {
      return { hasIssue: true, reason: "Contains frontmatter block" };
    }
  }
  
  // Check for markdown code blocks containing entire documents
  if (translatedText.match(/```markdown\s*\n.*?#\s+[^\n]+\n/s)) {
    return { hasIssue: true, reason: "Contains markdown code block with full document" };
  }
  
  // Check for document-starting patterns that suggest appended content
  const documentStartPatterns = [
    /^#\s+(Installation|Getting Started|Démarrage|Erste Schritte|Configuración|Configuração|Configuration|Konfiguration)/im,
    /^#\s+(Premiers pas|Primeros pasos|Primeiros passos)/im,
  ];
  
  // If we have source text, check line count
  if (sourceText) {
    const sourceAllLines = sourceText.split('\n');
    const translatedAllLines = translatedText.split('\n');
    const sourceLines = sourceAllLines.filter(l => l.trim().length > 0);
    const translatedLines = translatedAllLines.filter(l => l.trim().length > 0);
    
    // Calculate line count ratio
    const lineRatio = sourceLines.length > 0 ? translatedLines.length / sourceLines.length : 0;
    const totalLineRatio = sourceAllLines.length > 0 ? translatedAllLines.length / sourceAllLines.length : 0;
    
    // Check if translation has significantly more lines than source
    // Translations can be longer due to language differences, but 1.5x+ is suspicious
    const SUSPICIOUS_LINE_RATIO = 1.5; // If translation has 1.5x+ lines, it's suspicious
    
    if (lineRatio > SUSPICIOUS_LINE_RATIO || totalLineRatio > SUSPICIOUS_LINE_RATIO) {
      return {
        hasIssue: true,
        reason: `Excessive line count (${lineRatio.toFixed(2)}x source lines)`,
        sourceLines: sourceLines.length,
        translatedLines: translatedLines.length,
        ratio: lineRatio,
      };
    }
  } else {
    // Even without source, check for multiple document-starting patterns (indicates concatenation)
    const matches = translatedText.match(/^#\s+[^#]/gm);
    if (matches && matches.length > 1) {
      // Check if any match document-starting patterns
      if (matches.some(m => documentStartPatterns.some(pattern => pattern.test(m)))) {
        return { hasIssue: true, reason: "Multiple document-starting patterns found" };
      }
    }
  }
  
  return { hasIssue: false };
}

async function cleanFrontmatterCache(
  cachePath: string,
  locale?: string,
  dryRun: boolean = false
): Promise<void> {
  const dbPath = path.join(cachePath, "cache.db");
  
  if (!fs.existsSync(dbPath)) {
    console.log(chalk.yellow(`Cache database not found at ${dbPath}`));
    return;
  }

  const db = new Database(dbPath);
  
  try {
    // Get all translations (optionally filtered by locale)
    let query = "SELECT source_hash, locale, source_text, translated_text FROM translations";
    const params: string[] = [];
    
    if (locale) {
      query += " WHERE locale = ?";
      params.push(locale);
    }
    
    const allTranslations = db.prepare(query).all(...params) as Array<{
      source_hash: string;
      locale: string;
      source_text: string;
      translated_text: string;
    }>;
    
    console.log(chalk.cyan(`\n🔍 Scanning ${allTranslations.length} cache entries...\n`));
    
    const corruptedEntries: Array<{
      source_hash: string;
      locale: string;
      reason?: string;
      sourceLines?: number;
      translatedLines?: number;
      ratio?: number;
    }> = [];
    let checkedCount = 0;
    
    for (const entry of allTranslations) {
      checkedCount++;
      // Pass source_text to detect appended content from other files
      const issue = hasFrontmatterIssue(entry.translated_text, entry.source_text);
      if (issue.hasIssue) {
        corruptedEntries.push({
          source_hash: entry.source_hash,
          locale: entry.locale,
          reason: issue.reason,
          sourceLines: issue.sourceLines,
          translatedLines: issue.translatedLines,
          ratio: issue.ratio,
        });
        
        if (dryRun || process.env.VERBOSE === "true") {
          // Show details about the corrupted content
          let details = `  ⚠️  Found corrupted entry: ${entry.source_hash} (${entry.locale})`;
          if (issue.reason) {
            details += `\n     Reason: ${issue.reason}`;
          }
          if (issue.sourceLines !== undefined && issue.translatedLines !== undefined) {
            details += `\n     Lines: ${issue.sourceLines} → ${issue.translatedLines} (${issue.ratio?.toFixed(2)}x)`;
          }
          // Show a preview of the corrupted content
          const preview = entry.translated_text.substring(0, 200).replace(/\n/g, " ");
          details += `\n     Preview: ${preview}...\n`;
          console.log(chalk.yellow(details));
        }
      }
      
      // Progress indicator for large caches
      if (checkedCount % 1000 === 0) {
        process.stdout.write(`\r  Checked ${checkedCount}/${allTranslations.length} entries...`);
      }
    }
    
    // Clear progress line
    process.stdout.write('\r' + ' '.repeat(50) + '\r');
    
    if (corruptedEntries.length === 0) {
      console.log(chalk.green("✅ No corrupted cache entries found!"));
      return;
    }
    
    console.log(
      chalk.yellow(
        `\n⚠️  Found ${corruptedEntries.length} corrupted cache entries`
      )
    );
    
    if (dryRun) {
      console.log(chalk.gray("\n🔍 Dry run mode - no changes will be made"));
      console.log(chalk.gray("   Run without --dry-run to remove these entries\n"));
      return;
    }
    
    // Group by locale and reason for reporting
    const byLocale: Record<string, number> = {};
    const byReason: Record<string, number> = {};
    const lineRatioStats: { min: number; max: number; avg: number; count: number } = {
      min: Infinity,
      max: 0,
      avg: 0,
      count: 0,
    };
    
    for (const entry of corruptedEntries) {
      byLocale[entry.locale] = (byLocale[entry.locale] || 0) + 1;
      if (entry.reason) {
        byReason[entry.reason] = (byReason[entry.reason] || 0) + 1;
      }
      if (entry.ratio !== undefined) {
        lineRatioStats.min = Math.min(lineRatioStats.min, entry.ratio);
        lineRatioStats.max = Math.max(lineRatioStats.max, entry.ratio);
        lineRatioStats.avg += entry.ratio;
        lineRatioStats.count++;
      }
    }
    
    if (lineRatioStats.count > 0) {
      lineRatioStats.avg /= lineRatioStats.count;
    }
    
    // Delete corrupted entries
    const deleteStmt = db.prepare(
      "DELETE FROM translations WHERE source_hash = ? AND locale = ?"
    );
    
    const deleteMany = db.transaction(
      (entries: Array<{ source_hash: string; locale: string }>) => {
        for (const entry of entries) {
          deleteStmt.run(entry.source_hash, entry.locale);
        }
      }
    );
    
    deleteMany(corruptedEntries);
    
    console.log(chalk.green(`\n✅ Removed ${corruptedEntries.length} corrupted cache entries`));
    
    if (Object.keys(byLocale).length > 0) {
      console.log(chalk.gray("\n   By locale:"));
      for (const [loc, count] of Object.entries(byLocale)) {
        console.log(chalk.gray(`     - ${loc}: ${count} entries`));
      }
    }
    
    if (Object.keys(byReason).length > 0) {
      console.log(chalk.gray("\n   By issue type:"));
      for (const [reason, count] of Object.entries(byReason)) {
        console.log(chalk.gray(`     - ${reason}: ${count} entries`));
      }
    }
    
    if (lineRatioStats.count > 0) {
      console.log(chalk.gray("\n   Line count statistics:"));
      console.log(
        chalk.gray(
          `     - Average ratio: ${lineRatioStats.avg.toFixed(2)}x` +
          ` (min: ${lineRatioStats.min.toFixed(2)}x, max: ${lineRatioStats.max.toFixed(2)}x)`
        )
      );
    }
    
    // Note: We don't clear file_tracking entries because:
    // 1. The file hash tracking is still valid (it tracks source file changes)
    // 2. When files are re-translated, the segments will be regenerated
    // 3. This allows selective re-translation of affected files
    
    console.log(
      chalk.gray(
        "\n💡 Tip: Run translation again for affected files to regenerate clean cache entries"
      )
    );
    
  } finally {
    db.close();
  }
}

async function main() {
  program
    .name("clean-frontmatter-cache")
    .description("Remove cache entries that contain frontmatter blocks from other files")
    .option("-l, --locale <locale>", "Clean cache for specific locale only")
    .option("--dry-run", "Show what would be removed without making changes")
    .option("-c, --config <path>", "Path to config file")
    .option("-v, --verbose", "Show detailed output for each corrupted entry")
    .parse(process.argv);

  const options = program.opts();

  if (options.verbose) {
    process.env.VERBOSE = "true";
  }

  try {
    const config = loadConfig(options.config);
    const cachePath = path.resolve(config.paths.cache);
    
    console.log(chalk.bold(`\n🧹 Cleaning frontmatter cache entries\n`));
    console.log(chalk.gray(`   Cache path: ${cachePath}`));
    if (options.locale) {
      console.log(chalk.gray(`   Locale filter: ${options.locale}`));
    }
    if (options.dryRun) {
      console.log(chalk.yellow(`   Mode: DRY RUN (no changes)\n`));
    } else {
      console.log(chalk.gray(`   Mode: LIVE (will delete entries)\n`));
    }
    
    await cleanFrontmatterCache(
      cachePath,
      options.locale,
      options.dryRun || false
    );
    
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error}`));
    process.exit(1);
  }
}

main();
