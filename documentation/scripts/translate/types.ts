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
