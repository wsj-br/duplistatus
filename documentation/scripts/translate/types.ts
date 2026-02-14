export interface TranslationConfig {
  batchSize?: number;
  maxBatchChars?: number;
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
    /** Optional: user glossary (en, locale, translation) - overrides glossary-ui */
    glossaryUser?: string;
    /** Optional: path to static img (SVG source). Default: ./static/img */
    staticImg?: string;
    /** Optional: path to JSON source files (i18n source). Default: ./i18n/en */
    jsonSource?: string;
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
  type: "frontmatter" | "heading" | "paragraph" | "code" | "admonition" | "other" | "json";
  content: string;
  hash: string;
  translatable: boolean;
  /** 1-based line number in the markdown file where this segment started. */
  startLine?: number;
  /** For JSON segments: the full key path (e.g., "theme.ErrorPageContent.title") */
  jsonKey?: string;
  /** For JSON segments: the description field (for context, not translated) */
  jsonDescription?: string;
}

export interface TranslationResult {
  content: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  cost?: number; // Actual cost in USD from OpenRouter API
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
  totalCost: number; // Actual cost from OpenRouter API
  totalTimeMs: number; // Total time in milliseconds
  fileTimes: number[]; // Time per file in milliseconds
}

export interface FileTranslationPlan {
  filepath: string;
  locale: string;
  totalSegments: number;
  cachedSegments: number;
  needsTranslation: boolean;
}

/** Result from translateBatch, including usage and cost for stats. */
export interface BatchTranslationResult {
  /** Index in batch (0, 1, 2, ...) -> translated content. Use index, not hash, to preserve order when segments share the same hash. */
  translations: Map<number, string>;
  model: string;
  usage: { inputTokens: number; outputTokens: number; totalTokens: number };
  cost?: number;
}

/** Thrown when batch translation returns a different number of segments than requested. */
export class BatchTranslationError extends Error {
  constructor(
    public readonly expected: number,
    public readonly received: number,
    public readonly rawResponse: string
  ) {
    super(
      `Batch translation mismatch: expected ${expected} translated segments, got ${received}. Fall back to single-segment mode.`
    );
    this.name = "BatchTranslationError";
  }
}
