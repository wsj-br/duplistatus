import { Command } from "commander";
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import chalk from "chalk";
import { loadTranslateSvgIgnoreFile } from "./ignore";
import { getAllSvgFiles } from "./file-utils";
import { Glossary } from "./glossary";
import { TranslationCache } from "./cache";
import { SvgSplitter, SvgTextSegment } from "./svg-splitter";
import { Translator } from "./translator";
import { loadConfig, validateConfig } from "./config";
import { TranslationConfig, TranslationStats } from "./types";
import { setupLogOutput } from "./log-output";

const program = new Command();

/** Options for runSvgTranslation when called from another script (e.g. index.ts) */
export interface RunSvgTranslationOptions {
  dryRun: boolean;
  verbose: boolean;
  force: boolean;
  noCacheRead: boolean;
  exportPng: boolean;
  locale?: string;
  path?: string;
}

/** Path to static img (SVG source). Default relative to cwd (documentation/). */
const DEFAULT_STATIC_IMG = "./static/img";

/** Assets path relative to i18n locale folder. */
const ASSETS_PATH = "docusaurus-plugin-content-docs/current/assets";

function getOutputPath(
  filename: string,
  locale: string,
  config: TranslationConfig
): string {
  const i18nDir = path.resolve(config.paths.i18n);
  return path.join(i18nDir, locale, ASSETS_PATH, filename);
}

function normalizeLocale(locale: string): string {
  const normalized = locale.trim();
  if (normalized.includes("-")) {
    const parts = normalized.split("-");
    if (parts.length === 2) {
      return `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`;
    }
  }
  return normalized.toLowerCase();
}

/** Only translate SVGs that start with "duplistatus" */
const SVG_PREFIX = "duplistatus";

function exportSvgToPng(svgPath: string, pngPath: string): void {
  try {
    execFileSync("inkscape", [
      "--export-type=png",
      `--export-filename=${pngPath}`,
      "--export-area-page",
      svgPath,
    ], { stdio: "pipe" });
  } catch (error) {
    console.warn(chalk.yellow(`  ⚠️  Inkscape export failed for ${svgPath}: ${error}`));
  }
}

async function translateSvgFile(
  filepath: string,
  locale: string,
  config: TranslationConfig,
  glossary: Glossary,
  cache: TranslationCache,
  translator: Translator,
  splitter: SvgSplitter,
  stats: TranslationStats,
  dryRun: boolean,
  verbose: boolean,
  force: boolean,
  noCacheRead: boolean,
  exportPng: boolean
): Promise<void> {
  const fileStartTime = Date.now();
  const content = fs.readFileSync(filepath, "utf-8");
  const fileHash = TranslationCache.computeHash(content);
  const filename = path.basename(filepath);
  const relativePath = `static/img/${filename}`;
  const outputPath = getOutputPath(filename, locale, config);

  if (force) {
    cache.clearFile(relativePath, locale);
    if (verbose) {
      console.log(chalk.yellow(`  🔄 Force mode: cleared cache for ${relativePath}`));
    }
  }

  const cachedFileHash = cache.getFileStatus(relativePath, locale);
  const outputFileExists = fs.existsSync(outputPath);

  if (!force && cachedFileHash === fileHash && outputFileExists) {
    stats.filesSkipped++;
    if (verbose) {
      console.log(chalk.gray(`  ⏭️  Skipped (unchanged): ${relativePath}`));
    }
    // Touch cache so last_hit_at stays set (resetLastHitAtForSvg clears all at start;
    // we must update it for skipped files or they'd be treated as stale by cleanup)
    if (!noCacheRead) {
      const segments = splitter.split(content);
      for (const seg of segments) {
        if (seg.translatable) {
          cache.getSegment(seg.hash, locale, relativePath);
        }
      }
    }
    if (exportPng && !dryRun) {
      const pngPath = outputPath.replace(/\.svg$/, ".png");
      if (!fs.existsSync(pngPath)) {
        exportSvgToPng(outputPath, pngPath);
      }
    }
    return;
  }

  stats.filesProcessed++;
  const segments = splitter.split(content);
  const translatableSegments = segments.filter((s) => s.translatable);
  const translatedSegments: SvgTextSegment[] = [];
  let fileSegmentsCached = 0;
  let fileSegmentsTranslated = 0;
  let fileCost = 0;

  console.log(chalk.cyan(`\n  📄 ${relativePath}`));
  console.log(chalk.gray(`     Total segments: ${segments.length} (${translatableSegments.length} translatable)`));

  for (const segment of segments) {
    if (!segment.translatable) {
      translatedSegments.push(segment);
      continue;
    }

    const cachedTranslation = noCacheRead ? null : cache.getSegment(segment.hash, locale, relativePath);
    if (cachedTranslation) {
      fileSegmentsCached++;
      stats.segmentsCached++;
      translatedSegments.push({ ...segment, content: cachedTranslation.toLowerCase() });
      continue;
    }

    if (dryRun) {
      fileSegmentsTranslated++;
      stats.segmentsTranslated++;
      translatedSegments.push(segment);
      continue;
    }

    const glossaryHints = glossary.findTermsInText(segment.content, locale);

    try {
      const result = await translator.translate(
        segment.content,
        locale,
        glossaryHints
      );

      fileSegmentsTranslated++;
      stats.segmentsTranslated++;
      stats.totalTokens += result.usage.totalTokens;
      if (result.cost !== undefined && result.cost !== null && !isNaN(result.cost) && result.cost > 0) {
        stats.totalCost += result.cost;
        fileCost += result.cost;
      }

      const translated = result.content.toLowerCase();
      cache.setSegment(
        segment.hash,
        locale,
        segment.content,
        translated,
        result.model,
        relativePath
      );

      translatedSegments.push({ ...segment, content: translated });
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(
        chalk.red(`\n  ❌ Failed to translate segment in ${relativePath}: ${error}`)
      );
      translatedSegments.push(segment);
    }
  }

  const translatedContent = splitter.reassemble(content, translatedSegments);

  if (!dryRun) {
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, translatedContent);
    cache.setFileStatus(relativePath, locale, fileHash);

    if (exportPng) {
      const pngPath = outputPath.replace(/\.svg$/, ".png");
      exportSvgToPng(outputPath, pngPath);
    }
  }

  const fileTime = Date.now() - fileStartTime;
  stats.totalTimeMs += fileTime;
  stats.fileTimes.push(fileTime);

  const formatElapsedTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const fileCostStr = fileCost > 0 ? `$${fileCost.toFixed(4)}` : "$0.0000";
  console.log(
    chalk.green(
      `  ✅ ${relativePath} → ${locale} (${fileSegmentsCached} cached, ${fileSegmentsTranslated} new) - ${formatElapsedTime(fileTime)} - ${fileCostStr}`
    )
  );
}

/**
 * Run SVG translation. Can be called from index.ts (combined translate) or standalone.
 * Does NOT create or close the cache - caller owns the cache lifecycle.
 */
export async function runSvgTranslation(
  config: TranslationConfig,
  cache: TranslationCache,
  glossary: Glossary,
  translator: Translator | null,
  options: RunSvgTranslationOptions
): Promise<void> {
  const staticImgDir = config.paths.staticImg ?? DEFAULT_STATIC_IMG;
  const resolvedStaticImg = path.resolve(staticImgDir);

  if (!fs.existsSync(resolvedStaticImg)) {
    console.warn(chalk.yellow(`\n⚠️  Static img directory not found: ${resolvedStaticImg} - skipping SVG translation`));
    return;
  }

  if (!options.dryRun && !translator) {
    throw new Error("Translator is required when not in dry-run mode");
  }

  const locales = options.locale ? [normalizeLocale(options.locale)] : config.locales.targets;

  if (options.locale) {
    const normalizedLocale = normalizeLocale(options.locale);
    if (!config.locales.targets.includes(normalizedLocale)) {
      console.error(
        chalk.red(
          `\n❌ Error: Locale "${normalizedLocale}" not found in configuration.\n` +
            `   Available locales: ${config.locales.targets.join(", ")}`
        )
      );
      return;
    }
  }

  let files: string[];
  if (options.path) {
    const resolvedPath = path.resolve(options.path);
    if (!fs.existsSync(resolvedPath)) {
      console.error(chalk.red(`\n❌ Error: Path not found: ${resolvedPath}`));
      return;
    }
    const basename = path.basename(resolvedPath);
    if (!basename.toLowerCase().endsWith(".svg")) {
      console.error(chalk.red(`\n❌ Error: Path must be an SVG file: ${resolvedPath}`));
      return;
    }
    if (!basename.startsWith(SVG_PREFIX)) {
      console.error(
        chalk.red(`\n❌ Error: Only duplistatus*.svg files are translated: ${basename}`)
      );
      return;
    }
    files = [resolvedPath];
  } else {
    const svgIgnoreMatcher = loadTranslateSvgIgnoreFile(process.cwd());
    files = getAllSvgFiles(resolvedStaticImg, svgIgnoreMatcher);
  }

  const resetCount = cache.resetLastHitAtForSvg();
  if (resetCount > 0 && options.verbose) {
    console.log(chalk.gray(`   Reset last_hit_at for ${resetCount} SVG cache row(s)`));
  }

  if (files.length === 0) {
    console.warn(chalk.yellow(`\n⚠️  No SVG files found in ${resolvedStaticImg}`));
    return;
  }

  const exportPng = options.exportPng;

  console.log(
    chalk.bold(`\n🌐 Translating ${files.length} SVG file(s) to ${locales.length} locale(s)\n`)
  );
  console.log(chalk.gray(`   Model: ${config.openrouter.defaultModel}`));
  console.log(chalk.gray(`   Glossary terms: ${glossary.size}`));
  if (exportPng) {
    console.log(chalk.gray(`   PNG export: Inkscape CLI`));
  }
  console.log("");

  if (options.dryRun) {
    console.log(chalk.yellow("⚠️  Dry run mode - no changes will be made\n"));
  }

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

  const splitter = new SvgSplitter();

  for (const locale of locales) {
    console.log(chalk.bold.blue(`\n📝 Translating SVGs to ${locale}:`));

    for (const filepath of files) {
      const segments = splitter.split(fs.readFileSync(filepath, "utf-8"));
      if (segments.filter((s) => s.translatable).length === 0) {
        if (options.verbose) {
          console.log(chalk.gray(`  ⏭️  No translatable text: ${path.basename(filepath)}`));
        }
        continue;
      }

      await translateSvgFile(
        filepath,
        locale,
        config,
        glossary,
        cache,
        translator as Translator,
        splitter,
        totalStats,
        options.dryRun,
        options.verbose,
        options.force,
        options.noCacheRead,
        exportPng
      );
    }
  }

  console.log(chalk.bold.green("\n✅ SVG translation complete!\n"));
  console.log(chalk.bold("📊 SVG Summary:"));
  console.log(`   Total files processed: ${totalStats.filesProcessed}`);
  console.log(`   Total files skipped: ${totalStats.filesSkipped}`);
  console.log(`   Segments from cache: ${totalStats.segmentsCached}`);
  console.log(`   Segments translated: ${totalStats.segmentsTranslated}`);
  console.log(`   Total tokens used: ${totalStats.totalTokens.toLocaleString()}`);
  if (totalStats.segmentsTranslated > 0) {
    console.log(`   Total cost: $${totalStats.totalCost > 0 ? totalStats.totalCost.toFixed(6) : "0.00"}`);
  }
  if (totalStats.totalTimeMs > 0) {
    const totalSeconds = Math.floor(totalStats.totalTimeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    console.log(`   Total time: ${minutes}:${seconds.toString().padStart(2, "0")}`);
  }
}

async function main() {
  program
    .name("translate-svg")
    .description("Translate text in SVG files using OpenRouter LLM API")
    .option("-l, --locale <locale>", "Translate to specific locale only")
    .option("-p, --path <path>", "Translate specific SVG file")
    .option("--dry-run", "Show what would be translated without making changes")
    .option("--no-cache", "Ignore cache (force API calls) but still persist new translations")
    .option("--force", "Force re-translation by clearing file cache")
    .option("-v, --verbose", "Show detailed output")
    .option("--no-export-png", "Skip Inkscape PNG export after translation")
    .option("--stats", "Show cache statistics and exit")
    .option("-c, --config <path>", "Path to config file")
    .configureHelp({
      helpWidth: 100,
    })
    .exitOverride((err) => {
      // Handle unknown options or usage errors
      if (err.code === "commander.unknownOption" || err.code === "commander.unknownCommand" || err.code === "commander.missingArgument") {
        console.error(chalk.red(`\n❌ ${err.message}\n`));
        program.outputHelp();
        process.exit(1);
      }
      throw err;
    });

  let options: ReturnType<typeof program.opts>;
  try {
    program.parse(process.argv);
    options = program.opts();
  } catch (error: unknown) {
    // Handle parsing errors
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      if (
        errorMsg.includes("unknown option") ||
        errorMsg.includes("unexpected argument") ||
        errorMsg.includes("error") ||
        errorMsg.includes("invalid")
      ) {
        console.error(chalk.red(`\n❌ ${error.message}\n`));
        program.outputHelp();
        process.exit(1);
      }
    }
    throw error;
  }

  const config = loadConfig(options.config);
  const cacheDir = path.resolve(config.paths.cache);
  const { logPath } = setupLogOutput({ cacheDir, prefix: "translate-svg" });

  try {
    const staticImgDir = config.paths.staticImg ?? DEFAULT_STATIC_IMG;
    const resolvedStaticImg = path.resolve(staticImgDir);

    if (!fs.existsSync(resolvedStaticImg)) {
      console.error(chalk.red(`\n❌ Error: Static img directory not found: ${resolvedStaticImg}`));
      process.exit(1);
    }

    if (options.stats) {
      const cache = new TranslationCache(path.resolve(config.paths.cache));
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

    // Skip API key validation for dry-run (no actual API calls)
    if (!options.dryRun) {
      validateConfig(config);
    }

    const cache = new TranslationCache(path.resolve(config.paths.cache));
    console.log(chalk.gray(`   Output log: ${logPath}`));
    try {
      await runSvgTranslation(config, cache, new Glossary(config.paths.glossary, config.paths.glossaryUser), options.dryRun ? null : new Translator(config, null), {
        dryRun: options.dryRun || false,
        verbose: options.verbose || false,
        force: options.force || false,
        noCacheRead: options.cache === false,
        exportPng: options.exportPng !== false,
        locale: options.locale,
        path: options.path,
      });
    } finally {
      cache.close();
    }
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error}`));
    process.exit(1);
  }
}

// Only run when executed directly (e.g. pnpm translate:svg), not when imported by index.ts
if (process.argv[1]?.includes("translate-svg")) {
  main();
}
