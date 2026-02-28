# AGENTS.md - duplistatus Project Guide

This file documents essential information for AI agents working in the duplistatus codebase.

## Project Overview

**duplistatus** is a web application for monitoring multiple [Duplicati](https://github.com/duplicati/duplicati) backup servers. It provides a unified dashboard to track backup statuses, history, metrics, and performance across multiple servers with support for notifications via ntfy and SMTP.

## Tech Stack

| Component | Version |
|-----------|---------|
| Node.js | >=24.12.0 |
| TypeScript | ~5.9.3 |
| Next.js (App Router) | ^16.1.x |
| React & React-DOM | ^19.2.x |
| Tailwind CSS | ^4.2.x |
| pnpm | >=10.24.0 (packageManager: pnpm@10.30.3) |
| SQLite | better-sqlite3 ^12.6.2 |
| intlayer | ^8.1.8 (i18n) |

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
- **Library**: intlayer
- **Supported locales**: en, de, fr, es, pt-BR
- **Default**: en-GB (English)
- **Translation files**: `.content.ts` files next to components
- **Access pattern**: `content.key.value` (always use `.value` property)

## Essential Commands

```bash
# Dependencies
pnpm install              # Install dependencies (enforced via preinstall)

# Development
pnpm dev                  # Start Next.js dev server on port 8666
pnpm cron:dev             # Start cron service in watch mode on port 8667
pnpm dev:with-editor      # Start with intlayer editor enabled

# Build & Production
pnpm build                # Production build (runs intlayer build + next build)
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
pnpm docker-up            # Build and start Docker containers
pnpm docker-down          # Stop Docker containers
pnpm docker-clean         # Clean Docker resources

# Translation (documentation)
pnpm translate            # Translate documentation (runs docs + SVG translation)
pnpm translate:svg        # Translate SVG files only
pnpm translate:glossary-ui  # Generate UI glossary from intlayer
```

## Code Organization

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   ├── [locale]/           # Localized pages
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Root page
├── components/             # React components
│   ├── ui/                 # Base UI components (shadcn/ui)
│   ├── *.content.ts        # Translation files (next to components)
│   └── *.tsx               # Component files
├── contexts/               # React contexts
│   ├── locale-context.tsx
│   ├── theme-context.tsx
│   └── ...
├── hooks/                  # Custom React hooks
│   ├── use-toast.ts
│   └── ...
├── lib/                    # Shared utilities
│   ├── db.ts               # Database access
│   ├── types.ts            # TypeScript interfaces
│   ├── auth.ts             # Authentication utilities
│   ├── notifications.ts    # Notification logic
│   └── ...
└── cron-service/           # Background cron service
    ├── index.ts            # Entry point
    └── service.ts          # Task scheduling logic

data/                       # Data directory (SQLite, keys)
documentation/              # Docusaurus documentation
scripts/                    # Build and utility scripts
```

## Code Conventions

### TypeScript
- **Strict mode**: Enabled
- **No `any`**: Always define proper interfaces
- **Imports**: Use `@/` alias for src imports
- **Path mapping**: `@/*` → `./src/*`

### Component Structure
```typescript
// Component with translations
'use client';
import { useIntlayer } from 'react-intlayer';
import content from './component-name.content.ts';

export function ComponentName() {
  const { keyName } = useIntlayer('component-key');
  return <div>{keyName.value}</div>;
}
```

### Translation Pattern (CRITICAL)
- **Always use `.value`**: `content.title.value`
- **Never use `String()`**: Wrong: `String(content.title)`
- **Content files**: Place `.content.ts` next to component
- **Key format**: `component-name` (kebab-case)
- **Locales supported**: en, de, fr, es, pt-BR

Example `.content.ts`:
```typescript
import { t, type Dictionary } from 'intlayer';

export default {
  key: 'component-name',
  content: {
    title: t({
      en: 'English text',
      de: 'German text',
      fr: 'French text',
      es: 'Spanish text',
      'pt-BR': 'Portuguese text'
    }),
  },
} satisfies Dictionary;
```

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

### 1. Intlayer Translations
- Access strings via `.value` property: `content.title.value`
- For server components: use `useIntlayer` from `next-intlayer/server` (not a real hook despite name)
- Build intlayer before running: `pnpm intlayer build`
- Editor runs on port 8000 by default

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
  - Docker testing: `pnpm docker-devel`

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
- Map codes to translations in `.content.ts` files
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
- **Languages**: Full docs in en, de, fr, es, pt-BR
- **Translation workflow**: `pnpm translate` (OpenRouter API)
- **Update only English**: When modifying docs, only update `./documentation/docs/` (English), translations handled automatically

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/db.ts` | Database connection and operations |
| `src/lib/types.ts` | All TypeScript interfaces |
| `src/lib/auth.ts` | Authentication utilities |
| `src/lib/notifications.ts` | NTFY and email notifications |
| `src/lib/cron-client.ts` | Cron service client |
| `next.config.ts` | Next.js + Webpack configuration |
| `intlayer.config.ts` | i18n configuration |
| `eslint.config.mjs` | ESLint rules |
| `dev/CHANGELOG.md` | Change tracking (REQUIRED updates) |

## External Integrations

- **Duplicati servers**: POST to `/api/upload` with JSON backup reports
- **NTFY notifications**: Configurable per-backup via `NtfyConfig`
- **SMTP email**: Optional email notifications with multiple connection types (plain, STARTTLS, SSL)
- **OpenRouter**: Used for documentation translation (requires `OPENROUTER_API_KEY`)

## Troubleshooting Resources

- Check `dev/CHANGELOG.md` for recent changes and fixes
- Review existing `.content.ts` files for translation patterns
- See `src/lib/` for reusable utility functions
- Cron service: Check `src/cron-service/README.md`

---

**Last Updated**: Generated from codebase analysis
**Version**: 1.3.1
