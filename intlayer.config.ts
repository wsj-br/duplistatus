/**
 * Intlayer configuration for duplistatus (Next.js 16, App Router).
 * Target languages: en, de, fr, es, pt-BR.
 * Editor disabled initially; tree-shaking enabled for build optimization.
 */
import { Locales, type IntlayerConfig } from "intlayer";

const config: IntlayerConfig = {
  internationalization: {
    locales: [
      Locales.ENGLISH_UNITED_KINGDOM,
      Locales.GERMAN,
      Locales.FRENCH,
      Locales.SPANISH,
      Locales.PORTUGUESE_BRAZIL,
    ],
    defaultLocale: Locales.ENGLISH_UNITED_KINGDOM,
  },
  editor: {
    enabled: process.env.INTLAYER_ENABLED !== 'false', // true by default in development
    applicationURL: "http://localhost:8666",
    port: process.env.INTLAYER_PORT ? parseInt(process.env.INTLAYER_PORT, 10) : 8000,
    editorURL: process.env.INTLAYER_EDITOR_URL || "http://localhost:8000",
  },
  build: {
    optimize: true,
  },
  ai: {
    provider: "openrouter",
    model: "anthropic/claude-3.5-haiku",
    apiKey: process.env.OPENROUTER_API_KEY,
    temperature: 0.2,
  },
};

export default config;
