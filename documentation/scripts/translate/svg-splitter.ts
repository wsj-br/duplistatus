import { TranslationCache } from "./cache";

export interface SvgTextSegment {
  type: "text" | "title";
  content: string;
  hash: string;
  translatable: boolean;
  /** Original XML string for this element (for replacement) */
  fullMatch: string;
  /** Attributes to preserve on the opening tag */
  openingTag: string;
}

// [\s\S]*? allows attributes and content to span multiple lines
const TEXT_TAG_RE = /<text([\s\S]*?)>([\s\S]*?)<\/text>/gi;
const TITLE_TAG_RE = /<title([\s\S]*?)>([\s\S]*?)<\/title>/gi;

/**
 * Extract text content from XML string (strips all tags, concatenates)
 */
function extractTextFromXml(xml: string): string {
  return xml
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export class SvgSplitter {
  /**
   * Split SVG content into translatable segments (text and title elements)
   */
  split(svgContent: string): SvgTextSegment[] {
    const segments: SvgTextSegment[] = [];

    // Extract <text> elements
    let match: RegExpExecArray | null;
    TEXT_TAG_RE.lastIndex = 0;
    while ((match = TEXT_TAG_RE.exec(svgContent)) !== null) {
      const [, attrs, innerContent] = match;
      const content = extractTextFromXml(innerContent);
      if (!content) continue;

      const fullMatch = match[0];
      const openingTag = `<text${attrs || ""}>`;

      segments.push({
        type: "text",
        content,
        hash: TranslationCache.computeHash(content),
        translatable: true,
        fullMatch,
        openingTag,
      });
    }

    // Extract <title> elements
    TITLE_TAG_RE.lastIndex = 0;
    while ((match = TITLE_TAG_RE.exec(svgContent)) !== null) {
      const [, attrs, innerContent] = match;
      const content = extractTextFromXml(innerContent);
      if (!content) continue;

      const fullMatch = match[0];

      segments.push({
        type: "title",
        content,
        hash: TranslationCache.computeHash(content),
        translatable: true,
        fullMatch,
        openingTag: (attrs || "").trim(),
      });
    }

    return segments;
  }

  /**
   * Reassemble SVG with translated segments.
   * For each segment: replace inner content with a single tspan (for text) or direct text (for title).
   */
  reassemble(svgContent: string, translatedSegments: SvgTextSegment[]): string {
    let result = svgContent;

    for (const segment of translatedSegments) {
      if (segment.type === "text") {
        // Replace <text ...>content</text> with <text ...><tspan>translation</tspan></text>
        const newContent = `${segment.openingTag}<tspan>${escapeXml(segment.content)}</tspan></text>`;
        result = result.replace(segment.fullMatch, newContent);
      } else {
        // Replace <title ...>content</title> with <title ...>translation</title>
        const attrs = segment.openingTag ? " " + segment.openingTag : "";
        const newContent = `<title${attrs}>${escapeXml(segment.content)}</title>`;
        result = result.replace(segment.fullMatch, newContent);
      }
    }

    return result;
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
