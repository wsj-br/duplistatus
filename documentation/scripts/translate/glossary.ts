import fs from "fs";
import Papa from "papaparse";
import { GlossaryTerm } from "./types";

/** Expected locale columns in glossary CSV (header = locale only) */
const GLOSSARY_LOCALES = ["en", "fr", "de", "pt-BR", "es"] as const;

export class Glossary {
  private terms: Map<string, GlossaryTerm> = new Map();

  constructor(glossaryUiPath: string, glossaryUserPath?: string) {
    if (fs.existsSync(glossaryUiPath)) {
      this.loadGlossaryUi(glossaryUiPath);
    } else {
      console.warn(`Glossary file not found: ${glossaryUiPath}`);
    }
    if (glossaryUserPath && fs.existsSync(glossaryUserPath)) {
      this.loadGlossaryUser(glossaryUserPath);
    }
  }

  private loadGlossaryUi(filepath: string): void {
    const content = fs.readFileSync(filepath, "utf-8");
    const { data } = Papa.parse<Record<string, string>>(content, {
      header: true,
      skipEmptyLines: true,
    });

    for (const row of data) {
      const english = row["en"]?.trim();
      if (!english) continue;

      const term: GlossaryTerm = {
        english,
        translations: {},
        partOfSpeech: "unknown",
      };

      for (const locale of GLOSSARY_LOCALES) {
        if (locale === "en") continue; // English is the source
        const translation = row[locale]?.trim();
        if (translation) {
          term.translations[locale] = translation;
        }
      }

      this.terms.set(english.toLowerCase(), term);
    }

    console.log(`✓ Loaded ${this.terms.size} glossary terms from UI`);
  }

  /**
   * Load user glossary (en, locale, translation) - overrides UI glossary entries
   */
  private loadGlossaryUser(filepath: string): void {
    const content = fs.readFileSync(filepath, "utf-8");
    const { data } = Papa.parse<Record<string, string>>(content, {
      header: true,
      skipEmptyLines: true,
    });

    let count = 0;
    for (const row of data) {
      const english = row["en"]?.trim();
      const locale = row["locale"]?.trim();
      const translation = row["translation"]?.trim();
      if (!english || !locale || !translation) continue;

      const key = english.toLowerCase();
      let term = this.terms.get(key);
      if (!term) {
        term = {
          english,
          translations: {},
          partOfSpeech: "unknown",
        };
        this.terms.set(key, term);
      }
      term.translations[locale] = translation;
      count++;
    }

    if (count > 0) {
      console.log(`✓ Loaded ${count} user glossary overrides`);
    }
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
