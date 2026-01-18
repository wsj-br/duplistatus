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



### Removed

