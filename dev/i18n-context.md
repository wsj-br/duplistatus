# Duplistatus Internationalisation Context for AI Prompts

## Project Overview
**Application**: duplistatus - Duplicati backup monitoring dashboard  
**Current Framework**: Next.js 16 + React 19 + TypeScript + Tailwind CSS  
**Package Manager**: pnpm  
**Development Port**: 8666  
**Build Mode**: Standalone output  

## Current Technology Stack
- **Frontend**: Next.js 16 with App Router, React 19, TypeScript
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **Database**: SQLite with better-sqlite3 package
- **Authentication**: Custom session-based auth
- **Charts**: Recharts for data visualization
- **Date/Time**: date-fns library with existing locale awareness
- **Numbers**: Intl.NumberFormat with existing locale support

## Current Internationalisation Status
**Current State**: Phase 3+ completed - Hybrid content structure fully implemented  
**Implementation**: Intlayer ^8.0.2 with hybrid per-component management  
**Existing Locale Features**: 
- Locale-aware number formatting (`src/lib/number-format.ts`) - Intl.NumberFormat with locale
- Locale-aware date/time formatting (`src/lib/date-format.ts`) - date-fns with locale
- Locale detection: URL path → `NEXT_LOCALE` cookie → Accept-Language header → default "en"
- HTML `lang` and `dir` attributes set dynamically (root layout + ClientLocaleProvider)
- RTL infrastructure ready (`src/lib/rtl-utils.ts`, `use-rtl` hook) for future RTL languages

**Content Structure (Hybrid Approach)**:
- ✅ `src/app/[locale]/content/common.content.ts` - 100+ shared UI terms (ui, navigation, status, time, intervals, tolerance, frequency)
- ✅ Centralized content: `common`, `settings`, `auth`, `api`, `notifications`
- ✅ Dynamic locale routing: `/[locale]/` structure with `generateStaticParams` for en, de, fr, es, pt-BR
- ✅ Proxy (`src/proxy.ts`) for locale detection, URL rewriting, and request headers (Next.js 16 convention)
- ✅ 48 component-specific `.content.ts` files co-located with components

## Target Languages
1. **English (en)** - Default locale
2. **German (de)** 
3. **French (fr)**
4. **Spanish (es)**
5. **Brazilian Portuguese (pt-BR)**

## Current Project Structure
```
src/
├── app/
│   ├── [locale]/          # Locale-based routing
│   │   ├── content/       # Centralized content files
│   │   │   ├── common.content.ts   # Shared UI (100+ terms)
│   │   │   ├── settings.content.ts
│   │   │   ├── auth.content.ts
│   │   │   ├── api.content.ts
│   │   │   ├── notifications.content.ts
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   ├── intlayer-provider-wrapper.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx, page.content.ts
│   │   ├── settings/
│   │   ├── login/ (page.content.ts)
│   │   ├── blank/
│   │   └── detail/[serverId]/ (backup/[backupId]/page.content.ts)
│   ├── api/               # API routes (no locale)
│   ├── layout.tsx         # Root layout (sets lang, dir)
│   └── intlayer-provider-client.tsx
├── components/
│   ├── dashboard/         # dashboard-table, overview-cards, overview-charts-panel,
│   │                      # dashboard-summary-cards, overview-status-cards (.content.ts each)
│   ├── settings/          # 13 form/viewer components with .content.ts
│   ├── server-details/    # server-backup-table, server-detail-summary-items,
│   │                      # server-details-content, detail-auto-refresh (.content.ts)
│   ├── ui/                # available-backups-modal, backup-tooltip-content, ntfy-qr-modal,
│   │                      # collect-all-button, server-configuration-button, etc.
│   └── ... (app-header, conditional-layout, change-password-modal, etc.)
├── contexts/              # locale-context.tsx (ClientLocaleProvider, useLocale, usePrefixWithLocale)
├── hooks/                 # use-rtl.ts for RTL-aware components
├── lib/                   # date-format.ts, number-format.ts, rtl-utils.ts
├── proxy.ts               # Next.js 16 proxy (locale detection, redirects, headers)
└── cron-service/
```

## Hybrid Content Architecture

**HYBRID = Centralized Common + Co-located Component Content**

### Content File Organization

**Centralized (Shared UI)**:
- `src/app/[locale]/content/common.content.ts` - 100+ terms
  - UI actions: save, cancel, delete, edit, add, search, filter, refresh, etc.
  - Navigation: dashboard, settings, servers, logout, profile, help, about
  - Status: success, error, warning, loading, pending, failed, etc.
  - Time: today, yesterday, last7Days, last30Days, lastWeek, lastMonth, etc.
  - Intervals: disabled, 1min–2hours (cron options)
  - Tolerance: noTolerance, 5min–1d (overdue)
  - Frequency: oneTime, everyDay, everyWeek, everyMonth
- `settings.content.ts`, `auth.content.ts`, `api.content.ts`, `notifications.content.ts` - feature-level shared content

**Co-located (Component-Specific)**:
- 48 `.content.ts` files next to their `.tsx` files
- Example: `dashboard-table.tsx` → `dashboard-table.content.ts`
- Each component manages its own unique translations
- Intlayer auto-discovers `*.content.ts`; centralized content is also exported via `content/index.ts`

### Content File Pattern

```typescript
// Component content file (co-located)
// src/components/dashboard/dashboard-table.content.ts
import { t, type Dictionary } from 'intlayer';

export default {
  key: 'dashboard-table',  // Unique key
  content: {
    tableTitle: t({ 
      en: 'Server Overview', 
      de: 'Server-Übersicht',
      fr: 'Vue d\'ensemble des serveurs',
      es: 'Resumen del servidor',
      'pt-BR': 'Visão geral do servidor'
    }),
    // Component-specific strings only
  },
} satisfies Dictionary;
```

### Component Usage Pattern

**Client components** use `useIntlayer` from `react-intlayer`. **Server components** use `useIntlayer` from `next-intlayer/server` with locale parameter. **Always use `.value`** to access translation strings (per project rules):

```typescript
// Client Component
'use client';
import { useIntlayer } from 'react-intlayer';

export function DashboardTable() {
  const content = useIntlayer('dashboard-table');
  const common = useIntlayer('common');
  
  return (
    <div>
      <h2>{content.servers.title.value}</h2>   {/* Use .value */}
      <Button>{common.ui.save.value}</Button>
      <Button>{common.ui.cancel.value}</Button>
    </div>
  );
}

// Server Component (e.g. backup detail page)
import { useIntlayer } from 'next-intlayer/server';

export default async function BackupDetailPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const content = useIntlayer('backup-detail-page', locale);
  return <h1>{content.databaseError.value}</h1>;
}
```

### Decision Matrix: What Goes Where?

**Use `common.content.ts` for**:
- ✅ UI actions used across multiple components (Save, Cancel, Delete, Edit)
- ✅ Status messages (Success, Error, Loading, Pending)
- ✅ Navigation terms (Dashboard, Settings, Logout)
- ✅ Time terms (Today, Yesterday, Last 7 Days)
- ✅ Generic status (Online, Offline, Active, Inactive)

**Create component `.content.ts` for**:
- ✅ Component-specific headings and titles
- ✅ Feature-specific terminology
- ✅ Context-specific messages ("No servers found")
- ✅ Component-unique tooltips and help text
- ✅ Technical terms specific to that component

**Don't create `.content.ts` for**:
- ❌ Generic UI components (Button, Label, Input) - use common.content.ts
- ❌ Components that only use shared terms

## Key Features to Internationalise

### Content Organization (Implemented)

**Common Content** (`common.content.ts` - 100+ terms, shared across all components):
- Navigation, UI actions, status messages, time terms, intervals, tolerance, frequency
- See `src/app/[locale]/content/common.content.ts` for full list

**Centralized Feature Content**:
- `settings.content.ts`, `auth.content.ts`, `api.content.ts`, `notifications.content.ts`

**Component-Specific Content** (48 co-located `.content.ts` files):

1. **Dashboard** (6): dashboard-table, overview-cards, overview-charts-panel, dashboard-summary-cards, overview-status-cards, metrics-charts-panel
2. **Settings** (13): server-settings-form, email-configuration-form, ntfy-form, notification-templates-form, overdue-monitoring-form, user-management-form, audit-log-viewer, database-maintenance-form, backup-notifications-form, audit-log-retention-form, application-logs-viewer, display-settings-form, settings-page-client
3. **Server Details** (4): server-backup-table, server-detail-summary-items, server-details-content, detail-auto-refresh
4. **UI** (8): available-backups-modal, backup-tooltip-content, ntfy-qr-modal, collect-all-button, server-configuration-button, overview-side-panel-toggle, back-button
5. **Other** (10+): app-header, conditional-layout, change-password-modal, backup-collect-menu, status-badge, global-refresh-controls, password-change-guard, key-changed-modal, open-server-config-button, ntfy-messages-button
6. **Pages**: page.content.ts (dashboard), login/page.content.ts, detail/[serverId]/backup/[backupId]/page.content.ts

## Language-Specific Considerations

### German (de)
- **Text Expansion**: ~30% longer than English
- **Formality**: Use formal "Sie" for business application
- **Date Format**: DD.MM.YYYY
- **Number Format**: 1.234,56 (decimal comma, thousand period)
- **Special Characters**: ä, ö, ü, ß

### French (fr)
- **Text Expansion**: ~25-35% longer than English
- **Date Format**: DD/MM/YYYY
- **Number Format**: 1 234,56 (space thousand separator, decimal comma)
- **Special Characters**: é, à, ç, ê, î, ô, ù

### Spanish (es)
- **Text Expansion**: ~25-35% longer than English
- **Date Format**: DD/MM/YYYY
- **Number Format**: 1.234,56 (decimal comma, thousand period)
- **Special Characters**: ñ, á, é, í, ó, ú, ü

### Brazilian Portuguese (pt-BR)
- **Text Expansion**: ~20-30% longer than English
- **Date Format**: DD/MM/YYYY
- **Number Format**: 1.234,56 (decimal comma, thousand period)
- **Special Characters**: ã, õ, ç, á, é, í, ó, ú

## Key Translation Terms (Domain-Specific)
- **Backup**: 
  - English: "Backup"
  - German: "Sicherung"
  - French: "Sauvegarde"
  - Spanish: "Copia de seguridad"
  - Portuguese: "Backup"

- **Server**:
  - English: "Server"
  - German: "Server"
  - French: "Serveur"
  - Spanish: "Servidor"
  - Portuguese: "Servidor"

- **Dashboard**:
  - English: "Dashboard"
  - German: "Dashboard"
  - French: "Tableau de bord"
  - Spanish: "Panel de control"
  - Portuguese: "Painel"

## Current Configuration Files
- **next.config.ts**: `withIntlayerSync`, webpack (better-sqlite3, Intlayer dictionary watch), standalone output
- **intlayer.config.ts**: Locales (en, de, fr, es, pt-BR), default en, editor disabled, tree-shaking
- **src/proxy.ts**: Next.js 16 proxy (locale detection, redirects, `NEXT_LOCALE` cookie, x-pathname/x-search-params headers)
- **package.json**: intlayer ^8.0.2, react-intlayer, next-intlayer, @intlayer/swc; `pnpm intlayer build` before next build
- **tsconfig.json**: Strict TypeScript, @/* path aliases
- **tailwind.config.ts**, **components.json**: shadcn/ui

## Locale Detection Flow

Locale is determined by `src/proxy.ts` (Next.js 16 proxy, formerly middleware):

1. **URL path**: If request has `/[locale]/...` and locale is valid → use it
2. **Cookie**: `NEXT_LOCALE` (persisted preference)
3. **Accept-Language**: Browser language header
4. **Default**: `en`

Requests without a locale prefix are redirected to `/[locale]/path`. The proxy sets `x-pathname` and `x-search-params` headers for server components. Root layout uses `getServerLocale()` (cookies, headers, Accept-Language) for initial HTML `lang` and `dir` attributes.

## Integration Requirements
- **Preserve existing functionality** (don't break current features)
- **Maintain performance** (bundle size increase < 20%)
- **Keep existing authentication** system intact
- **Preserve API structure** (move to /src/app/api/)
- **Maintain styling** (shadcn/ui + Tailwind)

## Implementation Framework: Intlayer

### Why Intlayer
- Modern, Next.js 16 compatible (intlayer ^8.0.2)
- **Per-component management**: Content co-located with components
- TypeScript support with full type safety
- AI translation integration (optional)
- Tree-shaking and bundle optimization

### Architecture: Hybrid Per-Component Management

**Key Concept**: Intlayer's per-component management means:
1. **Distributed Content Declaration**: Content files co-located with components
2. **Automatic Cleanup**: Removing a component removes its content
3. **Bundle Optimization**: Only used component content gets bundled
4. **No Duplication**: Common terms shared via `common.content.ts`

**Hybrid Approach Benefits**:
- ✅ No duplication of shared UI terms (100+ terms in common.content.ts)
- ✅ Automatic cleanup when components removed
- ✅ Better organization (translations next to code)
- ✅ Optimal bundling (tree-shaking per component)
- ✅ Easier maintenance (clear separation: shared vs unique)

### Configuration
- **intlayer.config.ts**: Locales (en, de, fr, es, pt-BR), default en, editor disabled, tree-shaking enabled
- **Build**: `pnpm intlayer build` runs before `next build`; `@intlayer/swc` optional for full tree-shaking
- **next.config.ts**: Uses `withIntlayerSync`; webpack watches `.intlayer/dictionary` in dev
- **IntlayerProvider**: Wrapped in `IntlayerProviderClient` (root) and `IntlayerProviderWrapper` (per-locale layout)

### Content File Structure
- **Total Files**: 48+ content files
  - 5 centralized: common, settings, auth, api, notifications
  - 43+ component-specific (co-located with `.tsx`)
- **Location**: Component content next to component; centralized in `src/app/[locale]/content/`
- **Naming**: `component-name.content.ts` with `key: 'component-name'`

## Testing Requirements
- **All 5 languages** must work correctly
- **Responsive design** with text expansion
- **Character encoding** for accented characters
- **Performance impact** within acceptable limits
- **Existing functionality** preserved

## Success Criteria
- 100% translation coverage
- Bundle size increase < 20%
- Page load time impact < 10%
- Zero console errors
- Proper text expansion handling
- Accurate technical terminology

## Current Development Workflow
- **Package Manager**: pnpm
- **Development**: `pnpm dev` (port 8666)
- **Build**: `pnpm build` (standalone mode)
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript strict mode
- **Change log**: the changes are recorded in `dev/CHANGELOG.md`

## Migration Status

### Completed
- ✅ Intlayer ^8.0.2 with react-intlayer, next-intlayer, @intlayer/swc
- ✅ `intlayer.config.ts` and Next.js integration via `withIntlayerSync`
- ✅ Dynamic locale routing (`/[locale]/` with `generateStaticParams`)
- ✅ Proxy (`src/proxy.ts`) for locale detection, redirects, `NEXT_LOCALE` cookie, headers
- ✅ Root layout: `lang`, `dir` (RTL-ready), `getServerLocale()`
- ✅ `ClientLocaleProvider`, `useLocale()`, `usePrefixWithLocale()` in locale-context
- ✅ Locale switcher in app header (all 5 languages, cookie-persisted)
- ✅ `common.content.ts` with 100+ shared terms
- ✅ Centralized: settings, auth, api, notifications content
- ✅ 48 component-specific `.content.ts` files (dashboard, settings, server-details, ui, etc.)
- ✅ Locale-aware date/number formatting (`date-format.ts`, `number-format.ts`)
- ✅ RTL infrastructure (`rtl-utils.ts`, `use-rtl`, CSS variables)
- ✅ Components use `useIntlayer` + `.value` pattern
- ✅ Server components use `useIntlayer` from `next-intlayer/server` with locale

### Optional / Future
- ⏳ Visual editor (disabled in config)
- ⏳ AI translation of new/updated content
- ⏳ RTL language support (Arabic, Hebrew) when needed

## Known Challenges
1. **Text Expansion**: French/Spanish 25-35% longer text (affects UI layout)
2. **Technical Terminology**: Backup/IT domain-specific terms (must maintain accuracy)
3. **Brazilian Portuguese**: Use `Locales.PORTUGUESE_BRAZIL` in intlayer.config; URL/cookie use canonical "pt-BR"
4. **Performance**: Multiple language support impact on bundle size (target: <20% increase)
5. **German Compound Words**: May be too long for UI elements (need simplification)

## Implementation Patterns

### Translation Access (Required)
**Always use `.value`** to access translation strings. Do NOT use `String()` or helper functions:

```typescript
// ✅ CORRECT
content.title.value
common.ui.save.value

// ❌ INCORRECT
String(content.title)
```

### Hybrid Content Pattern
```typescript
// ✅ CORRECT: Component-specific + common
const content = useIntlayer('component-name');
const common = useIntlayer('common');
return <Button>{common.ui.save.value}</Button>;

// ❌ INCORRECT: Duplicating shared terms in component content
// Use common.ui.* for save, cancel, delete, etc.
```

### Content File Location Rules
- **Centralized**: `src/app/[locale]/content/` (common, settings, auth, api, notifications)
- **Component content**: Co-located with component (e.g. `dashboard-table.content.ts` next to `dashboard-table.tsx`)
- **Page content**: Next to page (e.g. `page.content.ts`, `login/page.content.ts`)

### Content Key Naming
- Unique across all content files; use kebab-case
- Match component name: `key: 'dashboard-table'` in `dashboard-table.content.ts`

## Context Usage Instructions

When using the AI prompts from the internationalisation plan:

1. **DO NOT** include this entire context file in your prompts
2. **DO** assume the AI has access to this context
3. **DO** use prompts as written in the plan file
4. **DO** reference this file for project-specific details if needed
5. **DO** follow the hybrid approach (common + component-specific)
6. **DO** co-locate component content files with their components
7. **DO** use `common.content.ts` for shared UI terms; use centralized settings/auth/api/notifications for feature-level shared content
8. **DO** use `.value` when accessing translation strings
9. **DO** use `useIntlayer` from `react-intlayer` (client) or `next-intlayer/server` (server, with locale param)
10. **DO** put translations in the `.content.ts` file next to the component when possible

### Important Reminders
- **Architecture**: Hybrid = Centralized (common, settings, auth, api, notifications) + Co-located component content
- **Access**: Always use `.value` (e.g. `content.title.value`)
- **Locale**: Client gets locale from pathname via `useLocale()`; server gets from `params.locale`
- **Proxy**: Next.js 16 uses `proxy.ts` (not middleware.ts) for locale detection and redirects

This context file provides all the background information needed for the AI prompts to execute effectively without repetitive context inclusion, with emphasis on the hybrid per-component management approach.

---

## Quick Reference: Hybrid Approach

### Content File Count
- **Centralized**: 5 files (common, settings, auth, api, notifications)
- **Component-specific**: 43+ files (co-located)
- **Total**: 48+ content files

### Usage Pattern
```typescript
// Client: use .value for all strings
const content = useIntlayer('component-name');
const common = useIntlayer('common');
return <span>{content.title.value}</span>;

// Server: pass locale
const content = useIntlayer('backup-detail-page', locale);
```

### Decision Flow
```
Is this string used in multiple components?
├─ YES → Add to common.content.ts (or settings/auth/api/notifications if feature-specific)
└─ NO → Add to component .content.ts (co-located)
```

### Key Paths
- **Proxy**: `src/proxy.ts` (locale detection, redirects)
- **Locale context**: `src/contexts/locale-context.tsx`
- **Date/number format**: `src/lib/date-format.ts`, `src/lib/number-format.ts`
- **RTL**: `src/lib/rtl-utils.ts`, `src/hooks/use-rtl.ts`