# Translation Maintenance Workflow

## When English Documentation Changes

1. **Update source files** in `docs/en/`
2. **Run extraction**: `pnpm write-translations` (updates translation keys)
3. **Update glossary** (if intlayer translations changed): `./scripts/generate-glossary.sh`
4. **Translate files** manually in `docs/[locale]/` directories
5. **Translate UI strings** in `i18n/[locale]/code.json`
6. **Test builds**: `pnpm build:all`
7. **Deploy**: `./deploy-i18n.sh`

## Adding New Languages

1. Add locale to `docusaurus.config.ts` in the `i18n.locales` array
2. Add locale config in `localeConfigs` object
3. Update search plugin `language` array (use appropriate language code)
4. Create locale directory: `mkdir docs/new-lang`
5. Copy English files: `cp -r docs/en/* docs/new-lang/`
6. Create i18n files: `pnpm write-translations`
7. Copy translation files: `cp -r i18n/en/* i18n/new-lang/`
8. Translate files manually in the new locale directories

## Manual Translation

To translate manually:

1. Edit files in `docs/[locale]/` directories
2. Edit UI strings in `i18n/[locale]/code.json`
3. Edit sidebar labels in `i18n/[locale]/docusaurus-plugin-content-docs/current.json`
4. Test: `pnpm build --locale [locale]`
5. Deploy: `./deploy-i18n.sh`

## Glossary Management

The terminology glossary is automatically generated from intlayer dictionaries to maintain consistency between the application UI and documentation translations.

### Generating the Glossary

```bash
cd documentation
./scripts/generate-glossary.sh
```

This script:
- Extracts terminology from `.intlayer/dictionary/*.json` files
- Generates `glossary.csv` file
- Updates the glossary table in `CONTRIBUTING-TRANSLATIONS.md`

### When to Regenerate

- After updating intlayer translations in the application
- When adding new technical terms to the application
- Before major translation work to ensure consistency

## AI-Powered Translation

The project includes an automated translation system using OpenRouter API that can translate documentation to French, German, Spanish, and Brazilian Portuguese with intelligent caching and glossary enforcement.

### Prerequisites

1. **OpenRouter API Key**: Set the `OPENROUTER_API_KEY` environment variable:
   ```bash
   export OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```

2. **Install Dependencies**: Dependencies are already in `package.json`. Install with:
   ```bash
   cd documentation
   pnpm install
   ```

3. **Configuration**: The `translate.config.json` file contains default settings. You can customize models, locales, and paths as needed.

### Basic Usage

**Translate all documentation to all locales:**
```bash
cd documentation
pnpm run translate
```

**Translate to a specific locale:**
```bash
pnpm run translate:fr    # French
pnpm run translate:de    # German
pnpm run translate:es    # Spanish
pnpm run translate:pt-br # Brazilian Portuguese
```

**Translate a specific file or directory:**
```bash
pnpm exec tsx scripts/translate/index.ts --path docs/intro.md
pnpm exec tsx scripts/translate/index.ts --path docs/getting-started/
```

**Preview without making changes (dry run):**
```bash
pnpm run translate:dry-run
```

### Cache Management

The translation system uses a two-level cache (file-level and segment-level) to minimize API costs:

**View cache statistics:**
```bash
pnpm run translate:stats
```

**Check translation status:**
```bash
pnpm run translate:status
```

This generates a table showing the translation status for all documentation files:
- `✓` = Translated and up-to-date (source hash matches)
- `-` = Not translated yet
- `⫗` = Translated but outdated (source file changed)
- `⁇` = Orphaned (exists in translation folder but not in source)

The script compares `source_file_hash` in the translated file's frontmatter with the computed hash of the source file to detect outdated translations.

**Clear all cache:**
```bash
pnpm run translate:clear-cache
```

**Clear cache for specific locale:**
```bash
pnpm exec tsx scripts/translate/index.ts --clear-cache fr
```

**Force re-translation (ignore cache):**
```bash
pnpm exec tsx scripts/translate/index.ts --no-cache
```

### Workflow with AI Translation

1. **Update English documentation** in `docs/`
2. **Update glossary** (if needed): `./scripts/generate-glossary.sh`
3. **Run AI translation**: `pnpm run translate`
4. **Review translations** in `i18n/{locale}/docusaurus-plugin-content-docs/current/`
5. **Test builds**: `pnpm build:all`
6. **Deploy**: `./deploy-i18n.sh`

### When to Use AI vs Manual Translation

**Use AI translation for:**
- Initial translation of new documentation
- Bulk updates when English docs change significantly
- Maintaining consistency across large documentation sets
- Quick updates when you need translations fast

**Use manual translation for:**
- Fine-tuning AI-generated translations
- Context-specific adjustments
- Cultural nuances that require human judgment
- Small, targeted updates

### Model Selection and Cost Optimization

The default configuration uses `anthropic/claude-sonnet-4` for high-quality translations. You can modify `translate.config.json` to use different models:

- **High quality**: `anthropic/claude-sonnet-4` (default)
- **Cost-effective**: `openai/gpt-4o-mini` or `anthropic/claude-haiku`
- **Open source**: `meta-llama/llama-3.1-70b-instruct`

**Cost optimization strategy:**
1. First pass: Use cheaper model (`gpt-4o-mini`) for initial translation
2. Review: Check sample translations manually
3. Quality pass: Re-translate problematic files with `claude-sonnet-4`

### Troubleshooting

**"OPENROUTER_API_KEY not set"**
- Export the environment variable or add to `.env.local`

**Rate limit errors**
- The system includes automatic delays, but you may need to reduce parallel requests

**Translation quality issues**
- Try different model in `translate.config.json`
- Add more terms to `glossary.csv`
- Review and manually adjust problematic translations

**Cache corruption**
- Run `pnpm run translate:clear-cache` to reset

**Debugging OpenRouter traffic**
- Use `--debug-traffic [path]` to log every request body and response to a file. API keys are never written. Default path: `.translation-cache/debug-traffic-<timestamp>.log`.
- Traffic is logged **only when segments are sent to the API**. If all segments are served from cache (e.g. when using `--force`, which clears file cache but not segment cache), no API calls are made and the log will only contain a header and a note. Use `--no-cache` to force API calls and capture request/response traffic. New translations from a `--no-cache` run are still written to the cache for future runs.
- Example: `pnpm translate --locale pt-br --debug-traffic a.log --no-cache` or `--debug-traffic ./my-debug.log`

## Translation Status Tracking

Track translation progress in `TRANSLATION-STATUS.md` (create if needed):

```markdown
| File     | Word Count | FR  | DE   | ES  | PT-BR  |
|----------|------------|---- |------|-----|--------|
| intro.md | XXX        | ✅  |  🔄 | ☐   | ☐     |

Legend: ☐ Not Started, 🔄 In Progress, ✅ Complete
```
