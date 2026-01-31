import fs from "fs";
import { TranslationConfig, TranslationResult } from "./types";

interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
  content: string;
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
    const prompt = this.buildPrompt(content, targetLocale, glossaryHints);

    try {
      return await this.callApi(this.model, prompt);
    } catch (error) {
      console.warn(`Primary model failed, trying fallback: ${this.fallbackModel}`);
      return await this.callApi(this.fallbackModel, prompt);
    }
  }

  private async callApi(model: string, prompt: string): Promise<TranslationResult> {
    const requestPayload: OpenRouterRequestPayload = {
      model,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      messages: [{ role: "user", content: prompt }],
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
  ): string {
    const localeNames: Record<string, string> = {
      fr: "French",
      de: "German",
      es: "Spanish",
      "pt-BR": "Brazilian Portuguese",
    };

    const localeGuidance: Record<string, string> = {
      fr: 'Use formal "vous" register. Use French quotation marks « » where appropriate.',
      de: "Use formal register. Handle compound nouns appropriately.",
      es: 'Use formal "usted" register. Use neutral Latin American Spanish.',
      "pt-BR": 'Use Brazilian Portuguese conventions with "você" for formal address.',
    };

    const targetLanguage = localeNames[targetLocale] || targetLocale;
    const guidance = localeGuidance[targetLocale] || "";

    let glossarySection = "";
    if (glossaryHints.length > 0) {
      glossarySection = `
## GLOSSARY - USE THESE EXACT TRANSLATIONS:
${glossaryHints.join("\n")}
`;
    }

    return `
    
You are a professional technical documentation translator. 
Translate the content inside <translate> tags from English (UK) to ${targetLanguage}:

<translate>
${content}
</translate>


Output ONLY the translated content. Do not add horizontal rules, extra newlines, or any text not present in the source.
Do not include any explanations or notes.

## CRITICAL RULES:

1. **Preserve Formatting**:
   - Keep ALL Markdown syntax exactly as-is (headers, links, bold, italic, lists)
   - **Heading levels must stay identical**: if the source has ### (three hashes), the translation must also start with ###; do not change # to ## or ### to #.
   - Keep code blocks and inline code unchanged
   - **Preserve indentation**: keep the exact leading spaces of every line. Code blocks (including fenced blocks like \`\`\`bash) and list continuations often use 2 or 4 spaces; do not remove or change this indentation.
   - Preserve link URLs and image paths
   - Keep MDX/JSX component names unchanged
   - Preserve admonition syntax (:::note, :::warning, etc.)

2. **Front Matter Rules**:
   - Translate ONLY "title" and "description" fields
   - Keep all other fields unchanged (sidebar_position, slug, translation_last_updated, source_file_mtime, source_file_hash, translation_language, source_file_path, etc.)

3. **Style Guidelines**:
   - Use formal/professional documentation tone
   - ${guidance}

4. **Do NOT translate**:
   - Code snippets
   - Variable names
   - File paths
   - URLs
   - Product name "duplistatus"
   - Technical terms in code context
${glossarySection}

`;
  }
}
