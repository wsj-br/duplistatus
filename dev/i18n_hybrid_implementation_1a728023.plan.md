---
name: i18n Hybrid Implementation
overview: Update the internationalisation plan to use Intlayer's hybrid per-component management approach, combining centralized common content with co-located component-specific content files. Includes migration strategy from the current centralized structure.
todos:
  - id: migrate-centralized
    content: Migrate existing centralized dashboard.content.ts to per-component files
    status: pending
  - id: extract-strings
    content: Extract all hard-coded strings from components and categorize (common vs component-specific)
    status: pending
  - id: create-component-content
    content: Create .content.ts files for 20-30 components with unique strings
    status: pending
  - id: update-component-imports
    content: Update all components to use hybrid approach (common + component-specific)
    status: pending
  - id: update-types
    content: Add component-specific TypeScript interfaces to types.ts
    status: pending
  - id: test-hybrid
    content: Test all components load correct translations in all 5 languages
    status: pending
---

# Internationalisation Plan: Hybrid Per-Component Approach

## Overview

This plan adopts Intlayer's **hybrid per-component management approach**, combining:

- **Centralized common content**: Shared UI elements in [`src/app/[locale]/content/common.content.ts`](src/app/[locale]/content/common.content.ts)
- **Co-located component content**: Component-specific translations next to their components

## Migration Context

**Current Status**: Phase 3.1 completed with centralized structure:

- `common.content.ts` ✅ (keep)
- `dashboard.content.ts` ✅ (needs migration to per-component)

**Migration Required**: Restructure existing centralized content files into per-component files while preserving `common.content.ts`.

---

## Migration Prompt: Adjust Current Implementation

````plaintext
CONTEXT: Internationalisation implementation (Phase 3.1 completed) currently uses centralized structure. Need to migrate to hybrid per-component approach.

TASK: Restructure existing content files from centralized to hybrid per-component management.

CURRENT STRUCTURE:
- src/app/[locale]/content/common.content.ts ✅ (471 lines, keep as-is)
- src/app/[locale]/content/dashboard.content.ts ✅ (100 lines, needs migration)

TARGET STRUCTURE (Hybrid):
1. Keep common.content.ts for shared UI elements
2. Create component-specific .content.ts files co-located with components
3. Split dashboard.content.ts into per-component files

STEPS:

1. ANALYZE DASHBOARD CONTENT
                                                                                 - Read src/app/[locale]/content/dashboard.content.ts
                                                                                 - Identify logical groupings by component/feature
                                                                                 - Map content keys to their respective components

2. CREATE COMPONENT CONTENT FILES
   Based on dashboard.content.ts structure, create these files:
   
   a. src/components/dashboard/dashboard-table.content.ts
                                                                                                                                                                  - Content keys: servers.*, backups.* (table-specific)
      
   b. src/components/dashboard/overview-cards.content.ts
                                                                                                                                                                  - Content keys: overview.* (cards-specific)
      
   c. src/components/dashboard/overview-charts-panel.content.ts
                                                                                                                                                                  - Content keys: charts.* (charts-specific)
      
   d. src/components/dashboard/server-cards.content.ts
                                                                                                                                                                  - Content keys: servers.* (card view-specific)
      
   e. src/app/[locale]/page.content.ts
                                                                                                                                                                  - Content keys: title, subtitle, alerts.* (page-level)

3. CONTENT FILE STRUCTURE
   Each component content file should:
   ```typescript
   import { t, type Dictionary } from 'intlayer';
   
   export default {
     key: 'component-name',  // Unique key matching component
     content: {
       // Component-specific translations
       title: t({ en: '...', de: '...', fr: '...', es: '...', 'pt-BR': '...' }),
     },
   } satisfies Dictionary;
   ```

4. UPDATE COMPONENTS
   For each component, update imports and usage:
   ```typescript
   // Before (if already using content):
   const { title } = useIntlayer('dashboard');
   
   // After:
   const { title } = useIntlayer('dashboard-table');  // Component-specific key
   const common = useIntlayer('common');  // For shared UI elements
   ```

5. DECISION MATRIX: What Goes Where?
   
   COMMON CONTENT (keep in common.content.ts):
                                                                                 - UI actions: save, cancel, delete, edit, add, search, filter, refresh
                                                                                 - Status terms: success, error, loading, pending, failed, completed
                                                                                 - Navigation: dashboard, settings, servers, logout
                                                                                 - Time terms: today, yesterday, last7Days, last30Days
                                                                                 - Generic status: online, offline, active, inactive, unknown
   
   COMPONENT CONTENT (co-locate with component):
                                                                                 - Component-specific headings and titles
                                                                                 - Feature-specific terminology (e.g., "Server Overview", "Backup History")
                                                                                 - Context-specific messages (e.g., "No servers found", "Backup failed")
                                                                                 - Component-unique tooltips and help text
                                                                                 - Technical terms specific to that component

6. MIGRATION CHECKLIST
                                                                                 - [ ] Analyze dashboard.content.ts and map to components
                                                                                 - [ ] Create component-specific content files (5-8 files)
                                                                                 - [ ] Move content keys to appropriate component files
                                                                                 - [ ] Update component imports to use new content keys
                                                                                 - [ ] Test each component loads correct translations
                                                                                 - [ ] Delete centralized dashboard.content.ts after migration
                                                                                 - [ ] Update types.ts to include component-specific interfaces

7. VERIFICATION
   After migration:
                                                                                 - Verify common.content.ts still has 50+ shared UI terms
                                                                                 - Verify each component has its own .content.ts file
                                                                                 - Verify no broken imports or missing translations
                                                                                 - Test all 5 languages load correctly in components

COMPONENTS REQUIRING CONTENT FILES:
Based on src/components/ structure:
- dashboard/dashboard-table.tsx → dashboard-table.content.ts
- dashboard/server-cards.tsx → server-cards.content.ts
- dashboard/overview-cards.tsx → overview-cards.content.ts
- dashboard/overview-charts-panel.tsx → overview-charts-panel.content.ts
- settings/* (8 form components) → individual .content.ts files
- server-details/* (4 components) → individual .content.ts files
- ui/* (only components with unique strings need content files)

EXPECTED OUTCOME:
- common.content.ts: 50+ shared UI terms
- 20-30 component-specific .content.ts files co-located with components
- No centralized feature-level content files (dashboard.content.ts deleted)
- All components use hybrid approach (common + component-specific)
````

---

## Updated Implementation Plan

### Phase 3: Content Structure Creation (REVISED)

#### Phase 3.1: Create Hybrid Content Structure ✅ COMPLETED

Current centralized structure exists. See migration prompt above to adjust.

#### Phase 3.2: Systematic String Extraction

Extract strings from all components and pages:

**High-Priority Components** (most unique strings):

1. **Dashboard components** (src/components/dashboard/)

                                                                                                                                                                                                - dashboard-table.tsx: Table headers, column names, actions
                                                                                                                                                                                                - server-cards.tsx: Card titles, status messages
                                                                                                                                                                                                - overview-cards.tsx: Metric names, summary text
                                                                                                                                                                                                - overview-charts-panel.tsx: Chart titles, axis labels

2. **Settings components** (src/components/settings/)

                                                                                                                                                                                                - 8 form components with extensive labels and help text
                                                                                                                                                                                                - Each form gets its own .content.ts file

3. **Server details** (src/components/server-details/)

                                                                                                                                                                                                - 4 components with technical terminology
                                                                                                                                                                                                - Backup-specific terms and status messages

4. **UI components** (src/components/ui/)

                                                                                                                                                                                                - Only components with unique strings need content files
                                                                                                                                                                                                - Examples: backup-tooltip-content.tsx, available-backups-modal.tsx
                                                                                                                                                                                                - Generic UI components (button, label, input) use common.content.ts

**Extraction Process**:

1. Scan each component for hard-coded strings
2. Categorize: Common (shared) vs Component-specific (unique)
3. Add common strings to common.content.ts
4. Create component .content.ts for unique strings
5. Document context and usage for each string

**String Categories**:

- Navigation and UI actions → common.content.ts
- Component headings and titles → component .content.ts
- Form labels and placeholders → component .content.ts
- Validation messages → component .content.ts
- Status and error messages → mix (generic in common, specific in component)
- Technical terminology → component .content.ts

#### Phase 3.3: Populate Component Content Files

Create content files for all components with unique strings:

**Priority 1: Dashboard** (5-6 files)

```
src/components/dashboard/
├── dashboard-table.content.ts (table-specific: headers, actions, tooltips)
├── server-cards.content.ts (card view: status messages, actions)
├── overview-cards.content.ts (metrics: card titles, descriptions)
├── overview-charts-panel.content.ts (charts: titles, legends, axes)
└── dashboard-summary-cards.content.ts (summary: titles, metrics)
```

**Priority 2: Settings** (8-10 files)

```
src/components/settings/
├── server-settings-form.content.ts
├── email-configuration-form.content.ts
├── ntfy-form.content.ts
├── notification-templates-form.content.ts
├── overdue-monitoring-form.content.ts
├── user-management-form.content.ts
├── audit-log-viewer.content.ts
└── database-maintenance-form.content.ts
```

**Priority 3: Server Details** (4-5 files)

```
src/components/server-details/
├── server-backup-table.content.ts
├── server-detail-summary-items.content.ts
└── server-details-content.content.ts
```

**Priority 4: UI Components** (only those with unique strings)

```
src/components/ui/
├── backup-tooltip-content.content.ts
├── available-backups-modal.content.ts
└── ntfy-qr-modal.content.ts
```

**Priority 5: Pages** (page-level content)

```
src/app/[locale]/
├── page.content.ts (dashboard page)
├── login/page.content.ts (authentication)
└── not-found.content.ts (error pages)
```

**Content File Template**:

```typescript
import { t, type Dictionary } from 'intlayer';

export default {
  key: 'component-name',
  content: {
    // Organize by logical groupings
    heading: t({
      en: 'Component Title',
      de: 'Komponententitel',
      fr: 'Titre du composant',
      es: 'Título del componente',
      'pt-BR': 'Título do componente',
    }),
    // More translations...
  },
} satisfies Dictionary;
```

---

### Phase 4: Component Integration (REVISED)

#### Phase 4.1: Update Components to Use Hybrid Approach

For each component:

1. Import both common and component-specific content:
```typescript
import { useIntlayer } from 'react-intlayer';

export function DashboardTable() {
  const content = useIntlayer('dashboard-table');  // Component-specific
  const common = useIntlayer('common');  // Shared UI
  
  return (
    <div>
      <h2>{content.tableTitle}</h2>
      <Button>{common.ui.save}</Button>
      <Button>{common.ui.cancel}</Button>
    </div>
  );
}
```

2. Server Components (no hooks):
```typescript
import { getContent } from 'intlayer';

export default function ServerPage() {
  const content = getContent('server-page');
  const common = getContent('common');
  
  return <div>{content.title}</div>;
}
```

3. Decision: Use Common or Component Content?

                                                                                                                                                                                                - Use common.ui.* for: Save, Cancel, Delete, Edit, Add, Search, Filter
                                                                                                                                                                                                - Use common.status.* for: Success, Error, Loading, Pending
                                                                                                                                                                                                - Use common.navigation.* for: Dashboard, Settings, Logout
                                                                                                                                                                                                - Use component content for: Everything else unique to that component

#### Phase 4.2: Update Type Definitions

Update src/app/[locale]/content/types.ts:

```typescript
// Keep CommonContent interface
export interface CommonContent { ... }

// Add component-specific interfaces
export interface DashboardTableContent {
  tableTitle: string;
  serverName: string;
  lastBackup: string;
  // Component-specific types
}

export interface ServerCardsContent { ... }
// More component interfaces...
```

#### Phase 4.3: Integration Testing

Test each component:

- Verify correct content key in useIntlayer('key')
- Verify common content imports work
- Verify all 5 languages load correctly
- Test locale switching preserves component content
- Verify no missing translations

---

## Benefits of Hybrid Approach

### Automatic Cleanup

- Remove dashboard-table.tsx → dashboard-table.content.ts automatically removed
- No orphaned translations in centralized files

### Better Organization

```
dashboard-table.tsx         ← Component logic
dashboard-table.content.ts  ← Component translations (co-located)
```

### Optimal Bundle Size

- Intlayer tree-shakes unused component content
- Common content shared efficiently across components
- Only imported component content gets bundled

### No Duplication

- Common UI terms defined once in common.content.ts
- Reused across all components via useIntlayer('common')

### Easier Maintenance

- Find translations next to component code
- Update component translations without searching centralized files
- Clear separation: shared vs unique content

---

## Component Content File Guidelines

### When to Create Component Content File

**CREATE** .content.ts if component has:

- Unique headings, titles, or labels
- Feature-specific terminology
- Context-specific messages or tooltips
- Form fields with unique labels
- Technical or domain-specific terms

**DON'T CREATE** .content.ts if component only uses:

- Generic UI actions (Save, Cancel, Delete) → use common.ui
- Generic status messages (Success, Error) → use common.status
- Navigation terms (Dashboard, Settings) → use common.navigation
- Time terms (Today, Yesterday) → use common.time

### Example: Button Component

Generic Button component: **No content file needed**

- Uses common.ui.save, common.ui.cancel, etc.

Specialized BackupButton with unique text: **Needs content file**

- Has specific labels like "Force Backup Now", "Schedule Backup"

---

## Updated Success Metrics

### Technical

- [ ] common.content.ts has 50+ shared UI terms
- [ ] 20-30 component-specific .content.ts files co-located
- [ ] No centralized feature-level content files (dashboard, settings)
- [ ] 100% translation coverage for all 5 languages
- [ ] Bundle size increase less than 20%
- [ ] Zero console errors in all locales

### Architecture

- [ ] Component content co-located with component code
- [ ] Common content used for shared UI elements
- [ ] No duplication of common terms across components
- [ ] Automatic cleanup when components removed
- [ ] Clear separation: shared vs component-specific

---

## File Organization Reference

### Final Structure

```
src/
├── app/[locale]/
│   ├── content/
│   │   ├── common.content.ts          ← Shared UI (50+ terms)
│   │   └── types.ts                    ← TypeScript interfaces
│   ├── page.tsx
│   ├── page.content.ts                 ← Page-level content
│   └── login/
│       ├── page.tsx
│       └── page.content.ts
│
└── components/
    ├── dashboard/
    │   ├── dashboard-table.tsx
    │   ├── dashboard-table.content.ts  ← Component content
    │   ├── server-cards.tsx
    │   └── server-cards.content.ts     ← Component content
    │
    ├── settings/
    │   ├── server-settings-form.tsx
    │   └── server-settings-form.content.ts  ← Component content
    │
    └── ui/
        ├── button.tsx                  ← No content (uses common)
        ├── backup-tooltip-content.tsx
        └── backup-tooltip-content.content.ts  ← Has unique strings
```

### Content Distribution

- **common.content.ts**: ~50 shared terms (ui, navigation, status, time)
- **Component content**: 20-30 files, each with 5-30 unique translations
- **Total content files**: ~25-35 files (1 common + 24-34 component-specific)

---

## Next Steps After Migration

1. Phase 4: Update all components to use hybrid approach
2. Phase 5: AI-powered translation of all content files
3. Phase 6: Advanced localization (dates, numbers)
4. Phase 7: Testing across all 5 languages
5. Phase 8: Visual editor and CMS setup