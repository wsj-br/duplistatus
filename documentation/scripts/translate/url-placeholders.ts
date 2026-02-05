/**
 * Protects markdown link URLs from translation by replacing them with placeholders.
 * Prevents the model from translating URL paths (e.g. overview#anchor → resumen#anchor)
 * when glossary terms like "overview" → "resumen" appear inside the URL.
 */

const PLACEHOLDER_PREFIX = "{{URL_PLACEHOLDER_";
const PLACEHOLDER_SUFFIX = "}}";

/** Matches ](url) in markdown links [text](url) and images ![alt](url) */
const MARKDOWN_URL_REGEX = /\]\(([^)]*)\)/g;

export interface ProtectedResult {
  protected: string;
  urlMap: string[];
}

/**
 * Replace markdown link URLs with placeholders. Call before sending text to the translator.
 */
export function protectMarkdownUrls(text: string): ProtectedResult {
  const urlMap: string[] = [];
  let placeholderIndex = 0;

  const protected_ = text.replace(MARKDOWN_URL_REGEX, (match, url) => {
    const placeholder = `${PLACEHOLDER_PREFIX}${placeholderIndex}${PLACEHOLDER_SUFFIX}`;
    urlMap.push(url);
    placeholderIndex++;
    return `](${placeholder})`;
  });

  return { protected: protected_, urlMap };
}

/**
 * Restore original URLs from placeholders. Call after receiving the translation.
 */
export function restoreMarkdownUrls(text: string, urlMap: string[]): string {
  if (urlMap.length === 0) return text;

  let restored = text;
  for (let i = 0; i < urlMap.length; i++) {
    const placeholder = `${PLACEHOLDER_PREFIX}${i}${PLACEHOLDER_SUFFIX}`;
    restored = restored.replace(placeholder, urlMap[i]);
  }
  return restored;
}
