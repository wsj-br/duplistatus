# AGENTS.md - duplistatus Project Guide

This file documents essential information for AI agents working in the duplistatus codebase.

## Project Overview

**duplistatus** is a web application for monitoring multiple [Duplicati](https://github.com/duplicati/duplicati) backup servers. It provides a unified dashboard to track backup statuses, history, metrics, and performance across multiple servers with support for notifications via ntfy and SMTP.

## Tech Stack

> **Source of truth for versions**: `package.json` (and `engines` / `packageManager` fields). The list below is intentionally version-light so it stays accurate across dependency upgrades — check `package.json` for exact versions.

| Component            | Notes                                                                                           |
|----------------------|-------------------------------------------------------------------------------------------------|
| Node.js              | See `engines.node` in `package.json` (currently Node 24+)                                       |
| pnpm                 | Enforced via `preinstall` (`only-allow pnpm`); see `engines.pnpm` / `packageManager`            |
| TypeScript           | Strict mode                                                                                     |
| Next.js (App Router) | `output: 'standalone'`                                                                          |
| React & React-DOM    | —                                                                                               |
| Tailwind CSS         | v4 or newer                                                                                     |
| SQLite               | `better-sqlite3`                                                                                |
| i18n                 | i18next + react-i18next; **ai-i18n-tools** (extract + OpenRouter translate for UI + docs + SVG) |
| Radix UI             | `@radix-ui/react-*` primitives                                                                  |
| ESLint               | Flat config (`eslint.config.mjs`) + `eslint-config-next`                                        |
| Prettier             | Not used                                                                                        |

## Architecture

### Main Application
- **Framework**: Next.js App Router with `output: 'standalone'`
- **Production server**: Run `.next/standalone/server.js` (generated during build)
- **Development port**: 8666
- **Production port**: 9666

### Cron Service
- **Location**: `src/cron-service/`
- **Purpose**: Background service for periodic tasks (overdue backup checks, audit-log cleanup, and cached Duplicati version refresh)
- **Development**: Started with the Next.js app by `pnpm dev` (port 8667); use `pnpm cron:dev` alone when you only need the cron process
- **Production**: Runs on port 9667
- **API**: REST endpoints for task management (`/health`, `/trigger/:task`, `/stop/:task`, `/start/:task`, `/reload-config`)
- **Version refresh**: The `duplicati-version-refresh` task runs in UTC; its schedule is overlaid from the `duplicati_version_check` configuration rather than persisted only in `cron_service`.

### Database
- **Type**: SQLite via `better-sqlite3`
- **Location**: `data/backups.db`
- **Security key**: `data/.duplistatus.key` (must have 0400 permissions)
- **Migrations**: Handled automatically in `src/lib/db-migrations.ts`
- **Security schema**: Fresh databases create the `api_keys` and `daily_summary_deliveries` tables in `src/lib/db.ts`; upgrades create them through migrations `4.1` and `4.2`.
- **Configuration**: JSON configuration and caches are stored in the `configurations` table, including API-key, IP-allowlist, upload-limit, and Duplicati-version settings.

### Internationalization (i18n)
- **Runtime**: i18next (`src/i18n.ts`, `I18nProvider` in root layout). Client components use **`useTranslation()` + `t('Exact English phrase')`** at the point of use (English source string = key). Server Components and other non-React code use **`getServerI18n()`** from `src/lib/i18n-server.ts` and **`i18n.t('…')`** with the same literal keys. **Do not** add feature-level wrapper hooks or shared “content” objects for UI strings — **`ai-i18n-tools extract`** scans literal `t('…')` in `src/`.
- **Catalog / flat bundles**: `src/locales/strings.json`, `de.json`, `fr.json`, `es.json`, `pt-BR.json`, `hi.json`, `zh-Hans.json` (updated via `pnpm i18n:extract` and translate commands).
- **Default notification templates**: `src/locales/templates/en-GB.json` (source) and per-locale `{locale}.json` outputs (updated via `pnpm i18n:translate:json`); loaded by `src/lib/default-notification-templates.ts`.
- **Config**: `ai-i18n-tools.config.json` at repo root (`sourceLocale`: `en-GB`, `targetLocales`, UI roots, Docusaurus paths, glossary, `cacheDir`).
- **URLs**: No locale prefix in app routes; language is stored (e.g. `NEXT_LOCALE` cookie) and applied with `loadLocale` + `i18n.changeLanguage`. Legacy `/{locale}/…` URLs are redirected at the edge (see `src/proxy.ts`).

## Essential Commands

> **DO NOT run these commands automatically.** Run `pnpm lint` (and `pnpm typecheck`) before suggesting code changes.

```bash
# Dependencies
pnpm install              # Install dependencies (enforced via preinstall)

# Development
pnpm dev                  # Start Next.js (8666) and cron (8667) together; CTRL-C stops both
pnpm dev:next             # Next.js dev server only (port 8666)
pnpm cron:dev             # Cron service only, watch mode (port 8667)

# Build & Production
pnpm build                # Production build (next build --webpack; pre-checks in scripts/pre-checks.sh)
pnpm start                # Production server on port 9666
pnpm cron:start           # Start cron service in production mode

# Code Quality (REQUIRED before suggesting changes)
pnpm lint                 # Run ESLint
pnpm typecheck            # Run TypeScript checks

# Testing & Utilities
pnpm generate-test-data   # Generate test backup data
pnpm validate-csv-export  # Validate CSV export functionality
pnpm validate-daily-summary  # Validate daily-summary schedule, snapshot, renderer, ledger, and 4.2 migration
pnpm take-screenshots     # Take documentation screenshots
pnpm notices:write        # Regenerate root NOTICES from production deps

# Docker
pnpm docker:up            # Build and start Docker containers
pnpm docker:down          # Stop Docker containers
pnpm docker:clean         # Clean Docker resources

# i18n (repo root — OpenRouter: set OPENROUTER_API_KEY)
pnpm i18n:extract         # Scan t('…') and update strings catalog
pnpm i18n:sync            # Sync per ai-i18n-tools
pnpm i18n:translate       # translate-ui + translate-svg + translate-docs + translate-json
pnpm i18n:translate:ui
pnpm i18n:translate:svg
pnpm i18n:translate:docs
pnpm i18n:translate:json
pnpm i18n:status
pnpm i18n:editor          # ai-i18n-tools editor (if used)
pnpm i18n:glossary-generate

# Documentation package (delegates to root for translate)
cd documentation && pnpm translate   # same as pnpm i18n:translate at root
```

## Code Organization

```
src/
├── app/                    # Next.js App Router (no locale segment)
│   ├── api/                # API routes
│   ├── layout.tsx          # Root layout (I18nProvider, locale context)
│   └── page.tsx            # Root page
├── components/             # React components
│   ├── ui/                 # Base UI components (shadcn/ui)
│   ├── dashboard/          # Dashboard components
│   ├── settings/           # Settings page components
│   ├── server-details/     # Server detail page components
│   └── *.tsx               # Top-level component files
├── i18n.ts                 # i18next runtime init (key-as-default t())
├── locales/                # strings.json + per-locale flat JSON (de, es, fr, pt-BR, hi, zh-Hans); en-GB.json is source-locale plural forms only; templates/ holds default notification template JSON
├── contexts/               # React contexts
│   ├── locale-context.tsx
│   ├── theme-context.tsx
│   └── ...
├── hooks/                  # Custom React hooks
├── lib/                    # Shared utilities
│   ├── db.ts               # Database access
│   ├── db-utils.ts         # Configuration helpers and derived dashboard data
│   ├── types.ts            # TypeScript interfaces
│   ├── auth.ts             # Authentication utilities
│   ├── api-key.ts          # API-key generation, hashing, masking, and redaction
│   ├── api-key-auth.ts     # External API-key authentication and rate limits
│   ├── ip-allowlist.ts     # CIDR allowlists, trusted proxies, and request classification
│   ├── ip-utils.ts         # TCP peer-IP and audit-IP helpers
│   ├── duplicati-version.ts         # Duplicati version parsing and comparison
│   ├── duplicati-version-service.ts # GitHub release cache refresh
│   ├── notifications.ts    # Notification logic
│   └── ...
├── proxy.ts                # Locale handling, legacy redirects, and IP-allowlist enforcement
└── cron-service/           # Background cron service

data/                       # Data directory (SQLite, keys)
documentation/              # Docusaurus documentation
scripts/                    # Build and utility scripts
├── peer-ip.cjs             # Trusted TCP peer header preload for allowlists
└── dev-preload.cjs         # Development preload combining peer-IP and request logging
ai-i18n-tools.config.json   # i18n tooling (UI + docs + SVG)
```

## Code Conventions

### Code Quality Rules
1. **Never use `any`** - Always define proper TypeScript interfaces
2. **Follow DRY** - Reuse functions from `src/lib/` instead of duplicating logic
3. **Preserve security** - Do not modify `.duplistatus.key` permission checks, API-key hashing, peer-header stripping, trusted-proxy validation, or proxy allowlist enforcement
4. **Run linter** - Use `pnpm lint` before suggesting code changes
5. **Update docs** - When changing ports, env vars, setup, or user-visible behavior, update the relevant English docs anywhere under `documentation/docs/` (including `development/`, `installation/`, `user-guide/`, and `api-reference/`)

### TypeScript
- **Strict mode**: Enabled
- **No `any`**: Always define proper interfaces
- **Imports**: Use `@/` alias for src imports
- **Path mapping**: `@/*` → `./src/*`

### Translations (UI)
- **Default**: **`const { t } = useTranslation()`** and inline **`t('…')`** next to labels, toasts, and `aria-*` text (the exact English phrase is the key).
- **Do not** add feature-level wrapper hooks or shared “content” objects for UI strings — `ai-i18n-tools extract` scans literal `t('…')` calls in `src/`.
- **Interpolation**: i18next format `{{name}}` with `t('…', { name: value })`.
- **Plurals**: write one English source string (typically the plural form) and pass **`{ plurals: true, count }`** as a **plain object literal**. `count` must be a number. Independent **numeric** counts need separate `t()` calls (one plural axis cannot flex two numbers). Non-numeric interpolations (names, labels, etc.) are fine alongside `{{count}}`. Do not write `_one`/`_other` keys or `item(s)` hedges. `pnpm i18n:translate:ui` emits `src/locales/en-GB.json`; both `src/i18n.ts` and `src/lib/i18n-server.ts` pass it as `sourcePluralFlatBundle`.
- **Server / notifications**: use `getServerI18n()` or `getServerI18nForLanguage()` from `src/lib/i18n-server.ts`, then `i18n.t('…')` with the same English keys as the UI (`setupKeyAsDefaultT` + locale bundles).

### Database Access
- **SQLite access**: Use `src/lib/db.ts` and its `dbOps` prepared statements. Use the helpers in `src/lib/db-utils.ts` for JSON configuration and cache values; do not duplicate configuration queries in routes.
- **Transactions**: Use `db.transaction()` for atomic operations
- **Prepared statements**: Use `dbOps` object for reusable queries

### Styling
- **Tailwind CSS**: v4 with HSL color variables
- **Components**: Based on shadcn/ui + Radix UI primitives
- **Dark mode**: `class` strategy
- **Animation**: tailwindcss-animate plugin

## Important Gotchas

### 1. i18n
- Run **`pnpm i18n:extract`** after adding or changing `t('…')` strings so `strings.json` stays current.
- After adding or changing `{ plurals: true }` calls, also run **`pnpm i18n:translate:ui`** so source-locale `one`/`other` forms and `src/locales/en-GB.json` stay current.
- Documentation and SVG translation use the same **`ai-i18n-tools.config.json`**; glossary UI terms come from **`glossary.uiGlossary`** → `src/locales/strings.json`.

### 2. Database Security
- `data/.duplistatus.key` must have 0400 permissions
- Never modify permission checks in code
- Key fingerprint stored in database for change detection

### 3. Build Requirements
- Pre-checks script runs before build/dev: `scripts/pre-checks.sh`
- Standalone output requires copying static files
- Webpack customizations in `next.config.ts` for better-sqlite3

### 4. Cron Service
- Runs as separate process, not within Next.js
- Communicates via REST API on dedicated port
- Base configuration is stored under `cron_service`; the Duplicati version task is always enabled and receives its schedule from `duplicati_version_check`
- Reload the service with `POST /reload-config` after changing the Duplicati version schedule

### 5. CSRF Protection
- Session/admin APIs use `withCSRF` for state-changing requests; GET requests require a valid session but do not require a CSRF token
- External APIs (`/api/upload`, `/api/summary`, `/api/lastbackup*`, `/api/lastbackups*`, and `/api/health`) intentionally skip CSRF so Duplicati and homepage integrations work; protect them with the external API key and IP-allowlist mechanisms instead
- Get token from `/api/csrf` endpoint
- Include in header: `X-CSRF-Token`

### 6. Port Configuration
- Development: Next 8666, Cron 8667
- Production: Next 9666, Cron 9667
- Override with `PORT` and `CRON_PORT` env vars
- IP allowlists run in the Next.js proxy and do not protect the separately exposed cron-service port

### 7. Change Tracking
**REQUIRED**: Update `dev/CHANGELOG.md` with all changes
- Follow Keep a Changelog format
- Group changes: Security, Fixed, Changed, Added, Removed, Deprecated
- Include detailed descriptions with file references

### 8. External API keys
- API keys are optional by default (`external_api_require_api_key=false`) and have strict `upload` or `read` scopes. Upload keys authenticate `POST /api/upload`; read keys authenticate `/api/summary`, `/api/lastbackup*`, and `/api/lastbackups*`.
- Secrets are generated as random URL-safe values, stored only as SHA-256 hashes, and shown only when created. Use fingerprints in UI/audit data; never log, return, or persist plaintext secrets. Updating a key cannot rotate its scope or secret; create a replacement key.
- Accepted secret locations are query `api_key`, `X-Api-Key`, `Authorization: Bearer`, and upload-body `Extra.api_key` (Duplicati commonly uses the query form).
- API-key management routes are admin/session routes protected by CSRF. API keys do not authenticate the dashboard or admin routes, and session cookies do not satisfy external API authentication.
- Keep upload body-size and rate-limit controls in `upload_limits`; invalid-key attempts and read requests have separate rate limits. An IP allowlist, when enabled, is independent and must also allow the request.

### 9. IP allowlists
- There are independent `admin_ip_allowlist` and `external_api_ip_allowlist` CIDR lists, both disabled by default, plus `ip_trusted_proxies`. When a list is enabled, an empty list or missing peer-IP header denies access.
- Enforcement happens in `src/proxy.ts` using `resolveAllowlistIp()` and `isIpAllowed()`. Do not use `getClientIpAddress()` for access control; it is for audit/rate-limit information. Forwarded headers are trusted only when the TCP peer is in the configured trusted-proxy list.
- `scripts/peer-ip.cjs` must be loaded by development, standalone, and Docker startup commands. It strips client-supplied peer headers before adding the real TCP peer address; do not remove that protection.
- Allowlist-exempt paths are `/_next/`, `/favicon.ico`, `/api/health`, and `/api/ping`. External paths cover upload and read integrations; other matched paths use the admin list. Environment variables override database settings for recovery: `IP_TRUSTED_PROXIES`, `ADMIN_IP_ALLOWLIST_ENABLED`, `ADMIN_IP_ALLOWLIST`, `EXTERNAL_API_IP_ALLOWLIST_ENABLED`, and `EXTERNAL_API_IP_ALLOWLIST`.
- Call `invalidateIpAllowlistCache()` after configuration changes. When enabling the admin list through the UI, preserve the current-IP safety check and the trusted-proxy header rules.

### 10. Duplicati version tracking
- Upload and collection store the report `Version` in `backups.version` and `BackendStatistics.Version` in `backups.backend_version`; dashboard/settings badges compare `backend_version` with the cached release for the same channel.
- Latest channel releases (`stable`, `beta`, `experimental`, `canary`) are fetched from GitHub and cached under `duplicati_versions`. Schedule settings (`daily`, `12h`, or `6h` plus UTC start time `HH:mm`) are stored under `duplicati_version_check`; the cache is not a separate table.
- Startup refreshes stale caches, the cron task refreshes on schedule, and the admin refresh route supports a forced manual refresh. Failed GitHub refreshes retain the previous cache. The refresh service uses `data/.duplicati-version-refresh.lock` to prevent concurrent updates.
- GET settings access is authenticated; schedule changes and forced refreshes require admin access plus CSRF. After saving the schedule, reload the cron service configuration. Do not live-query Duplicati servers for release comparisons.
- `showDashboardVersion` is a per-user browser setting in `localStorage`; it does not control the always-visible dashboard table Version column.

## Testing Approach

- **No automated tests** (as noted in project rules)
- Manual testing via:
  - `pnpm generate-test-data --servers=N [--upload] [--api-key=KEY]` - Populate test data; use `--api-key` when upload API keys are required
  - `pnpm validate-csv-export` - Test exports
  - `pnpm validate-daily-summary` - Daily Summary schedule, snapshot, renderer, ledger, and 4.2 migration
  - `pnpm take-screenshots` - Visual regression
  - Docker testing: `pnpm docker:devel`

## API Patterns

### Route Handlers
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    // ... logic
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error message' },
      { status: 500 }
    );
  }
}
```

### Error Codes
- APIs return `errorCode` strings for i18n (not hardcoded messages)
- Map codes to user-facing strings via the same translation pipeline as the UI
- Examples: `INVALID_CREDENTIALS`, `DATABASE_NOT_READY`, `INTERNAL_ERROR`, `API_KEY_REQUIRED`, `API_KEY_INVALID`, `API_KEY_WRONG_SCOPE`, `IP_NOT_ALLOWED`, `CIDR_INVALID`, `VERSION_REFRESH_FAILED`

## Git Commit Guidelines

- **Do NOT** include version numbers in commit headlines
- **Do include** version changes in detailed change list
- **Update** `dev/CHANGELOG.md` with every change
- Follow conventional commit format where possible

## Docker & Deployment

- **Images**: `wsjbr/duplistatus` (Docker Hub) and `ghcr.io/wsj-br/duplistatus` (GHCR)
- **Docker Compose**: `docker-compose.yml` with separate cron service
- **Entry point**: `docker-entrypoint.sh` handles initialization
- **Volumes**: Mount `data/` directory for persistent storage

## Documentation

- **Location**: `documentation/` (Docusaurus site)
- **Languages**: Full docs in en-GB, de, fr, es, pt-BR, hi, zh-Hans
- **Translation**: `ai-i18n-tools` from repo root; from `documentation/`, `pnpm translate` calls the root scripts
- **Update only English**: When modifying docs, only update `./documentation/docs/` (English); translated files under `documentation/i18n/` are produced by the tooling
- **Feature docs**: API-key and external-API behavior is documented in `user-guide/settings/api-keys-settings.md` and `api-reference/`; IP allowlists are documented in `user-guide/settings/ip-allowlist-settings.md` and the installation proxy/environment pages; Duplicati version behavior is documented in `user-guide/settings/duplicati-versions.md` and related dashboard/development pages

## Key Files Reference

| File                        | Purpose                                             |
|-----------------------------|-----------------------------------------------------|
| `src/lib/default-notification-templates.ts` | Default notification template JSON loader |
| `src/locales/templates/en-GB.json` | English source for default notification templates |
| `src/lib/db.ts`             | Database connection and operations                  |
| `src/lib/db-utils.ts`       | Configuration helpers, version cache, and derived data |
| `src/lib/types.ts`          | All TypeScript interfaces                           |
| `src/lib/auth.ts`           | Authentication utilities                            |
| `src/lib/csrf-middleware.ts` | Session CSRF and external API exemptions          |
| `src/lib/api-key.ts`        | API-key generation, hashing, masking, and URL redaction |
| `src/lib/api-key-auth.ts`   | External API-key authentication and rate limits     |
| `src/lib/ip-allowlist.ts`   | CIDR allowlist and trusted-proxy enforcement helpers |
| `src/lib/ip-utils.ts`       | TCP peer-IP and audit-IP resolution                 |
| `src/lib/duplicati-version.ts` | Version parsing, comparison, and scheduling       |
| `src/lib/duplicati-version-service.ts` | GitHub release fetching and cache refresh |
| `src/lib/notifications.ts`  | NTFY and email notifications                        |
| `src/lib/cron-client.ts`    | Cron service client                                 |
| `src/cron-service/service.ts` | Cron task execution and `/reload-config`          |
| `src/app/api/api-keys/route.ts` | Admin API-key management                        |
| `src/app/api/configuration/ip-allowlist/route.ts` | Admin allowlist configuration       |
| `src/app/api/configuration/duplicati-versions/route.ts` | Version settings and refresh config |
| `src/proxy.ts`              | Locale handling, legacy redirects, and IP allowlists |
| `scripts/peer-ip.cjs`       | TCP peer-IP preload; strips spoofed client headers  |
| `next.config.ts`            | Next.js + Webpack configuration                     |
| `ai-i18n-tools.config.json` | i18n extract/translate configuration                |
| `eslint.config.mjs`         | ESLint rules                                        |
| `dev/CHANGELOG.md`          | Change tracking (REQUIRED updates)                  |

## External Integrations

- **Duplicati servers**: POST JSON backup reports to `/api/upload`; optional scoped `api_key` authentication is supported. Release comparisons use the GitHub Releases API and the server's `BackendStatistics.Version`.
- **Homepage integrations**: Read summary/last-backup APIs with a `read` API key when external API protection is enabled.
- **NTFY notifications**: Configurable per-backup via `NtfyConfig`
- **SMTP email**: Optional email notifications with multiple connection types (plain, STARTTLS, SSL)
- **GitHub**: `src/lib/duplicati-version-service.ts` fetches public Duplicati releases and caches channel versions; failed refreshes preserve the previous cache
- **OpenRouter**: Used by ai-i18n-tools for machine translation (requires `OPENROUTER_API_KEY`)

## Troubleshooting Resources

- Check `dev/CHANGELOG.md` for recent changes and fixes
- See `documentation/docs/development/translation-workflow.md` and `ai-i18n-tools.config.json`
- See `src/lib/` for reusable utility functions
- Cron service: Check `src/cron-service/README.md`

---

**App version**: See `version` in `package.json`

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
