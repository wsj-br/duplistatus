# Translation Maintenance Workflow {/* #translation-maintenance-workflow */}

For general documentation commands (build, deploy, screenshots, README generation), see [Documentation Tools](documentation-tools.md).

## Overview {/* #overview */}

The documentation uses Docusaurus i18n with English as the default locale. Source documentation lives in `docs/`; translations are written under `i18n/{locale}/`. Supported locales: en-GB (default), fr, de, es, pt-BR, hi, zh-Hans.

**AI translation** for the app UI, Docusaurus markdown/JSON, SVG assets, and **default notification templates** is handled by [**ai-i18n-tools**](https://www.npmjs.com/package/ai-i18n-tools) from the **repository root**, configured in `ai-i18n-tools.config.json` (not inside `documentation/`). Set `OPENROUTER_API_KEY` when running translate commands.

To try an unpublished checkout on the same machine (default `../ai-i18n-tools`), switch the dependency with `pnpm i18n:tools --local` or `./scripts/link-ai-i18n-tools.sh --local`. That links both the CLI (`pnpm i18n:*`) and the `ai-i18n-tools/runtime` import. Rebuild the tools package after source changes (`pnpm build` in that checkout). Restore the latest npm package with `--remote`. Do not commit the `link:` specifier.

## When English documentation changes {/* #when-english-documentation-changes */}

1. **Edit source** in `documentation/docs/` (English only). Landing-page copy is `documentation/src/landing/landing.html`.
2. **Docusaurus UI strings** (theme labels, navbar, etc.): if needed, run `pnpm write-translations` in `documentation/` so `i18n/en/*.json` picks up new keys.
3. **Heading IDs**: `pnpm write-heading-ids` (from `documentation/`).
4. **Translate** from the **repo root** (or use the shortcuts below from `documentation/`):
   - `pnpm i18n:extract` — refresh `src/locales/strings.json` from `t('…')` in the Next.js app.
   - `pnpm i18n:translate:docs` — translate markdown, Docusaurus shell JSON, and the landing HTML into `documentation/i18n/` and `documentation/src/landing/i18n/` per config.
   - `pnpm i18n:translate:svg` — translate SVGs under `documentation/static/img` as configured.
   - `pnpm i18n:translate:json` — translate default notification templates in `src/locales/templates/` from `en-GB.json`.
   - Or run everything: `pnpm i18n:translate`.
5. **Build**: `cd documentation && pnpm build` (all locales).

From inside `documentation/`, the same flows are wired as `pnpm translate` → root `i18n:translate`, plus `pnpm translate:docs`, `translate:ui`, `translate:svg`, `translate:status`, `i18n:extract`, `i18n:sync`.

## UI plurals {/* #ui-plurals */}

Cardinal plurals in the Next.js app use **ai-i18n-tools**, not hand-written `_one` / `_other` keys.

Write one English source string (usually the plural) and pass a **plain object literal** with `plurals: true` and a numeric `count`:

```tsx
t("{{count}} backups selected", { plurals: true, count: selectedBackups.size })
```

Rules:

- Do not use `item(s)` hedges or `count === 1 ? t('…') : t('…')` pairs.
- Independent **numeric** counts need separate `t()` calls — one plural axis cannot flex two numbers (for example 1 successful and 2 failed). Concatenate the fragments:

```tsx
`${t("Tested {{count}} connections:", { plurals: true, count: total })} ` +
  `${t("{{count}} successful,", { plurals: true, count: successCount })} ` +
  `${t("{{count}} failed", { plurals: true, count: failureCount })}`
```

- Non-numeric interpolations (names, labels, etc.) are fine in the same plural string as `{{count}}`.
- `pnpm i18n:extract` marks the catalog row `"plural": true`. `pnpm i18n:translate:ui` fills CLDR forms and writes `src/locales/en-GB.json` (plural keys only).
- `src/i18n.ts` and `src/lib/i18n-server.ts` load that file as `sourcePluralFlatBundle` so English singular/plural resolve at runtime.

## Default notification templates {/* #default-notification-templates */}

Settings → Templates → **Reset** loads defaults from `src/locales/templates/{locale}.json` (wired in `src/lib/default-notification-templates.ts`).

1. Edit **`src/locales/templates/en-GB.json`** only (English source).
2. Run **`pnpm i18n:translate:json`** (or **`pnpm i18n:translate`**) from the repo root.
3. Review diffs — placeholders such as `{backup_name}` and `{problem_table}` must stay unchanged; `priority` and `tags` are skipped by `keyPolicy` in `ai-i18n-tools.config.json`.
4. Run **`pnpm i18n:status`** to see JSON block coverage.

See the [ai-i18n-tools JSON guide](https://wsj-br.github.io/ai-i18n-tools/guide/json.html) for flags (`--locale`, `--force`, etc.).

## Landing page HTML {/* #landing-page-html */}

The docs homepage body is a single English HTML file, not React section components.

1. Edit **`documentation/src/landing/landing.html`** (and `documentation/src/landing/landing.css` for layout). Keep the hash ids `features`, `dashboard`, `workflow`, `security`, and `install`.
2. Run **`pnpm i18n:translate:docs`** from the repo root (or `pnpm translate:docs` from `documentation/`).
3. Generated copies are written to **`documentation/src/landing/i18n/{locale}/landing.html`**. Do not edit those files by hand.

`translate-docs` uses the [HTML pages](https://wsj-br.github.io/ai-i18n-tools/guide/documents/html-pages.html) pipeline: visible text and `alt` / `title` / `aria-label` are translated; `<pre>` and `<code>` stay in English. Navbar labels and the page title stay in Docusaurus `Translate` (`homepage.nav.*`, `homepage.meta.*`).

Do not add `data-i18n` markers to this file, and do not list it under `ui.sourceRoots`. The same HTML file must not be in both the documents pipeline and the UI-strings pipeline.

## Glossary {/* #glossary */}

- **UI terminology** for documentation comes from each `ui[]` catalog with `uiGlossary` left on (the default). The Next.js app catalog is `src/locales/strings.json` (produced by `pnpm i18n:extract`). Do not set `glossary.uiGlossary`; that key is rejected.
- **Overrides** live in `documentation/glossary-user.csv` (`glossary.userGlossary` in config). See the [ai-i18n-tools glossary docs](https://github.com/wsj-br/ai-i18n-tools/blob/main/docs/GETTING_STARTED.md) for column format.
- Generate a CSV template: `pnpm i18n:glossary-generate` (root).

## Cache {/* #cache */}

Translation cache for ai-i18n-tools is under `.translation-cache/` at the repo root (`cacheDir` in `ai-i18n-tools.config.json`). It is gitignored. Use `pnpm i18n:status` and the CLI’s `--force` / cache flags per [ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools) documentation when you need a full refresh.

## Heading IDs and anchors {/* #heading-ids-and-anchors */}

Use explicit IDs so links stay stable across languages. Prefer the MDX comment syntax (`pnpm write-heading-ids` uses `--syntax mdx-comment`):

```markdown
## This is a heading {/* #this-is-a-heading */}
```

Put IDs on `h2` and below. Docusaurus `write-heading-ids` skips `h1` (the page/sidebar title). `documentation/docusaurus.config.ts` also strips heading-id comments from inferred titles, because Docusaurus metadata extraction still only removes classic `{#id}`.

```bash
cd documentation
pnpm write-heading-ids
```

## Ignore lists {/* #ignore-lists */}

Use `.translate-ignore` at the repo root (same idea as `.gitignore`) for paths the doc translator should skip, if you add one for your workflow.

## Docusaurus theme JSON {/* #docusaurus-theme-json */}

`pnpm write-translations` extracts Docusaurus UI strings into `documentation/i18n/en/`. The **ai-i18n-tools** `translate-docs` step (with `markdownOutput.style: "docusaurus"`) fills translated JSON under each locale alongside markdown, per `ai-i18n-tools.config.json`.

## Troubleshooting {/* #troubleshooting */}

- `OPENROUTER_API_KEY` **not set** — export it or add to `.env.local` at the repo root.
- **Model / quality** — adjust `openrouter.translationModels` and related options in `ai-i18n-tools.config.json`.
- **Glossary** — edit `documentation/glossary-user.csv` or regenerate UI strings and re-run extract + translate.

## Adding a new language {/* #adding-a-new-language */}

1. Add the locale to Docusaurus `i18n.locales` and `localeConfigs` in `documentation/docusaurus.config.ts`.
2. Add the same locale to `targetLocales` in `ai-i18n-tools.config.json` (repo root).
3. Run `pnpm i18n:generate-ui-languages` at the root, then `pnpm i18n:extract` / translate commands as needed.
