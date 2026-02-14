import { Segment } from "./types";
import { TranslationCache } from "./cache";

/**
 * Splits JSON translation files into translatable segments.
 *
 * JSON structure in Docusaurus i18n files:
 * {
 *   "some.key": {
 *     "message": "Text to translate",
 *     "description": "Developer context (not translated)"
 *   },
 *   "another.key": {
 *     "message": "More text",
 *     // description is optional
 *   }
 * }
 */
export class JsonSplitter {
  /**
   * Split a JSON file into translatable segments.
   * Each entry with a "message" field becomes one segment.
   * The "description" field is kept for context but not translated.
   * Line numbers are calculated based on the position in the original content.
   */
  split(filePath: string, content: string): Segment[] {
    const segments: Segment[] = [];
    let segmentIndex = 0;
    const lines = content.split("\n");

    let json: any;
    try {
      json = JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to parse JSON file ${filePath}: ${error}`);
    }

    // Define the i18n entry shape
    interface I18nEntry {
      message: string;
      description?: string;
    }

    /**
     * Find the line number (1-based) where a given message appears in the JSON content.
     * Searches for the message text in quotes to find the exact line.
     */
    const findLineNumber = (message: string, key: string): number => {
      // Try to find the line containing the key first
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Look for the key in quotes, allowing for whitespace
        const keyPattern = new RegExp(`"${this.escapeRegex(key)}"\\s*:`);
        if (keyPattern.test(line)) {
          return i + 1; // 1-based line number
        }
      }
      // Fallback: search for the message text
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(`"${message}"`)) {
          return i + 1;
        }
      }
      return 1; // Default to line 1 if not found
    };

    // Walk the JSON object recursively
    const walk = (
      obj: any,
      keyPrefix: string = ""
    ): void => {
      if (typeof obj !== "object" || obj === null) {
        return;
      }

      for (const [key, value] of Object.entries(obj)) {
        const fullKey = keyPrefix ? `${keyPrefix}.${key}` : key;

        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          // Check if this object has a "message" field (i18n entry)
          const entry = value as I18nEntry;
          if (entry.hasOwnProperty("message")) {
            const message = entry.message;
            const description = entry.description;

            if (typeof message === "string") {
              const hash = TranslationCache.computeHash(message);
              const startLine = findLineNumber(message, key);
              segments.push({
                id: `json-${segmentIndex++}`,
                type: "json",
                content: message,
                hash: hash,
                translatable: true,
                startLine: startLine,
                jsonKey: fullKey,
                jsonDescription: description,
              });
            }
          } else {
            // Recurse into nested objects
            walk(value, fullKey);
          }
        }
      }
    };

    walk(json);
    return segments;
  }

  /**
   * Escape special regex characters in a string
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Reassemble translated segments back into a JSON object.
   * Preserves the original structure and all non-translated fields.
   */
  reassemble(originalContent: string, translatedSegments: Segment[]): string {
    // Parse original JSON
    const originalJson = JSON.parse(originalContent);

    // Build a map of segments by jsonKey
    const segmentMap = new Map<string, Segment>();
    for (const seg of translatedSegments) {
      if (seg.jsonKey) {
        segmentMap.set(seg.jsonKey, seg);
      }
    }

    // Define the i18n entry shape
    interface I18nEntry {
      message: string;
      description?: string;
    }

    // Reconstruct the JSON by walking original structure
    const walk = (src: any, keyPrefix: string = ""): any => {
      if (typeof src !== "object" || src === null) {
        return src;
      }

      if (Array.isArray(src)) {
        return src.map((item: any) => walk(item, keyPrefix));
      }

      const result: Record<string, any> = {};

      for (const [key, value] of Object.entries(src)) {
        const fullKey = keyPrefix ? `${keyPrefix}.${key}` : key;

        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          // Check if this is an i18n entry with a message field
          const entry = value as I18nEntry;
          if (entry.hasOwnProperty("message")) {
            // This is a leaf entry - use translated message if available
            const seg = segmentMap.get(fullKey);
            const translatedMessage = seg ? seg.content : entry.message;

            result[key] = {
              message: translatedMessage,
            };

            // Preserve description if it exists
            if (entry.hasOwnProperty("description")) {
              result[key].description = entry.description;
            }
          } else {
            // Recurse
            result[key] = walk(value, fullKey);
          }
        } else {
          result[key] = value;
        }
      }

      return result;
    };

    const reconstructed = walk(originalJson);

    // Pretty print with 2-space indentation (matching Docusaurus style)
    return JSON.stringify(reconstructed, null, 2) + "\n";
  }
}
