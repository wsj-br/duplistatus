# ai-i18n-tools: Getting Started

`ai-i18n-tools` provides two independent, composable workflows:

- **Workflow 1 - UI Translation**: extract `t("…")` calls from any JS/TS source, translate them via OpenRouter, and write flat per-locale JSON files ready for i18next.
- **Workflow 2 - Document Translation**: translate markdown (MDX) and Docusaurus JSON label files to any number of locales, with smart caching. **SVG** assets use `features.translateSVG`, the top-level `svg` block, and `translate-svg` (see [CLI reference](#cli-reference)).

Both workflows use OpenRouter (any compatible LLM) and share a single config file.

<!-- DOCTOC SKIP -->

---


## Installation

The published package is **ESM-only**. Use `import`/`import()` in Node.js or your bundler; **do not use `require('ai-i18n-tools')`.**

```bash
npm install ai-i18n-tools
# or
pnpm add ai-i18n-tools
# or
yarn add ai-i18n-tools
```

ai-i18n-tools includes its own string extractor. If you previously used `i18next-scanner`, `babel-plugin-i18next-extract`, or similar, you can remove those dev dependencies after migrating.

Set your OpenRouter API key:

```bash
export OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

Or create a `.env` file in the project root:

```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

---

## Quick Start

The default `init` template (`ui-markdown`) enables **UI** extraction and translation only. The `ui-docusaurus` template enables **document** translation (`translate-docs`). Use `sync` when you want one command that runs extract, UI translation, optional standalone SVG translation, and documentation translation according to your config.

```bash
# Workflow 1 - UI strings (default template enables extract + translate-ui)
npx ai-i18n-tools init
npx ai-i18n-tools extract
npx ai-i18n-tools translate-ui

# Workflow 2 - docs (Docusaurus-oriented template)
npx ai-i18n-tools init -t ui-docusaurus
npx ai-i18n-tools translate-docs

# Combined: extract UI strings, then translate UI + SVG + docs (per config features)
npx ai-i18n-tools sync

# Translation status (UI strings per locale; markdown per file × locale in chunked tables)
npx ai-i18n-tools status
# npx ai-i18n-tools status --max-columns 12   # wider tables, fewer chunks
```

### Recommended `package.json` scripts

With the package installed locally, you can use the CLI commands directly in scripts (no `npx` needed):

```json
{
  "i18n:extract": "ai-i18n-tools extract",
  "i18n:sync": "ai-i18n-tools sync",
  "i18n:translate": "ai-i18n-tools translate-ui && ai-i18n-tools translate-svg && ai-i18n-tools translate-docs",
  "i18n:translate:ui": "ai-i18n-tools translate-ui",
  "i18n:translate:svg": "ai-i18n-tools translate-svg",
  "i18n:translate:docs": "ai-i18n-tools translate-docs",
  "i18n:status": "ai-i18n-tools status",
  "i18n:editor": "ai-i18n-tools editor",
  "i18n:cleanup": "ai-i18n-tools cleanup"
}
```

---

## Workflow 1 - UI Translation

Designed for any JS/TS project that uses i18next: React apps, Next.js (client and server components), Node.js services, CLI tools.

### Step 1: Initialise

```bash
npx ai-i18n-tools init
```

This writes `ai-i18n-tools.config.json` with the `ui-markdown` template. Edit it to set:

- `sourceLocale` - your source language BCP-47 code (e.g. `"en-GB"`). **Must match** `SOURCE_LOCALE` exported from your runtime i18n setup file (`src/i18n.ts` / `src/i18n.js`).
- `targetLocales` - array of BCP-47 codes for your target languages (e.g. `["de", "fr", "pt-BR"]`). Run `generate-ui-languages` to create the `ui-languages.json` manifest from this list.
- `ui.sourceRoots` - directories to scan for `t("…")` calls (e.g. `["src/"]`).
- `ui.stringsJson` - where to write the master catalog (e.g. `"src/locales/strings.json"`).
- `ui.flatOutputDir` - where to write `de.json`, `pt-BR.json`, etc. (e.g. `"src/locales/"`).
- `ui.preferredModel` (optional) - OpenRouter model id to try **first** for `translate-ui` only; on failure the CLI continues with `openrouter.translationModels` (or legacy `defaultModel` / `fallbackModel`) in order, skipping duplicates.

### Step 2: Extract strings

```bash
npx ai-i18n-tools extract
```

Scans all JS/TS files under `ui.sourceRoots` for `t("literal")` and `i18n.t("literal")` calls. Writes (or merges into) `ui.stringsJson`.

The scanner is configurable: add custom function names via `ui.reactExtractor.funcNames`.

### Step 3: Translate UI strings

```bash
npx ai-i18n-tools translate-ui
```

Reads `strings.json`, sends batches to OpenRouter for each target locale, writes flat JSON files (`de.json`, `fr.json`, etc.) to `ui.flatOutputDir`. When `ui.preferredModel` is set, that model is attempted before the ordered list in `openrouter.translationModels` (document translation and other commands still use only `openrouter`).

For each entry, `translate-ui` stores the **OpenRouter model id** that successfully translated each locale in an optional `models` object (same locale keys as `translated`). Strings edited in the local `editor` command are marked with the sentinel value `user-edited` in `models` for that locale. The per-locale flat files under `ui.flatOutputDir` remain **source string → translation** only; they do not include `models` (so runtime bundles stay unchanged).

> **Note on using the Cache Editor:** If you edit an entry in the cache editor, you need to run a `sync --force-update` (or the equivalent `translate` command with `--force-update`) to rewrite the output files with the updated cache entry. Also, keep in mind that if the source text changes later, your manual edit will be lost because a new cache key (hash) will be generated for the new source string.

### Exporting to XLIFF 2.0 (optional)

To hand UI strings off to a translation vendor, TMS, or CAT tool, export the catalog as **XLIFF 2.0** (one file per target locale). This command is **read-only**: it does not modify `strings.json` or call any API.

```bash
npx ai-i18n-tools export-ui-xliff
```

By default, files are written next to `ui.stringsJson`, named like `strings.de.xliff`, `strings.pt-BR.xliff` (basename of your catalog + locale + `.xliff`). Use `-o` / `--output-dir` to write elsewhere. Existing translations from `strings.json` appear in `<target>`; missing locales use `state="initial"` with no `<target>` so tools can fill them in. Use `--untranslated-only` to export only units that still need a translation for each locale (useful for vendor batches). `--dry-run` prints paths without writing files.

### Step 4: Wire i18next at runtime

Create your i18n setup file using the helpers exported by `'ai-i18n-tools/runtime'`:

```js
// src/i18n.js  (or src/i18n.ts)
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import uiLanguages from './locales/ui-languages.json';
import {
  defaultI18nInitOptions,
  wrapI18nWithKeyTrim,
  makeLoadLocale,
  applyDirection,
} from 'ai-i18n-tools/runtime';

// Must match sourceLocale in ai-i18n-tools.config.json
export const SOURCE_LOCALE = 'en-GB';

void i18n.use(initReactI18next).init(defaultI18nInitOptions(SOURCE_LOCALE));
wrapI18nWithKeyTrim(i18n);
i18n.on('languageChanged', applyDirection);
applyDirection(i18n.language);

const localeLoaders = Object.fromEntries(
  uiLanguages
    .filter(({ code }) => code !== SOURCE_LOCALE)
    .map(({ code }) => [code, () => import(`./locales/${code}.json`)])
);

export const loadLocale = makeLoadLocale(i18n, localeLoaders, SOURCE_LOCALE);
export default i18n;
```

Import `i18n.js` before React renders (e.g. at the top of your entry point). When the user changes language, call `await loadLocale(code)` then `i18n.changeLanguage(code)`.

`SOURCE_LOCALE` is exported so any other file that needs it (e.g. a language switcher) can import it directly from `'./i18n'`. If you are migrating an existing i18next setup, replace any hardcoded source locale strings (e.g. `'en-GB'` checks scattered across components) with imports of `SOURCE_LOCALE` from your i18n bootstrap file.

`defaultI18nInitOptions(sourceLocale)` returns the standard options for key-as-default setups:

- `parseMissingKeyHandler` returns the key itself, so untranslated strings display the source text.
- `nsSeparator: false` allows keys that contain colons.
- `interpolation.escapeValue: false` - safe to disable: React escapes values itself, and Node.js/CLI output has no HTML to escape.

`wrapI18nWithKeyTrim(i18n)` wraps `i18n.t` so that: (1) keys are trimmed before lookup, matching how the extract script stores them; (2) <code>{"{{var}}"}</code> interpolation is applied when the source locale returns the raw key - so <code>{"t('Hello {{name}}', { name })"}</code> works correctly even for the source language.

`makeLoadLocale(i18n, loaders, sourceLocale)` returns an async `loadLocale(lang)` function that dynamically imports the JSON bundle for a locale and registers it with i18next.

### Using `t()` in source code

Call `t()` with a **literal string** so the extract script can find it:

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <button>{t('Save')}</button>;
}
```

The same pattern works outside React (Node.js, server components, CLI):

```js
import i18n from './i18n.js';
console.log(i18n.t('Processing complete'));
```

**Rules:**

- Only these forms are extracted: `t("…")`, `t('…')`, `t(`…`)`, `i18n.t("…")`.
- The key must be a **literal string** - no variables or expressions as the key.
- Do not use template literals for the key: <code>{'t(`Hello ${name}`)'}</code> is not extractable.

### Interpolation

Use i18next's native second-argument interpolation for <code>{"{{var}}"}</code> placeholders:

```js
// i18next handles substitution natively, even in key-as-default mode
t('Hello {{name}}, you have {{count}} messages', { name, count })
// → "Hello Alice, you have 3 messages"
```

The extract script ignores the second argument - only the literal key string <code>{"\"Hello {{name}}, you have {{count}} messages\""}</code> is extracted and sent for translation. Translators are instructed to preserve <code>{"{{...}}"}</code> tokens.

If your project uses a custom interpolation utility (e.g. calling `t('key')` then piping the result through a template function like `interpolateTemplate(t('Hello {{name}}'), { name })`), `wrapI18nWithKeyTrim` makes that unnecessary — it applies <code>{"{{var}}"}</code> interpolation even when the source locale returns the raw key. Migrate call sites to `t('Hello {{name}}', { name })` and remove the custom utility.

### Language switcher UI

Use the `ui-languages.json` manifest to build a language selector. `ai-i18n-tools` exports two display helpers:

```tsx
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getUILanguageLabel,
  getUILanguageLabelNative,
  type UiLanguageEntry,
} from 'ai-i18n-tools/runtime';
import uiLanguages from './locales/ui-languages.json';
import { loadLocale } from './i18n';

function LanguageSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const { t, i18n } = useTranslation();

  const options = useMemo(
    () =>
      (uiLanguages as UiLanguageEntry[]).map((lang) => ({
        code: lang.code,
        // Settings/content dropdowns: shows translated name when available
        label: getUILanguageLabel(lang, t),
        // Header globe menu: shows "English / Deutsch"-style label, no t() call
        nativeLabel: getUILanguageLabelNative(lang),
      })),
    [t]
  );

  const handleChange = async (code: string) => {
    await loadLocale(code);
    i18n.changeLanguage(code);
    onChange(code);
  };

  return (
    <select value={value} onChange={(e) => handleChange(e.target.value)}>
      {options.map((row) => (
        <option key={row.code} value={row.code}>
          {row.label}
        </option>
      ))}
    </select>
  );
}
```

`getUILanguageLabel(lang, t)` - shows `t(englishName)` when translated, or `englishName / t(englishName)` when both differ. Suitable for settings screens.

`getUILanguageLabelNative(lang)` - shows `englishName / label` (no `t()` call on each row). Suitable for header menus where you want the native name visible.

The `ui-languages.json` manifest is a JSON array of <code>{"{ code, label, englishName, direction }"}</code> entries (`direction` is `"ltr"` or `"rtl"`). Example:

```json
[
  { "code": "en-GB", "label": "English (UK)", "englishName": "English (UK)", "direction": "ltr" },
  { "code": "pt-BR", "label": "Português (BR)", "englishName": "Portuguese (BR)", "direction": "ltr" },
  { "code": "de",    "label": "Deutsch",        "englishName": "German", "direction": "ltr" },
  { "code": "fr",    "label": "Français",       "englishName": "French", "direction": "ltr" },
  { "code": "ar",    "label": "العربية",         "englishName": "Arabic", "direction": "rtl" }
]
```

The manifest is generated by `generate-ui-languages` from `sourceLocale` + `targetLocales` and the bundled master catalog. It is written to `ui.flatOutputDir`.

### RTL languages

`ai-i18n-tools` exports `getTextDirection(lng)` and `applyDirection(lng)`:

```js
import { getTextDirection, applyDirection } from 'ai-i18n-tools/runtime';

getTextDirection('ar')    // 'rtl'
getTextDirection('en-GB') // 'ltr'

// Applied automatically via i18n.on('languageChanged', applyDirection) - see Step 4
```

`applyDirection` sets `document.documentElement.dir` (browser) or is a no-op (Node.js). Pass an optional `element` argument to target a specific element.

For strings that may contain `→` arrows, flip them for RTL layouts:

```js
import { flipUiArrowsForRtl } from 'ai-i18n-tools/runtime';
const { i18n } = useTranslation();
const isRtl = getTextDirection(i18n.language) === 'rtl';
const label = flipUiArrowsForRtl(t('Next → Step'), isRtl);
```

---

## Workflow 2 - Document Translation

Designed for markdown documentation, Docusaurus sites, and JSON label files. Standalone SVG assets are translated via [`translate-svg`](#cli-reference) when `features.translateSVG` is enabled and the top-level `svg` block is set — not via `documentations[].contentPaths`.

### Step 1: Initialise

```bash
npx ai-i18n-tools init -t ui-docusaurus
```

Edit the generated `ai-i18n-tools.config.json`:

- `sourceLocale` - source language (must match `defaultLocale` in `docusaurus.config.js`).
- `targetLocales` - array of BCP-47 locale codes (e.g. `["de", "fr", "es"]`).
- `cacheDir` - shared SQLite cache directory for all documentation pipelines (and default log directory for `--write-logs`).
- `documentations` - array of documentation blocks. Each block has optional `description`, `contentPaths`, `outputDir`, optional `jsonSource`, `markdownOutput`, `targetLocales`, `addFrontmatter`, etc.
- `documentations[].description` - optional short note for maintainers (what this block covers). When set, it appears in the `translate-docs` headline (`🌐 …: translating …`) and in `status` section headers.
- `documentations[].contentPaths` - markdown/MDX source directories or files (see also `documentations[].jsonSource` for JSON labels).
- `documentations[].outputDir` - translated output root for that block.
- `documentations[].markdownOutput.style` - `"nested"` (default), `"docusaurus"`, or `"flat"` (see [Output layouts](#output-layouts)).

### Step 2: Translate documents

```bash
npx ai-i18n-tools translate-docs
```

This translates all files in every `documentations` block’s `contentPaths` to all effective documentation locales (union of each block’s `targetLocales` when set, otherwise root `targetLocales`). Already-translated segments are served from the SQLite cache - only new or changed segments are sent to the LLM.

To translate a single locale:

```bash
npx ai-i18n-tools translate-docs --locale de
```

To check what needs translating:

```bash
npx ai-i18n-tools status
```

#### Cache behaviour and `translate-docs` flags

The CLI keeps **file tracking** in SQLite (source hash per file × locale) and **segment** rows (hash × locale per translatable chunk). A normal run skips a file entirely when the tracked hash matches the current source **and** the output file already exists; otherwise it processes the file and uses the segment cache so unchanged text does not call the API.


| Flag                     | Effect                                                                                                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| *(default)*              | Skip unchanged files when tracking + on-disk output match; use segment cache for the rest.                                                                                                             |
| `-l, --locale <codes>`   | Comma-separated target locales (defaults follow `documentation.targetLocales` / `targetLocales` when omitted).                                                                                           |
| `-p, --path` / `-f, --file` | Only translate markdown/JSON under this path (project-relative or absolute); `--file` is an alias for `--path`.                                                                                     |
| `--dry-run`              | No file writes and no API calls.                                                                                                                                                                       |
| `--type <kind>`          | Restrict to `markdown` or `json` (otherwise both when enabled in config).                                                                                                                              |
| `--json-only` / `--no-json` | Translate only JSON label files, or skip JSON and translate markdown only.                                                                                                                         |
| `-j, --concurrency <n>`  | Max parallel target locales (default from config or CLI built-in default).                                                                                                                             |
| `-b, --batch-concurrency <n>` | Max parallel batch API calls per file (docs; default from config or CLI).                                                                                                                          |
| `--emphasis-placeholders` | Mask markdown emphasis markers as placeholders before translation (optional; default off).                                                                                                         |
| `--debug-failed`         | Write detailed `FAILED-TRANSLATION` logs under `cacheDir` when validation fails.                                                                                                                       |
| `--force-update`         | Re-process every matched file (extract, reassemble, write outputs) even when file tracking would skip. **Segment cache still applies** - unchanged segments are not sent to the LLM.                   |
| `--force`                | Clears file tracking for each processed file and **does not read** the segment cache for API translation (full re-translation). New results are still **written** to the segment cache.                 |
| `--stats`                | Print segment counts, tracked file counts, and per-locale segment totals, then exit.                                                                                                                   |
| `--clear-cache [locale]` | Delete cached translations (and file tracking): all locales, or a single locale, then exit.                                                                                                            |
| `--prompt-format <mode>` | How each **batch** of segments is sent to the model and parsed (`xml`, `json-array`, or `json-object`). Default **`json-array`**. Does not change extraction, placeholders, validation, cache, or fallback behaviour — see [Batch prompt format](#batch-prompt-format). |


You cannot combine `--force` with `--force-update` (they are mutually exclusive).

#### Batch prompt format

`translate-docs` sends translatable segments to OpenRouter in **batches** (grouped by `batchSize` / `maxBatchChars`). The **`--prompt-format`** flag only changes that batch’s **wire format**; segment splitting, `PlaceholderHandler` tokens, markdown AST checks, SQLite cache keys, and per-segment fallback when batch parsing fails are unchanged.

| Mode | User message | Model reply |
| ---- | ------------ | ----------- |
| **`xml`** | Pseudo-XML: one `<seg id="N">…</seg>` per segment (with XML escaping). | Only `<t id="N">…</t>` blocks, one per segment index. |
| **`json-array`** (default) | A JSON array of strings, one entry per segment in order. | A JSON array of the **same length** (same order). |
| **`json-object`** | A JSON object `{"0":"…","1":"…",…}` keyed by segment index. | A JSON object with the **same keys** and translated values. |

The run header also prints `Batch prompt format: …` so you can confirm the active mode. JSON label files (`jsonSource`) and standalone SVG batches use the same setting when those steps run as part of `translate-docs` (or `sync`’s docs phase — `sync` does not expose this flag; it defaults to **`json-array`**).

**Segment dedupe and paths in SQLite**

- Segment rows are keyed globally by `(source_hash, locale)` (hash = normalized content). Identical text in two files shares one row; `translations.filepath` is metadata (last writer), not a second cache entry per file.
- `file_tracking.filepath` uses namespaced keys: `doc-block:{index}:{relPath}` per `documentations` block (`relPath` is project-root-relative posix: markdown paths as collected; **JSON label files use the cwd-relative path to the source file**, e.g. `docs-site/i18n/en/code.json`, so cleanup can resolve the real file), and `svg-assets:{relPath}` for standalone SVG assets under `translate-svg`.
- `translations.filepath` stores cwd-relative posix paths for markdown, JSON, and SVG segments (SVG uses the same path shape as other assets; the `svg-assets:…` prefix is **only** on `file_tracking`).
- After a run, `last_hit_at` is cleared only for segment rows **in the same translate scope** (respecting `--path` and enabled kinds) that were not hit, so a filtered or docs-only run does not mark unrelated files stale.

### Output layouts

`"nested"` (default when omitted) — mirrors the source tree under `{outputDir}/{locale}/` (e.g. `docs/guide.md` → `i18n/de/docs/guide.md`).

`"docusaurus"` — places files that lie under `docsRoot` at `i18n/<locale>/docusaurus-plugin-content-docs/current/<relativeToDocsRoot>`, matching the usual Docusaurus i18n layout. Set `documentations[].markdownOutput.docsRoot` to your docs source root (e.g. `"docs"`).

```
docs/guide.md         → i18n/de/docusaurus-plugin-content-docs/current/guide.md
i18n/en/sidebar.json  → i18n/de/sidebar.json  (JSON label files)
```

`"flat"` - places translated files next to the source with a locale suffix, or in a subdirectory. Relative links between pages are rewritten automatically.

```
docs/guide.md → i18n/guide.de.md
```

You can override paths entirely with `documentations[].markdownOutput.pathTemplate`. Placeholders: <code>{"{outputDir}"}</code>, <code>{"{locale}"}</code>, <code>{"{LOCALE}"}</code>, <code>{"{relPath}"}</code>, <code>{"{stem}"}</code>, <code>{"{basename}"}</code>, <code>{"{extension}"}</code>, <code>{"{docsRoot}"}</code>, <code>{"{relativeToDocsRoot}"}</code>.

---

## Combined workflow (UI + Docs)

Enable all features in a single config to run both workflows together:

```json
{
  "sourceLocale": "en-GB",
  "targetLocales": ["de", "fr", "es", "pt-BR", "ja", "ko", "zh-CN"],
  "features": {
    "extractUIStrings": true,
    "translateUIStrings": true,
    "translateMarkdown": true,
    "translateJSON": false,
    "translateSVG": false
  },
  "glossary": {
    "uiGlossary": "src/locales/strings.json",
    "userGlossary": "glossary-user.csv"
  },
  "ui": {
    "sourceRoots": ["src/"],
    "stringsJson": "src/locales/strings.json",
    "flatOutputDir": "src/locales/"
  },
  "cacheDir": ".translation-cache",
  "documentations": [
    {
      "contentPaths": ["docs/"],
      "outputDir": "i18n/",
      "markdownOutput": { "style": "flat" }
    }
  ]
}
```

`glossary.uiGlossary` points document translation at the same `strings.json` catalog as the UI so terminology stays consistent; `glossary.userGlossary` adds CSV overrides for product terms.

Run `npx ai-i18n-tools sync` to run one pipeline: **extract** UI strings (if `features.extractUIStrings`), **translate UI** strings (if `features.translateUIStrings`), **translate standalone SVG assets** (if `features.translateSVG` and a `svg` block are set), then **translate documentation** (each `documentations` block: markdown/JSON as configured). Skip parts with `--no-ui`, `--no-svg`, or `--no-docs`. The docs step accepts `--dry-run`, `-p` / `--path`, `--force`, and `--force-update` (the last two only apply when documentation translation runs; they are ignored if you pass `--no-docs`).

Use `documentations[].targetLocales` on a block to translate that block’s files to a **smaller subset** than the UI (effective documentation locales are the **union** across blocks):

```json
{
  "targetLocales": ["de", "fr", "es", "pt-BR", "ja", "ko", "zh-CN"],
  "documentations": [
    {
      "contentPaths": ["docs/"],
      "outputDir": "i18n/",
      "targetLocales": ["de", "fr", "es"]
    }
  ]
}
```

---

## Configuration reference

### `sourceLocale`

BCP-47 code for the source language (e.g. `"en-GB"`, `"en"`, `"pt-BR"`). No translation file is generated for this locale - the key string itself is the source text.

**Must match** `SOURCE_LOCALE` exported from your runtime i18n setup file (`src/i18n.ts` / `src/i18n.js`).

### `targetLocales`

Array of BCP-47 locale codes to translate to (e.g. `["de", "fr", "es", "pt-BR"]`).

`targetLocales` is the primary locale list for UI translation and the default locale list for documentation blocks. Use `generate-ui-languages` to build the `ui-languages.json` manifest from `sourceLocale` + `targetLocales`.

### `uiLanguagesPath` (optional)

Path to the `ui-languages.json` manifest used for display names, locale filtering, and language-list post-processing. When omitted, the CLI looks for the manifest at `ui.flatOutputDir/ui-languages.json`.

Use this when:

- The manifest lives outside `ui.flatOutputDir` and you need to point the CLI at it explicitly.
- You want `markdownOutput.postProcessing.languageListBlock` to build locale labels from the manifest.
- `extract` should merge `englishName` entries from the manifest into `strings.json` (requires `ui.reactExtractor.includeUiLanguageEnglishNames: true`).

### `concurrency` (optional)

Maximum **target locales** translated at the same time (`translate-ui`, `translate-docs`, `translate-svg`, and the matching steps inside `sync`). If omitted, the CLI uses **4** for UI translation and **3** for documentation translation (built-in defaults). Override per run with `-j` / `--concurrency`.

### `batchConcurrency` (optional)

**translate-docs** and **translate-svg** (and the documentation step of `sync`): maximum parallel OpenRouter **batch** requests per file (each batch can contain many segments). Default **4** when omitted. Ignored by `translate-ui`. Override with `-b` / `--batch-concurrency`. On `sync`, `-b` applies to the documentation translation step only.

### `batchSize` / `maxBatchChars` (optional)

Segment batching for document translation: how many segments per API request, and a character ceiling. Defaults: **20** segments, **4096** characters (when omitted).

### `openrouter`


| Field               | Description                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `baseUrl`           | OpenRouter API base URL. Default: `https://openrouter.ai/api/v1`.                        |
| `translationModels` | Preferred ordered list of model IDs. The first is tried first; later entries are fallbacks on error. For `translate-ui` only**, you can also set `ui.preferredModel` to try one model before this list (see `ui`). |
| `defaultModel`      | Legacy single primary model. Used only when `translationModels` is unset or empty.       |
| `fallbackModel`     | Legacy single fallback model. Used after `defaultModel` when `translationModels` is unset or empty. |
| `maxTokens`         | Max completion tokens per request. Default: `8192`.                                      |
| `temperature`       | Sampling temperature. Default: `0.2`.                                                    |

**Why use multiple models:** Different providers and models have varying costs and offer different levels of quality across languages and locales. Configure **`openrouter.translationModels` as an ordered fallback chain** (rather than a single model) so the CLI can attempt the next model if a request fails. 

Treat the list below as a **baseline** that you can expand: if translation for a specific locale is poor or unsuccessful, research which models support that language or script effectively (refer to online resources or your provider’s documentation), and add those OpenRouter IDs as further alternatives. 

This list was **tested for broad locale coverage** (for example, on the Transrewrt project translating **36** target locales) in **April 2026**; it serves as a practical default, but is not guaranteed to perform well for every locale.

Example `translationModels` (same as `npx ai-i18n-tools init` and the package examples):

```json
"translationModels": [
  "qwen/qwen3-235b-a22b-2507",
  "openai/gpt-4o-mini",
  "deepseek/deepseek-v3.2",
  "anthropic/claude-3-haiku",
  "qwen/qwen3.6-plus",
  "anthropic/claude-3.5-haiku",
  "openai/gpt-5.3-codex",
  "anthropic/claude-sonnet-4.6",
  "google/gemini-3-flash-preview"
]
```

Set `OPENROUTER_API_KEY` in your environment or `.env` file.

### `features`


| Field                | Workflow | Description                                                       |
| -------------------- | -------- | ----------------------------------------------------------------- |
| `extractUIStrings`   | 1        | Scan source for `t("…")` / `i18n.t("…")`, merge optional `package.json` description and (if enabled) `ui-languages.json` `englishName` values into `strings.json`. |
| `translateUIStrings` | 1        | Translate `strings.json` entries and write per-locale JSON files. |
| `translateMarkdown`  | 2        | Translate `.md` / `.mdx` files.                                   |
| `translateJSON`      | 2        | Translate Docusaurus JSON label files.                            |
| `translateSVG`       | 2        | Translate standalone `.svg` assets (requires the top-level `svg` block). |

Translate **standalone** SVG assets with `translate-svg` when `features.translateSVG` is true and a top-level `svg` block is configured. The `sync` command runs that step when both are set (unless `--no-svg`).

### `ui`


| Field                       | Description                                                             |
| --------------------------- | ----------------------------------------------------------------------- |
| `sourceRoots`               | Directories (relative to cwd) scanned for `t("…")` calls.               |
| `stringsJson`               | Path to the master catalog file. Updated by `extract`.                  |
| `flatOutputDir`             | Directory where per-locale JSON files are written (`de.json`, etc.).    |
| `preferredModel`            | Optional. OpenRouter model id tried first for `translate-ui` only; then `openrouter.translationModels` (or legacy models) in order, without duplicating this id. |
| `reactExtractor.funcNames`  | Additional function names to scan (default: `["t", "i18n.t"]`).         |
| `reactExtractor.extensions` | File extensions to include (default: `[".js", ".jsx", ".ts", ".tsx"]`). |
| `reactExtractor.includePackageDescription` | When `true` (default), `extract` also includes `package.json` `description` as a UI string when present. |
| `reactExtractor.packageJsonPath` | Custom path to the `package.json` file used for that optional description extraction. |
| `reactExtractor.includeUiLanguageEnglishNames` | When `true` (default `false`), `extract` also adds each `englishName` from the manifest at `uiLanguagesPath` to `strings.json` when not already present from the source scan (same hash keys). Requires `uiLanguagesPath` pointing at a valid `ui-languages.json`. |

### `cacheDir`

| Field      | Description                                                                 |
| ---------- | ----------------------------------------------------------------------------- |
| `cacheDir` | SQLite cache directory (shared by all `documentations` blocks). Reuse across runs. If you are migrating from a custom doc translation cache, archive or delete it — `cacheDir` creates its own SQLite database and is not compatible with other schemas. |

### `documentations`

Array of documentation pipeline blocks. `translate-docs` and the docs phase of `sync` process **each** block in order.

| Field                                        | Description                                                                                                                                                                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `description`                                | Optional human-readable note for this block (not used for translation). Prefixed in the `translate-docs` `🌐` headline when set; also shown in `status` section headers.                                                     |
| `contentPaths`                               | Markdown/MDX sources to translate (`translate-docs` scans these for `.md` / `.mdx`). JSON labels come from `jsonSource` on the same block.                                                                                  |
| `outputDir`                                  | Root directory for translated output for this block.                                                                                                                                                                      |
| `sourceFiles`                                | Optional alias merged into `contentPaths` at load.                                                                                                                                                                        |
| `targetLocales`                              | Optional subset of locales for this block only (otherwise root `targetLocales`). Effective documentation locales are the union across blocks.                                                                             |
| `jsonSource`                                 | Source directory for Docusaurus JSON label files for this block (e.g. `"i18n/en"`).                                                                                                                                       |
| `markdownOutput.style`                       | `"nested"` (default), `"docusaurus"`, or `"flat"`.                                                                                                                                                                        |
| `markdownOutput.docsRoot`                    | Source docs root for Docusaurus layout (e.g. `"docs"`).                                                                                                                                                                   |
| `markdownOutput.pathTemplate`                | Custom markdown output path. Placeholders: <code>{"{outputDir}"}</code>, <code>{"{locale}"}</code>, <code>{"{LOCALE}"}</code>, <code>{"{relPath}"}</code>, <code>{"{stem}"}</code>, <code>{"{basename}"}</code>, <code>{"{extension}"}</code>, <code>{"{docsRoot}"}</code>, <code>{"{relativeToDocsRoot}"}</code>. |
| `markdownOutput.jsonPathTemplate`            | Custom JSON output path for label files. Supports the same placeholders as `pathTemplate`.                                                                                                                                |
| `markdownOutput.flatPreserveRelativeDir`     | For `flat` style, keep source subdirectories so files with the same basename do not collide.                                                                                                                              |
| `markdownOutput.rewriteRelativeLinks` | Rewrite relative links after translation (auto-enabled for `flat` style).                                                                                                                                                 |
| `markdownOutput.linkRewriteDocsRoot` | Repo root used when computing flat-link rewrite prefixes. Usually leave this as `"."` unless your translated docs live under a different project root. |
| `markdownOutput.postProcessing` | Optional transforms on the translated markdown **body** (YAML front matter is preserved). Runs after segment reassembly and flat link rewriting, and before `addFrontmatter`. |
| `markdownOutput.postProcessing.regexAdjustments` | Ordered list of `{ "description"?, "search", "replace" }`. `search` is a regex pattern (plain string uses flag `g`, or `/pattern/flags`). `replace` supports placeholders such as `${translatedLocale}`, `${sourceLocale}`, `${sourceFullPath}`, `${translatedFullPath}`, `${sourceFilename}`, `${translatedFilename}`, `${sourceBasedir}`, `${translatedBasedir}` (same idea as the reference `additional-adjustments`). |
| `markdownOutput.postProcessing.languageListBlock` | `{ "start", "end", "separator" }` — the translator finds the first line containing `start` and the matching `end` line, then replaces that slice with a canonical language switcher. Links are built with paths relative to the translated file; labels come from `uiLanguagesPath` / `ui-languages.json` when configured, otherwise from `localeDisplayNames` and locale codes. |
| `addFrontmatter`                  | When `true` (default when omitted), translated markdown files include YAML keys: `translation_last_updated`, `source_file_mtime`, `source_file_hash`, `translation_language`, `source_file_path`, and when at least one segment has model metadata, `translation_models` (sorted list of OpenRouter model ids used). Set to `false` to skip. |


Example (flat README pipeline — screenshot paths + optional language list wrapper):

```json
"markdownOutput": {
  "style": "flat",
  "postProcessing": {
    "regexAdjustments": [
      {
        "description": "Per-locale screenshot folders",
        "search": "images/screenshots/[^/]+/",
        "replace": "images/screenshots/${translatedLocale}/"
      }
    ],
    "languageListBlock": {
      "start": "<small id=\"lang-list\">",
      "end": "</small>",
      "separator": " · "
    }
  }
}
```

### `svg` (optional)

Top-level paths and layout for standalone SVG assets. Translation runs only when **`features.translateSVG`** is true (via `translate-svg` or the SVG stage of `sync`).

| Field                       | Description |
| --------------------------- | ----------- |
| `sourcePath`                | One directory or an array of directories scanned recursively for `.svg` files. |
| `outputDir`                 | Root directory for translated SVG output. |
| `style`                     | `"flat"` or `"nested"` when `pathTemplate` is unset. |
| `pathTemplate`              | Custom SVG output path. Placeholders: <code>{"{outputDir}"}</code>, <code>{"{locale}"}</code>, <code>{"{LOCALE}"}</code>, <code>{"{relPath}"}</code>, <code>{"{stem}"}</code>, <code>{"{basename}"}</code>, <code>{"{extension}"}</code>, <code>{"{relativeToSourceRoot}"}</code>. |
| `svgExtractor.forceLowercase` | Lower-case translated text on SVG reassembly. Useful for designs that rely on all-lowercase labels. |

### `glossary`


| Field          | Description                                                                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `uiGlossary`   | Path to `strings.json` - auto-builds a glossary from existing translations.                                                                                                                 |
| `userGlossary` | Path to a CSV with columns `Original language string` (or `en`), `locale`, `Translation` - one row per source term and target locale (`locale` may be `*` for all targets). |


The legacy key `uiGlossaryFromStringsJson` is still accepted and mapped to `uiGlossary` when loading config.

Generate an empty glossary CSV:

```bash
npx ai-i18n-tools glossary-generate
```

---

## CLI reference


| Command                                                                   | Description                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`                                                                 | Print CLI version and build timestamp (same information as `-V` / `--version` on the root program).                                                                                                                                                                                                  |
| `init [-t ui-markdown|ui-docusaurus] [-o path] [--with-translate-ignore]` | Write a starter config file (includes `concurrency`, `batchConcurrency`, `batchSize`, `maxBatchChars`, and `documentations[].addFrontmatter`). `--with-translate-ignore` creates a starter `.translate-ignore`.                                                                            |
| `extract`                                                                 | Update `strings.json` from `t("…")` / `i18n.t("…")` literals, optional `package.json` description, and optional manifest `englishName` entries (see `ui.reactExtractor`). Requires `features.extractUIStrings`.                                                                                                                                                                                                    |
| `generate-ui-languages [--master <path>] [--dry-run]`                     | Write `ui-languages.json` to `ui.flatOutputDir` (or `uiLanguagesPath` when set) using `sourceLocale` + `targetLocales` and the bundled `data/ui-languages-complete.json` (or `--master`). Warns and emits `TODO` placeholders for locales missing from the master file. If you have an existing manifest with customised `label` or `englishName` values, they will be replaced by master catalog defaults — review and adjust the generated file afterward. |
| `translate-docs …`                                                        | Translate markdown/MDX and JSON for each `documentations` block (`contentPaths`, optional `jsonSource`). `-j`: max parallel locales; `-b`: max parallel batch API calls per file. `--prompt-format`: batch wire format (`xml` \| `json-array` \| `json-object`). See [Cache behaviour and `translate-docs` flags](#cache-behaviour-and-translate-docs-flags) and [Batch prompt format](#batch-prompt-format). |
| `translate-svg …`                                                         | Translate standalone SVG assets configured in `config.svg` (separate from docs). Requires `features.translateSVG`. Same cache ideas as docs; supports `--no-cache` to skip SQLite reads/writes for that run. `-j`, `-b`, `--force`, `--force-update`, `-p` / `--path`, `--dry-run`.                                                    |
| `translate-ui [--locale <code>] [--force] [--dry-run] [-j <n>]`           | Translate UI strings only. `--force`: re-translate all entries per locale (ignore existing translations). `--dry-run`: no writes, no API calls. `-j`: max parallel locales. Requires `features.translateUIStrings`.                                                                                 |
| `export-ui-xliff [-l <codes>] [-o <dir>] [--untranslated-only] [--dry-run]` | Export `strings.json` to XLIFF 2.0 (one `.xliff` per target locale). `-o` / `--output-dir`: output directory (default: same folder as the catalog). `--untranslated-only`: only units missing a translation for that locale. Read-only; no API.                                                        |
| `sync …`                                                                  | Extract (if enabled), then UI translation, then `translate-svg` when `features.translateSVG` and `config.svg` are set, then documentation translation - unless skipped with `--no-ui`, `--no-svg`, or `--no-docs`. Shared flags: `-l`, `-p` / `-f`, `--dry-run`, `-j`, `-b` (docs batching only), `--force` / `--force-update` (docs only; mutually exclusive when docs run). Docs phase also forwards `--emphasis-placeholders` and `--debug-failed` (same meaning as `translate-docs`). `--prompt-format` is not a `sync` flag; the docs step uses the built-in default (`json-array`).                         |
| `status [--max-columns <n>]`                                   | When `features.translateUIStrings` is on, prints UI coverage per locale (`Translated` / `Missing` / `Total`). Then prints markdown translation status per file × locale (no `--locale` filter; locales come from config). Large locale lists are split into repeated tables of up to `n` locale columns (default **9**) so lines stay narrow in the terminal.                                                                                                                                                                                               |
| `cleanup [--dry-run] [--no-backup] [--backup <path>]`                  | Runs `sync --force-update` first (extract, UI, SVG, docs), then removes stale segment rows (null `last_hit_at` / empty filepath); drops `file_tracking` rows whose resolved source path is missing on disk; removes translation rows whose `filepath` metadata points at a missing file. Logs three counts (stale, orphaned `file_tracking`, orphaned translations). Creates a timestamped SQLite backup under the cache dir unless `--no-backup`. |
| `editor [-p <port>] [--no-open]`                                          | Launch a local web editor for the cache, `strings.json`, and glossary CSV. `--no-open`: do not open the default browser automatically.<br><br>**Note:** If you edit an entry in the cache editor, you must run a `sync --force-update` to rewrite the output files with the updated cache entry. Also, if the source text changes later, the manual edit will be lost since a new cache key is generated. |
| `glossary-generate [-o <path>]`                                           | Write an empty `glossary-user.csv` template. `-o`: override the output path (default: `glossary.userGlossary` from config, or `glossary-user.csv`).                                                                                                                                                |


All commands accept `-c <path>` to specify a non-default config file, `-v` for verbose output, and `-w` / `--write-logs [path]` to tee console output to a log file (default path: under root `cacheDir`). The root program also supports `-V` / `--version` and `-h` / `--help`; `ai-i18n-tools help [command]` shows the same per-command usage as `ai-i18n-tools <command> --help`.

---

## Environment variables


| Variable               | Description                                                |
| ---------------------- | ---------------------------------------------------------- |
| `OPENROUTER_API_KEY`   | **Required.** Your OpenRouter API key.                     |
| `OPENROUTER_BASE_URL`  | Override the API base URL.                                 |
| `I18N_SOURCE_LOCALE`   | Override `sourceLocale` at runtime.                        |
| `I18N_TARGET_LOCALES`  | Comma-separated locale codes to override `targetLocales`.  |
| `I18N_LOG_LEVEL`       | Logger level (`debug`, `info`, `warn`, `error`, `silent`). |
| `NO_COLOR`             | When `1`, disable ANSI colours in log output.            |
| `I18N_LOG_SESSION_MAX` | Max lines kept per log session (default `5000`).           |

