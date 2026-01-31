# Translation Implementation Guide

## Complete Source Code for duplistatus Documentation Translation

This guide contains the full implementation of all TypeScript files needed for the translation system.

---

## 1. TypeScript Interfaces (`scripts/translate/types.ts`)

```typescript
export interface TranslationConfig {
  openrouter: {
    baseUrl: string;
    defaultModel: string;
    fallbackModel: string;
    maxTokens: number;
    temperature: number;
  };
  locales: {
    source: string;
    targets: string[];
  };
  paths: {
    docs: string;
    i18n: string;
    cache: string;
    glossary: string;
  };
  cache: {
    enabled: boolean;
    segmentLevel: boolean;
  };
}

export interface GlossaryTerm {
  english: string;
  translations: Record<string, string>;
  partOfSpeech: string;
}

export interface Segment {
  id: string;
  type: "frontmatter" | "heading" | "paragraph" | "code" | "admonition" | "other";
  content: string;
  hash: string;
  translatable: boolean;
}

export interface TranslationResult {
  content: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export interface CacheEntry {
  sourceHash: string;
  locale: string;
  translatedContent: string;
  model: string;
  createdAt: string;
}

export interface TranslationStats {
  filesProcessed: number;
  filesSkipped: number;
  segmentsCached: number;
  segmentsTranslated: number;
  totalTokens: number;
  estimatedCost: number;
}

export interface FileTranslationPlan {
  filepath: string;
  locale: string;
  totalSegments: number;
  cachedSegments: number;
  needsTranslation: boolean;
}
```

---

## 2. Configuration Loader (`scripts/translate/config.ts`)

```typescript
import fs from "fs";
import path from "path";
import { TranslationConfig } from "./types";

const DEFAULT_CONFIG: TranslationConfig = {
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "anthropic/claude-sonnet-4",
    fallbackModel: "openai/gpt-4o",
    maxTokens: 8192,
    temperature: 0.3,
  },
  locales: {
    source: "en",
    targets: ["fr", "de", "es", "pt-BR"],
  },
  paths: {
    docs: "./docs",
    i18n: "./i18n",
    cache: "./.translation-cache",
    glossary: "./glossary.csv",
  },
  cache: {
    enabled: true,
    segmentLevel: true,
  },
};

export function loadConfig(configPath?: string): TranslationConfig {
  const resolvedPath = configPath || path.join(process.cwd(), "translate.config.json");

  if (!fs.existsSync(resolvedPath)) {
    console.warn(`Config file not found at ${resolvedPath}, using defaults`);
    return DEFAULT_CONFIG;
  }

  try {
    const fileContent = fs.readFileSync(resolvedPath, "utf-8");
    const userConfig = JSON.parse(fileContent);

    // Deep merge with defaults
    return {
      openrouter: { ...DEFAULT_CONFIG.openrouter, ...userConfig.openrouter },
      locales: { ...DEFAULT_CONFIG.locales, ...userConfig.locales },
      paths: { ...DEFAULT_CONFIG.paths, ...userConfig.paths },
      cache: { ...DEFAULT_CONFIG.cache, ...userConfig.cache },
    };
  } catch (error) {
    throw new Error(`Failed to parse config file: ${error}`);
  }
}

export function validateConfig(config: TranslationConfig): void {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY environment variable is required");
  }

  if (!fs.existsSync(config.paths.docs)) {
    throw new Error(`Docs directory not found: ${config.paths.docs}`);
  }

  if (!fs.existsSync(config.paths.glossary)) {
    console.warn(`Glossary file not found: ${config.paths.glossary}`);
  }
}
```

---

## 3. Glossary Parser (`scripts/translate/glossary.ts`)

```typescript
import fs from "fs";
import Papa from "papaparse";
import { GlossaryTerm } from "./types";

export class Glossary {
  private terms: Map<string, GlossaryTerm> = new Map();
  private localeColumnMap: Record<string, string> = {
    fr: "Term [fr]",
    de: "Term [de]",
    es: "Term [es-ES]",
    "pt-BR": "Term [pt-BR]",
  };

  constructor(glossaryPath: string) {
    if (fs.existsSync(glossaryPath)) {
      this.loadGlossary(glossaryPath);
    } else {
      console.warn(`Glossary file not found: ${glossaryPath}`);
    }
  }

  private loadGlossary(filepath: string): void {
    const content = fs.readFileSync(filepath, "utf-8");
    const { data } = Papa.parse<Record<string, string>>(content, {
      header: true,
      skipEmptyLines: true,
    });

    for (const row of data) {
      const english = row["Term [en]"]?.trim();
      if (!english) continue;

      const term: GlossaryTerm = {
        english,
        translations: {},
        partOfSpeech: row["Part of Speech [en]"] || "unknown",
      };

      for (const [locale, column] of Object.entries(this.localeColumnMap)) {
        const translation = row[column]?.trim();
        if (translation) {
          term.translations[locale] = translation;
        }
      }

      // Index by lowercase for case-insensitive matching
      this.terms.set(english.toLowerCase(), term);
    }

    console.log(`✓ Loaded ${this.terms.size} glossary terms`);
  }

  /**
   * Find glossary terms in text and return translation hints
   */
  findTermsInText(text: string, locale: string): string[] {
    const hints: string[] = [];
    const textLower = text.toLowerCase();

    // Sort terms by length (longest first) to avoid partial matches
    const sortedTerms = Array.from(this.terms.entries()).sort(
      (a, b) => b[0].length - a[0].length
    );

    const matchedPositions = new Set<number>();

    for (const [termLower, term] of sortedTerms) {
      const translation = term.translations[locale];
      if (!translation) continue;

      let index = 0;
      while ((index = textLower.indexOf(termLower, index)) !== -1) {
        // Check word boundaries
        const beforeChar = index > 0 ? textLower[index - 1] : " ";
        const afterChar = textLower[index + termLower.length] || " ";
        const isWordBoundary =
          /[\s\p{P}]/u.test(beforeChar) && /[\s\p{P}]/u.test(afterChar);

        if (!isWordBoundary) {
          index++;
          continue;
        }

        // Check if this position overlaps with an already matched term
        const positions = Array.from(
          { length: termLower.length },
          (_, i) => index + i
        );
        const hasOverlap = positions.some((pos) => matchedPositions.has(pos));

        if (!hasOverlap) {
          hints.push(`- "${term.english}" → "${translation}"`);
          positions.forEach((pos) => matchedPositions.add(pos));
          break; // Only add each term once
        }

        index++;
      }
    }

    return hints;
  }

  getTranslation(englishTerm: string, locale: string): string | undefined {
    const term = this.terms.get(englishTerm.toLowerCase());
    return term?.translations[locale];
  }

  get size(): number {
    return this.terms.size;
  }
}
```

---

## 4. Translation Cache (`scripts/translate/cache.ts`)

```typescript
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import crypto from "crypto";

export class TranslationCache {
  private db: Database.Database;

  constructor(cachePath: string) {
    // Handle in-memory database for --no-cache option
    if (cachePath === ":memory:") {
      this.db = new Database(":memory:");
      this.initializeSchema();
      return;
    }

    // Ensure cache directory exists
    if (!fs.existsSync(cachePath)) {
      fs.mkdirSync(cachePath, { recursive: true });
    }

    this.db = new Database(path.join(cachePath, "cache.db"));
    this.initializeSchema();
  }

  private initializeSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS translations (
        source_hash TEXT NOT NULL,
        locale TEXT NOT NULL,
        source_text TEXT NOT NULL,
        translated_text TEXT NOT NULL,
        model TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        PRIMARY KEY (source_hash, locale)
      );

      CREATE TABLE IF NOT EXISTS file_tracking (
        filepath TEXT NOT NULL,
        locale TEXT NOT NULL,
        source_hash TEXT NOT NULL,
        last_translated TEXT DEFAULT (datetime('now')),
        PRIMARY KEY (filepath, locale)
      );

      CREATE INDEX IF NOT EXISTS idx_translations_locale 
        ON translations(locale);
    `);
  }

  /**
   * Compute a hash for cache lookup
   * Normalizes whitespace for consistent matching
   */
  static computeHash(content: string): string {
    const normalized = content.replace(/\s+/g, " ").trim();
    return crypto.createHash("sha256").update(normalized).digest("hex").slice(0, 16);
  }

  /**
   * Get cached translation for a segment
   */
  getSegment(sourceHash: string, locale: string): string | null {
    const stmt = this.db.prepare(`
      SELECT translated_text FROM translations 
      WHERE source_hash = ? AND locale = ?
    `);
    const row = stmt.get(sourceHash, locale) as { translated_text: string } | undefined;
    return row?.translated_text || null;
  }

  /**
   * Store a translated segment in cache
   */
  setSegment(
    sourceHash: string,
    locale: string,
    sourceText: string,
    translatedText: string,
    model: string
  ): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO translations 
      (source_hash, locale, source_text, translated_text, model)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(sourceHash, locale, sourceText, translatedText, model);
  }

  /**
   * Get cached file hash for change detection
   */
  getFileStatus(filepath: string, locale: string): string | null {
    const stmt = this.db.prepare(`
      SELECT source_hash FROM file_tracking 
      WHERE filepath = ? AND locale = ?
    `);
    const row = stmt.get(filepath, locale) as { source_hash: string } | undefined;
    return row?.source_hash || null;
  }

  /**
   * Update file tracking after translation
   */
  setFileStatus(filepath: string, locale: string, sourceHash: string): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO file_tracking 
      (filepath, locale, source_hash)
      VALUES (?, ?, ?)
    `);
    stmt.run(filepath, locale, sourceHash);
  }

  /**
   * Get cache statistics
   */
  getStats(): { totalSegments: number; totalFiles: number; byLocale: Record<string, number> } {
    const segments = this.db
      .prepare("SELECT COUNT(*) as count FROM translations")
      .get() as { count: number };
    const files = this.db
      .prepare("SELECT COUNT(*) as count FROM file_tracking")
      .get() as { count: number };

    const byLocale: Record<string, number> = {};
    const localeStats = this.db
      .prepare("SELECT locale, COUNT(*) as count FROM translations GROUP BY locale")
      .all() as { locale: string; count: number }[];

    for (const row of localeStats) {
      byLocale[row.locale] = row.count;
    }

    return {
      totalSegments: segments.count,
      totalFiles: files.count,
      byLocale,
    };
  }

  /**
   * Clear cache (optionally for specific locale)
   */
  clear(locale?: string): void {
    if (locale) {
      this.db.prepare("DELETE FROM translations WHERE locale = ?").run(locale);
      this.db.prepare("DELETE FROM file_tracking WHERE locale = ?").run(locale);
    } else {
      this.db.prepare("DELETE FROM translations").run();
      this.db.prepare("DELETE FROM file_tracking").run();
    }
  }

  close(): void {
    this.db.close();
  }
}
```

---

## 5. Document Splitter (`scripts/translate/splitter.ts`)

```typescript
import matter from "gray-matter";
import { Segment } from "./types";
import { TranslationCache } from "./cache";

export class DocumentSplitter {
  /**
   * Split a markdown document into translatable segments
   */
  split(content: string): Segment[] {
    const segments: Segment[] = [];
    let segmentIndex = 0;

    // Extract front matter
    const { data: frontMatter, content: body } = matter(content);

    if (Object.keys(frontMatter).length > 0) {
      const frontMatterStr = matter.stringify("", frontMatter).trim();
      segments.push({
        id: `seg-${segmentIndex++}`,
        type: "frontmatter",
        content: frontMatterStr,
        hash: TranslationCache.computeHash(JSON.stringify(frontMatter)),
        translatable: true,
      });
    }

    // Split body into segments
    const bodySegments = this.splitBody(body);
    for (const seg of bodySegments) {
      segments.push({
        id: `seg-${segmentIndex++}`,
        ...seg,
        hash: TranslationCache.computeHash(seg.content),
      });
    }

    return segments;
  }

  private splitBody(body: string): Omit<Segment, "id" | "hash">[] {
    const segments: Omit<Segment, "id" | "hash">[] = [];
    const lines = body.split("\n");
    let currentSegment: string[] = [];
    let inCodeBlock = false;
    let inAdmonition = false;
    let codeBlockContent: string[] = [];
    let admonitionContent: string[] = [];

    const flushCurrentSegment = () => {
      if (currentSegment.length > 0) {
        const content = currentSegment.join("\n").trim();
        if (content) {
          segments.push(this.classifySegment(content));
        }
        currentSegment = [];
      }
    };

    for (const line of lines) {
      // Handle code blocks
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          // End of code block
          codeBlockContent.push(line);
          segments.push({
            type: "code",
            content: codeBlockContent.join("\n"),
            translatable: false,
          });
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          // Start of code block
          flushCurrentSegment();
          codeBlockContent.push(line);
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      // Handle admonitions (:::note, :::warning, etc.)
      if (line.match(/^:::\w+/)) {
        flushCurrentSegment();
        admonitionContent.push(line);
        inAdmonition = true;
        continue;
      }

      if (line === ":::" && inAdmonition) {
        admonitionContent.push(line);
        segments.push({
          type: "admonition",
          content: admonitionContent.join("\n"),
          translatable: true,
        });
        admonitionContent = [];
        inAdmonition = false;
        continue;
      }

      if (inAdmonition) {
        admonitionContent.push(line);
        continue;
      }

      // Handle empty lines as segment separators
      if (line.trim() === "") {
        flushCurrentSegment();
        continue;
      }

      currentSegment.push(line);
    }

    // Flush remaining content
    flushCurrentSegment();

    if (codeBlockContent.length > 0) {
      segments.push({
        type: "code",
        content: codeBlockContent.join("\n"),
        translatable: false,
      });
    }

    if (admonitionContent.length > 0) {
      segments.push({
        type: "admonition",
        content: admonitionContent.join("\n"),
        translatable: true,
      });
    }

    return segments;
  }

  private classifySegment(content: string): Omit<Segment, "id" | "hash"> {
    // Heading
    if (content.match(/^#{1,6}\s/)) {
      return { type: "heading", content, translatable: true };
    }

    // Image only
    if (content.match(/^!\[.*\]\(.*\)$/)) {
      return { type: "other", content, translatable: false };
    }

    // Import statement or MDX component
    if (content.startsWith("import ") || content.match(/^<[A-Z]/)) {
      return { type: "other", content, translatable: false };
    }

    // Default to paragraph
    return { type: "paragraph", content, translatable: true };
  }

  /**
   * Reassemble translated segments into a document
   */
  reassemble(segments: Segment[]): string {
    const parts: string[] = [];

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];

      if (segment.type === "frontmatter") {
        parts.push(segment.content);
        parts.push(""); // Empty line after front matter
      } else {
        parts.push(segment.content);
      }
    }

    return parts.join("\n\n").trim() + "\n";
  }
}
```

---

## 6. OpenRouter Translator (`scripts/translate/translator.ts`)

```typescript
import { TranslationConfig, TranslationResult } from "./types";

interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class Translator {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private fallbackModel: string;
  private maxTokens: number;
  private temperature: number;

  constructor(config: TranslationConfig) {
    this.apiKey = process.env.OPENROUTER_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("OPENROUTER_API_KEY environment variable is required");
    }

    this.baseUrl = config.openrouter.baseUrl;
    this.model = config.openrouter.defaultModel;
    this.fallbackModel = config.openrouter.fallbackModel;
    this.maxTokens = config.openrouter.maxTokens;
    this.temperature = config.openrouter.temperature;
  }

  async translate(
    content: string,
    targetLocale: string,
    glossaryHints: string[]
  ): Promise<TranslationResult> {
    const prompt = this.buildPrompt(content, targetLocale, glossaryHints);

    try {
      return await this.callApi(this.model, prompt);
    } catch (error) {
      console.warn(`Primary model failed, trying fallback: ${this.fallbackModel}`);
      return await this.callApi(this.fallbackModel, prompt);
    }
  }

  private async callApi(model: string, prompt: string): Promise<TranslationResult> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/wsj-br/duplistatus",
        "X-Title": "duplistatus-docs-translator",
      },
      body: JSON.stringify({
        model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages: [{ role: "user", content: prompt }] as OpenRouterMessage[],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data: OpenRouterResponse = await response.json();

    return {
      content: data.choices[0].message.content,
      model,
      usage: {
        inputTokens: data.usage.prompt_tokens,
        outputTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
    };
  }

  private buildPrompt(
    content: string,
    targetLocale: string,
    glossaryHints: string[]
  ): string {
    const localeNames: Record<string, string> = {
      fr: "French",
      de: "German",
      es: "Spanish",
      "pt-BR": "Brazilian Portuguese",
    };

    const localeGuidance: Record<string, string> = {
      fr: 'Use formal "vous" register. Use French quotation marks « » where appropriate.',
      de: "Use formal register. Handle compound nouns appropriately.",
      es: 'Use formal "usted" register. Use neutral Latin American Spanish.',
      "pt-BR": 'Use Brazilian Portuguese conventions with "você" for formal address.',
    };

    const targetLanguage = localeNames[targetLocale] || targetLocale;
    const guidance = localeGuidance[targetLocale] || "";

    let glossarySection = "";
    if (glossaryHints.length > 0) {
      glossarySection = `
## GLOSSARY - USE THESE EXACT TRANSLATIONS:
${glossaryHints.join("\n")}
`;
    }

    return `You are a professional technical documentation translator. Translate the following documentation from English (UK) to ${targetLanguage}.

## CRITICAL RULES:

1. **Preserve Formatting**:
   - Keep ALL Markdown syntax exactly as-is (headers, links, bold, italic, lists)
   - Keep code blocks and inline code unchanged
   - Preserve link URLs and image paths
   - Keep MDX/JSX component names unchanged
   - Preserve admonition syntax (:::note, :::warning, etc.)

2. **Front Matter Rules**:
   - Translate ONLY "title" and "description" fields
   - Keep all other fields unchanged (sidebar_position, slug, etc.)

3. **Style Guidelines**:
   - Use formal/professional documentation tone
   - ${guidance}

4. **Do NOT translate**:
   - Code snippets
   - Variable names
   - File paths
   - URLs
   - Product name "duplistatus"
   - Technical terms in code context
${glossarySection}
## DOCUMENT TO TRANSLATE:

${content}

## IMPORTANT:
Return ONLY the translated document. Do not include any explanations or notes.`;
  }
}
```

---

## 7. Translation Validator (`scripts/translate/validator.ts`)

```typescript
import { Segment } from "./types";

export interface ValidationResult {
  valid: boolean;
  issues: string[];
  warnings: string[];
}

export function validateTranslation(
  sourceSegments: Segment[],
  translatedSegments: Segment[]
): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check segment count
  if (sourceSegments.length !== translatedSegments.length) {
    issues.push(
      `Segment count mismatch: ${sourceSegments.length} vs ${translatedSegments.length}`
    );
    return { valid: false, issues, warnings };
  }

  for (let i = 0; i < sourceSegments.length; i++) {
    const source = sourceSegments[i];
    const translated = translatedSegments[i];

    if (!translated) continue;

    // Check code blocks preserved
    if (source.type === "code" && source.content !== translated.content) {
      issues.push(`Code block modified at segment ${i}`);
    }

    // Check URLs preserved
    const sourceUrls = source.content.match(/\]\(([^)]+)\)/g) || [];
    const translatedUrls = translated.content.match(/\]\(([^)]+)\)/g) || [];

    if (sourceUrls.length !== translatedUrls.length) {
      warnings.push(`URL count mismatch at segment ${i}: ${sourceUrls.length} vs ${translatedUrls.length}`);
    }

    // Check heading levels preserved
    const sourceHeading = source.content.match(/^(#{1,6})\s/);
    const translatedHeading = translated.content.match(/^(#{1,6})\s/);

    if (
      sourceHeading &&
      translatedHeading &&
      sourceHeading[1] !== translatedHeading[1]
    ) {
      issues.push(`Heading level changed at segment ${i}`);
    }

    // Check length ratio (translations shouldn't be wildly different)
    if (source.translatable && translated.content.length > 0) {
      const ratio = translated.content.length / source.content.length;
      if (ratio > 3 || ratio < 0.2) {
        warnings.push(
          `Unusual length ratio (${ratio.toFixed(2)}) at segment ${i}`
        );
      }
    }

    // Check front matter structure preserved
    if (source.type === "frontmatter") {
      const sourceFmKeys = source.content.match(/^[a-z_]+:/gm) || [];
      const translatedFmKeys = translated.content.match(/^[a-z_]+:/gm) || [];

      if (sourceFmKeys.length !== translatedFmKeys.length) {
        issues.push("Front matter structure changed");
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings,
  };
}
```

---

## 8. CLI Entry Point (`scripts/translate/index.ts`)

```typescript
import { Command } from "commander";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { Glossary } from "./glossary";
import { TranslationCache } from "./cache";
import { DocumentSplitter } from "./splitter";
import { Translator } from "./translator";
import { loadConfig, validateConfig } from "./config";
import { validateTranslation } from "./validator";
import { TranslationConfig, TranslationStats, Segment } from "./types";

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

function getAllDocFiles(docsDir: string): string[] {
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
  return files.sort();
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
  verbose: boolean
): Promise<void> {
  const content = fs.readFileSync(filepath, "utf-8");
  const fileHash = TranslationCache.computeHash(content);
  const relativePath = path.relative(config.paths.docs, filepath);

  // Check file-level cache
  const cachedFileHash = cache.getFileStatus(relativePath, locale);
  if (cachedFileHash === fileHash) {
    const outputPath = getOutputPath(filepath, locale, config);
    if (fs.existsSync(outputPath)) {
      stats.filesSkipped++;
      if (verbose) {
        console.log(chalk.gray(`  ⏭️  Skipped (unchanged): ${relativePath}`));
      }
      return;
    }
  }

  stats.filesProcessed++;
  const segments = splitter.split(content);
  const translatedSegments: Segment[] = [];
  let fileSegmentsCached = 0;
  let fileSegmentsTranslated = 0;

  for (const segment of segments) {
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

    try {
      const result = await translator.translate(
        segment.content,
        locale,
        glossaryHints
      );

      fileSegmentsTranslated++;
      stats.segmentsTranslated++;
      stats.totalTokens += result.usage.totalTokens;

      // Cache the translation
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

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(
        chalk.red(`  ❌ Failed to translate segment in ${relativePath}: ${error}`)
      );
      translatedSegments.push(segment); // Keep original on failure
    }
  }

  // Validate translation
  const validation = validateTranslation(segments, translatedSegments);
  if (!validation.valid) {
    console.warn(
      chalk.yellow(`  ⚠️  Validation issues in ${relativePath}:`)
    );
    validation.issues.forEach((issue) => console.warn(chalk.yellow(`     - ${issue}`)));
  }

  // Reassemble and write
  const translatedContent = splitter.reassemble(translatedSegments);
  const outputPath = getOutputPath(filepath, locale, config);

  if (!dryRun) {
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, translatedContent);

    // Update file tracking
    cache.setFileStatus(relativePath, locale, fileHash);
  }

  if (verbose) {
    console.log(
      chalk.green(
        `  ✅ ${relativePath} → ${locale} (${fileSegmentsCached} cached, ${fileSegmentsTranslated} new)`
      )
    );
  }
}

async function main() {
  program
    .name("translate")
    .description("Translate Docusaurus documentation using OpenRouter LLM API")
    .option("-l, --locale <locale>", "Translate to specific locale only")
    .option("-f, --file <path>", "Translate specific file only")
    .option("--dry-run", "Show what would be translated without making changes")
    .option("--no-cache", "Ignore cache and re-translate everything")
    .option("-v, --verbose", "Show detailed output")
    .option("--stats", "Show cache statistics and exit")
    .option("--clear-cache [locale]", "Clear translation cache")
    .option("-c, --config <path>", "Path to config file")
    .parse(process.argv);

  const options = program.opts();

  try {
    const config = loadConfig(options.config);

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
      const locale =
        typeof options.clearCache === "string" ? options.clearCache : undefined;
      cache.clear(locale);
      console.log(
        chalk.green(`✅ Cache cleared${locale ? ` for ${locale}` : ""}`)
      );
      cache.close();
      return;
    }

    // Validate config (requires API key for translation)
    validateConfig(config);

    // Initialize components
    const cache = options.cache === false
      ? new TranslationCache(":memory:")
      : new TranslationCache(config.paths.cache);
    const glossary = new Glossary(config.paths.glossary);
    const splitter = new DocumentSplitter();
    const translator = new Translator(config);

    // Determine locales to process
    const locales = options.locale ? [options.locale] : config.locales.targets;

    // Determine files to process
    const files = options.file
      ? [path.resolve(options.file)]
      : getAllDocFiles(config.paths.docs);

    console.log(
      chalk.bold(
        `\n🌐 Translating ${files.length} files to ${locales.length} locale(s)\n`
      )
    );
    console.log(chalk.gray(`   Model: ${config.openrouter.defaultModel}`));
    console.log(chalk.gray(`   Glossary terms: ${glossary.size}`));
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
      estimatedCost: 0,
    };

    for (const locale of locales) {
      console.log(chalk.bold.blue(`\n📝 Translating to ${locale}:`));

      const localeStats: TranslationStats = {
        filesProcessed: 0,
        filesSkipped: 0,
        segmentsCached: 0,
        segmentsTranslated: 0,
        totalTokens: 0,
        estimatedCost: 0,
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
          options.verbose || false
        );
      }

      // Aggregate stats
      totalStats.filesProcessed += localeStats.filesProcessed;
      totalStats.filesSkipped += localeStats.filesSkipped;
      totalStats.segmentsCached += localeStats.segmentsCached;
      totalStats.segmentsTranslated += localeStats.segmentsTranslated;
      totalStats.totalTokens += localeStats.totalTokens;

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
    }

    // Final summary
    console.log(chalk.bold.green("\n✅ Translation complete!\n"));
    console.log(chalk.bold("📊 Summary:"));
    console.log(`   Total files processed: ${totalStats.filesProcessed}`);
    console.log(`   Total files skipped: ${totalStats.filesSkipped}`);
    console.log(`   Segments from cache: ${totalStats.segmentsCached}`);
    console.log(`   Segments translated: ${totalStats.segmentsTranslated}`);
    console.log(`   Total tokens used: ${totalStats.totalTokens.toLocaleString()}`);

    // Rough cost estimate (Claude Sonnet pricing via OpenRouter)
    const estimatedCost = (totalStats.totalTokens / 1_000_000) * 10;
    console.log(`   Estimated cost: ~$${estimatedCost.toFixed(2)}`);

    cache.close();
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error}`));
    process.exit(1);
  }
}

main();
```

---

## 9. Configuration File (`translate.config.json`)

```json
{
  "openrouter": {
    "baseUrl": "https://openrouter.ai/api/v1",
    "defaultModel": "anthropic/claude-sonnet-4",
    "fallbackModel": "openai/gpt-4o",
    "maxTokens": 8192,
    "temperature": 0.3
  },
  "locales": {
    "source": "en",
    "targets": ["fr", "de", "es", "pt-BR"]
  },
  "paths": {
    "docs": "./docs",
    "i18n": "./i18n",
    "cache": "./.translation-cache",
    "glossary": "./glossary.csv"
  },
  "cache": {
    "enabled": true,
    "segmentLevel": true
  }
}
```

---

## 10. Package.json Updates

Add these scripts to your existing `package.json`:

```json
{
  "scripts": {
    "translate": "tsx scripts/translate/index.ts",
    "translate:fr": "tsx scripts/translate/index.ts --locale fr",
    "translate:de": "tsx scripts/translate/index.ts --locale de",
    "translate:es": "tsx scripts/translate/index.ts --locale es",
    "translate:pt-br": "tsx scripts/translate/index.ts --locale pt-BR",
    "translate:dry-run": "tsx scripts/translate/index.ts --dry-run --verbose",
    "translate:stats": "tsx scripts/translate/index.ts --stats",
    "translate:clear-cache": "tsx scripts/translate/index.ts --clear-cache"
  },
  "devDependencies": {
    "better-sqlite3": "^11.7.0",
    "@types/better-sqlite3": "^7.6.12",
    "papaparse": "^5.5.2",
    "@types/papaparse": "^5.3.15",
    "gray-matter": "^4.0.3",
    "commander": "^13.1.0",
    "ora": "^8.2.0",
    "chalk": "^5.4.1",
    "tsx": "^4.19.0"
  }
}
```

---

## 11. .gitignore Additions

```gitignore
# Translation cache
.translation-cache/

# Environment variables
.env
.env.local
```

---

## 12. Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set your OpenRouter API key
export OPENROUTER_API_KEY=sk-or-v1-your-key-here

# 3. Create translate.config.json (copy from section 9)

# 4. Run a dry run first
npm run translate:dry-run

# 5. Run the actual translation
npm run translate

# 6. Test the translations
npm run start:fr
```
