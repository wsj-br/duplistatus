# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.x-Unreleased]

### Added
- **Intlayer i18n dependencies**: Added `intlayer`, `react-intlayer`, and `next-intlayer` (^7.5.14) for Next.js 16 internationalisation support. Target languages: en, de, fr, es, pt-BR.
- **intlayer.config.ts**: Core Intlayer config with locales (en, de, fr, es, pt-BR), default locale English, editor disabled and `applicationURL` http://localhost:8666, and build optimization (tree-shaking) enabled.
- **Next.js + Intlayer integration**: `next.config.ts` now uses `withIntlayerSync` from `next-intlayer/server` for Intlayer webpack integration (aliases, IntlayerPlugin, .node loader). Our webpack customizations (better-sqlite3 externals, watchOptions, resolve, splitChunks, etc.) are composed to run first, then Intlayer's. Standalone output, experimental options, and all existing behaviour preserved. For full build-time tree-shaking of content, `@intlayer/swc` is recommended (optional).
- **Dynamic [locale] routing**: App Router locale segment `src/app/[locale]/` with `generateStaticParams` for en, de, fr, es, pt-BR. Dashboard, detail, detail/backup, settings, login, and blank pages moved under `[locale]`. Root `/` redirects to `/en`. API routes remain at `src/app/api/`.
- **Locale context and helpers**: `ClientLocaleProvider` and `useLocale()` in `src/contexts/locale-context.tsx`; locale derived from pathname, `document.documentElement.lang` set on client. `usePrefixWithLocale()` for building locale-prefixed paths.
- **Locale-aware navigation**: All `Link` and `router.push` updated to use `/[locale]/...` in app-header, conditional-layout, dashboard (table, overview/status/server/overview-cards), server-details (summary-items, backup-table), backup-tooltip-content, global-refresh-controls, open-server-config-button. `requireServerAuth` redirects to `/[locale]/login`; login form and `getHelpUrl` support locale-prefixed paths.
- **Locale detection and request proxy**: `src/proxy.ts` implements automatic locale detection, URL rewriting, and request header management. Detects locale from: (1) URL path (if already prefixed), (2) `NEXT_LOCALE` cookie (persisted preference), (3) `Accept-Language` header (browser language), (4) default "en". Automatically redirects requests without locale prefix to `/[locale]/path`. Sets custom headers (`x-pathname`, `x-search-params`) and cache control headers for dashboard and detail pages. Excludes API routes, `_next`, and static files. Matcher: `/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)`.
- **Root layout locale support**: `src/app/layout.tsx` now dynamically sets HTML `lang` attribute based on detected locale (from cookies, headers, or Accept-Language). Root layout is async and uses `getServerLocale()` helper to determine locale server-side for SEO. ClientLocaleProvider continues to update `document.documentElement.lang` on client-side for consistency. All existing styling, authentication, and theming preserved.

### Fixed



### Changed

 


### Improved
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
  - Updated existing `formatNumber()` and `formatBytes()` in `utils.ts` to accept optional locale parameter for backward compatibility
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

