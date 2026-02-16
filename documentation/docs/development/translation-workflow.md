# Translation Maintenance Workflow {#translation-maintenance-workflow}

For general documentation commands (build, deploy, screenshots, README generation), see [Documentation Tools](documentation-tools.md).

## Overview {#overview}

The documentation uses Docusaurus i18n with English as the default locale. Source documentation lives in `docs/`; translations are written to `i18n/{locale}/docusaurus-plugin-content-docs/current/`. Supported locales: en (default), fr, de, es, pt-BR.

## When English Documentation Changes {#when-english-documentation-changes}

1. **Update source files** in `docs/`
2. **Run extraction** (if Docusaurus UI strings changed): `pnpm write-translations`
3. **Update glossary** (if intlayer translations changed): `pnpm translate:glossary-ui`
4. **Add the Heading IDs**: `pnpm heading-ids`
5. **Run AI translation**: `pnpm translate` (translates docs, JSON UI strings, and SVGs; use `--no-svg` for docs only, `--no-json` to skip UI strings)
6. **UI strings** (if Docusaurus UI changed): `pnpm write-translations` extracts new keys; docs, JSON UI strings, and SVGs are translated by the AI scripts above
7. **Test builds**: `pnpm build` (builds all locales)
8. **Deploy**: Use your deployment process (e.g. `pnpm deploy` for GitHub Pages)

<br/>

## Adding New Languages {#adding-new-languages}

1. Add locale to `docusaurus.config.ts` in the `i18n.locales` array
2. Add locale config in `localeConfigs` object
3. Update search plugin `language` array (use appropriate language code, e.g. `pt` for pt-BR)
4. Add locale to `translate.config.json` in `locales.targets` (for AI translation)
5. Run AI translation: `pnpm translate` (translates docs, JSON UI strings, and SVGs)
6. Create UI translation files: `pnpm write-translations` (generates structure); translate docs, JSON UI strings, and SVGs with `pnpm translate`

<br/>

## AI-Powered Translation {#ai-powered-translation}

The project includes an automated translation system using the OpenRouter API that can translate documentation to French, German, Spanish, and Brazilian Portuguese with intelligent caching and glossary enforcement.

### Prerequisites {#prerequisites}

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

   To see a summary of all translation commands and the translate script options:

   ```bash
   pnpm help
   # or
   pnpm translate:help
   ```

### Basic Usage {#basic-usage}

      **Translate all documentation to all locales:**

      ```bash
      cd documentation
      pnpm translate
      ```

      **Translate to a specific locale:**

      ```bash
      pnpm translate --locale fr    # French
      pnpm translate --locale de    # German
      pnpm translate --locale es    # Spanish
      pnpm translate --locale pt-br # Brazilian Portuguese
      ```

      **Translate a specific file or directory:**

      ```bash
      pnpm translate --path docs/intro.md
      pnpm translate --path docs/development/
      ```

      **Preview without making changes (dry run):**

      ```bash
      pnpm translate --dry-run
      ```

### Model Configuration {#model-configuration}

The translation system uses models configured in `translate.config.json`, one primary and a fallback.

| Configuration | Notes                               | Default Model                |
|---------------|-------------------------------------|------------------------------|
| defaultModel  | Main model for translations         | `anthropic/claude-3.5-haiku` |
| fallbackModel | Fallback used if primary model fail | `anthropic/claude-haiku-4.5` |

Check a list of all available models and cost associated at [Openrouter.ai page](https://openrouter.ai/models)

### Testing the quality of the translation {#testing-the-quality-of-the-translation}


To test the quality of a new model, change the `defaultModel` in the `translate.config.json` and run the translation for one file, for instance:

```bash
pnpm translate --force --path docs/intro.md --no-cache --locale pt-BR
```

and check the translated file in the `i18n/pt-BR/docusaurus-plugin-content-docs/current/intro.md`


### Ignore Files {#ignore-files}

Add the files to skip during AI translation be in the `.translate-ignore` file (same style of `.gitignore`).

Example:

```bash
# Documentation files
# Keep the license in English
LICENSE.md

# Don't translate the API reference
api-reference/*

# Dashboard/table diagram - not referenced in docs
duplistatus_dash-table.svg
```

### Glossary Management {#glossary-management}

The terminology glossary is automatically generated from intlayer dictionaries to maintain consistency between the application UI and documentation translations.

#### Generating the Glossary {#generating-the-glossary}

```bash
cd documentation
pnpm translate:glossary-ui
```

This script:

- Runs `pnpm intlayer build` in the project root to generate dictionaries
- Extracts terminology from `.intlayer/dictionary/*.json` files
- Generates `glossary-ui.csv`
- Updates the glossary table in `CONTRIBUTING-TRANSLATIONS.md` (if that file exists)

#### When to Regenerate {#when-to-regenerate}

- After updating intlayer translations in the application
- When adding new technical terms to the application
- Before major translation work to ensure consistency

#### User Glossary Overrides {#user-glossary-overrides}

`glossary-user.csv` lets you override or add terms without modifying the generated UI glossary. Format: `en`, `locale`, `translation` (one row per term per locale). Use `*` as the locale to apply a term to all configured locales. Entries take precedence over `glossary-ui.csv`.


### Cache Management {#cache-management}

The translation system uses a two-level cache (file-level and segment-level) stored in `.translation-cache/cache.db` to minimize API costs. This file is included in the Git repository to reduce future translation costs.

Cache Management Commands:

| Command                                 | Description                                                           |
|-----------------------------------------|-----------------------------------------------------------------------|
| `pnpm translate --clear-cache <locale>` | Clear cache for specific locale                                       |
| `pnpm translate --clear-cache`          | Clear **all** cache (both file and segment)                           |
| `pnpm translate --force`                | Force re-translation (clears file cache, keeps segment cache)         |
| `pnpm translate --no-cache`             | Bypass cache entirely (force API calls, still saves new translations) |
| `pnpm translate:editor`             | Manual review, delete or edit cache entries                           |

### Remove orphaned and stale cache {#remove-orphaned-and-stale-cache}

When changes are made to existing documents, cache entries may become orphaned or outdated. Use the commands to delete entries that are no longer required, reducing the size of the translation cache.

```bash
pnpm translate --force
pnpm translate:cleanup
```

:::warning
Before running the cleanup script, ensure you have executed `pnpm translate --force`. This step is crucial to avoid accidentally deleting valid entries that are marked as stale.

The script automatically creates a backup in the `.translation-cache` folder, allowing you to recover any deleted data if necessary.
:::


<br/>

### Manual review of the cache {#manual-review-of-the-cache}

When reviewing translations, use the web-based cache editing tool to view translations of specific terms, delete cache entries, delete entries using the available filters, or delete specific files. This allows you to retranslate only the desired texts or files. 

For example, if a model has translated a term incorrectly, you can filter all entries for that term, change the model in the `translate.config.json` file, and retranslate only the lines containing those terms using the new model.

```bash
pnpm translate:editor
```


This will open a web UI to browse and edit cache manually (port 4000 or 4000+), so you can:
   - Table view with filtering capabilities
   - Inline editing of translated text
   - Delete a single entry, translations for a specific file or filtered entries
   - Prints source and translated file paths to the terminal for quick editor access

![Translate Edit-Cache App](/img/screenshot-translate-edit-cache.png)


<br/>

### Heading IDs and Anchors {#heading-ids-and-anchors}

Consistent anchor links (IDs) are crucial for cross-references, table of contents, and deep linking. When content is translated, heading text changes, which would normally cause auto-generated anchor IDs to differ between languages.

```markdown
 ## This is a Heading {#this-is-a-heading}
```

After updating or creating a new English source file, run this to ensure explicit IDs:

```bash
cd documentation
pnpm heading-ids   # Adds {#id} to all headings without explicit IDs
```

:::note
Always use the generated ID when cross-refencing sections of the documentation.
:::

<br/>

### SVG Translation {#svg-translation}

SVG translation is included in `pnpm translate` by default (runs after docs). SVG files in `static/img/` whose names start with `duplistatus` are translated.

**Skip SVG** (docs only):

```bash
pnpm translate --no-svg
```

**SVG-only** (standalone script):

```bash
pnpm translate:svg
```

Options: `--locale`, `--path`, `--dry-run`, `--no-cache`, `--force`, `--no-export-png`. Uses `.translate-ignore` for exclusions. 


<br/>

### UI Strings Translation (JSON) {#ui-strings-translation-json}

Docusaurus UI strings and custom component labels are stored in JSON translation files. These are auto-generated by `pnpm write-translations` and then translated by the AI system.

**How it works:**

1. **Extraction**: `pnpm write-translations` scans Docusaurus theme files and custom React components for translatable strings (like "Next", "Previous", "Search", button labels) and writes them to `i18n/en/` as JSON files. Each file corresponds to a Docusaurus plugin or theme.
2. **Translation**: `pnpm translate` (with JSON support enabled) translates these JSON files to all target locales using the AI model, respecting the glossary.
3. **Usage**: Docusaurus automatically loads the appropriate locale's JSON files at runtime to display the UI in the selected language.

**Key JSON files** (all in `i18n/{locale}/`):
- `docusaurus-plugin-content-docs/current.json` - Documentation UI strings (search, navigation, table of contents)
- `docusaurus-theme-classic/navbar.json` - Navbar items
- `docusaurus-theme-classic/footer.json` - Footer items
- `code.json` - Code block labels (copy, collapse, expand)
- Other plugin-specific JSON files

**Skip JSON translation** (docs only):

```bash
pnpm translate --no-json
```

**Important**: UI strings are usually stable, but if you add new custom components with translatable text, you must run `pnpm write-translations` to extract those new strings before running `pnpm translate`. Otherwise, the new strings will only appear in English for all locales.

<br/>


The `translate` command logs all console output and API traffic to files in the `.translation-cache/` directory. The logs include:

- `translate_<timestamp>.log`: A comprehensive log of the output from the `pnpm translate` command.
- `debug-traffic-<timestamp>.log`: A log of all traffic sent to and received from the AI model.

   Note that API traffic is only logged when segments are sent to the API. 
   If all segments are retrieved from the cache (for example, when using the `--force` option, which 
   overwrite the file cache, but not the translationst the segment cache), no API calls are made, and 
   the log will only contain a header and a note. 
   
   To force API calls and capture request/response traffic, 
   use the `--no-cache` option.

<br/>


## Workflow with AI Translation {#workflow-with-ai-translation}

1. **Update English documentation** in `docs/`
2. **Update glossary** (if needed): `pnpm translate:glossary-ui` and `glossary-user.csv`.
3. **Update the headings IDs**: `pnpm headings-ids`
4. **Run AI translation**: `pnpm translate` (translates docs, json and SVGs)
5. **Verify** translations in `i18n/{locale}/docusaurus-plugin-content-docs/current/` (optional)
6. **Test builds**: `pnpm build`
7. **Deploy** using your deployment process


<br/>

## Troubleshooting {#troubleshooting}

**"OPENROUTER_API_KEY not set"**

- Export the environment variable or add to `.env.local`

**Translation quality issues**

- Try different model in `translate.config.json`
- Delete entries in the cache and use another model
- Review the English document and rewrite it to make the translation clear
- Add more terms to `glossary-ui.csv` or add overrides to `glossary-user.csv` (en, locale, translation)

**Cache corruption**

- Run `pnpm translate --clear-cache` to reset
- Run `pnpm translate:cleanup` to remove orphaned entries
- Use `pnpm translate:editor` to fix/delete individual cached translations without re-translating the whole document

**Debugging OpenRouter traffic**

- Logs are written to `.translation-cache/debug-traffic-<timestamp>.log`. 
- Use this log to check if the translation problem is related to the script, prompts used or the model.


## Translation Status Tracking {#translation-status-tracking}

Track translation progress with:

```bash
pnpm translate:status
```

This generates a table showing the translation status for all documentation files. For example:

![Translate Status](/img/screenshot-translate-status.png)
