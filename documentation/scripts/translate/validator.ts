import { Segment } from "./types";

export interface ValidationIssue {
  message: string;
  segmentIndex?: number;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  warnings: string[];
}

export function validateTranslation(
  sourceSegments: Segment[],
  translatedSegments: Segment[]
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const warnings: string[] = [];

  // Check segment count
  if (sourceSegments.length !== translatedSegments.length) {
    issues.push({
      message: `Segment count mismatch: ${sourceSegments.length} vs ${translatedSegments.length}`,
    });
    return { valid: false, issues, warnings };
  }

  for (let i = 0; i < sourceSegments.length; i++) {
    const source = sourceSegments[i];
    const translated = translatedSegments[i];

    if (!translated) continue;

    // Check code blocks preserved
    if (source.type === "code" && source.content !== translated.content) {
      issues.push({ message: `Code block modified at segment ${i} (source_hash: ${source.hash})`, segmentIndex: i });
    }

    // Check URLs preserved
    const sourceUrls = source.content.match(/\]\(([^)]+)\)/g) || [];
    const translatedUrls = translated.content.match(/\]\(([^)]+)\)/g) || [];

    if (sourceUrls.length !== translatedUrls.length) {
      warnings.push(`URL count mismatch at segment ${i}: ${sourceUrls.length} vs ${translatedUrls.length} (source_hash: ${source.hash})`);
    }

    // Check heading levels preserved
    const sourceHeading = source.content.match(/^(#{1,6})\s/);
    const translatedHeading = translated.content.match(/^(#{1,6})\s/);

    if (
      sourceHeading &&
      translatedHeading &&
      sourceHeading[1] !== translatedHeading[1]
    ) {
      issues.push({ message: `Heading level changed at segment ${i} (source_hash: ${source.hash})`, segmentIndex: i });
    }

    // Check length ratio (translations shouldn't be wildly different)
    if (source.translatable && translated.content.length > 0) {
      const ratio = translated.content.length / source.content.length;
      if (ratio > 3 || ratio < 0.2) {
        warnings.push(
          `Unusual length ratio (${ratio.toFixed(2)}) at segment ${i} (source_hash: ${source.hash})`
        );
      }
    }

    // Check front matter structure preserved
    if (source.type === "frontmatter") {
      const sourceFmKeys = source.content.match(/^[a-z_]+:/gm) || [];
      const translatedFmKeys = translated.content.match(/^[a-z_]+:/gm) || [];

      if (sourceFmKeys.length !== translatedFmKeys.length) {
        issues.push({ message: `Front matter structure changed (source_hash: ${source.hash})`, segmentIndex: 0 });
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings,
  };
}
