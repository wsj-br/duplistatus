import fs from "fs";
import {
  BatchTranslationError,
  BatchTranslationResult,
  Segment,
  TranslationConfig,
  TranslationResult,
} from "./types";

/** Message content with cache_control for context caching (OpenRouter). */
interface OpenRouterContentBlock {
  type: "text";
  text: string;
  cache_control?: { type: "ephemeral"; ttl?: string };
}

interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
  content: string | OpenRouterContentBlock[];
}

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cost?: number; // Actual cost in credits (USD) - located in usage object
    cost_details?: {
      upstream_inference_cost?: number;
    };
  };
}

/** Request body sent to OpenRouter (never includes API key). */
interface OpenRouterRequestPayload {
  model: string;
  max_tokens: number;
  temperature: number;
  messages: OpenRouterMessage[];
}

const LOCALE_NAMES: Record<string, string> = {
  fr: "French",
  de: "German",
  es: "Spanish",
  "pt-BR": "Brazilian Portuguese",
};

const LOCALE_GUIDANCE: Record<string, string> = {
  fr: 'Formal "vous", French quotes « »',
  de: "Formal register, compound nouns",
  es: 'Formal "usted", Latin American',
  "pt-BR": 'Brazilian Portuguese, "você"',
};

export class Translator {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private fallbackModel: string;
  private maxTokens: number;
  private temperature: number;
  private debugTrafficFilePath: string | null;

  constructor(config: TranslationConfig, debugTrafficFilePath?: string | null) {
    this.apiKey = process.env.OPENROUTER_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("OPENROUTER_API_KEY environment variable is required");
    }

    this.baseUrl = config.openrouter.baseUrl;
    this.model = config.openrouter.defaultModel;
    this.fallbackModel = config.openrouter.fallbackModel;
    this.maxTokens = config.openrouter.maxTokens;
    this.temperature = config.openrouter.temperature;
    this.debugTrafficFilePath = debugTrafficFilePath ?? null;
  }

  private appendDebugLog(direction: "request" | "response", payload: unknown): void {
    if (!this.debugTrafficFilePath) return;
    const ts = new Date().toISOString();
    const sep = `========== ${direction.toUpperCase()} ${ts} ==========`;
    const body = typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
    try {
      fs.appendFileSync(this.debugTrafficFilePath, `${sep}\n${body}\n\n`, "utf-8");
    } catch (e) {
      console.warn(`[debug-traffic] Failed to write to ${this.debugTrafficFilePath}: ${e}`);
    }
  }

  async translate(
    content: string,
    targetLocale: string,
    glossaryHints: string[]
  ): Promise<TranslationResult> {
    const { systemPrompt, userContent } = this.buildPrompt(content, targetLocale, glossaryHints);

    const call = async (model: string) => {
      const res = await this.callApi(model, systemPrompt, userContent);
      return { ...res, content: this.stripTranslateTags(res.content) };
    };

    try {
      return await call(this.model);
    } catch (error) {
      console.warn(`Primary model failed, trying fallback: ${this.fallbackModel}`);
      return await call(this.fallbackModel);
    }
  }

  /** Remove stray <translate>...</translate> wrapper if LLM echoes it back. */
  private stripTranslateTags(content: string): string {
    return content
      .replace(/^\s*<translate>\s*/i, "")
      .replace(/\s*<\/translate>\s*$/i, "")
      .trim();
  }

  /**
   * Translate multiple segments in a single API call. Returns translations plus usage/cost for stats.
   * @throws BatchTranslationError if the number of returned tags doesn't match the input (caller can fall back to single-segment mode).
   */
  async translateBatch(
    segments: Segment[],
    locale: string,
    glossaryHints: string[] = []
  ): Promise<BatchTranslationResult> {
    if (segments.length === 0) {
      return {
        translations: new Map<number, string>(),
        model: this.model,
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      };
    }

    const { systemPrompt, userContent } = this.buildBatchPrompt(segments, locale, glossaryHints);

    const call = async (model: string) => {
      const result = await this.callApi(model, systemPrompt, userContent);
      const translations = this.parseBatchResponse(
        result.content,
        segments,
        result.content
      );
      return {
        translations,
        model: result.model,
        usage: result.usage,
        cost: result.cost,
      };
    };

    try {
      return await call(this.model);
    } catch (error) {
      if (error instanceof BatchTranslationError) {
        throw error;
      }
      console.warn(`Primary model failed, trying fallback: ${this.fallbackModel}`);
      return await call(this.fallbackModel);
    }
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /** Reverse escapeXml so output renders correctly in markdown. Must unescape &amp; last. */
  private unescapeXml(text: string): string {
    return text
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
  }

  private buildBatchPrompt(
    segments: Segment[],
    targetLocale: string,
    glossaryHints: string[]
  ): { systemPrompt: string; userContent: string } {
    const targetLanguage = LOCALE_NAMES[targetLocale] || targetLocale;
    const guidance = LOCALE_GUIDANCE[targetLocale] || "";

    let glossarySection = "";
    if (glossaryHints.length > 0) {
      glossarySection = `\n<glossary>\n${glossaryHints.join("\n")}\n</glossary>\n`;
    }

    const segBlocks = segments
      .map((s, i) => `<seg id="${i}">${this.escapeXml(s.content)}</seg>`)
      .join("\n");

    const systemPrompt = `Translate from English (UK) to ${targetLanguage}. ${guidance}

Rules: Keep headers (###), code, variables, URLs, line breaks, markdown formatting, placeholders {{X}} unchanged. Preserve {{ADM_OPEN_N}} and {{ADM_END_N}} placeholders exactly - do not translate or modify them. Translate only title/description in front matter. Prefer glossary terms.

Reply with ONLY <t id="N">translation</t> blocks, one per segment, in order. No other text.${glossarySection}`;

    const userContent = `<segments>
${segBlocks}
</segments>`;

    return { systemPrompt, userContent };
  }

  private parseBatchResponse(
    response: string,
    segments: Segment[],
    rawResponse: string
  ): Map<number, string> {
    // Non-greedy capture; \s* handles newlines/whitespace the LLM may add inside tags
    const regex = /<t\s+id="(\d+)"[^>]*>\s*([\s\S]*?)\s*<\/t>/g;
    const byIndex = new Map<number, string>();
    let match;

    while ((match = regex.exec(response)) !== null) {
      const id = parseInt(match[1], 10);
      const rawContent = match[2].trim();
      const content = this.unescapeXml(rawContent);
      byIndex.set(id, content);
    }

    if (byIndex.size !== segments.length) {
      throw new BatchTranslationError(segments.length, byIndex.size, rawResponse);
    }

    for (let i = 0; i < segments.length; i++) {
      if (byIndex.get(i) === undefined) {
        throw new BatchTranslationError(segments.length, byIndex.size, rawResponse);
      }
    }
    return byIndex;
  }

  private async callApi(
    model: string,
    systemPrompt: string,
    userContent: string
  ): Promise<TranslationResult> {
    const messages: OpenRouterMessage[] = [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: systemPrompt,
            cache_control: { type: "ephemeral" },
          },
        ],
      },
      { role: "user", content: userContent },
    ];

    const requestPayload: OpenRouterRequestPayload = {
      model,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      messages,
    };

    if (this.debugTrafficFilePath) {
      this.appendDebugLog("request", requestPayload);
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/wsj-br/duplistatus",
        "X-Title": "duplistatus-docs-translator",
      },
      body: JSON.stringify(requestPayload),
    });

    const rawBody = await response.text();

    if (this.debugTrafficFilePath) {
      this.appendDebugLog("response", {
        status: response.status,
        ok: response.ok,
        body: response.ok ? (JSON.parse(rawBody) as OpenRouterResponse) : rawBody,
      });
    }

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} - ${rawBody}`);
    }

    const data: OpenRouterResponse = JSON.parse(rawBody);

    // Debug: Log cost field location if available
    if (process.env.DEBUG_COST === "true") {
      console.error(`[DEBUG] Top-level cost: ${(data as any).cost}`);
      console.error(`[DEBUG] Usage cost: ${data.usage.cost}`);
      console.error(`[DEBUG] Usage keys:`, Object.keys(data.usage));
      console.error(`[DEBUG] Full usage object:`, JSON.stringify(data.usage, null, 2));
    }

    const cost = data.usage.cost ?? (data as any).cost;
    
    // Debug logging
    if (process.env.DEBUG_COST === "true") {
      console.error(`[DEBUG] Extracted cost: ${cost}`);
      console.error(`[DEBUG] Cost type: ${typeof cost}`);
    }

    return {
      content: data.choices[0].message.content,
      model,
      usage: {
        inputTokens: data.usage.prompt_tokens,
        outputTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
      cost: cost, // Cost from usage.cost
    };
  }

  private buildPrompt(
    content: string,
    targetLocale: string,
    glossaryHints: string[]
  ): { systemPrompt: string; userContent: string } {
    const targetLanguage = LOCALE_NAMES[targetLocale] || targetLocale;
    const guidance = LOCALE_GUIDANCE[targetLocale] || "";

    let glossarySection = "";
    if (glossaryHints.length > 0) {
      glossarySection = `\n<glossary>\n${glossaryHints.join("\n")}\n</glossary>\n`;
    }

    const systemPrompt = `Translate from English (UK) to ${targetLanguage}. ${guidance}

Rules: Keep headers (###), code, variables, URLs, line breaks, markdown formatting, placeholders {{X}} unchanged. Preserve {{ADM_OPEN_N}} and {{ADM_END_N}} placeholders exactly - do not translate or modify them. Translate only title/description in front matter. Prefer glossary terms.

Example:
Input:
### Configure Backup
Set \`BACKUP_PATH\` in <config>. Visit {{URL_PLACEHOLDER_1}}.

Output (${targetLanguage}):
### Configurer la sauvegarde
Définissez \`BACKUP_PATH\` dans <config>. Visitez {{URL_PLACEHOLDER_1}}.

---
Translate the content inside the <translate> tags below. Output ONLY the translated text - do NOT include <translate> or </translate> tags in your response. No explanations or extra markup.${glossarySection}`;

    const userContent = `<translate>
${content}
</translate>`;

    return { systemPrompt, userContent };
  }
}
