# ai-i18n-tools — agent context for **your** application

Use this document (and [`i18n-getstarted.md`](i18n-getstarted.md)) when you add the **`ai-i18n-tools` npm package** to a JavaScript/TypeScript project. Copy sections into your repo’s `.cursor` rules or team prompts so assistants know how your app is wired.

**Developing the `ai-i18n-tools` package itself?** That work happens in the upstream repository; maintainer-oriented internals are in `dev/package-context.md` (not shipped on npm).

<!-- DOCTOC SKIP -->

---

## What you install

```bash
npm install ai-i18n-tools
# or: pnpm add ai-i18n-tools
```

- **CLI:** `npx ai-i18n-tools <command>` (see **CLI** below).
- **Runtime:** `import … from 'ai-i18n-tools/runtime'` for i18next helpers.

Configuration lives in **`ai-i18n-tools.config.json`** at the project root (or pass `-c <path>`).

---

## Non-negotiable: `sourceLocale` and `SOURCE_LOCALE`

The config field **`sourceLocale`** must **exactly match** the **`SOURCE_LOCALE`** constant you export from your app’s i18n bootstrap (e.g. `src/i18n.ts`). If they differ, extraction and translation targets will be wrong.

---

## `ui-languages.json` manifest (fixed shape)

Use a **JSON array** of objects. Each row must include:

| Field | Role |
|--------|------|
| `code` | BCP-47 locale tag (e.g. `en-GB`, `pt-BR`, `de`). |
| `label` | String shown in the UI — often the **native** language name. |
| `englishName` | English (or reference) name used in prompts, and often as the **`t()` key** for language-picker rows (`t(englishName)`). |
| `direction` | `"ltr"` or `"rtl"` — layout / `dir` for that row (see runtime `getTextDirection`). |

`targetLocales` in config is an **array of BCP-47 codes** (e.g. `["de", "fr", "pt-BR"]`). The manifest is generated — not hand-maintained — by `generate-ui-languages`.

**Generate the manifest:** `npx ai-i18n-tools generate-ui-languages` builds `ui-languages.json` from **`sourceLocale` + `targetLocales`** and the bundled catalog `data/ui-languages-complete.json`, writing it to `ui.flatOutputDir` (or `uiLanguagesPath` when set). If a locale is missing from the master list, the command **warns** and writes **TODO** placeholders (edit the JSON afterward). If you have an existing manifest with customised `label` or `englishName` values, they will be replaced by master catalog defaults — review and adjust the generated file afterward.

---

## What `extract` puts in `strings.json`

`strings.json` keys are **MD5 first 8 hex chars** of the **source string** (trimmed), same hash used for lookups in per-locale flat JSON.

The catalog is **not** only `t("…")` calls:

1. **Scanner** — string literals passed to `t` / `i18n.t` (and any extra names in `ui.reactExtractor.funcNames`) under `ui.sourceRoots`.
2. **Optional — `package.json` `description`** — when `ui.reactExtractor.includePackageDescription` is `true` (default), the description string is included so apps that surface it via `t(description)` stay translatable.
3. **Optional — manifest `englishName`** — when `ui.reactExtractor.includeUiLanguageEnglishNames` is `true`, each **`englishName`** from the file at `uiLanguagesPath` is added if that string was not already found in (1). Same keying as other entries; **scanned strings win** on duplicates.

Re-running **`extract`** is safe: existing `translated` / `models` entries are preserved for keys that still exist. If you already have a `strings.json` with `{ source, translated }` entries keyed by MD5 hash (e.g. from a custom extract script), `extract` and `translate-ui` will adopt it seamlessly. The optional `models` field will be added on the next `translate-ui` run.

---

## Typical commands

| Goal | Command |
|------|---------|
| First-time config | `npx ai-i18n-tools init` |
| (Optional) Build `ui-languages.json` from locales + master | `npx ai-i18n-tools generate-ui-languages` |
| Refresh UI catalog | `npx ai-i18n-tools extract` |
| Translate UI strings | `npx ai-i18n-tools translate-ui` (needs `OPENROUTER_API_KEY`) |
| Extract + translate UI + docs (per config) | `npx ai-i18n-tools sync` |

Use **`-c path`** if the config file is not the default name.

---

## Troubleshooting (short)

- **`extract` misses a string** — only **string literal** keys are extracted; dynamic keys need manual catalog entries or a post-step merge.
- **Language names not translated** — ensure `englishName` strings are either merged by `extract` (flag on) or added to `strings.json` by your pipeline; then run **`translate-ui`**.
- **`generate-ui-languages` errors** — set **`uiLanguagesPath`** in config (output path for the manifest).