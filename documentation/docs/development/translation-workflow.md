# Translation Maintenance Workflow

For general documentation commands (build, deploy, screenshots, README generation), see [Documentation Tools](documentation-tools.md).

## Overview

The documentation uses Docusaurus i18n with English as the default locale. Source documentation lives in `docs/`; translations are written to `i18n/{locale}/docusaurus-plugin-content-docs/current/`. Supported locales: en (default), fr, de, es, pt-BR.

## When English Documentation Changes

1. **Update source files** in `docs/`
2. **Run extraction** (if Docusaurus UI strings changed): `pnpm write-translations`
3. **Update glossary** (if intlayer translations changed): `./scripts/generate-glossary.sh` (run from `documentation/`)
4. **Run AI translation**: `pnpm run translate` (translates docs and SVGs; use `--no-svg` for docs only)
5. **UI strings** (if Docusaurus UI changed): `pnpm write-translations` extracts new keys; docs and SVGs are translated by the AI scripts above
6. **Test builds**: `pnpm build` (builds all locales)
7. **Deploy**: Use your deployment process (e.g. `pnpm deploy` for GitHub Pages)

## Adding New Languages

1. Add locale to `docusaurus.config.ts` in the `i18n.locales` array
2. Add locale config in `localeConfigs` object
3. Update search plugin `language` array (use appropriate language code, e.g. `pt` for pt-BR)
4. Add locale to `translate.config.json` in `locales.targets` (for AI translation)
5. Run AI translation: `pnpm run translate` (translates docs and SVGs)
6. Create UI translation files: `pnpm write-translations` (generates structure); translate docs and SVGs with `pnpm run translate`

## Ignore Files

- **`.translate.ignore`**: Gitignore-style patterns for documentation files to skip during AI translation. Paths are relative to `docs/`. Example: `api-reference/*`, `LICENSE.md`
- **`.translate-svg.ignore`**: Patterns for SVG files in `static/img/` to skip during `translate:svg`. Example: `duplistatus_logo.svg`

## Glossary Management

The terminology glossary is automatically generated from intlayer dictionaries to maintain consistency between the application UI and documentation translations.

### Generating the Glossary

```bash
cd documentation
./scripts/generate-glossary.sh
```

This script:

- Runs `pnpm intlayer build` in the project root to generate dictionaries
- Extracts terminology from `.intlayer/dictionary/*.json` files
- Generates `glossary.csv` and `scripts/glossary-table.md`
- Updates the glossary table in `CONTRIBUTING-TRANSLATIONS.md` (if that file exists)

### When to Regenerate

- After updating intlayer translations in the application
- When adding new technical terms to the application
- Before major translation work to ensure consistency

## AI-Powered Translation

The project includes an automated translation system using the OpenRouter API that can translate documentation to French, German, Spanish, and Brazilian Portuguese with intelligent caching and glossary enforcement.

### Prerequisites

1. **OpenRouter API Key**: Set the `OPENROUTER_API_KEY` environment variable:
   ```bash
   export OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```

2. **Install Dependencies**: Dependencies are in `package.json`. Install with:
   ```bash
   cd documentation
   pnpm install
   ```

3. **Configuration**: The `translate.config.json` file contains default settings. You can customize models, locales, and paths as needed.

### Quick Help

To see a summary of all translation commands and the translate script options:

```bash
pnpm run help
# or
pnpm run translate:help
```

This displays `TRANSLATION-HELP.md`.

### Basic Usage

**Translate all documentation to all locales:**

```bash
cd documentation
pnpm run translate
```

**Translate to a specific locale:**

```bash
pnpm run translate --locale fr    # French
pnpm run translate --locale de    # German
pnpm run translate --locale es    # Spanish
pnpm run translate --locale pt-br # Brazilian Portuguese
```

**Translate a specific file or directory:**

```bash
pnpm translate --path docs/intro.md
pnpm translate --path docs/development/
```

**Preview without making changes (dry run):**

```bash
pnpm run translate:dry-run
```

### Output Logs

Both `translate` and `translate:svg` write all console output to log files in `.translation-cache/`:

- `translate_<timestamp>.log` – full output from `pnpm run translate`
- `translate-svg_<timestamp>.log` – full output from `pnpm run translate:svg` (standalone)

The log path is printed at the start of each run. Logs are appended in real time.

### Cache Management

The translation system uses a two-level cache (file-level and segment-level) stored in `.translation-cache/cache.db` to minimize API costs:

**Check translation status:**

```bash
pnpm run translate:status
```

This generates a table showing the translation status for all documentation files:

- `✓` = Translated and up-to-date (source hash matches)
- `-` = Not translated yet
- `●` = Translated but outdated (source file changed)
- `□` = Orphaned (exists in translation folder but not in source)
- `i` = Ignored (skipped by `.translate.ignore`)

The script compares `source_file_hash` in the translated file's frontmatter with the computed hash of the source file to detect outdated translations.

**Clear all cache:**

```bash
pnpm translate --clear-cache
```

**Clear cache for specific locale:**

```bash
pnpm translate --clear-cache fr
```

**Force re-translation (clear file cache, not the translations cache):**

```bash
pnpm translate --force
```

**Ignore cache (force API calls, but still persist new translations):**

```bash
pnpm translate --no-cache
```

**Clean up cache (remove orphaned and stale entries):**

```bash
pnpm run translate:cleanup
```
or

```bash
pnpm run translate:clean
```

**Edit cache in a web UI:**

```bash
pnpm run translate:edit-cache
```

This serves a web app on port 4000 (or next available) for browsing and editing the translation cache. Features: table view with filters (filename, locale, source_hash, source_text, translated_text), inline edit of translated text, delete single entry, delete all translations for a filepath, pagination, dark theme. A show-links icon print source and translated file paths to the terminal so you can open them in your editor. Run from `documentation/`.

### SVG Translation

SVG translation is included in `pnpm run translate` by default (runs after docs). SVG files in `static/img/` whose names start with `duplistatus` are translated.

**Skip SVG** (docs only):

```bash
pnpm run translate --no-svg
```

**SVG-only** (standalone script):

```bash
pnpm run translate:svg
```

Options: `--locale`, `--path`, `--dry-run`, `--no-cache`, `--force`, `--no-export-png`. Uses `.translate-svg.ignore` for exclusions. Optionally exports PNG via Inkscape CLI.

### Workflow with AI Translation

1. **Update English documentation** in `docs/`
2. **Update glossary** (if needed): `./scripts/generate-glossary.sh`
3. **Run AI translation**: `pnpm run translate` (translates docs and SVGs)
4. **Verify** translations in `i18n/{locale}/docusaurus-plugin-content-docs/current/` (optional)
5. **Test builds**: `pnpm build`
6. **Deploy** using your deployment process

### Model Selection and Cost Optimization

The default configuration uses `anthropic/claude-haiku-4.5`. You can modify `translate.config.json` to use different models:

- **Default**: `anthropic/claude-haiku-4.5`
- **Fallback**: `google/gemma-3-27b-it`
- **High quality**: `anthropic/claude-sonnet-4`
- **Cost-effective**: `openai/gpt-4o-mini`

**Cost optimization strategy:**

1. First pass: Use cheaper model (`gpt-4o-mini`) for initial translation
2. Quality pass: Re-translate problematic files with `claude-sonnet-4` if needed

### Troubleshooting

**"OPENROUTER_API_KEY not set"**

- Export the environment variable or add to `.env.local`

**Rate limit errors**

- The system includes automatic delays, but you may need to reduce parallel requests

**Translation quality issues**

- Try different model in `translate.config.json`
- Add more terms to `glossary.csv`

**Cache corruption**

- Run `pnpm translate --clear-cache` to reset
- Run `pnpm run translate:cleanup` to remove orphaned entries
- Use `pnpm run translate:edit-cache` to fix individual cached translations without re-translating

**Debugging OpenRouter traffic**

- Debug traffic logging is **on by default**. Logs are written to `.translation-cache/debug-traffic-<timestamp>.log`. Use `--debug-traffic <path>` to specify a custom filename, or `--no-debug-traffic` to disable. API keys are never written.
- Traffic is logged **only when segments are sent to the API**. If all segments are served from cache (e.g. when using `--force`, which clears file cache but not segment cache), no API calls are made and the log will only contain a header and a note. Use `--no-cache` to force API calls and capture request/response traffic. New translations from a `--no-cache` run are still written to the cache for future runs.
- Example: `pnpm run translate -- --locale pt-BR --debug-traffic my-debug.log --no-cache`

## Translation Status Tracking

Track translation progress with:

```bash
pnpm run translate:status
```

This outputs a table and summary for all documentation files.
