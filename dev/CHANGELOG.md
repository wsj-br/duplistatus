# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Instructions:** don't create new sections, be concise and only record user facing changes.


## Unreleased

### Fixed
- **Dependency upgrade script**: `source ./scripts/upgrade-dependencies.sh` aborted with `_duplistatus_upgrade_tools: command not found` because `upgrade-tools.sh` still used the old `transrewrt`-era function/variable names and ran on source. The scripts now share consistent, project-neutral names and a define-only mode.

### Changed
- **Dependency upgrade scripts (generic + build-safe + security-aware)**: `scripts/upgrade-dependencies.sh` and `scripts/upgrade-tools.sh` are now project-agnostic (no hardcoded project names; auto-detect the package manager from the lockfile, the workspace packages from `pnpm-workspace.yaml`/`package.json`, and each package's verify command from its `scripts`). Upgrades are build-safe via `npm-check-updates` doctor mode (keeps upgrades that pass `typecheck`+`lint`, reverts those that break the build); security fixes (`audit` + `audit --fix`) take priority, and a vulnerable direct dependency whose safe version breaks the build is force-applied and reported so the code can be made compatible. Added a new shared `scripts/upgrade-common.sh`; removed `scripts/eslint-react-peers-allow-eslint10.js` (its ESLint peer-range check is now embedded). The exec guard env var is renamed `DUPLISTATUS_UPGRADE_ALLOW_EXEC` -> `UPGRADE_ALLOW_EXEC` (`CI=1` still works).
- **Dependencies**: Upgraded `nodemailer` to `9.0.1` (v9's only breaking change — default TLS validation when fetching remote attachment/OAuth2/proxy content — does not affect this app, which sends inline text/HTML only). Also bumped `puppeteer` to `25.1.0`, `eslint-config-next` to `16.2.9`, and `@types/react` to `19.2.17`. ESLint kept on `9.39.4` (latest 9.x) since ESLint 10 is not yet compatible with the `eslint-config-next` toolchain.



## [1.4.2] - 2026-06-18

### Fixed
- **Docker standalone startup crash**: Container crashed at startup with `Cannot find module '.../@swc/helpers/esm/_interop_require_default.js'`. Fixed with two coordinated changes: (1) set `nodeLinker: hoisted` in `pnpm-workspace.yaml` so Next.js `output: 'standalone'` file tracing resolves real (non-symlinked) files and places `@swc/helpers` at top-level `node_modules`; (2) added `outputFileTracingIncludes` for `@swc/helpers/**/*` in `next.config.ts`, since tracing otherwise copied only the package's `cjs/` build and dropped the `esm/` entry that the standalone `require-hook` loads. See vercel/next.js#48017, #65636, #50072.
- **Auth requests on dashboard load**: Current user is fetched once via shared `CurrentUserProvider` instead of each component calling `/api/auth/me` independently (header, password guard, theme/config providers, dashboard widgets).
- **Merge duplicate servers**: Server merge now also consolidates duplicate Duplicati `backup_id` values that share the same `backup_name` on the merged server, preferring the ID from the most recent backup row (target server when available).
- **Audit trail**: Server merge operations (`/api/servers/merge`) are now recorded in the audit log as `servers_merged`.
- **Dashboard duplicate entries**: `getServersSummary` no longer returns multiple rows per backup name when several records share the same latest backup date; fixed malformed React list keys in the dashboard table.

### Changed
- **Merge duplicate servers headers**: The "Target Server (newest)" and "Old Server ID" labels in Settings > Database Maintenance > Merge Duplicate Servers now render as table-header cells (subtle background fill with bottom border, theme-aware) instead of pill/button shapes; removed the muted dark-blue button look.
- **Dev request logs**: `pnpm dev` prefixes Next.js incoming request lines with a compact timestamp (`hh:mm:ss.sss`) via `scripts/dev-log-timestamps.cjs`.
- **Documentation assets**: Moved SVG sources (`duplistatus_dash-cards.svg`, `duplistatus_toolbar.svg`) from `documentation/static/img/` to `documentation/static/assets/` alongside PNG screenshots. English docs now use `../assets/` paths like translated docs; removed `regexAdjustments` SVG path bridge from `ai-i18n-tools.config.json`. Removed stale `duplistatus_dash-table.svg` entry from `svg.sourcePath`.
- **pnpm 11**: Moved `overrides`, `peerDependencyRules`, `allowedDeprecatedVersions`, and `allowBuilds` from `package.json#pnpm` to `pnpm-workspace.yaml` (pnpm 11 no longer reads the `pnpm` field in `package.json`).
- **Next.js**: Pinned `next` to stable `16.2.9` (was `16.3.0-canary.19`).
- **Project docs**: Merged `.cursor/rules/project-rule.mdc` into `AGENTS.md` (single source of guidance). Made the tech-stack / dependency lists in `AGENTS.md`, `documentation/docs/development/development-guidelines.md`, and `documentation/docs/development/setup.md` version-light, pointing to `package.json` as the source of truth so they no longer go stale on dependency upgrades. Removed obsolete `src/i18n/generated-hooks` / `useXxxContent()` references and corrected build (`next build --webpack`), lint (`eslint .`), and docs-path references.



## [1.4.1] - 2026-05-13

### Added
- **Inline Chart Time Range Selector**: Stock-chart-style pill buttons (`1W | 2W | 1M | 3M`) in chart panel headers for quick time range switching without navigating to Display Settings. Shares state with Display Settings via `ConfigContext`.
- **Inline Chart Style Toggle**: Toggle button in `ChartTimeRangeSelector` to switch between line and bar charts directly from the chart panel header. Persisted via `ConfigContext` and synced across all panels.
- **Chart Style setting (issue #54)**: Display Settings includes a "Smooth Lines" / "Bar Chart" toggle. Both modes use time-bucket aggregation instead of linear interpolation. In bar mode, empty periods render no bar.
- **take-screenshots.ts**: Documentation screenshots captured in dark mode. Puppeteer emulates `prefers-color-scheme: dark` and sets the same `theme:user-<id>` localStorage key as the app.
- **take-screenshots.ts**: Uses cookie-based locale switching (`NEXT_LOCALE`) instead of URL prefixes.
- **take-screenshots.ts**: File logging to `dev/take-screenshots-YYYYMMDD-HHMMSS.log`.
- **Theme**: Display Settings includes "System (follow OS)" option. App stores theme preference and applies effective light/dark class from `prefers-color-scheme`.
- **Format locale override (issue #59)**: Users can select a formatting locale independently of UI language in Settings > Display Settings (416 locales supported). Date, time, and number formatting respects the selected format locale with live preview.
- **Server filtering**: Filter input to server lists in Settings > Backup Monitoring, Settings > Servers, and main Dashboard (card and table views).

### Changed
- **Chart Time Range options**: Reduced from 7 options to 4: **1W, 2W, 1M, 3M** (was `2W, 1M, 3M, 6M, 1Y, 2Y, All`). Default is now "1 month".
- **Time range calculations**: Now use rolling day windows: 1W = last 7 days, 2W = last 14 days, 1M = last 30 days, 3M = last 90 days (was calendar-based).
- **Data consolidation by day**: All chart data points consolidated by calendar day before bucketing. Multiple backups on same day aggregated (SUM for cumulative metrics, LAST for storage size, MAX for backup versions).
- **Documentation (issue #40)**: Clarified that Duplicati remote access is optional and only necessary if direct links to Duplicati UI are required.
- **Theme (Display Settings)**: Theme choice is a button group (Light / Dark / System); status line on same row.
- **Dashboard server filter**: Search field moved to app header with auto-refresh and toolbar actions. State shared via `DashboardServerFilterProvider`. Control shows only search icon when empty; hover/click expands text field.
- **Connectivity loss detection**: Added `/api/ping` and a 30-second header-based connectivity probe. Refresh and auto-refresh failures now open the lost-connection modal without exposing raw error text.
- **Next expected backup / overdue**: `GetNextBackupRunDate` now advances day/week/month/year intervals and weekday checks in UTC instead of local time, avoiding one-hour UTC drift when host timezone crosses DST.
- **Default overdue tolerance**: New installs and defaults now use `2h` instead of `1h`.
- **Locale code**: English UI / cookie / i18n source locale consistently `en-GB` (replaced mistaken `en-GB-GB`).
- **Locale consolidation**: Consolidated locale definitions to use single source of truth from `src/locales/ui-languages.json`. Created `src/lib/locales.ts` with shared utilities. Updated 12 files.
- **ESLint**: Ignore `.intlayer/**` (generated). Turn off React Compiler-specific `react-hooks/*` rules.
- **Tooling**: `scripts/upgrade-dependencies.sh` aligns with ai-i18n-tools upgrade flow. `scripts/upgrade-tools.sh` upgrades nvm/Node LTS/globals.
- **i18n**: `SOURCE_LOCALE` and `LOCALE_COOKIE_NAME` defined in `src/lib/locales.ts`. Removed `src/i18n/constants.ts` and `src/i18n/` folder.
- **UI copy / i18n**: Removed `src/i18n/generated-hooks/` and `src/i18n/backup-detail-page-translations.ts`. All UI strings use `useTranslation().t('…')` or `getServerI18n()` / `i18n.t('…')`.
- **UI copy / i18n**: Removed shared `useCommonContent()` hook; shared labels now use `useTranslation().t('…')` inline.
- **i18n stack**: Replaced Intlayer with i18next + ai-i18n-tools. App language is cookie-driven (no `/en/…` path segment); legacy URLs redirect via `src/proxy.ts`.
- **Documentation translation**: Removed `documentation/scripts/translate/`; package.json scripts delegate to root `pnpm i18n:*` commands.
- **Status labels in notifications**: `src/lib/status-translations.ts` reads same flat locale JSON as UI.
- **Documentation locale**: Fixed i18n configuration mismatch. Docusaurus now uses `en-GB` as `defaultLocale`. Removed outdated `i18n/en/` folder.
- **Turbopack NFT warnings**: Reduced "whole project traced" warnings by wrapping runtime `process.cwd()` usage in `path.join(/* turbopackIgnore: true */, …)`.
- **`usePrefixWithLocale`**: Removed unused hook from `src/contexts/locale-context.tsx`.
- **Notifications i18n**: Removed `src/lib/status-translations.ts` static imports. `src/lib/notifications.ts` uses `getServerI18nForLanguage()` and `i18n.t()` to match ai-i18n-tools stack.
- **Legacy URL locale removal**: Dropped `LOCALE_REGEX` and client-side "strip locale prefix" logic. Root layout SSR locale no longer infers from first path segment. `src/proxy.ts` still 308-redirects old `/{locale}/...` bookmarks.
- **Help links**: `src/lib/helpMapper.ts` no longer strips legacy locale prefix.
- **RTL**: Removed `src/lib/rtl-utils.ts` and unused `src/hooks/use-rtl.ts`. App uses `ai-i18n-tools/runtime` `getTextDirection` and `applyDirection`.
- **Hardcoded locale cleanup**: Removed remaining hardcoded `'en-GB'` literals and duplicated arrays. Files now consume from `src/lib/locales.ts`.
- **Locale parsing**: Single implementation in `src/lib/locales.ts`. Removed `normalizeLocale` and inlined `Accept-Language` handling.
- **Legacy locale typos**: Removed special handling for mistaken codes like `en-gb-gb` / `en-GB-GB`.
- **Server i18n**: `src/lib/i18n-server.ts` matches client bootstrap: ai-i18n-tools/runtime default export, `makeLocaleLoadersFromManifest`, dynamic imports, `makeLoadLocale`, `applyDirection`.
- **Locale utilities**: Removed `src/lib/intl-locale.ts`. `src/lib/date-format.ts` and `src/lib/number-format.ts` pass locale codes directly to `Intl`.
- **Date/time formatting**: `src/lib/date-format.ts` no longer maintains per-locale `Intl.DateTimeFormatOptions` table. Uses standard `dateStyle: 'short'` / `timeStyle: 'short'`.

### Fixed
- **User UI preferences not persisted on page refresh**: Fixed race conditions in `overviewSidePanel`, `chartTimeRange`, `chartStyle` settings. `useCurrentUser()` now returns `undefined` for loading, `null` for unauthenticated. Setters now save inside `setState` callbacks. `isInitialized` starts as `false`.
- **Periodic `/api/ping` connectivity health check**: Moved ping polling out of `AppHeader` into `ConnectivityErrorProvider`, ensuring the periodic health probe runs consistently and responds to browser online/offline events.
- **Chart infinite loop on /detail page**: Fixed re-render loop from `startDate`/`endDate` creating new Date objects on every render. Wrapped in `useMemo` with `chartTimeRange` as only dependency.
- **Too many chart data points**: Charts now enforce maximum 30 data points. `bucketChartData()` dynamically calculates optimal bucket sizes for ranges exceeding 30 days. Data consolidated by calendar day before bucketing.
- **Chart tooltip shows time**: Tooltip now displays only date (e.g., "5/12/26") instead of date and time.
- **OverviewChartsPanel ignoring time range filter**: Fixed panel displaying all data points regardless of selected time range. Simplified architecture by removing external `chartData` prop; panel now fetches its own data from API with proper time range parameters.
- **OOM crash on backup details (issue #62)**: Prevented `JavaScript heap out of memory` by optimizing queries and UI rendering. `getServerBackups` no longer loads massive logs; fetched on-demand via `getBackupLogsById`. Added truncation limit (max 1000 lines).
- **Backup version parsing (issue #65)**: `convertTimestampToISO()` now handles all common locale-specific timestamp formats used by Duplicati across different system locales.
- **Spanish "in the future" string**: Restored to `'en el futuro'` (was erroneous `'en-GB el futuro'`).
- **Monday-first locale prefixes**: Restored to `'en-gb'`, `'en-au'`, `'en-nz'` (was bad `'en-GB-gb'`, etc.).
- **Production build (`/_not-found`)**: Fixed server code importing from `@/i18n` which broke server bundle. `LOCALE_COOKIE_NAME` and `SOURCE_LOCALE` now exported from `@/lib/locales`.
- **Backup monitoring**: Resolved `react-hooks/exhaustive-deps` by memoizing `getServersWithBackupAndSettings` with `useCallback`.
- **build-local script**: Fixed to copy static files to standalone directory using post-build.sh.
- **i18n tooltip issue**: Settings > Servers password change tooltip showed "[object Object]". Changed to `setupKeyAsDefaultT` in `src/i18n.ts` and `src/lib/i18n-server.ts`.
- **Dashboard server filter (issue #53)**: Filter now matches server id, URL, and any backup job name. Fixed overview card grid not updating when filter changed.
- **Documentation (Docusaurus)**: Set `markdown.mdx1Compat` for `{#heading-id}` support in MDX v4.
- **Documentation (Docusaurus start)**: Fixed `pnpm start:en` failing with `TypeError: pathRegexp is not a function` by pinning Express to 4.21.0.
- **Documentation (Docusaurus build)**: Escaped French heading IDs and updated anchors to match API pages' `{/* #…- */}` IDs.
- **Next.js 16 proxy**: Removed `src/middleware.ts` so only `src/proxy.ts` is used.
- **Login logo import**: Corrected static import path to `public/images/duplistatus_logo.png`.
- **pnpm install warnings**: Resolved three install-time warnings via `pnpm.peerDependencyRules` and `pnpm.allowedDeprecatedVersions`.
- **application-logs-viewer useEffect exhaustive-deps**: Added eslint-disable-next-line with comment for intentional omission.
- **Build warning vscode-languageserver-types (documentation)**: Suppressed Webpack warning via inline plugin in `documentation/docusaurus.config.ts`.

### Security
- **npm audit vulnerabilities**: Resolved 7 vulnerabilities (1 high, 6 moderate):
  - Updated `next` to `16.3.0-canary.19` to fix `postcss@8.4.31` (XSS)
  - Added `.pnpmfile.cjs` to force `serialize-javascript@^7.0.5` (RCE, DoS)
  - Updated `mermaid` override to `>=11.14.1` (4 moderate vulnerabilities)
  - Added explicit `postcss@^8.5.14` and `serialize-javascript@^7.0.5` dependencies
- **pnpm overrides (uuid, postcss)**: Added root `pnpm.overrides` for transitive `uuid >=14.0.0` and `postcss >=8.5.10`.
- **Dependabot dependency updates (documentation)**: Merged PRs for `ajv` and `fast-xml-parser` vulnerabilities.
- **Dependency vulnerabilities**: Fixed 4 high-severity vulnerabilities via pnpm overrides for `minimatch >=3.1.4` and `serialize-javascript >=7.0.3`.





