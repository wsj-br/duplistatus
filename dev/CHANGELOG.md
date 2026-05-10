# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Instructions:** don't create new sections, be concise and only record user facing changes.


## Unreleased

### Added
- **Theme**: Display Settings includes **System (follow OS)** alongside light and dark. The app stores a **theme preference** and applies the effective light/dark class from `prefers-color-scheme` when set to system; the root layout inline script reads the same `theme:user-*` / `theme:anonymous` keys. Export **`getResolvedSystemTheme()`** from **`src/contexts/theme-context.tsx`** for OS detection.

### Changed
- **Theme (Display Settings)**: Theme choice is a **button group** with Light / Dark / System; the status line sits on the **same row** as the group (wraps on narrow viewports).
- **`usePrefixWithLocale`**: Removed unused hook from `src/contexts/locale-context.tsx` (no call sites).
- **Notifications i18n**: Removed **`src/lib/status-translations.ts`** (static imports of **`de.json`** / **`fr.json`** / **`es.json`** / **`pt-BR.json`**). **`src/lib/notifications.ts`** uses **`getServerI18nForLanguage()`** from **`src/lib/i18n-server.ts`** and **`i18n.t()`** for backup status labels so server code matches the **`ai-i18n-tools`** stack (`setupKeyAsDefaultT`, manifest loaders).
- **Legacy URL locale removal**: Dropped `LOCALE_REGEX` and client-side “strip locale prefix” logic (`global-refresh-context.tsx`, `global-refresh-controls.tsx`); pathnames are canonical. Root layout SSR locale no longer infers locale from the first path segment (cookie + `Accept-Language` only). `AppHeader` treats only `/` as the dashboard for “return” chrome. `src/proxy.ts` still 308-redirects old `/{locale}/...` bookmarks and sets `NEXT_LOCALE` (documented as legacy-only). `open-server-config-button.tsx` no longer references locale-prefixed paths.
- **Help links**: `src/lib/helpMapper.ts` no longer strips a legacy locale prefix from `pathname`; routes match the cookie-driven app URLs directly.
- **RTL**: Removed `src/lib/rtl-utils.ts` and unused `src/hooks/use-rtl.ts`. Dropped app-level RTL helpers from `src/lib/locales.ts`; **`ai-i18n-tools/runtime`** already provides **`getTextDirection`** (bundled locale catalog + **`RTL_LANGS`**), **`applyDirection`** (used in **`src/i18n.ts`**, **`src/lib/i18n-server.ts`**, **`src/contexts/locale-context.tsx`**). **`src/app/layout.tsx`** uses **`getTextDirection`** from the runtime package for SSR **`<html dir>`** (same logic as **`applyDirection`** on the client).
- **Hardcoded locale cleanup**: Removed remaining hardcoded `'en-GB'` literals and the duplicated `["en-GB","de","fr","es","pt-BR"]` arrays/`LOCALE_COOKIE_NAME = "NEXT_LOCALE"` constants. Affected files now consume `SOURCE_LOCALE`, `LOCALE_COOKIE_NAME`, `LOCALE_CODE_LIST`, `isSupportedLocale`, and `LocaleCode` directly from `src/lib/locales.ts`: `src/proxy.ts` (uses `LOCALE_CODE_LIST` + `SOURCE_LOCALE` for cookie/`Accept-Language` detection and source-base mapping), `src/app/layout.tsx`, `src/components/i18n-provider.tsx`, `src/contexts/locale-context.tsx`, `src/components/app-header.tsx` and `src/app/login/page.tsx` (locale dropdown labels derived via `Object.fromEntries(LOCALES.map(...))`), `src/components/settings/notification-templates-form.tsx`, `src/components/metrics-charts-panel.tsx`, `src/components/dashboard/overview-charts-panel.tsx`, `src/lib/utils.ts`, `src/lib/notifications.ts`, `src/lib/db-utils.ts`, `src/app/api/configuration/templates/defaults/route.ts`, `src/lib/helpMapper.ts`, and `src/lib/default-config.ts` (`isValidTemplateLanguage` now delegates to `isSupportedLocale`; templates map keyed by `[SOURCE_LOCALE]`).
- **Locale parsing**: Single implementation in **`src/lib/locales.ts`** (`parseLocaleTag`, `resolveLocalePreference`, `resolveLocaleFromAcceptLanguage`). Removed **`normalizeLocale`** from **`src/proxy.ts`** / **`src/lib/i18n-server.ts`** and inlined **`Accept-Language`** handling duplicated with **`src/app/layout.tsx`**; root layout and **`i18n-provider.tsx`** now use the same cookie/path rules (case-insensitive tags only).
- **Legacy locale typos**: Removed special handling for mistaken codes such as **`en-gb-gb`** / **`en-GB-GB`**; only configured **`ui-languages.json`** codes (matched case-insensitively) are accepted.
- **Server i18n**: **`src/lib/i18n-server.ts`** matches the client bootstrap in **`src/i18n.ts`**: **`ai-i18n-tools/runtime`** default export, **`makeLocaleLoadersFromManifest`** + dynamic **`../locales/<code>.json`** imports from **`ui-languages.json`**, **`makeLoadLocale`** for translation bundles, and **`applyDirection`** on **`languageChanged`** (replacing static imports of every locale JSON).
- **Locale utilities**: **`src/lib/intl-locale.ts`** removed. **`src/lib/date-format.ts`** and **`src/lib/number-format.ts`** pass UI / format locale codes directly to **`Intl`** (no separate locale map); **`SOURCE_LOCALE`** is used for defaults and fallbacks instead of hardcoded **`en-GB`**.
- **Date/time formatting**: `src/lib/date-format.ts` no longer maintains a per-locale table of `Intl.DateTimeFormatOptions`. Dates and times use standard **`dateStyle: 'short'`** / **`timeStyle: 'short'`** with **`Intl`**, using the same locale strings as number formatting.

### Fixed
- **Spanish "in the future" string**: `src/lib/utils.ts` returned `'en-GB el futuro'` for Spanish locales (an erroneous find/replace). Restored to `'en el futuro'`.
- **Monday-first locale prefixes**: `src/lib/utils.ts` listed `'en-GB-gb'`, `'en-GB-au'`, `'en-GB-nz'` in the Monday-first locale prefix list (also a bad find/replace). Restored to `'en-gb'`, `'en-au'`, `'en-nz'` so English (UK/AU/NZ) browsers correctly default to Monday as the first day of the week.
- **Production build (`/_not-found`)**: Server code imported **`SOURCE_LOCALE`** / **`LOCALE_COOKIE_NAME`** from **`@/i18n`**, which executes **`initReactI18next`** at module load and broke the server bundle during static generation (**`createContext is not a function`**). **`LOCALE_COOKIE_NAME`** is now exported from **`src/lib/locales.ts`** next to **`SOURCE_LOCALE`**; **`src/app/layout.tsx`**, **`src/lib/i18n-server.ts`**, and **`src/lib/status-translations.ts`** import from **`@/lib/locales`**. **`src/i18n.ts`** re-exports both constants for bundles that already load the client i18n instance.
- **Backup monitoring (`backup-monitoring-form.tsx`)**: Resolved **`react-hooks/exhaustive-deps`** by memoizing **`getServersWithBackupAndSettings`** with **`useCallback`** and depending on it from the **`filteredServers`** **`useMemo`**.

### Changed
- **Locale consolidation**: Consolidated locale definitions across the codebase to use a single source of truth from `src/locales/ui-languages.json`. Created `src/lib/locales.ts` with shared utilities (`LOCALE_CODE_LIST`, `LABEL`, `ENGLISH_NAME`, `LOCALE_REGEX`, `getLocaleLabel()`, `getLocaleEnglishName()`, `isSupportedLocale()`). Removed duplicate `SOURCE_LOCALE` definition from `src/i18n-config.ts` (now re-exported from `src/i18n.ts`). Updated 12 files to use shared locale utilities. Language dropdowns now use the `label` field (native language name like "Deutsch"), while template language selector uses `englishName` field (English name like "German").



### Fixed
- **build-local script**: Fixed the build-local script to copy the static files to the standalone directory. Simplify the script to use the pos-build.sh script.

### Added
- **Format locale override**: Users can now select a formatting locale independently of their UI language in Settings > Display Settings using a searchable combobox (416 locales supported). Date, time, and number formatting across the dashboard, server details, and settings panels respects the selected format locale. A live preview shows formatted samples on selection.

### Changed
- **Locale code**: English UI / cookie / i18n source locale is consistently **`en-GB`** (replaced the mistaken `en-GB-GB` string). `src/proxy.ts`, `src/app/layout.tsx`, `src/i18n.ts`, `src/i18n-config.ts`, `src/locales/ui-languages.json`, header/refresh/detail helpers, and related defaults were updated. `Accept-Language` handling in the root layout now maps the primary tag `en` to `en-GB` (it compared to `en-GB` before, which never matched).

### Fixed
- **i18n tooltip issue**: In Settings > Servers, the password change tooltip was showing "[object Object]" instead of the correct text. Changed from `wrapI18nWithKeyTrim` to `setupKeyAsDefaultT` in `src/i18n.ts` and `src/lib/i18n-server.ts` to properly handle translation key resolution. Updated `dev/TODO.md`.
- **Dashboard server filter**: The home dashboard filter now matches server id, URL, and any backup job name (cards and table use `src/lib/dashboard-server-filter-match.ts`), so queries like a backup name no longer hide all rows when the server label did not match. Fixed overview card grid not updating when only the filter changed (`OverviewCards` memo comparator omitted `serverFilter`).


### Added
- **Server filtering**: Added filter input to server lists in Settings > Backup Monitoring, Settings > Servers, and the main Dashboard (both card and table views). Users can filter servers by name, alias, and backup name (where applicable) to quickly find specific servers.


### Changed
- **Dashboard server filter**: The search field for filtering servers on the home dashboard is shown in the **app header** (with auto-refresh and toolbar actions) instead of above the overview/table content; state is shared via `DashboardServerFilterProvider` in `conditional-layout.tsx` (`src/contexts/dashboard-server-filter-context.tsx`). When the query is empty, the control shows **only the search icon**; hover or click expands the text field (`ServerFilterInput` with `variant="collapsible"`).
- **Next expected backup / overdue**: `GetNextBackupRunDate` (`src/lib/server_intervals.ts`) now advances **day/week/month/year** intervals and weekday checks in **UTC** (`setUTCDate`, `getUTCDay`, …) instead of local `setDate`/`getDay`, avoiding a **one-hour UTC drift** when the host timezone crosses DST (e.g. Europe/London GMT→BST). Documented in `dev/OVERDUE_DETECTION_ALGORITHM.md`.
- **Default overdue tolerance**: New installs and defaults now use **`2h`** instead of **`1h`** (`src/lib/default-config.ts`, `src/lib/db.ts` / `src/lib/db-migrations.ts` initial config paths).
- **ESLint**: Ignore **`.intlayer/**`** (generated). Turn off React Compiler–specific **`react-hooks/*`** rules that flag common mount/sync/fetch patterns; remove obsolete **`eslint-disable-next-line react-hooks/set-state-in-effect`** comments (auto-fixed).
- **Tooling**: **`scripts/upgrade-dependencies.sh`** aligns with the **ai-i18n-tools** upgrade flow: prefer **`source ./scripts/upgrade-dependencies.sh`** so **nvm** applies to the shell (**`CI=1`** or **`DUPLISTATUS_UPGRADE_ALLOW_EXEC=1`** when executing directly); **`scripts/upgrade-tools.sh`** upgrades nvm/Node LTS/globals; **`eslint-react-peers-allow-eslint10.js`** gates **`npm-check-updates`** so the ESLint stack is not bumped past React plugin peers; **`documentation/`** uses the **same workspace lockfile** as the app (no nested `--ignore-workspace` install).
- **i18n**: **`SOURCE_LOCALE`** and **`LOCALE_COOKIE_NAME`** are defined in **`src/lib/locales.ts`** (with **`SOURCE_LOCALE`** matching **`ai-i18n-tools.config.json`**); **`src/i18n.ts`** re-exports them for **`@/i18n`** consumers. Removed **`src/i18n/constants.ts`** and the **`src/i18n/`** folder.
- **UI copy / i18n**: Removed **`src/i18n/generated-hooks/`** and **`src/i18n/backup-detail-page-translations.ts`**. All UI strings use **`useTranslation().t('…')`** in client components or **`getServerI18n()`** / **`i18n.t('…')`** in Server Components (e.g. backup detail page). Regenerated **`src/locales/strings.json`** metadata via **`pnpm i18n:extract`**.
- **UI copy / i18n**: Removed the shared `useCommonContent()` hook; shared labels (Cancel, Error, time ranges, etc.) now use **`useTranslation().t('…')` inline** at each call site. Deleted `src/i18n/generated-hooks/useCommonContent.ts`.
- **i18n stack**: Replaced Intlayer (`.content.ts`, locale-prefixed routes) with **i18next** + **ai-i18n-tools** (`ai-i18n-tools.config.json` at repo root). UI strings use English keys in `t('…')` / generated hooks; flat JSON lives under `src/locales/`. App language is cookie-driven (no `/en/…` path segment); legacy URLs redirect via `src/proxy.ts`.
- **Documentation translation**: Removed `documentation/scripts/translate/` and `translate.config.json`; `documentation/package.json` scripts delegate to root `pnpm i18n:*` commands. Glossary ties UI terms via `glossary.uiGlossary` → `src/locales/strings.json`; optional overrides in `documentation/glossary-user.csv`.
- **Status labels in notifications**: `src/lib/status-translations.ts` reads the same flat locale JSON as the UI.
- **Release notes**: Added documentation/docs/release-notes/1.3.2.md and linked it in the release notes sidebar (sidebars.ts).
- **Documentation**: Updated Docker script names to match package.json: `docker-up` → `docker:up`, `docker-down` → `docker:down`, `docker-clean` → `docker:clean`, `docker-devel` → `docker:devel` in AGENTS.md and documentation/docs (setup.md, devel.md, release-management.md).
- **Documentation**: Updated package versions to match package.json in AGENTS.md, documentation/docs/development/setup.md, documentation/docs/development/development-guidelines.md, and .cursor/rules/project-rule.mdc: pnpm 10.30.3, TypeScript ^5.9.3, Next.js ^16.1.6, React ^19.2.4, Tailwind CSS ^4.2.1, intlayer family ^8.1.8, lucide-react ^0.575.0, react-day-picker ^9.14.0, react-hook-form ^7.71.2, ESLint ^9.16.0, webpack ^5.105.3.

### Deprecated


### Removed


### Fixed
- **Documentation (Docusaurus)**: With `future.v4: true`, MDX v1 compatibility flags (including `headingIds`) default off, so classic `{#heading-id}` in `.md` files fails MDX compilation. Set `markdown.mdx1Compat` (`comments`, `admonitions`, `headingIds`) in `documentation/docusaurus.config.ts` to match pre–v4-shortcut defaults so `{#id}` works again alongside `{/* #id */}`.
- **Documentation (Docusaurus start)**: Fixed `pnpm start:en` failing with `TypeError: pathRegexp is not a function` by pinning Express to version 4.21.0 (which uses compatible `path-to-regexp@0.1.10`). The `ai-i18n-tools@1.4.0` dependency was pulling in Express 5.x which has breaking changes incompatible with webpack-dev-server used by Docusaurus. Added explicit `express: 4.21.0` override in `pnpm.overrides`.
- **Documentation (Docusaurus build)**: Escaped French `documentation/i18n/fr/.../intro.md` heading IDs (`{#développement}`, `{#crédits}`) so MDX does not treat them as expressions. Updated `documentation/docs/api-reference/api-endpoint-list.md` anchors to match API pages’ `{/* #…- */}` IDs (`---api…` separator, trailing dash). Updated English docs links (installation, migration, user guide, release notes, audit logs retention) to use the same trailing-dash anchor IDs—`pnpm build` in `documentation/` completes with no broken-anchor warnings.
- **Next.js 16 proxy**: Removed `src/middleware.ts` so only `src/proxy.ts` is used (avoids "middleware and proxy both detected" build error).
- **Login logo import**: Corrected static import path to `public/images/duplistatus_logo.png` from `src/app/login/page.tsx`.
- **pnpm install warnings**: Resolved three install-time warnings: (1) unmet peer `webpack@5.104.1` from `next-intlayer` > `@intlayer/webpack` (project has webpack 5.105.3) by adding `pnpm.peerDependencyRules.allowedVersions.webpack: "5"` in root `package.json`; (2) deprecated subdependencies `prebuild-install@7.1.3` (from better-sqlite3) and `whatwg-encoding@3.1.1` (from documentation > docusaurus-search-local > cheerio) by adding `pnpm.allowedDeprecatedVersions` for both so install runs without warnings.
- **application-logs-viewer useEffect exhaustive-deps**: Resolved react-hooks/exhaustive-deps warning for the auto-scroll effect. `logData` is intentionally omitted from the dependency array so we only scroll when auto-scroll or selected file changes, not on every poll; new-line scrolling is handled in loadLogs. Added an eslint-disable-next-line with a short comment.
- **Build warning vscode-languageserver-types (documentation)**: Suppressed Webpack "Critical dependency: require function is used in a way in which dependencies cannot be statically extracted" for transitive dependency `vscode-languageserver-types` (from intlayer-editor) in the **documentation** (Docusaurus) build via an inline plugin in `documentation/docusaurus.config.ts` that adds `ignoreWarnings`. The warning occurs during the docs build only, not the main app.

### Security
- **pnpm overrides (uuid, postcss)**: Added root **`pnpm.overrides`** so transitive **`uuid`** is **≥14.0.0** (GHSA-w5hq-g745-h8pq: sockjs/mermaid under Docusaurus) and **`postcss`** is **≥8.5.10** (GHSA-qx2v-qp2m-jg93: Next.js dependency chain).
- **Dependabot dependency updates (documentation)**: Merged two Dependabot PRs to address vulnerabilities in the documentation workspace: (1) bump `ajv` in `/documentation` (8.17.1→8.18.0 and 6.12.6→6.14.0); (2) bump `fast-xml-parser` in `/documentation` (5.3.5→5.3.6). Both were merged via the dependabot multi-update for /documentation.
- **Dependency vulnerabilities**: Fixed 4 high-severity vulnerabilities by adding pnpm overrides:
  - `minimatch >=3.1.4`: Fixes GHSA-3ppc-4f35-3m26 (ReDoS via repeated wildcards), GHSA-7r86-cg39-jmmj (combinatorial backtracking), and GHSA-23c5-xmqv-rm74 (nested extglobs backtracking) in documentation>@docusaurus/core>serve-handler>minimatch.
  - `serialize-javascript >=7.0.3`: Fixes GHSA-5c6j-r48x-rmvq (RCE via RegExp.flags and Date.prototype.toISOString()) in webpack>terser-webpack-plugin>serialize-javascript.







