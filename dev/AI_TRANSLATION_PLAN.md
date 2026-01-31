# Docusaurus Documentation Translation Plan

## Project: duplistatus Documentation
## Target Languages: Spanish (es), German (de), French (fr), Brazilian Portuguese (pt-BR)
## Stack: Node.js / TypeScript with OpenRouter API

---

## Executive Summary

This plan outlines an automated translation workflow for the duplistatus Docusaurus documentation using an LLM-based approach with intelligent caching and glossary enforcement. The system translates only changed content, maintains terminology consistency via the existing glossary, and integrates seamlessly with the existing i18n structure.

**Key Design Decisions:**
- **Node.js/TypeScript** - Matches existing project stack, zero new runtime dependencies
- **OpenRouter API** - Model-agnostic, allows switching between Claude, GPT-4, Llama, etc.
- **Segment-level caching** - Only re-translate changed paragraphs
- **Glossary enforcement** - Consistent terminology with the application UI

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Translation Pipeline                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────┐    ┌──────────────┐    ┌─────────────────────┐       │
│   │  Source  │--->│   Segment    │--->│   Cache Lookup      │       │
│   │  docs/   │    │   Splitter   │    │   (hash-based)      │       │
│   └──────────┘    └──────────────┘    └─────────┬───────────┘       │
│                                                 │                   │
│                          ┌──────────────────────┴───────────┐       │
│                          ▼                                  ▼       │
│                   ┌─────────────┐                    ┌──────────┐   │
│                   │  Cache HIT  │                    │ Cache    │   │
│                   │  (reuse)    │                    │ MISS     │   │
│                   └──────┬──────┘                    └────┬─────┘   │
│                          │                                │         │
│                          │                                ▼         │
│                          │                    ┌───────────────────┐ │
│                          │                    │  Glossary Lookup  │ │
│                          │                    │  (term matching)  │ │
│                          │                    └─────────┬─────────┘ │
│                          │                              │           │
│                          │                              ▼           │
│                          │                    ┌───────────────────┐ │
│                          │                    │   OpenRouter API  │ │
│                          │                    │   (LLM translate) │ │
│                          │                    └─────────┬─────────┘ │
│                          │                              │           │
│                          │                              ▼           │
│                          │                    ┌───────────────────┐ │
│                          │                    │  Update Cache     │ │
│                          │                    └─────────┬─────────┘ │
│                          │                              │           │
│                          ▼                              ▼           │
│                   ┌─────────────────────────────────────────┐       │
│                   │        Reassemble Document              │       │
│                   └─────────────────────┬───────────────────┘       │
│                                         │                           │
│                                         ▼                           │
│                   ┌─────────────────────────────────────────┐       │
│                   │   i18n/{locale}/docusaurus-plugin-      │       │
│                   │   content-docs/current/                 │       │
│                   └─────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```
documentation/
├── docs/                           # Source documentation (English)
│   ├── installation.md
│   ├── user-guide/
│   │   └── overview.md
│   └── ...
├── i18n/                           # Docusaurus i18n folder
│   ├── fr/
│   │   └── docusaurus-plugin-content-docs/
│   │       └── current/            # Translated French docs
│   ├── de/
│   ├── es/
│   └── pt-BR/
├── scripts/
│   └── translate/                  # Translation tooling
│       ├── index.ts                # CLI entry point
│       ├── config.ts               # Configuration loader
│       ├── glossary.ts             # Glossary parser and matcher
│       ├── cache.ts                # Translation cache manager (SQLite)
│       ├── splitter.ts             # Document segmentation
│       ├── translator.ts           # OpenRouter API integration
│       ├── validator.ts            # Translation validation
│       └── types.ts                # TypeScript interfaces
├── .translation-cache/             # Cache storage (gitignored)
│   └── cache.db                    # SQLite database
├── glossary.csv                    # Terminology glossary (existing)
├── translate.config.json           # Translation configuration
├── package.json                    # Updated with new dependencies
└── docusaurus.config.ts            # Docusaurus configuration (existing)
```

---

## 3. Dependencies

### New devDependencies

Add to your `package.json`:

```json
{
  "devDependencies": {
    "better-sqlite3": "^11.7.0",
    "@types/better-sqlite3": "^7.6.12",
    "papaparse": "^5.5.2",
    "@types/papaparse": "^5.3.15",
    "gray-matter": "^4.0.3",
    "commander": "^13.1.0",
    "ora": "^8.2.0",
    "chalk": "^5.4.1",
    "tsx": "^4.19.0"
  }
}
```

### Package Purposes

| Package          | Purpose                                     |
|------------------|---------------------------------------------|
| `better-sqlite3` | Fast, synchronous SQLite for caching        |
| `papaparse`      | CSV parsing for glossary                    |
| `gray-matter`    | YAML front matter parsing                   |
| `commander`      | CLI argument parsing                        |
| `ora`            | Terminal spinners for progress              |
| `chalk`          | Colored terminal output                     |
| `tsx`            | Run TypeScript directly without compilation |

---

## 4. OpenRouter API Integration

### 4.1 Why OpenRouter?

OpenRouter provides a unified API to access multiple LLM providers:

| Benefit               | Description                                        |
|-----------------------|----------------------------------------------------|
| **Model flexibility** | Switch between Claude, GPT-4, Llama, Mistral, etc. |
| **Cost optimization** | Choose cheaper models for simple translations      |
| **Fallback support**  | Automatic failover if a model is unavailable       |
| **Single API key**    | One key for all providers                          |
| **Usage tracking**    | Unified dashboard for costs across models          |

### 4.2 Recommended Models

| Model                               | Use Case                   | Cost (approx.)             |
|-------------------------------------|----------------------------|----------------------------|
| `anthropic/claude-sonnet-4`         | High-quality, complex docs | ~$3/$15 per 1M tokens      |
| `anthropic/claude-haiku`            | Fast, simple segments      | ~$0.25/$1.25 per 1M tokens |
| `openai/gpt-4o`                     | Alternative high-quality   | ~$2.50/$10 per 1M tokens   |
| `openai/gpt-4o-mini`                | Cost-effective bulk        | ~$0.15/$0.60 per 1M tokens |
| `meta-llama/llama-3.1-70b-instruct` | Open source option         | ~$0.50/$0.75 per 1M tokens |

### 4.3 Configuration

**Environment Variable:**
```bash
export OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxx
```

**Configuration File (`translate.config.json`):**
```json
{
  "openrouter": {
    "baseUrl": "https://openrouter.ai/api/v1",
    "defaultModel": "anthropic/claude-sonnet-4",
    "fallbackModel": "openai/gpt-4o",
    "maxTokens": 8192,
    "temperature": 0.3
  },
  "locales": {
    "source": "en",
    "targets": ["fr", "de", "es", "pt-BR"]
  },
  "paths": {
    "docs": "./docs",
    "i18n": "./i18n",
    "cache": "./.translation-cache",
    "glossary": "./glossary.csv"
  },
  "cache": {
    "enabled": true,
    "segmentLevel": true
  }
}
```

---

## 5. pnpm Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "translate": "tsx scripts/translate/index.ts",
    "translate:fr": "tsx scripts/translate/index.ts --locale fr",
    "translate:de": "tsx scripts/translate/index.ts --locale de",
    "translate:es": "tsx scripts/translate/index.ts --locale es",
    "translate:pt-br": "tsx scripts/translate/index.ts --locale pt-BR",
    "translate:dry-run": "tsx scripts/translate/index.ts --dry-run --verbose",
    "translate:stats": "tsx scripts/translate/index.ts --stats",
    "translate:clear-cache": "tsx scripts/translate/index.ts --clear-cache"
  }
}
```

---

## 6. CLI Usage

```bash
# Translate all docs to all locales
pnpm run translate

# Translate to specific locale
pnpm run translate:fr

# Translate specific file
pnpm exec tsx scripts/translate/index.ts --file docs/installation.md

# Translate specific file to specific locale
pnpm exec tsx scripts/translate/index.ts --file docs/installation.md --locale de

# Dry run (preview without changes)
pnpm run translate:dry-run

# Force re-translation (ignore cache)
pnpm exec tsx scripts/translate/index.ts --no-cache

# View cache statistics
pnpm run translate:stats

# Clear all cache
pnpm run translate:clear-cache

# Clear cache for specific locale
pnpm exec tsx scripts/translate/index.ts --clear-cache fr

# Verbose output
pnpm exec tsx scripts/translate/index.ts --verbose
```

---

## 7. Workflow

1. **Write documentation** in English (`docs/`)
2. **Run translation**: `pnpm run translate`
3. **Review output** in `i18n/{locale}/docusaurus-plugin-content-docs/current/`
4. **Test locally**: `pnpm run start:fr` (or other locale)
5. **Build all**: `pnpm run build:all`

---

## 8. Glossary Integration

Your existing `glossary.csv` (1,130 terms) is automatically used to ensure consistent terminology:

- Terms are matched in source text before translation
- Matching terms are passed as explicit instructions to the LLM
- Example: "Use *Sauvegarde* for *Backup*"

### Glossary Column Mapping

| Locale  | CSV Column     |
|---------|----------------|
| `fr`    | `Term [fr]`    |
| `de`    | `Term [de]`    |
| `es`    | `Term [es-ES]` |
| `pt-BR` | `Term [pt-BR]` |

---

## 9. Caching Strategy

### Two-Level Cache

| Level       | Key                     | Purpose                                     |
|-------------|-------------------------|---------------------------------------------|
| **File**    | `filepath + locale`     | Skip unchanged files entirely               |
| **Segment** | `content_hash + locale` | Reuse translations for unchanged paragraphs |

### Cache Benefits

| Run        | Cache Hit Rate | API Calls | Est. Cost   |
|------------|----------------|-----------|-------------|
| Initial    | 0%             | ~200-300  | ~$1.50-3.00 |
| Subsequent | 80-95%         | ~5-30     | ~$0.05-0.30 |

---

## 10. Model Selection Guide

### Switching Models

Update `translate.config.json`:

```json
{
  "openrouter": {
    "defaultModel": "openai/gpt-4o-mini",
    "fallbackModel": "anthropic/claude-haiku"
  }
}
```

### Cost Optimization Strategy

1. **First pass**: Use cheaper model (`gpt-4o-mini`) for initial translation
2. **Review**: Check sample translations manually
3. **Quality pass**: Re-translate problematic files with `claude-sonnet-4`

```bash
# Force re-translate specific file with default (high-quality) model
pnpm exec tsx scripts/translate/index.ts --no-cache --file docs/complex-topic.md
```

---

## 11. Implementation Checklist

### Phase 1: Setup
- [ ] Install new dependencies
- [ ] Create `scripts/translate/` directory
- [ ] Create `translate.config.json`
- [ ] Add scripts to `package.json`
- [ ] Add `.translation-cache/` to `.gitignore`
- [ ] Set up `OPENROUTER_API_KEY` environment variable

### Phase 2: Core Implementation
- [ ] Implement `types.ts`
- [ ] Implement `config.ts`
- [ ] Implement `glossary.ts`
- [ ] Implement `cache.ts`
- [ ] Implement `splitter.ts`
- [ ] Implement `translator.ts`
- [ ] Implement `validator.ts`
- [ ] Implement `index.ts`

### Phase 3: Testing
- [ ] Test single file translation
- [ ] Test glossary term matching
- [ ] Test cache hit/miss scenarios
- [ ] Test all target locales
- [ ] Verify Docusaurus builds

### Phase 4: Documentation
- [ ] Document setup in project README
- [ ] Document CLI usage
- [ ] Document model selection

---

## 12. Files Included

This plan includes the following implementation files:

| File                    | Description            |
|-------------------------|------------------------|
| `types.ts`              | TypeScript interfaces  |
| `config.ts`             | Configuration loader   |
| `glossary.ts`           | Glossary parser        |
| `cache.ts`              | SQLite cache manager   |
| `splitter.ts`           | Document segmentation  |
| `translator.ts`         | OpenRouter API client  |
| `validator.ts`          | Translation validation |
| `index.ts`              | CLI entry point        |
| `translate.config.json` | Configuration template |

---

## Appendix: Troubleshooting

| Issue                        | Solution                                         |
|------------------------------|--------------------------------------------------|
| "OPENROUTER_API_KEY not set" | Export the environment variable or add to `.env` |
| `better-sqlite3` build fails | Install build tools: `pnpm add -g node-gyp`      |
| Rate limit errors            | Reduce parallel requests or add delay            |
| Translation quality issues   | Try different model or add more glossary terms   |
| Cache corruption             | Run `pnpm run translate:clear-cache`             |

---

## Appendix: OpenRouter API Reference

- **Endpoint**: `https://openrouter.ai/api/v1/chat/completions`
- **Models List**: https://openrouter.ai/models
- **Usage Dashboard**: https://openrouter.ai/activity
- **Documentation**: https://openrouter.ai/docs
