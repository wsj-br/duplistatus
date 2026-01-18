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
**Current State**: Phase 3.1 completed - Hybrid content structure created  
**Implementation**: Intlayer with hybrid per-component management  
**Existing Locale Features**: 
- Basic number formatting with Intl.NumberFormat
- Date formatting with date-fns
- Browser locale detection (navigator.language)
- HTML lang attribute set dynamically based on locale

**Content Structure (Hybrid Approach)**:
- ✅ `src/app/[locale]/content/common.content.ts` - 50+ shared UI terms
- ✅ `src/app/[locale]/content/dashboard.content.ts` - Needs migration to per-component
- ✅ Dynamic locale routing: `/[locale]/` structure implemented
- ✅ Middleware for locale detection and URL rewriting
- ⏳ Component-specific content files - To be created co-located with components

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
│   │   ├── content/       # Content files
│   │   │   ├── common.content.ts  # Shared UI (50+ terms)
│   │   │   ├── dashboard.content.ts  # ⚠️ Needs migration
│   │   │   └── types.ts   # TypeScript interfaces
│   │   ├── page.tsx       # Dashboard page
│   │   ├── page.content.ts  # Page-level content (to be created)
│   │   ├── settings/      # Settings pages
│   │   ├── login/         # Authentication
│   │   └── detail/        # Server detail pages
│   ├── api/               # API routes (unchanged)
│   └── layout.tsx         # Root layout
├── components/
│   ├── dashboard/
│   │   ├── dashboard-table.tsx
│   │   ├── dashboard-table.content.ts  # ⏳ To be created
│   │   ├── server-cards.tsx
│   │   ├── server-cards.content.ts      # ⏳ To be created
│   │   └── ... (other dashboard components)
│   ├── settings/
│   │   ├── server-settings-form.tsx
│   │   ├── server-settings-form.content.ts  # ⏳ To be created
│   │   └── ... (other settings components)
│   ├── server-details/
│   │   ├── server-backup-table.tsx
│   │   ├── server-backup-table.content.ts  # ⏳ To be created
│   │   └── ... (other server detail components)
│   └── ui/              # shadcn/ui base components (use common.content.ts)
├── contexts/            # React context providers (includes locale-context.tsx)
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries and core logic
└── cron-service/        # Background service
```

## Hybrid Content Architecture

**HYBRID = Centralized Common + Co-located Component Content**

### Content File Organization

**Centralized (Shared UI)**:
- `src/app/[locale]/content/common.content.ts`
  - 50+ shared UI terms
  - UI actions: save, cancel, delete, edit, add, search, filter, refresh
  - Status messages: success, error, loading, pending, failed
  - Navigation: dashboard, settings, servers, logout
  - Time terms: today, yesterday, last7Days, last30Days
  - Generic status: online, offline, active, inactive

**Co-located (Component-Specific)**:
- Component `.content.ts` files next to their `.tsx` files
- Example: `dashboard-table.tsx` → `dashboard-table.content.ts`
- Each component manages its own unique translations
- Automatic cleanup: Remove component → content removed automatically

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

```typescript
// Client Component
'use client';
import { useIntlayer } from 'react-intlayer';

export function DashboardTable() {
  const content = useIntlayer('dashboard-table');  // Component-specific
  const common = useIntlayer('common');  // Shared UI
  
  return (
    <div>
      <h2>{content.tableTitle}</h2>  {/* Component-specific */}
      <Button>{common.ui.save}</Button>  {/* Shared */}
      <Button>{common.ui.cancel}</Button>  {/* Shared */}
    </div>
  );
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

### Content Organization (Hybrid Approach)

**Common Content** (`common.content.ts` - Shared across all components):
1. **Navigation & UI Actions**
   - Navigation menu items (Dashboard, Settings, Servers, Logout)
   - Common button labels (Save, Cancel, Delete, Edit, Add, Search, Filter, Refresh)
   - Generic status messages (Success, Error, Loading, Pending, Failed)
   - Time terms (Today, Yesterday, Last 7 Days, Last 30 Days)
   - Generic status indicators (Online, Offline, Active, Inactive)

**Component-Specific Content** (Co-located `.content.ts` files):

2. **Dashboard Components** (5-6 content files)
   - `dashboard-table.content.ts`: Table headers, column names, row actions
   - `server-cards.content.ts`: Card titles, status messages, card-specific actions
   - `overview-cards.content.ts`: Metric names, summary descriptions
   - `overview-charts-panel.content.ts`: Chart titles, axis labels, legends
   - `dashboard-summary-cards.content.ts`: Summary card titles and metrics

3. **Settings Pages** (8 content files)
   - `server-settings-form.content.ts`: Form labels, help text, validation
   - `email-configuration-form.content.ts`: Email-specific labels and descriptions
   - `ntfy-form.content.ts`: NTFY-specific configuration labels
   - `notification-templates-form.content.ts`: Template management labels
   - `overdue-monitoring-form.content.ts`: Monitoring configuration labels
   - `user-management-form.content.ts`: User management labels
   - `audit-log-viewer.content.ts`: Audit log viewer labels
   - `database-maintenance-form.content.ts`: Database maintenance labels

4. **Server Details Components** (3-4 content files)
   - `server-backup-table.content.ts`: Backup table headers and actions
   - `server-detail-summary-items.content.ts`: Summary item labels
   - `server-details-content.content.ts`: Detail page content

5. **Authentication** (1-2 content files)
   - `login/page.content.ts`: Login form labels, error messages
   - Password change modal content

6. **UI Components** (Only those with unique strings)
   - `backup-tooltip-content.content.ts`: Tooltip-specific content
   - `available-backups-modal.content.ts`: Modal-specific content

7. **Pages** (Page-level content)
   - `page.content.ts`: Dashboard page title, subtitle, alerts
   - `not-found.content.ts`: Error page content

8. **API Responses** (If needed)
   - Error messages from API endpoints
   - Success notifications
   - Validation messages

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
- **next.config.ts**: Has better-sqlite3 webpack config, standalone output
- **tsconfig.json**: Strict TypeScript, @/* path aliases
- **package.json**: Uses pnpm, extensive dependencies
- **tailwind.config.ts**: Custom configuration
- **components.json**: shadcn/ui configuration

## Integration Requirements
- **Preserve existing functionality** (don't break current features)
- **Maintain performance** (bundle size increase < 20%)
- **Keep existing authentication** system intact
- **Preserve API structure** (move to /src/app/api/)
- **Maintain styling** (shadcn/ui + Tailwind)

## Implementation Framework: Intlayer

### Why Intlayer
- Modern, AI-powered, Next.js 16 compatible
- **Per-component management control**: Content co-located with components
- TypeScript support with full type safety
- AI translation integration
- Automatic tree-shaking and bundle optimization

### Architecture: Hybrid Per-Component Management

**Key Concept**: Intlayer's per-component management means:
1. **Distributed Content Declaration**: Content files co-located with components
2. **Automatic Cleanup**: Removing a component removes its content
3. **Bundle Optimization**: Only used component content gets bundled
4. **No Duplication**: Common terms shared via `common.content.ts`

**Hybrid Approach Benefits**:
- ✅ No duplication of shared UI terms (50+ terms in one place)
- ✅ Automatic cleanup when components removed
- ✅ Better organization (translations next to code)
- ✅ Optimal bundling (tree-shaking per component)
- ✅ Easier maintenance (clear separation: shared vs unique)

### Configuration
- **Editor**: Visual editor configured but disabled initially
- **Build**: Tree-shaking enabled, static rendering support
- **Locales**: en, de, fr, es, pt-BR (5 languages)
- **Default Locale**: English (en)

### Content File Structure
- **Total Files**: ~25-30 content files
  - 1 common content file (shared UI)
  - 24-29 component-specific content files (co-located)
- **Location Pattern**: Component content files next to their `.tsx` files
- **Naming**: `component-name.content.ts` (matches component name)

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

### Completed (Phase 3.1)
- ✅ Intlayer dependencies installed
- ✅ Configuration files created (`intlayer.config.ts`)
- ✅ Dynamic locale routing (`/[locale]/` structure)
- ✅ Middleware for locale detection
- ✅ Root layout updated for locale support
- ✅ `common.content.ts` created with 50+ shared UI terms
- ✅ `dashboard.content.ts` created (centralized - needs migration)

### In Progress / Next Steps
- ⏳ **Migration Required**: Migrate `dashboard.content.ts` to per-component files
  - Create `dashboard-table.content.ts`
  - Create `server-cards.content.ts`
  - Create `overview-cards.content.ts`
  - Create `overview-charts-panel.content.ts`
  - Create `page.content.ts` (page-level)
- ⏳ Create component-specific content files for all components
- ⏳ Update components to use hybrid pattern (`useIntlayer('component')` + `useIntlayer('common')`)
- ⏳ AI translation of all content files
- ⏳ Testing across all 5 languages

### Migration Strategy
1. Analyze existing `dashboard.content.ts` and map to components
2. Create component-specific `.content.ts` files co-located with components
3. Move content keys to appropriate component files
4. Update component imports to use new content keys
5. Delete centralized `dashboard.content.ts` after migration
6. Repeat for settings and other feature areas

## Known Challenges
1. **Text Expansion**: French/Spanish 25-35% longer text (affects UI layout)
2. **Technical Terminology**: Backup/IT domain-specific terms (must maintain accuracy)
3. **Brazilian Portuguese**: Custom locale "pt-BR" (not standard Intlayer enum)
4. **Existing Locale Code**: Need to integrate with current date/number formatting
5. **Performance**: Multiple language support impact on bundle size (target: <20% increase)
6. **Migration Complexity**: Moving from centralized to hybrid structure requires careful mapping
7. **German Compound Words**: May be too long for UI elements (need simplification)

## Implementation Patterns

### Hybrid Content Pattern (Required)
Always use the hybrid approach when creating or updating content:

```typescript
// ✅ CORRECT: Hybrid pattern
const content = useIntlayer('component-name');  // Component-specific
const common = useIntlayer('common');  // Shared UI

// ❌ INCORRECT: Don't duplicate shared terms in component content
// Don't create "save", "cancel", "delete" in component files
// Use common.ui.save, common.ui.cancel, common.ui.delete instead
```

### Content File Location Rules
- **Common content**: `src/app/[locale]/content/common.content.ts` (centralized)
- **Component content**: Next to component file (co-located)
  - Example: `src/components/dashboard/dashboard-table.tsx`
  - Content: `src/components/dashboard/dashboard-table.content.ts`
- **Page content**: Next to page file
  - Example: `src/app/[locale]/page.tsx`
  - Content: `src/app/[locale]/page.content.ts`

### Content Key Naming
- Must be unique across all content files
- Match component name: `dashboard-table` → `dashboard-table.content.ts`
- Use kebab-case for consistency
- Key in content file must match: `key: 'dashboard-table'`

## Context Usage Instructions

When using the AI prompts from the internationalisation plan:

1. **DO NOT** include this entire context file in your prompts
2. **DO** assume the AI has access to this context
3. **DO** use prompts as written in the plan file
4. **DO** start with session-specific resume prompts when continuing
5. **DO** reference this file for project-specific details if needed
6. **DO** follow the hybrid per-component approach (common + component-specific)
7. **DO** co-locate component content files with their components
8. **DO NOT** create centralized feature-level content files (dashboard.content.ts, settings.content.ts)
9. **DO** use `common.content.ts` for all shared UI terms
10. **DO** create component `.content.ts` only for unique component strings

### Important Reminders
- **Architecture**: Hybrid = Centralized common + Co-located component content
- **Migration**: Existing `dashboard.content.ts` needs to be split into per-component files
- **Pattern**: Always import both `useIntlayer('component')` and `useIntlayer('common')`
- **Cleanup**: Removing a component automatically removes its content (Intlayer feature)
- **Bundle**: Tree-shaking works optimally with per-component content

This context file provides all the background information needed for the AI prompts to execute effectively without repetitive context inclusion, with emphasis on the hybrid per-component management approach.

---

## Quick Reference: Hybrid Approach

### Content File Count
- **Common**: 1 file (`common.content.ts` with 50+ terms)
- **Components**: ~24-29 files (co-located with components)
- **Pages**: 2-3 files (co-located with pages)
- **Total**: ~25-30 content files

### Component Content Files Needed
- Dashboard: 5-6 files
- Settings: 8 files
- Server Details: 3-4 files
- UI Components: 2-3 files (only those with unique strings)
- Pages: 2-3 files

### Usage Pattern
```typescript
// Every component that needs translations:
const content = useIntlayer('component-name');
const common = useIntlayer('common');
```

### Decision Flow
```
Is this string used in multiple components?
├─ YES → Add to common.content.ts
└─ NO → Add to component .content.ts (co-located)
```

### File Structure Example
```
src/components/dashboard/
├── dashboard-table.tsx              ← Component
├── dashboard-table.content.ts      ← Content (co-located)
├── server-cards.tsx                 ← Component
└── server-cards.content.ts          ← Content (co-located)
```