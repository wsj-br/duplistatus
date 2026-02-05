import fs from "fs";
import path from "path";
import { TranslationConfig } from "./types";

const DEFAULT_CONFIG: TranslationConfig = {
  batchSize: 20,
  maxBatchChars: 5000,
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "deepseek/deepseek-chat",
    fallbackModel: "anthropic/claude-3-haiku",
    maxTokens: 8192,
    temperature: 0.2,
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
    staticImg: "./static/img",
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
      batchSize: userConfig.batchSize ?? DEFAULT_CONFIG.batchSize,
      maxBatchChars: userConfig.maxBatchChars ?? DEFAULT_CONFIG.maxBatchChars,
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
