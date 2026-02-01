# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.x-Unreleased]

### Added
- **remove-code-block-anchors script**: New script `scripts/remove-code-block-anchors.ts` that removes incorrectly added Docusaurus heading anchors (`{#anchor-id}`) from lines inside fenced code blocks in Markdown files under `documentation/docs/`. Supports `--dry-run`. Run with `pnpm exec tsx scripts/remove-code-block-anchors.ts`.
- **Translation ignore list**: Documentation translation script now reads `.translate.ignore` (gitignore-style patterns) and skips matching files during translation. Initially ignores `docs/LICENSE.md` via `LICENSE.md` pattern so Docusaurus can fall back to English. The `translate:status` report also marks ignored files with `i` and greys the filename.
- **AI translation debug traffic**: `--debug-traffic [path]` option for the documentation translate script. When set, writes each OpenRouter request body (model, messages, max_tokens, temperature; no API key) and full response to a file for debugging. Default path: `.translation-cache/debug-traffic-<timestamp>.log`. Documented in TRANSLATION-WORKFLOW.md under Troubleshooting.
- **Translation cache in git**: `.translation-cache/cache.db` is now tracked in git to save API costs for contributors. The cache is deterministic (hash-based) and automatically validates stale entries. Debug traffic logs remain excluded. Added `.gitattributes` to mark SQLite files as binary.
- **Source file hash in translation metadata**: Translated files now include `source_file_hash` in frontmatter, allowing verification of which source file version was used for translation. This complements existing metadata fields (`source_file_mtime`, `source_file_path`, `translation_language`, `translation_last_updated`).
- **Case-insensitive locale support**: All CLI options that accept locales (`--locale`, `--clear-cache`) now support case-insensitive input. Locales like `FR`, `fr`, `Pt-Br`, `PT-BR` are automatically normalized to the correct format (`fr`, `pt-BR`). Invalid locales are validated and show helpful error messages.
- **Translation status checker**: New `translate:status` script (`scripts/translate/check-status.ts`) that generates a table showing translation status for all documentation files. Columns include filename and one column per locale with status indicators: `✓` (translated and up-to-date), `-` (not translated), `⫗` (translated but outdated), `⁇` (orphaned - exists in translation but not in source). Uses `source_file_hash` from frontmatter to detect outdated translations. Includes summary statistics per locale.
- **Intlayer i18n dependencies**: Added `intlayer`, `react-intlayer`, and `next-intlayer` (^7.5.14) for Next.js 16 internationalisation support. Target languages: en, de, fr, es, pt-BR.
- **intlayer.config.ts**: Core Intlayer config with locales (en, de, fr, es, pt-BR), default locale English, editor disabled and `applicationURL` http://localhost:8666, and build optimization (tree-shaking) enabled.
- **Next.js + Intlayer integration**: `next.config.ts` now uses `withIntlayerSync` from `next-intlayer/server` for Intlayer webpack integration (aliases, IntlayerPlugin, .node loader). Our webpack customizations (better-sqlite3 externals, watchOptions, resolve, splitChunks, etc.) are composed to run first, then Intlayer's. Standalone output, experimental options, and all existing behaviour preserved. For full build-time tree-shaking of content, `@intlayer/swc` is recommended (optional).
- **Dynamic [locale] routing**: App Router locale segment `src/app/[locale]/` with `generateStaticParams` for en, de, fr, es, pt-BR. Dashboard, detail, detail/backup, settings, login, and blank pages moved under `[locale]`. Root `/` redirects to `/en`. API routes remain at `src/app/api/`.
- **Locale context and helpers**: `ClientLocaleProvider` and `useLocale()` in `src/contexts/locale-context.tsx`; locale derived from pathname, `document.documentElement.lang` set on client. `usePrefixWithLocale()` for building locale-prefixed paths.
- **Locale-aware navigation**: All `Link` and `router.push` updated to use `/[locale]/...` in app-header, conditional-layout, dashboard (table, overview/status/server/overview-cards), server-details (summary-items, backup-table), backup-tooltip-content, global-refresh-controls, open-server-config-button. `requireServerAuth` redirects to `/[locale]/login`; login form and `getHelpUrl` support locale-prefixed paths.
- **Locale detection and request proxy**: `src/proxy.ts` implements automatic locale detection, URL rewriting, and request header management. Detects locale from: (1) URL path (if already prefixed), (2) `NEXT_LOCALE` cookie (persisted preference), (3) `Accept-Language` header (browser language), (4) default "en". Automatically redirects requests without locale prefix to `/[locale]/path`. Sets custom headers (`x-pathname`, `x-search-params`) and cache control headers for dashboard and detail pages. Excludes API routes, `_next`, and static files. Matcher: `/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)`.
- **Root layout locale support**: `src/app/layout.tsx` now dynamically sets HTML `lang` attribute based on detected locale (from cookies, headers, or Accept-Language). Root layout is async and uses `getServerLocale()` helper to determine locale server-side for SEO. ClientLocaleProvider continues to update `document.documentElement.lang` on client-side for consistency. All existing styling, authentication, and theming preserved.
- **Locale switcher in app header**: Added language selection dropdown in the app header with support for all 5 languages (English, Deutsch, Français, Español, Português (BR)). Language preference is saved in `NEXT_LOCALE` cookie and persists across sessions. Switching languages automatically redirects to the same page in the selected locale.
- **Translation validation verbose output**: When `--verbose` is used and validation issues are reported, the script now prints the source and translated segment content (first 200 chars) for each affected segment index, plus a hint to run with `--no-cache` to re-translate and fix cached issues.
- **Translation heading level preservation**: Pipeline now enforces source heading level on translated segments. The model sometimes outputs # or ## when the source has ###; after cleaning we apply `preserveHeadingLevel(source, translated)` so the document outline matches the English source. Applied to both newly translated and cached segments. Prompt updated to state that heading levels must stay identical.
- **LocalizedFileInput component**: Created new `src/components/ui/localized-file-input.tsx` component for locale-aware file input with customizable button and "no file chosen" text, improving file selection UX across all languages.
- **Common translation strings**: Extended `common.content.ts` with additional shared translations:
  - Password visibility controls (show/hide password)
  - GitHub link text
  - Help tooltips with page name support
  - Time units (minutes, hours, days, weeks, months, years)
  - Status labels (enabled/disabled)
  - Cron interval options (disabled, 1min through 2hours)
  - Overdue tolerance values (no tolerance, 5min through 1d)
  - Notification frequency options (one time, every day/week/month)

### Fixed
- **take-screenshots**: Screenshot file path is now resolved with `path.resolve(process.cwd(), ...)` so files are always written under the project root, fixing cases where `screen-main-dashboard-table-mode.png` (and others) were reported as saved but missing on disk when the script ran with a different effective cwd.
- **take-screenshots**: `screen-metrics.png` is now captured on the dashboard page in table mode, immediately after the dashboard table mode screenshot, with no navigation (the metrics chart panel is below the table on the same page).
- **take-screenshots**: Script now measures the time to take each screenshot. The summary list shows the duration next to each screenshot (e.g. `(2.3s)`), and at the end it prints total time and average per screenshot.
- **take-screenshots**: Timing for each screenshot now runs from when the start message is shown (e.g. "Capturing user menu dropdown (user)...") until the file is written. `timedCapture` logs the start message first, then starts the timer, then runs the capture.
- **upgrade-dependencies.sh**: Script now sources nvm (`$NVM_DIR/nvm.sh`) at startup so `nvm install --lts` and `nvm use --lts` work when the script is run directly. nvm is a shell function and is not available in non-interactive script subshells otherwise. Also adds `PNPM_HOME` to PATH when present so pnpm is found when installed via the standalone installer (profile-only PATH).
- **Build**: Components that imported `formatBytes` from `@/lib/utils` now import from `@/lib/number-format` (formatBytes was removed from utils). Updated: `dashboard-summary-cards.tsx`, `overview-cards.tsx`, `metrics-charts-panel.tsx`, `server-detail-summary-items.tsx`.
- **Build**: Suppressed webpack "Critical dependency: the request of a dependency is an expression" warning for `@ts-morph/common` (pulled in by next-intlayer) via `next.config.ts` ignoreWarnings.
- **Detail page initial load**: Server detail page now clears request/data cache before fetching so overdue message and other data show on first load instead of only after the first auto-refresh. Aligns server render with `/api/detail/[serverId]` behaviour.
- **Docs translation persistence**: Some translated segments (e.g. heading "# Development Setup" → "# Configuration de développement") were not persisted for fr/es/pt-BR because `removeAppendedContent` treated the translated heading "Configuration de développement" as document-start content and cut the segment to empty, which was then cached. Removed all response cleanup (cleanTranslatedContent, removeAppendedContent, preserveHeadingLevel); cache now stores and returns raw API output. Line-count validation added to warn when source and translated segment line counts differ.
- **Docs code-block anchors**: Removed erroneous Docusaurus anchors (`{#...}`) from comment lines inside fenced code blocks in `documentation/docs/` (e.g. `# Push the updated master branch {#push-the-updated-master-branch}` → `# Push the updated master branch`). Heading anchors outside code blocks are unchanged.
- **Spanish translations**: Fixed Spanish translations for overdue notifications and configuration settings to ensure consistency and accuracy.
- **Docs translate splitter**: Do not send standalone `<br/>` or Markdown thematic breaks (`---`) to the LLM; they are structural-only segments and caused the model to return unrelated “getting started” content, which then polluted translations.
- **Docs translate splitter**: Treat any single-line HTML / non-text-only segment as non-translatable to avoid LLM hallucinations on structural markup.
- **Docs translate splitter**: Allow normal prose lines that contain inline HTML/MDX (e.g. `<IconButton ... />`) to be translated; only structural/no-text single-line segments are skipped.
- **take-screenshots user menu**: User menu dropdown capture no longer fails with "Could not select user menu button element". The script was tagging the loading-state button (User icon + "Loading" span), then the DOM was replaced when user loaded and the selector pointed at a removed node. The app header user menu trigger now has `data-screenshot-target="user-menu-trigger"` and the script waits for that selector (only present after user is loaded) before clicking.
- **take-screenshots screen-metrics.png**: Metrics chart screenshot was never created because `captureMetricsChart` was defined but never called. The script now invokes it in Phase B after the available-backups modal capture and records success/failure for `screen-metrics.png`. Chart detection now waits for Recharts/canvas to render and includes Recharts class selectors when finding the metrics card.
- **take-screenshots user-menu screenshots**: User menu (admin and user) captures were failing because the blank page was loaded with `domcontentloaded` so auth/me had not completed and the user-menu trigger (with `data-screenshot-target`) was not yet in the DOM. Navigation to `/blank` now uses `networkidle0`, and the wait for the user-menu trigger timeout is increased to 15s.
- **Docs translate cache cleanup**: Purge cached segment translations whose `source_text` is a structural single-line (HTML/tag-only or non-text), which previously caused the model to return unrelated full-document content when asked to “translate” `<br/>`.



### Changed
- **take-screenshots script speed**: Reduced execution time by (1) removing or shortening many `delay()` calls (e.g. after Escape, after navigation, popover/modal waits, settings tab waits), (2) using `waitUntil: 'domcontentloaded'` instead of `networkidle0` for `/blank`, `/login`, and settings pages, (3) adding optional `skipNavigation` to capture functions and consolidating navigations: Phase A navigates to `/blank` once then runs collect-button, Duplicati config, and user-menu captures without re-navigating; Phase B reuses the detail page for backup-history and available-backups-modal after the initial detail goto.
- **take-screenshots --locale**: Optional `--locale` argument to capture screenshots for one or more locales (comma-separated). Example: `tsx scripts/take-screenshots.ts --locale en,de`. If omitted, all locales are used. Documented in documentation-tools.md.
- **take-screenshots --help**: `-h` or `--help` prints usage (options, env vars, examples) and exits; checked before password validation so help works without setting env.
- **Translation consolidation**: Refactored components to use common translations from `common.content.ts` instead of component-specific translations for better consistency:
  - `overdue-monitoring-form`: Now uses common translations for time units, intervals, tolerance values, and frequency options
  - `backup-notifications-form`: Updated to use common translations for bulk operations (additional destinations, backups selected, clear selection, bulk edit, bulk clear)
  - `app-header`: Uses common translations for help tooltips
  - `display-settings-form`: Removed redundant translations in favor of common ones
- **Code cleanup**: Removed deprecated functions from `src/lib/utils.ts`:
  - `formatNumber()` (use `formatNumber` from `@/lib/number-format` instead)
  - `formatBytes()` (use `formatBytes` from `@/lib/number-format` instead)
  - `formatSQLiteTimestamp()` (use `formatSQLiteTimestamp` from `@/lib/date-format` instead)
  These functions were marked as deprecated and have been replaced by locale-aware versions in dedicated modules.


### Improved
- **Screenshot script locale-stable locators**: Added `data-screenshot-target` (and `data-overview-panel-state` on the overview toggle) to UI elements so the documentation screenshot script finds them reliably in all locales (en, de, fr, es, pt-BR). App: collect button (`collect-button`), Duplicati configuration trigger (`duplicati-configuration-trigger`), overview side panel toggle (`overview-side-panel-toggle` with `data-overview-panel-state`), settings notifications bulk bar (`settings-notifications-bulk-bar`), and Clear Selection button (`settings-notifications-clear-selection`). Script: `take-screenshots.ts` now uses only these attributes instead of translated text, title, or aria-label for collect button, Duplicati trigger, overview panel state/toggle, bulk bar bounds, and clear-selection click.
- **Date/Time Localization**: Enhanced date and time formatting with locale-aware utilities. Created `src/lib/date-format.ts` with locale-specific date/time formatting functions:
  - Date formats: English (MM/DD/YYYY), German (DD.MM.YYYY), French/Spanish/Portuguese (DD/MM/YYYY)
  - Time formats: 12-hour format for English, 24-hour format for German, French, Spanish, and Portuguese
  - Updated all date displays across the application to use locale-aware formatting:
    - Dashboard table (last backup dates, expected backup dates, overdue check times)
    - Server backup table (backup dates with relative time)
    - Chart components (tooltips and X-axis labels in overview and metrics charts)
    - Backup tooltip content (last backup date, expected backup date)
    - Server detail summary items (expected backup date formatting)
    - Overdue monitoring form (next run dates, last backup timestamps)
  - Functions: `formatDate()`, `formatTime()`, `formatDateTime()`, `formatDateForChart()`, and enhanced `formatSQLiteTimestamp()` with locale support
- **Number Localization**: Enhanced number formatting with locale-aware utilities. Created `src/lib/number-format.ts` with locale-specific number formatting functions:
  - Number formats: English (1,234.56), German (1.234,56), French (1 234,56), Spanish/Portuguese (1.234,56)
  - Updated all number displays across the application to use locale-aware formatting:
    - Dashboard summary cards (server counts, backup counts, file sizes)
    - Server detail summary items (backup statistics, file counts)
    - Backup tooltip content (file counts, backup versions)
    - Overview cards (total file counts)
    - Chart components (Y-axis labels and tooltips in overview and metrics charts)
  - Functions: `formatNumber()`, `formatInteger()`, `formatDecimal()`, `formatBytes()`, `formatCurrency()`, and `formatPercentage()` with locale support
  - Updated existing `formatNumber()` and `formatBytes()` in `utils.ts` to accept optional locale parameter for backward compatibility (now removed in favor of dedicated modules)
- **Internationalization consistency**: Improved translation usage across components:
  - Components now consistently use common translations for shared strings (time units, intervals, status labels)
  - Better separation between component-specific and common translations
  - Improved locale-aware week day ordering in overdue monitoring form
- **UI improvements**:
  - Increased server filter width in backup notifications form (260px → 360px) for better usability
  - Enhanced bulk selection UI with proper pluralization support for backup counts
  - Improved help tooltip text with page name context
- **RTL (Right-to-Left) Support Preparation**: Added foundation for future RTL language support:
  - Created `src/lib/rtl-utils.ts` with RTL detection utilities (`isRTL()`, `getTextDirection()`, `getLogicalProperties()`)
  - Created `src/hooks/use-rtl.ts` hook for RTL-aware components
  - Added CSS variables in `globals.css` for RTL-aware styling (direction, text-align, margins, padding, borders)
  - Added RTL utility classes (`.rtl-safe-ml`, `.rtl-safe-mr`, `.rtl-safe-pl`, `.rtl-safe-pr`, `.rtl-safe-text-left`, `.rtl-safe-text-right`, etc.)
  - Updated `locale-context.tsx` and root `layout.tsx` to automatically set `dir` attribute based on locale
  - Added icon mirroring classes (`.rtl-mirror`, `.rtl-flip-icon`) for directional icons
  - Updated navigation components (app-header) to use RTL-aware icon classes
  - All current languages (en, de, fr, es, pt-BR) are LTR, but infrastructure is ready for future RTL languages (Arabic, Hebrew, etc.)



### Removed
- **Test and documentation files**: Removed obsolete development files:
  - `dev/phase4-testing-checklist.md`
  - `dev/phase4-testing-guide.md`
  - `dev/phase4-testing-results.md`
  - `dev/session-ses_4364.md`
  - `dev/string-extraction-document.md`

