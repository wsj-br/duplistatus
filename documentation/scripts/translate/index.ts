import { Command } from "commander";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import matter from "gray-matter";
import { Glossary } from "./glossary";
import { TranslationCache } from "./cache";
import { DocumentSplitter } from "./splitter";
import { Translator } from "./translator";
import { loadConfig, validateConfig } from "./config";
import { validateTranslation } from "./validator";
import { TranslationConfig, TranslationStats, Segment } from "./types";
import { isIgnoredDocFile, loadTranslateIgnoreFile } from "./ignore";

const program = new Command();

function getOutputPath(
  sourcePath: string,
  locale: string,
  config: TranslationConfig
): string {
  const relativePath = path.relative(config.paths.docs, sourcePath);
  return path.join(
    config.paths.i18n,
    locale,
    "docusaurus-plugin-content-docs",
    "current",
    relativePath
  );
}

/**
 * Normalize locale code to match expected format
 * Handles case-insensitive input and normalizes to expected format:
 * - Simple locales: "fr", "de", "es" -> lowercase
 * - Hyphenated locales: "pt-br", "PT-BR", "Pt-Br" -> "pt-BR" (lowercase language, uppercase region)
 */
function normalizeLocale(locale: string): string {
  const normalized = locale.trim();
  
  // Handle hyphenated locales (e.g., pt-BR, pt-br, PT-BR)
  if (normalized.includes("-")) {
    const parts = normalized.split("-");
    if (parts.length === 2) {
      // Language code lowercase, region code uppercase
      return `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`;
    }
  }
  
  // Simple locales: convert to lowercase
  return normalized.toLowerCase();
}

function getAllDocFiles(docsDir: string, ig?: ReturnType<typeof loadTranslateIgnoreFile> | null): string[] {
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

/** Get all files under docs (any extension), for copying ignored paths. */
function getAllFilesUnderDocs(docsDir: string): string[] {
  const files: string[] = [];
  function walk(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }
  walk(docsDir);
  return files.sort();
}

/**
 * Copy ignored paths (per .translate.ignore) into each target locale's
 * current folder so the structure and content exist there untranslated.
 * Copies all files under ignored paths (including .json, images, etc.), not just .md/.mdx.
 */
function copyIgnoredFilesToLocales(
  config: TranslationConfig,
  ignoreMatcher: ReturnType<typeof loadTranslateIgnoreFile> | null,
  locales: string[],
  dryRun: boolean,
  verbose: boolean
): void {
  if (!ignoreMatcher) return;

  const allFiles = getAllFilesUnderDocs(config.paths.docs);
  const ignoredFiles = allFiles.filter((filepath) =>
    isIgnoredDocFile(filepath, config.paths.docs, ignoreMatcher)
  );
  if (ignoredFiles.length === 0) return;

  const docsDir = path.resolve(config.paths.docs);
  const i18nDir = path.resolve(config.paths.i18n);

  for (const locale of locales) {
    for (const sourcePath of ignoredFiles) {
      const absoluteSource = path.resolve(sourcePath);
      const relativePath = path.relative(docsDir, absoluteSource);
      const destPath = path.join(
        i18nDir,
        locale,
        "docusaurus-plugin-content-docs",
        "current",
        relativePath
      );

      if (dryRun) {
        console.log(chalk.gray(`  [dry-run] would copy ignored: ${relativePath} → ${locale}`));
        continue;
      }

      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.copyFileSync(absoluteSource, destPath);
      if (verbose) {
        console.log(chalk.gray(`  📋 Copied ignored: ${relativePath} → ${locale}`));
      }
    }
  }
}

/**
 * Add translation metadata to frontmatter
 * Preserves existing frontmatter and adds/updates translation tracking fields
 */
function addTranslationMetadata(
  content: string,
  sourceFileMtime: string,
  sourceFileHash: string,
  locale: string,
  relativePath: string
): string {
  const { data: frontMatter, content: body } = matter(content);
  
  // Add/update translation tracking metadata
  frontMatter.translation_last_updated = new Date().toISOString();
  frontMatter.source_file_mtime = sourceFileMtime;
  frontMatter.source_file_hash = sourceFileHash;
  frontMatter.translation_language = locale;
  frontMatter.source_file_path = relativePath;
  
  // Reconstruct document with updated frontmatter
  return matter.stringify(body, frontMatter);
}

async function translateFile(
  filepath: string,
  locale: string,
  config: TranslationConfig,
  glossary: Glossary,
  cache: TranslationCache,
  translator: Translator,
  splitter: DocumentSplitter,
  stats: TranslationStats,
  dryRun: boolean,
  verbose: boolean,
  force: boolean = false,
  totalFilesCount: number = 1,
  debugTrafficPath?: string,
  noCacheRead: boolean = false
): Promise<void> {
  const fileStartTime = Date.now();
  const content = fs.readFileSync(filepath, "utf-8");
  const fileHash = TranslationCache.computeHash(content);
  const relativePath = path.relative(config.paths.docs, filepath);
  const outputPath = getOutputPath(filepath, locale, config);

  // Get source file modification time
  const sourceStats = fs.statSync(filepath);
  const sourceFileMtime = sourceStats.mtime.toISOString();

  // Clear file cache if --force flag is set
  if (force) {
    cache.clearFile(relativePath, locale);
    if (verbose) {
      console.log(chalk.yellow(`  🔄 Force mode: cleared cache for ${relativePath}`));
    }
  }

  // Check file-level cache
  const cachedFileHash = cache.getFileStatus(relativePath, locale);
  const outputFileExists = fs.existsSync(outputPath);
  
  // Skip only if cache matches AND output file exists AND not forcing
  if (!force && cachedFileHash === fileHash && outputFileExists) {
    stats.filesSkipped++;
    if (verbose) {
      console.log(chalk.gray(`  ⏭️  Skipped (unchanged): ${relativePath}`));
    }
    return;
  }
  
  // If output file is missing, recreate it even if cache says it's up-to-date
  if (!outputFileExists && cachedFileHash === fileHash && !force) {
    if (verbose) {
      console.log(chalk.gray(`  🔄 Recreating missing file: ${relativePath}`));
    }
  }

  stats.filesProcessed++;
  const segments = splitter.split(content);
  const totalSegments = segments.length;
  const translatableSegments = segments.filter(s => s.translatable).length;
  const translatedSegments: Segment[] = [];
  let fileSegmentsCached = 0;
  let fileSegmentsTranslated = 0;
  let currentSegmentIndex = 0;
  let fileCost = 0; // Track cost for this file only

  // Display file start
  console.log(chalk.cyan(`\n  📄 ${relativePath}`));
  console.log(chalk.gray(`     Total segments: ${totalSegments} (${translatableSegments} translatable)`));

  /**
   * Format elapsed time as mm:ss
   */
  const formatElapsedTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  /**
   * Update progress line with current status
   */
  const updateProgress = (status: string) => {
    const elapsedMs = Date.now() - fileStartTime;
    const elapsedTime = formatElapsedTime(elapsedMs);
    const percentage = Math.round((currentSegmentIndex / totalSegments) * 100);
    const fileCostStr = fileCost > 0 ? `$${fileCost.toFixed(4)}` : '$0.0000';
    const totalCostStr = stats.totalCost > 0 ? `$${stats.totalCost.toFixed(4)}` : '$0.0000';
    
    // Build progress line
    let progressLine = `\r     [${currentSegmentIndex}/${totalSegments}] ${percentage}% | ${elapsedTime} | ${fileCostStr}`;
    
    // Add total cost if multiple files
    if (stats.filesProcessed > 1 || fileSegmentsTranslated > 0) {
      progressLine += ` | total: ${totalCostStr}`;
    }
    
    progressLine += ` | ${status}`;
    
    process.stdout.write(progressLine.padEnd(100));
  };

  for (const segment of segments) {
    currentSegmentIndex++;
    if (!segment.translatable) {
      translatedSegments.push(segment);
      continue;
    }

    // Check segment cache
    const cachedTranslation = cache.getSegment(segment.hash, locale);
    if (cachedTranslation) {
      fileSegmentsCached++;
      stats.segmentsCached++;
      translatedSegments.push({
        ...segment,
        content: cachedTranslation,
      });
      
      // Update progress for cached segments
      updateProgress('cache');
      continue;
    }

    if (dryRun) {
      fileSegmentsTranslated++;
      stats.segmentsTranslated++;
      translatedSegments.push(segment);
      continue;
    }

    // Find glossary terms and translate
    const glossaryHints = glossary.findTermsInText(segment.content, locale);

    // Update progress before translating
    updateProgress('translating');

    // Write segment metadata to debug log before the API request (when --debug-traffic is set)
    if (debugTrafficPath) {
      try {
        const segmentIndex0 = currentSegmentIndex - 1;
        const meta = [
          `filename: ${relativePath}`,
          `segment number: ${segmentIndex0}`,
          `segment source_hash: ${segment.hash}`,
          "text to be translated:",
          segment.content,
          "",
        ].join("\n");
        fs.appendFileSync(debugTrafficPath, meta, "utf-8");
      } catch {
        // ignore write errors
      }
    }

    try {
      const segmentStartTime = Date.now();
      const result = await translator.translate(
        segment.content,
        locale,
        glossaryHints
      );
      const segmentTime = Date.now() - segmentStartTime;

      fileSegmentsTranslated++;
      stats.segmentsTranslated++;
      stats.totalTokens += result.usage.totalTokens;
      
      // Accumulate actual cost from API
      if (result.cost !== undefined && result.cost !== null && !isNaN(result.cost)) {
        if (result.cost > 0) {
          stats.totalCost += result.cost;
          fileCost += result.cost;
        }
      }

      // Cache and use the raw API response (no cleanup; LLM responses are trusted)
      cache.setSegment(
        segment.hash,
        locale,
        segment.content,
        result.content,
        result.model
      );
      
      translatedSegments.push({
        ...segment,
        content: result.content,
      });

      // Update progress after translation
      updateProgress('translating');

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(
        chalk.red(`\n  ❌ Failed to translate segment ${currentSegmentIndex} in ${relativePath}: ${error}`)
      );
      translatedSegments.push(segment); // Keep original on failure
    }
  }
  
  // Clear progress line
  process.stdout.write('\r' + ' '.repeat(100) + '\r');

  // Validate translation
  const validation = validateTranslation(segments, translatedSegments);
  if (validation.warnings.length > 0) {
    console.warn(chalk.yellow(`  ⚠️  Validation warnings in ${relativePath}:`));
    for (const w of validation.warnings) {
      console.warn(chalk.yellow(`     - ${w}`));
    }
  }
  if (!validation.valid) {
    console.warn(
      chalk.yellow(`  ⚠️  Validation issues in ${relativePath}:`)
    );
    const maxSnippetLen = 200;
    let hasSegmentIssue = false;
    for (const issue of validation.issues) {
      console.warn(chalk.yellow(`     - ${issue.message}`));
      if (verbose && issue.segmentIndex !== undefined) {
        hasSegmentIssue = true;
        const idx = issue.segmentIndex;
        const src = segments[idx];
        const trn = translatedSegments[idx];
        if (src && trn) {
          const srcSnippet = src.content.length > maxSnippetLen
            ? src.content.slice(0, maxSnippetLen) + "..."
            : src.content;
          const trnSnippet = trn.content.length > maxSnippetLen
            ? trn.content.slice(0, maxSnippetLen) + "..."
            : trn.content;
          console.warn(chalk.gray(`       [segment ${idx}] source (${src.content.length} chars):`));
          console.warn(chalk.gray(`         ${srcSnippet.replace(/\n/g, "\n         ")}`));
          console.warn(chalk.gray(`       [segment ${idx}] translated (${trn.content.length} chars):`));
          console.warn(chalk.gray(`         ${trnSnippet.replace(/\n/g, "\n         ")}`));
        }
      }
    }
    if (verbose && hasSegmentIssue) {
      console.warn(chalk.gray(`       To fix cached issues: run with --no-cache to re-translate segments.`));
    }
  }

  // Reassemble and add translation metadata
  let translatedContent = splitter.reassemble(translatedSegments);
  
  // Add translation metadata to frontmatter
  if (!dryRun) {
    translatedContent = addTranslationMetadata(
      translatedContent,
      sourceFileMtime,
      fileHash,
      locale,
      relativePath
    );
  }

  if (!dryRun) {
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, translatedContent);

    // Update file tracking
    cache.setFileStatus(relativePath, locale, fileHash);
  }

  const fileTime = Date.now() - fileStartTime;
  stats.totalTimeMs += fileTime;
  stats.fileTimes.push(fileTime);
  
  const fileTimeSec = (fileTime / 1000).toFixed(2);
  const fileTimeFormatted = formatElapsedTime(fileTime);
  const cachedCount = fileSegmentsCached;
  const translatedCount = fileSegmentsTranslated;
  const fileCostStr = fileCost > 0 ? `$${fileCost.toFixed(4)}` : '$0.0000';
  
  // Debug timing if enabled
  if (process.env.DEBUG_COST === "true") {
    console.log(chalk.gray(`     [DEBUG] File time: ${fileTime}ms, Total time so far: ${stats.totalTimeMs}ms`));
  }
  
  console.log(
    chalk.green(
      `  ✅ ${relativePath} → ${locale} (${cachedCount} cached, ${translatedCount} new) - ${fileTimeFormatted} - ${fileCostStr}`
    )
  );
}

async function main() {
  program
    .name("translate")
    .description("Translate Docusaurus documentation using OpenRouter LLM API")
    .option("-l, --locale <locale>", "Translate to specific locale only")
    .option("-p, --path <path>", "Translate specific file or directory (recursively processes all .md/.mdx files in directory)")
    .option("--dry-run", "Show what would be translated without making changes")
    .option("--no-cache", "Ignore cache (force API calls) but still persist new translations")
    .option("--force", "Force re-translation by clearing file cache")
    .option("-v, --verbose", "Show detailed output")
    .option("--stats", "Show cache statistics and exit")
    .option("--clear-cache [locale]", "Clear translation cache")
    .option("--debug-traffic [path]", "Log OpenRouter request/response to a file (only when API is called; use --no-cache to force API calls)")
    .option("-c, --config <path>", "Path to config file")
    .parse(process.argv);

  const options = program.opts();

  try {
    const config = loadConfig(options.config);
    const ignoreMatcher = loadTranslateIgnoreFile(process.cwd());

    // Handle --stats (before validating API key)
    if (options.stats) {
      const cache = new TranslationCache(config.paths.cache);
      const cacheStats = cache.getStats();
      console.log(chalk.bold("\n📊 Cache Statistics:"));
      console.log(`   Cached segments: ${cacheStats.totalSegments}`);
      console.log(`   Tracked files: ${cacheStats.totalFiles}`);
      console.log(`   By locale:`);
      for (const [locale, count] of Object.entries(cacheStats.byLocale)) {
        console.log(`     - ${locale}: ${count} segments`);
      }
      cache.close();
      return;
    }

    // Handle --clear-cache
    if (options.clearCache !== undefined) {
      const cache = new TranslationCache(config.paths.cache);
      let locale: string | undefined;
      if (typeof options.clearCache === "string") {
        locale = normalizeLocale(options.clearCache);
        // Validate that provided locale exists in config
        if (!config.locales.targets.includes(locale)) {
          console.error(
            chalk.red(
              `\n❌ Error: Locale "${locale}" not found in configuration.\n` +
              `   Available locales: ${config.locales.targets.join(", ")}`
            )
          );
          cache.close();
          process.exit(1);
        }
      }
      cache.clear(locale);
      console.log(
        chalk.green(`✅ Cache cleared${locale ? ` for ${locale}` : ""}`)
      );
      cache.close();
      return;
    }

    // Validate config (requires API key for translation)
    validateConfig(config);

    // Initialize components: always use persistent cache so new translations are saved.
    // --no-cache only skips reading from cache (forces API calls); we still write to cache.
    const cache = new TranslationCache(config.paths.cache);
    const noCacheRead = options.cache === false;

    // Ensure we always close the cache so SQLite flushes to disk (avoids losing fr/es/pt-BR
    // when a later locale throws or process is interrupted before the previous close).
    let cacheClosed = false;
    const closeCacheOnce = () => {
      if (!cacheClosed) {
        cacheClosed = true;
        cache.close();
      }
    };
    const glossary = new Glossary(config.paths.glossary);
    const splitter = new DocumentSplitter();

    let debugTrafficPath: string | undefined;
    if (options.debugTraffic) {
      debugTrafficPath =
        options.debugTraffic === true
          ? path.join(
              config.paths.cache,
              `debug-traffic-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.log`
            )
          : String(options.debugTraffic);
      const dir = path.dirname(debugTrafficPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      // Create the log file immediately so it exists even when all segments are cached
      const header = `Translation debug traffic - started ${new Date().toISOString()}\n` +
        `Traffic is logged only when segments are sent to the API (not when served from cache).\n` +
        `Use --no-cache to force API calls and capture request/response.\n\n`;
      fs.writeFileSync(debugTrafficPath, header, "utf-8");
    }
    const translator = new Translator(config, debugTrafficPath ?? null);

    // Determine locales to process (normalize locale if provided)
    const locales = options.locale ? [normalizeLocale(options.locale)] : config.locales.targets;
    
    // Validate that provided locale exists in config
    if (options.locale) {
      const normalizedLocale = normalizeLocale(options.locale);
      if (!config.locales.targets.includes(normalizedLocale)) {
        console.error(
          chalk.red(
            `\n❌ Error: Locale "${normalizedLocale}" not found in configuration.\n` +
            `   Available locales: ${config.locales.targets.join(", ")}`
          )
        );
        process.exit(1);
      }
    }

    // Determine files to process
    let files: string[];
    if (options.path) {
      const resolvedPath = path.resolve(options.path);
      if (!fs.existsSync(resolvedPath)) {
        console.error(
          chalk.red(`\n❌ Error: Path not found: ${resolvedPath}`)
        );
        process.exit(1);
      }
      const stats = fs.statSync(resolvedPath);
      if (stats.isDirectory()) {
        // If it's a directory, get all markdown files in it
        files = getAllDocFiles(resolvedPath, ignoreMatcher);
        if (files.length === 0) {
          console.warn(
            chalk.yellow(`\n⚠️  Warning: No markdown files found in directory: ${resolvedPath}`)
          );
        }
      } else {
        // If it's a file, use it directly
        files = ignoreMatcher && isIgnoredDocFile(resolvedPath, config.paths.docs, ignoreMatcher) ? [] : [resolvedPath];
      }
    } else {
      files = getAllDocFiles(config.paths.docs, ignoreMatcher);
    }

    if (ignoreMatcher && options.verbose) {
      console.log(chalk.gray(`   Ignore file: ${path.join(process.cwd(), ".translate.ignore")}`));
    }

    console.log(
      chalk.bold(
        `\n🌐 Translating ${files.length} files to ${locales.length} locale(s)\n`
      )
    );
    console.log(chalk.gray(`   Model: ${config.openrouter.defaultModel}`));
    console.log(chalk.gray(`   Glossary terms: ${glossary.size}`));
    if (debugTrafficPath) {
      console.log(chalk.gray(`   Debug traffic log: ${debugTrafficPath}`));
    }
    console.log("");

    if (options.dryRun) {
      console.log(chalk.yellow("⚠️  Dry run mode - no changes will be made\n"));
    }

    // Copy ignored files into each locale's current folder (untranslated)
    if (ignoreMatcher) {
      console.log(chalk.bold.blue("\n📋 Copying ignored files to locale folders…"));
      copyIgnoredFilesToLocales(
        config,
        ignoreMatcher,
        locales,
        options.dryRun || false,
        options.verbose || false
      );
    }

    try {
    const totalStats: TranslationStats = {
      filesProcessed: 0,
      filesSkipped: 0,
      segmentsCached: 0,
      segmentsTranslated: 0,
      totalTokens: 0,
      totalCost: 0,
      totalTimeMs: 0,
      fileTimes: [],
    };

    for (const locale of locales) {
      console.log(chalk.bold.blue(`\n📝 Translating to ${locale}:`));

      const localeStats: TranslationStats = {
        filesProcessed: 0,
        filesSkipped: 0,
        segmentsCached: 0,
        segmentsTranslated: 0,
        totalTokens: 0,
        totalCost: 0,
        totalTimeMs: 0,
        fileTimes: [],
      };

      for (const filepath of files) {
        await translateFile(
          filepath,
          locale,
          config,
          glossary,
          cache,
          translator,
          splitter,
          localeStats,
          options.dryRun || false,
          options.verbose || false,
          options.force || false,
          files.length, // Pass total file count for progress display
          debugTrafficPath,
          noCacheRead
        );
      }

      // Aggregate stats
      totalStats.filesProcessed += localeStats.filesProcessed;
      totalStats.filesSkipped += localeStats.filesSkipped;
      totalStats.segmentsCached += localeStats.segmentsCached;
      totalStats.segmentsTranslated += localeStats.segmentsTranslated;
      totalStats.totalTokens += localeStats.totalTokens;
      totalStats.totalCost += localeStats.totalCost;
      totalStats.totalTimeMs += localeStats.totalTimeMs;
      totalStats.fileTimes.push(...localeStats.fileTimes);

      const localeTimeSec = (localeStats.totalTimeMs / 1000).toFixed(2);
      console.log(
        chalk.gray(
          `   Files: ${localeStats.filesProcessed} processed, ${localeStats.filesSkipped} skipped`
        )
      );
      console.log(
        chalk.gray(
          `   Segments: ${localeStats.segmentsCached} cached, ${localeStats.segmentsTranslated} translated`
        )
      );
      if (localeStats.totalTimeMs > 0) {
        console.log(
          chalk.gray(
            `   Time for ${locale}: ${localeTimeSec}s`
          )
        );
      }
    }

    // Final summary
    console.log(chalk.bold.green("\n✅ Translation complete!\n"));
    console.log(chalk.bold("📊 Summary:"));
    console.log(`   Total files processed: ${totalStats.filesProcessed}`);
    console.log(`   Total files skipped: ${totalStats.filesSkipped}`);
    console.log(`   Segments from cache: ${totalStats.segmentsCached}`);
    console.log(`   Segments translated: ${totalStats.segmentsTranslated}`);
    console.log(`   Total tokens used: ${totalStats.totalTokens.toLocaleString()}`);
    
    // Display actual cost from OpenRouter API
    if (totalStats.segmentsTranslated > 0) {
      if (totalStats.totalCost > 0) {
        console.log(`   Total cost: $${totalStats.totalCost.toFixed(6)}`);
      } else {
        console.log(`   Total cost: $0.00 (cost data not available from API)`);
        if (process.env.DEBUG_COST === "true") {
          console.log(chalk.yellow(`   [DEBUG] Segments translated: ${totalStats.segmentsTranslated}, but cost is 0`));
        }
      }
    } else {
      console.log(`   Total cost: $0.00 (all segments from cache)`);
    }
    
    // Display timing information
    if (totalStats.totalTimeMs > 0) {
      // Format total time as hh:mm:ss
      const formatTotalTime = (ms: number): string => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (hours > 0) {
          return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
          return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
      };
      
      const totalTimeFormatted = formatTotalTime(totalStats.totalTimeMs);
      console.log(`   Total time: ${totalTimeFormatted}`);
      
      if (totalStats.fileTimes.length > 0) {
        const avgTimeMs = totalStats.totalTimeMs / totalStats.fileTimes.length;
        const avgTimeFormatted = formatTotalTime(avgTimeMs);
        const avgCost = totalStats.totalCost / totalStats.fileTimes.length;
        const avgCostStr = avgCost > 0 ? `$${avgCost.toFixed(6)}` : '$0.000000';
        console.log(`   Average time per file: ${avgTimeFormatted}`);
        console.log(`   Average cost per file: ${avgCostStr}`);
      }
    } else {
      console.log(`   Total time: Not measured (files may have been skipped)`);
      if (process.env.DEBUG_COST === "true") {
        console.log(chalk.yellow(`   [DEBUG] totalTimeMs: ${totalStats.totalTimeMs}, fileTimes.length: ${totalStats.fileTimes.length}`));
      }
    }

    // If debug traffic was requested but no API calls were made, append a note to the log
    if (debugTrafficPath && totalStats.segmentsTranslated === 0) {
      try {
        fs.appendFileSync(
          debugTrafficPath,
          `========== NO API REQUESTS (all segments from cache) ==========\n` +
            `No OpenRouter requests were made in this run. Use --no-cache to force translation and capture request/response traffic.\n\n`,
          "utf-8"
        );
      } catch {
        // ignore write errors
      }
    }

    // Show cache contents by locale so you can verify all locales were persisted
    const cacheStats = cache.getStats();
    console.log(chalk.gray("\n   Cache segments by locale:"));
    for (const [loc, count] of Object.entries(cacheStats.byLocale)) {
      console.log(chalk.gray(`     - ${loc}: ${count}`));
    }

    } finally {
      closeCacheOnce();
    }
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error}`));
    process.exit(1);
  }
}

main();
