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
- **Purpose**: Background service for periodic tasks (overdue backup checks)
- **Development**: Runs on port 8667 via `pnpm cron:dev`
- **Production**: Runs on port 9667
- **API**: REST endpoints for task management (`/health`, `/trigger/:task`, `/stop/:task`, `/start/:task`)

### Database
- **Type**: SQLite via `better-sqlite3`
- **Location**: `data/backups.db`
- **Security key**: `data/.duplistatus.key` (must have 0400 permissions)
- **Migrations**: Handled automatically in `src/lib/db-migrations.ts`

### Internationalization (i18n)
- **Runtime**: i18next (`src/i18n.ts`, `I18nProvider` in root layout). Client components use **`useTranslation()` + `t('Exact English phrase')`** at the point of use (English source string = key). Server Components and other non-React code use **`getServerI18n()`** from `src/lib/i18n-server.ts` and **`i18n.t('…')`** with the same literal keys. **Do not** add feature-level wrapper hooks or shared “content” objects for UI strings — **`ai-i18n-tools extract`** scans literal `t('…')` in `src/`.
- **Catalog / flat bundles**: `src/locales/strings.json`, `de.json`, `fr.json`, `es.json`, `pt-BR.json` (updated via `pnpm i18n:extract` and translate commands).
- **Config**: `ai-i18n-tools.config.json` at repo root (`sourceLocale`: `en-GB`, `targetLocales`, UI roots, Docusaurus paths, glossary, `cacheDir`).
- **URLs**: No locale prefix in app routes; language is stored (e.g. `NEXT_LOCALE` cookie) and applied with `loadLocale` + `i18n.changeLanguage`. Legacy `/{locale}/…` URLs are redirected at the edge (see `src/proxy.ts`).

## Essential Commands

> **DO NOT run these commands automatically.** Run `pnpm lint` (and `pnpm typecheck`) before suggesting code changes.

```bash
# Dependencies
pnpm install              # Install dependencies (enforced via preinstall)

# Development
pnpm dev                  # Start Next.js dev server on port 8666
pnpm cron:dev             # Start cron service in watch mode on port 8667

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
pnpm take-screenshots     # Take documentation screenshots

# Docker
pnpm docker:up            # Build and start Docker containers
pnpm docker:down          # Stop Docker containers
pnpm docker:clean         # Clean Docker resources

# i18n (repo root — OpenRouter: set OPENROUTER_API_KEY)
pnpm i18n:extract         # Scan t('…') and update strings catalog
pnpm i18n:sync            # Sync per ai-i18n-tools
pnpm i18n:translate       # translate-ui + translate-svg + translate-docs
pnpm i18n:translate:ui
pnpm i18n:translate:svg
pnpm i18n:translate:docs
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
├── locales/                # strings.json + per-locale flat JSON (de, es, fr, pt-BR)
├── contexts/               # React contexts
│   ├── locale-context.tsx
│   ├── theme-context.tsx
│   └── ...
├── hooks/                  # Custom React hooks
├── lib/                    # Shared utilities
│   ├── db.ts               # Database access
│   ├── types.ts            # TypeScript interfaces
│   ├── auth.ts             # Authentication utilities
│   ├── notifications.ts    # Notification logic
│   └── ...
├── proxy.ts                # Request proxy (locale cookie, legacy URL redirects)
└── cron-service/           # Background cron service

data/                       # Data directory (SQLite, keys)
documentation/              # Docusaurus documentation
scripts/                    # Build and utility scripts
ai-i18n-tools.config.json   # i18n tooling (UI + docs + SVG)
```

## Code Conventions

### Code Quality Rules
1. **Never use `any`** - Always define proper TypeScript interfaces
2. **Follow DRY** - Reuse functions from `src/lib/` instead of duplicating logic
3. **Preserve security** - Do not modify `.duplistatus.key` permission checks
4. **Run linter** - Use `pnpm lint` before suggesting code changes
5. **Update docs** - When changing ports, env vars, or setup, update the English docs under `documentation/docs/development/` and `documentation/docs/installation/`

### TypeScript
- **Strict mode**: Enabled
- **No `any`**: Always define proper interfaces
- **Imports**: Use `@/` alias for src imports
- **Path mapping**: `@/*` → `./src/*`

### Translations (UI)
- **Default**: **`const { t } = useTranslation()`** and inline **`t('…')`** next to labels, toasts, and `aria-*` text (the exact English phrase is the key).
- **Do not** add feature-level wrapper hooks or shared “content” objects for UI strings — `ai-i18n-tools extract` scans literal `t('…')` calls in `src/`.
- **Interpolation**: i18next format `{{name}}` with `t('…', { name: value })`.
- **Server / notifications**: use `getServerI18n()` or `getServerI18nForLanguage()` from `src/lib/i18n-server.ts`, then `i18n.t('…')` with the same English keys as the UI (`setupKeyAsDefaultT` + locale bundles).

### Database Access
- **Always use** functions from `src/lib/db.ts`
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
- Configuration stored in database under `cron_service` key

### 5. CSRF Protection
- Required for all mutating API calls
- Get token from `/api/csrf` endpoint
- Include in header: `X-CSRF-Token`

### 6. Port Configuration
- Development: Next 8666, Cron 8667
- Production: Next 9666, Cron 9667
- Override with `PORT` and `CRON_PORT` env vars

### 7. Change Tracking
**REQUIRED**: Update `dev/CHANGELOG.md` with all changes
- Follow Keep a Changelog format
- Group changes: Security, Fixed, Changed, Added, Removed, Deprecated
- Include detailed descriptions with file references

## Testing Approach

- **No automated tests** (as noted in project rules)
- Manual testing via:
  - `pnpm generate-test-data` - Populate test data
  - `pnpm validate-csv-export` - Test exports
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
- Examples: `INVALID_CREDENTIALS`, `DATABASE_NOT_READY`, `INTERNAL_ERROR`

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
- **Languages**: Full docs in en-GB, de, fr, es, pt-BR
- **Translation**: `ai-i18n-tools` from repo root; from `documentation/`, `pnpm translate` calls the root scripts
- **Update only English**: When modifying docs, only update `./documentation/docs/` (English); translated files under `documentation/i18n/` are produced by the tooling

## Key Files Reference

| File                        | Purpose                                             |
|-----------------------------|-----------------------------------------------------|
| `src/lib/db.ts`             | Database connection and operations                  |
| `src/lib/types.ts`          | All TypeScript interfaces                           |
| `src/lib/auth.ts`           | Authentication utilities                            |
| `src/lib/notifications.ts`  | NTFY and email notifications                        |
| `src/lib/cron-client.ts`    | Cron service client                                 |
| `src/proxy.ts`              | Request proxy (locale cookie, legacy URL redirects) |
| `next.config.ts`            | Next.js + Webpack configuration                     |
| `ai-i18n-tools.config.json` | i18n extract/translate configuration                |
| `eslint.config.mjs`         | ESLint rules                                        |
| `dev/CHANGELOG.md`          | Change tracking (REQUIRED updates)                  |

## External Integrations

- **Duplicati servers**: POST to `/api/upload` with JSON backup reports
- **NTFY notifications**: Configurable per-backup via `NtfyConfig`
- **SMTP email**: Optional email notifications with multiple connection types (plain, STARTTLS, SSL)
- **OpenRouter**: Used by ai-i18n-tools for machine translation (requires `OPENROUTER_API_KEY`)

## Troubleshooting Resources

- Check `dev/CHANGELOG.md` for recent changes and fixes
- See `documentation/docs/development/translation-workflow.md` and `ai-i18n-tools.config.json`
- See `src/lib/` for reusable utility functions
- Cron service: Check `src/cron-service/README.md`

---

**App version**: See `version` in `package.json`
