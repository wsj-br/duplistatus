/**
 * Intlayer configuration for duplistatus (Next.js 16, App Router).
 * Target languages: en, de, fr, es, pt-BR.
 * Editor disabled initially; tree-shaking enabled for build optimization.
 */
import { Locales, type IntlayerConfig } from "intlayer";

const config: IntlayerConfig = {
  internationalization: {
    locales: [
      Locales.ENGLISH,
      Locales.GERMAN,
      Locales.FRENCH,
      Locales.SPANISH,
      Locales.PORTUGUESE_BRAZIL,
    ],
    defaultLocale: Locales.ENGLISH,
  },
  editor: {
    enabled: false,
    applicationURL: "http://localhost:8666",
  },
  build: {
    optimize: true,
  },
};

export default config;
