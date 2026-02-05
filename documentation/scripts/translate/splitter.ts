import matter from "gray-matter";
import { Segment } from "./types";
import { TranslationCache } from "./cache";

export class DocumentSplitter {
  /**
   * Split a markdown document into translatable segments
   */
  split(content: string): Segment[] {
    const segments: Segment[] = [];
    let segmentIndex = 0;

    // Extract front matter
    const { data: frontMatter, content: body } = matter(content);

    if (Object.keys(frontMatter).length > 0) {
      const frontMatterStr = matter.stringify("", frontMatter).trim();
      segments.push({
        id: `seg-${segmentIndex++}`,
        type: "frontmatter",
        content: frontMatterStr,
        hash: TranslationCache.computeHash(frontMatterStr),
        translatable: true,
        startLine: 1,
      });
    }

    // Compute 1-based line number where body starts in the file
    const bodyStartLine =
      1 +
      (content.substring(0, content.indexOf(body)).match(/\n/g) || []).length;

    // Split body into segments
    const bodySegments = this.splitBody(body, bodyStartLine);
    for (const seg of bodySegments) {
      segments.push({
        id: `seg-${segmentIndex++}`,
        ...seg,
        hash: TranslationCache.computeHash(seg.content),
      });
    }

    return segments;
  }

  private splitBody(
    body: string,
    bodyStartLine: number
  ): Omit<Segment, "id" | "hash">[] {
    const segments: Omit<Segment, "id" | "hash">[] = [];
    const lines = body.split("\n");
    let currentSegment: string[] = [];
    let currentSegmentStartLine = 0;
    let inCodeBlock = false;
    let inAdmonition = false;
    let codeBlockContent: string[] = [];
    let codeBlockStartLine = 0;
    let admonitionContent: string[] = [];
    let admonitionStartLine = 0;

    const flushCurrentSegment = () => {
      if (currentSegment.length > 0) {
        const content = currentSegment.join("\n").trim();
        if (content) {
          segments.push(
            this.classifySegment(content, bodyStartLine + currentSegmentStartLine)
          );
        }
        currentSegment = [];
      }
    };

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      // Handle code blocks (allow optional leading whitespace so indented fences are recognized)
      if (/^\s*```/.test(line)) {
        if (inCodeBlock) {
          // End of code block
          codeBlockContent.push(line);
          segments.push({
            type: "code",
            content: codeBlockContent.join("\n"),
            translatable: false,
            startLine: bodyStartLine + codeBlockStartLine,
          });
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          // Start of code block
          flushCurrentSegment();
          codeBlockContent.push(line);
          codeBlockStartLine = lineIndex;
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      // Handle admonitions (:::note, :::warning, etc.)
      if (line.match(/^:::\w+/)) {
        flushCurrentSegment();
        admonitionContent.push(line);
        admonitionStartLine = lineIndex;
        inAdmonition = true;
        continue;
      }

      if (line === ":::" && inAdmonition) {
        admonitionContent.push(line);
        segments.push({
          type: "admonition",
          content: admonitionContent.join("\n"),
          translatable: true,
          startLine: bodyStartLine + admonitionStartLine,
        });
        admonitionContent = [];
        inAdmonition = false;
        continue;
      }

      if (inAdmonition) {
        admonitionContent.push(line);
        continue;
      }

      // Handle empty lines as segment separators
      if (line.trim() === "") {
        flushCurrentSegment();
        continue;
      }

      if (currentSegment.length === 0) {
        currentSegmentStartLine = lineIndex;
      }
      currentSegment.push(line);
    }

    // Flush remaining content
    flushCurrentSegment();

    if (codeBlockContent.length > 0) {
      segments.push({
        type: "code",
        content: codeBlockContent.join("\n"),
        translatable: false,
        startLine: bodyStartLine + codeBlockStartLine,
      });
    }

    if (admonitionContent.length > 0) {
      segments.push({
        type: "admonition",
        content: admonitionContent.join("\n"),
        translatable: true,
        startLine: bodyStartLine + admonitionStartLine,
      });
    }

    return segments;
  }

  private classifySegment(
    content: string,
    startLine: number
  ): Omit<Segment, "id" | "hash"> {
    const trimmed = content.trim();
    const isSingleLine = !trimmed.includes("\n");

    // HTML-only structural elements (not translatable)
    // Common in our docs: <br/> used as spacing.
    if (/^<br\s*\/?>$/i.test(trimmed)) {
      return { type: "other", content, translatable: false, startLine };
    }

    // Markdown thematic break / horizontal rule (not translatable)
    if (/^---+$/.test(trimmed)) {
      return { type: "other", content, translatable: false, startLine };
    }

    // Generic: single-line segments with no real text should not be translated.
    // This catches pure punctuation/markup-ish lines that tend to cause LLM hallucinations.
    if (isSingleLine) {
      // Strip common non-textual markdown/MDX constructs and see if anything remains.
      const textOnly = trimmed
        // remove inline code
        .replace(/`[^`]*`/g, "")
        // remove markdown links/images
        .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
        .replace(/\[[^\]]*\]\([^)]*\)/g, "")
        // remove emphasis/heading/list/quote markers and common punctuation
        .replace(/[*_#>\-]/g, "")
        .replace(/[()[\]{}<>]/g, "")
        // remove remaining HTML tags if any slipped through
        .replace(/<[^>]+>/g, "")
        .trim();

      // If nothing substantial remains (no letters or digits), treat as non-translatable.
      if (!/[A-Za-z0-9]/.test(textOnly)) {
        return { type: "other", content, translatable: false, startLine };
      }
    }

    // Heading
    if (content.match(/^#{1,6}\s/)) {
      return { type: "heading", content, translatable: true, startLine };
    }

    // Image only
    if (content.match(/^!\[.*\]\(.*\)$/)) {
      return { type: "other", content, translatable: false, startLine };
    }

    // Import statement or MDX/JSX component (opening or closing tag; use trimmed so indented lines are caught)
    if (content.startsWith("import ") || /^<[A-Z]/.test(trimmed) || /^<\/\w+>$/.test(trimmed)) {
      return { type: "other", content, translatable: false, startLine };
    }

    // Default to paragraph
    return { type: "paragraph", content, translatable: true, startLine };
  }

  /**
   * Reassemble translated segments into a document
   */
  reassemble(segments: Segment[]): string {
    const parts: string[] = [];

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];

      if (segment.type === "frontmatter") {
        parts.push(segment.content);
        parts.push(""); // Empty line after front matter
      } else {
        parts.push(segment.content);
      }
    }

    return parts.join("\n\n").trim() + "\n";
  }
}
