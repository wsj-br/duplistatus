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
