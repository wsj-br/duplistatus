/**
 * Protects admonition directive syntax from translation by replacing with placeholders.
 * Prevents the model from translating directive names (e.g. :::note → :::nota) or
 * modifying the closing ::: markers.
 */

const OPEN_PREFIX = "{{ADM_OPEN_";
const OPEN_SUFFIX = "}}";
const END_PREFIX = "{{ADM_END_";
const END_SUFFIX = "}}";

/** Docusaurus admonition directive names */
const ADMONITION_DIRECTIVES =
  /^(:::(?:note|tip|info|warning|danger|caution|important)(?:\[[^\]]*\])?(?:\s+[^\n]*)?)\s*$/;

/** Closing marker: ::: or nested ::::, :::::, etc. */
const ADMONITION_CLOSING = /^(:::+)\s*$/;

export interface AdmonitionProtectedResult {
  protected: string;
  openMap: string[];
  endMap: string[];
}

/**
 * Replace admonition opening and closing lines with placeholders.
 * Call before sending text to the translator.
 */
export function protectAdmonitionSyntax(text: string): AdmonitionProtectedResult {
  const openMap: string[] = [];
  const endMap: string[] = [];
  let openIndex = 0;
  let endIndex = 0;

  const lines = text.split("\n");
  const result: string[] = [];

  for (const line of lines) {
    const openMatch = line.match(ADMONITION_DIRECTIVES);
    if (openMatch) {
      const placeholder = `${OPEN_PREFIX}${openIndex}${OPEN_SUFFIX}`;
      openMap.push(openMatch[1]);
      openIndex++;
      result.push(placeholder);
      continue;
    }

    const endMatch = line.match(ADMONITION_CLOSING);
    if (endMatch) {
      const placeholder = `${END_PREFIX}${endIndex}${END_SUFFIX}`;
      endMap.push(endMatch[1]);
      endIndex++;
      result.push(placeholder);
      continue;
    }

    result.push(line);
  }

  return {
    protected: result.join("\n"),
    openMap,
    endMap,
  };
}

/**
 * Restore original admonition syntax from placeholders.
 * Call after receiving the translation.
 * Restores end placeholders first, then open, to avoid index collisions.
 * Uses flexible regex to handle LLM-added whitespace (e.g. {{ ADM_OPEN_0 }}).
 */
export function restoreAdmonitionSyntax(
  text: string,
  openMap: string[],
  endMap: string[]
): string {
  let restored = text;

  for (let i = 0; i < endMap.length; i++) {
    const flexible = new RegExp(
      `\\{\\{\\s*ADM_END_${i}\\s*\\}\\}`,
      "g"
    );
    restored = restored.replace(flexible, endMap[i]);
  }

  for (let i = 0; i < openMap.length; i++) {
    const flexible = new RegExp(
      `\\{\\{\\s*ADM_OPEN_${i}\\s*\\}\\}`,
      "g"
    );
    restored = restored.replace(flexible, openMap[i]);
  }

  return restored;
}
