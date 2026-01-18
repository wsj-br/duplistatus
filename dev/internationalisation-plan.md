# Internationalisation Implementation Plan for duplistatus

## Project Overview
**Application**: duplistatus - Duplicati backup monitoring dashboard  
**Framework**: Next.js 16 + React 19 + TypeScript + Tailwind CSS  
**Target Languages**: English (en), German (de), French (fr), Spanish (es), Brazilian Portuguese (pt-BR)  
**i18n Framework**: Intlayer with AI-powered translation  
**Implementation Method**: Multi-session AI agent execution  
**Architecture**: **Hybrid Per-Component Management** (centralized common + co-located component content)

---

## 🔄 MIGRATION: Centralized → Hybrid Per-Component Approach

### Current Status (Phase 3.1 Completed)
- ✅ `src/app/[locale]/content/common.content.ts` (471 lines) - **KEEP AS-IS**
- ✅ `src/app/[locale]/content/dashboard.content.ts` (100 lines) - **NEEDS MIGRATION**

### Why Hybrid Approach?

Intlayer's **per-component management control** concept means content files should be co-located with their components for:
- **Automatic cleanup**: Removing a component removes its translations
- **Better organization**: Translations next to component code
- **Optimal bundling**: Tree-shaking of unused component content
- **No duplication**: Common UI terms shared via `common.content.ts`

### Migration Strategy

**HYBRID = Centralized Common + Co-located Component Content**

```
Before (Centralized):                After (Hybrid):
src/app/[locale]/content/           src/app/[locale]/content/
├── common.content.ts               ├── common.content.ts ✅ (keep)
├── dashboard.content.ts            └── types.ts
├── settings.content.ts             
└── auth.content.ts                 src/components/dashboard/
                                    ├── dashboard-table.tsx
                                    ├── dashboard-table.content.ts 🆕
                                    ├── server-cards.tsx
                                    └── server-cards.content.ts 🆕
```

### Decision Matrix: What Goes Where?

**COMMON CONTENT** (`common.content.ts`):
- ✅ UI actions: save, cancel, delete, edit, add, search, filter, refresh
- ✅ Status terms: success, error, loading, pending, failed, completed
- ✅ Navigation: dashboard, settings, servers, logout
- ✅ Time terms: today, yesterday, last7Days, last30Days
- ✅ Generic status: online, offline, active, inactive

**COMPONENT CONTENT** (co-located `.content.ts`):
- ✅ Component-specific headings and titles
- ✅ Feature-specific terminology ("Server Overview", "Backup History")
- ✅ Context-specific messages ("No servers found")
- ✅ Component-unique tooltips and help text
- ✅ Technical terms specific to that component

### Migration Prompt (Execute After Phase 3.1)

```plaintext
TASK: Migrate existing centralized dashboard.content.ts to hybrid per-component structure.

STEPS:

1. ANALYZE dashboard.content.ts
   - Identify content sections: overview.*, servers.*, backups.*, charts.*, alerts.*
   - Map each section to its corresponding component

2. CREATE COMPONENT CONTENT FILES
   
   a. src/components/dashboard/overview-cards.content.ts
      - Move: overview.* (totalServers, onlineServers, etc.)
   
   b. src/components/dashboard/dashboard-table.content.ts
      - Move: servers.* and backups.* (table-specific)
   
   c. src/components/dashboard/overview-charts-panel.content.ts
      - Move: charts.* (chart titles, legends, axes)
   
   d. src/app/[locale]/page.content.ts
      - Move: title, subtitle, alerts.* (page-level)

3. CONTENT FILE TEMPLATE
   ```typescript
   import { t, type Dictionary } from 'intlayer';
   
   export default {
     key: 'dashboard-table',  // Unique key
     content: {
       tableTitle: t({ 
         en: 'Server Overview', 
         de: 'Server-Übersicht',
         // ... other languages
       }),
     },
   } satisfies Dictionary;
   ```

4. UPDATE COMPONENT IMPORTS
   ```typescript
   // Before:
   const { title } = useIntlayer('dashboard');
   
   // After:
   const content = useIntlayer('dashboard-table');  // Component-specific
   const common = useIntlayer('common');  // Shared UI
   
   return (
     <div>
       <h2>{content.tableTitle}</h2>
       <Button>{common.ui.save}</Button>
     </div>
   );
   ```

5. VERIFY MIGRATION
   - [ ] Each component has its own .content.ts file
   - [ ] common.content.ts unchanged (50+ shared terms)
   - [ ] No broken imports
   - [ ] All 5 languages work correctly
   - [ ] Delete centralized dashboard.content.ts

EXPECTED OUTCOME:
- common.content.ts: 50+ shared UI terms
- 5-8 component-specific .content.ts files for dashboard
- No centralized dashboard.content.ts
- All components use hybrid approach
```

---

## Session Tracking System

### Implementation Status Tracking
```
## Session Progress Log

### Session 1 - [Date]
- [ ] Phase 1.1: Dependencies installed
- [ ] Phase 1.2: Configuration files created
- [ ] Phase 1.3: TypeScript setup completed

### Session 2 - [Date]  
- [ ] Phase 2.1: URL routing implemented
- [ ] Phase 2.2: Middleware created
- [ ] Phase 2.3: Root layout updated

### Session 3 - [Date]
- [x] Phase 3.1: Hybrid content structure created (common + component files) ✅
- [x] Phase 3.2: Strings extracted and categorized (common vs component) ✅
- [x] Phase 3.3: All content files populated (common + 18 component files + 2 pages) ✅

### Session 4 - [Date]
- [ ] Phase 4.1: Components updated to hybrid pattern (common + component)
- [ ] Phase 4.2: TypeScript types added for all content files
- [ ] Phase 4.3: Component integration tested in all 5 languages

### Session 5 - [Date]
- [ ] Phase 5.1: AI translation configured for all content files
- [ ] Phase 5.2: Batch translations generated (common + all components)
- [ ] Phase 5.3: Manual review completed for all translations

### Session 6 - [Date]
- [ ] Phase 6.1: Date/time localization enhanced
- [ ] Phase 6.2: Number formatting improved
- [ ] Phase 6.3: RTL support prepared

### Session 7 - [Date]
- [ ] Phase 7.1: Functionality testing
- [ ] Phase 7.2: Visual testing
- [ ] Phase 7.3: Performance testing

### Session 8 - [Date]
- [ ] Phase 8.1: Visual editor configured
- [ ] Phase 8.2: CMS integration prepared
- [ ] Phase 8.3: Documentation updated
```

---

## Session-Specific AI Prompts

### **SESSION 1 PROMPTS (Core Setup)**

#### **Prompt 1.1: Install Dependencies**
```
Install Intlayer dependencies for Next.js 16 internationalisation support. Execute:

1. Run: pnpm add intlayer react-intlayer next-intlayer
2. Verify package.json updates correctly
3. Check for any peer dependency conflicts
4. Confirm installation with: pnpm list | grep intlayer

Target languages: English (en), German (de), French (fr), Spanish (es), Brazilian Portuguese (pt-BR)
Framework: Next.js 16 with App Router
Application: duplistatus backup monitoring dashboard

Current project uses pnpm and has extensive dependencies including better-sqlite3, ensure compatibility.
```

#### **Prompt 1.2: Create Core Configuration Files**
```
Create intlayer.config.ts configuration file for duplistatus with support for 5 languages:

1. Create intlayer.config.ts in project root
2. Configure with these specifications:
   - Locales: ENGLISH (en), GERMAN (de), FRENCH (fr), SPANISH (es), "pt-BR" (Brazilian Portuguese)
   - Default locale: ENGLISH
   - Editor: disabled initially, applicationURL: http://localhost:8666
   - Build optimization: tree-shaking enabled
3. Add custom pt-BR locale configuration if needed
4. Ensure TypeScript types are properly configured

File should be Next.js 16 compatible and support App Router.

Current project structure:
- src/app/ directory with page.tsx, layout.tsx
- Uses shadcn/ui and tailwind CSS
- Has better-sqlite3 integration
- Runs on port 8666 in development
```

#### **Prompt 1.3: Update Next.js Configuration**
```
Update next.config.ts to integrate Intlayer for Next.js 16:

1. Modify next.config.ts to include Intlayer webpack integration
2. Ensure compatibility with existing configuration (keep current settings)
3. Add build optimizations for internationalisation:
   - Tree-shaking for content files
   - Static rendering support
   - Bundle size optimization
4. Maintain existing features (better-sqlite3, webpack config, etc.)
5. Test configuration with: pnpm run build --dry-run

Current next.config.ts has:
- better-sqlite3 and webpack customizations
- Standalone output mode
- Optimizations for production
- Must preserve all existing functionality
```

#### **Prompt 1.4: Update TypeScript Configuration**
```
Update tsconfig.json for Intlayer TypeScript support:

1. Add Intlayer types to compilerOptions
2. Configure path aliases for content files (@/content/*)
3. Enable strict type checking for internationalisation
4. Ensure compatibility with existing path aliases (@/*)
5. Add type definitions for custom pt-BR locale if needed

Current tsconfig.json uses Next.js 16 with strict mode and existing @/* paths.
```

---

### **SESSION 2 PROMPTS (URL Routing and Middleware)**

#### **Prompt 2.1: Implement Dynamic Locale Routing**
```
Implement dynamic locale routing for Next.js 16 App Router:

1. Create /src/app/[locale]/ directory structure
2. Move existing pages to [locale] subdirectory:
   - /src/app/[locale]/page.tsx (dashboard)
   - /src/app/[locale]/layout.tsx (root layout for locales)
   - /src/app/[locale]/detail/ (server detail pages)
   - /src/app/[locale]/settings/ (settings pages)
   - /src/app/[locale]/login/ (authentication)
3. Create locale-specific layout.tsx
4. Ensure all existing functionality works with locale parameter
5. Preserve existing API routes (move to root /src/app/api/)

Maintain all current functionality while adding locale support.

Current pages to migrate:
- src/app/page.tsx (main dashboard)
- src/app/detail/[id]/page.tsx (server details)
- src/app/settings/page.tsx (settings)
- src/app/login/page.tsx (authentication)
- src/app/layout.tsx (root layout)
```

#### **Prompt 2.2: Create Locale Detection Middleware**
```
Create middleware.ts for locale detection and URL rewriting:

1. Create middleware.ts in project root
2. Implement locale detection logic:
   - Browser language detection (navigator.language)
   - Cookie/session persistence
   - Fallback to default (English)
3. Support these locales: en, de, fr, es, pt-BR
4. URL rewriting for locale prefixes
5. Exclude API routes, _next, static files
6. Matcher configuration: "/((?!api|_next|static|.*\\..*).*)"

Ensure seamless locale switching and proper URL structure.

Current project uses:
- Port 8666 for development
- Authentication system
- Custom server.js link
```

#### **Prompt 2.3: Update Root Layout**
```
Update root layout.tsx to support locale routing:

1. Modify /src/app/layout.tsx to handle locale parameters
2. Set HTML lang attribute dynamically based on locale
3. Pass locale context to children
4. Maintain existing styling and structure
5. Ensure SEO meta tags are locale-aware
6. Preserve existing authentication and theming

Current layout.tsx uses:
- shadcn/ui themes
- Authentication state management
- SessionProvider
- Tailwind CSS
```

---

### **SESSION 3 PROMPTS (Content Structure Creation - HYBRID APPROACH)**

#### **Prompt 3.1: Create Hybrid Content Structure**
```
Create HYBRID content structure following Intlayer's per-component management:

ARCHITECTURE:
- Centralized common content: src/app/[locale]/content/common.content.ts
- Co-located component content: .content.ts files next to each component

1. CREATE COMMON CONTENT (centralized for shared UI)
   
   Location: /src/app/[locale]/content/
   Files to create:
   - common.content.ts (50+ shared UI terms)
   - types.ts (TypeScript interfaces)
   
   Common content includes:
   - UI actions: save, cancel, delete, edit, add, search, filter, refresh, close
   - Status terms: success, error, loading, pending, failed, completed
   - Navigation: dashboard, settings, servers, logout, profile, help
   - Time terms: today, yesterday, last7Days, last30Days, thisWeek, thisMonth
   - Generic status: online, offline, active, inactive, unknown

2. IDENTIFY COMPONENTS NEEDING CONTENT FILES
   
   Create .content.ts files ONLY for components with unique strings:
   
   Dashboard (5-6 files):
   - src/components/dashboard/dashboard-table.content.ts
   - src/components/dashboard/server-cards.content.ts
   - src/components/dashboard/overview-cards.content.ts
   - src/components/dashboard/overview-charts-panel.content.ts
   
   Settings (8 files):
   - src/components/settings/server-settings-form.content.ts
   - src/components/settings/email-configuration-form.content.ts
   - src/components/settings/ntfy-form.content.ts
   - src/components/settings/notification-templates-form.content.ts
   - src/components/settings/overdue-monitoring-form.content.ts
   - src/components/settings/user-management-form.content.ts
   - src/components/settings/audit-log-viewer.content.ts
   - src/components/settings/database-maintenance-form.content.ts
   
   Server Details (3-4 files):
   - src/components/server-details/server-backup-table.content.ts
   - src/components/server-details/server-detail-summary-items.content.ts
   
   UI Components (only those with unique strings):
   - src/components/ui/backup-tooltip-content.content.ts
   - src/components/ui/available-backups-modal.content.ts
   
   Pages (page-level content):
   - src/app/[locale]/page.content.ts (dashboard page)
   - src/app/[locale]/login/page.content.ts

3. DO NOT CREATE content files for:
   - Generic UI components (button, label, input) - they use common.content.ts
   - Components that only use shared UI terms

Target: ~25-30 total content files (1 common + 24-29 component-specific)
```

#### **Prompt 3.2: Extract and Categorize Hard-coded Strings**
```
Extract all hard-coded strings and categorize for hybrid structure:

1. SCAN COMPONENTS FOR STRINGS
   Directories to scan:
   - src/components/dashboard/ (6 components)
   - src/components/settings/ (8 form components)
   - src/components/server-details/ (4 components)
   - src/components/ui/ (only those with unique text)
   - src/app/[locale]/ pages

2. CATEGORIZATION DECISION
   
   For each string, ask:
   
   → Is it shared across multiple components? 
      YES: Add to common.content.ts
      Examples: "Save", "Cancel", "Delete", "Loading...", "Error"
   
   → Is it specific to ONE component?
      YES: Create component .content.ts file
      Examples: "Server Overview", "Backup History", "No servers found"

3. CREATE EXTRACTION DOCUMENT
   
   Format for each component:
   ```
   Component: dashboard-table.tsx
   Common strings (use common.content.ts):
   - Save, Cancel, Refresh, Search, Filter
   
   Unique strings (create dashboard-table.content.ts):
   - "Server Overview"
   - "Last Backup Time"
   - "No servers configured"
   - "View backup details"
   ```

4. STRINGS TO EXTRACT BY TYPE
   - Table headers and column names → component content
   - Form labels and placeholders → component content
   - Button text → common content (if generic) OR component content (if specific)
   - Status messages → common content (if generic) OR component content (if specific)
   - Error messages → component content (context-specific)
   - Tooltips and help text → component content
   - Chart labels and axes → component content

Key translations vocabulary:
- "Backup" → "Sicherung" (DE), "sauvegarde" (FR), "copia de seguridad" (ES), "backup" (PT-BR)
- "Server" → "Server" (DE), "serveur" (FR), "servidor" (ES/PT-BR)
```

#### **Prompt 3.3: Populate Content Files (Hybrid Structure)**
```
Create all content files with 5-language translations (en, de, fr, es, pt-BR):

1. CREATE COMMON CONTENT FIRST
   
   File: src/app/[locale]/content/common.content.ts
   
   Template:
   ```typescript
   import { t, type Dictionary } from 'intlayer';
   
   export default {
     key: 'common',
     content: {
       ui: {
         save: t({ en: 'Save', de: 'Speichern', fr: 'Enregistrer', es: 'Guardar', 'pt-BR': 'Salvar' }),
         cancel: t({ en: 'Cancel', de: 'Abbrechen', fr: 'Annuler', es: 'Cancelar', 'pt-BR': 'Cancelar' }),
         delete: t({ en: 'Delete', de: 'Löschen', fr: 'Supprimer', es: 'Eliminar', 'pt-BR': 'Excluir' }),
         // ... 50+ more shared terms
       },
       navigation: { ... },
       status: { ... },
       time: { ... },
     },
   } satisfies Dictionary;
   ```

2. CREATE COMPONENT CONTENT FILES
   
   For each component identified in 3.1, create co-located .content.ts file:
   
   Template:
   ```typescript
   import { t, type Dictionary } from 'intlayer';
   
   export default {
     key: 'dashboard-table',  // Must be unique
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

3. PRIORITY ORDER
   
   Create in this order:
   1. common.content.ts (foundation)
   2. Dashboard components (5-6 files)
   3. Page-level content (dashboard, login)
   4. Settings components (8 files)
   5. Server details components (3-4 files)
   6. UI components with unique strings (2-3 files)

4. VALIDATION CHECKLIST
   - [ ] Each .content.ts file has unique key
   - [ ] All 5 languages present for each string
   - [ ] No duplication between common and component content
   - [ ] Component content files are co-located next to their .tsx files
   - [ ] TypeScript types match content structure
```

---

### **SESSION 4 PROMPTS (Component Integration - HYBRID APPROACH)**

#### **Prompt 4.1: Update Components to Use Hybrid Content**
```
Update all components to use HYBRID approach (common + component-specific content):

1. COMPONENT INTEGRATION PATTERN
   
   For Client Components:
   ```typescript
   'use client';
   import { useIntlayer } from 'react-intlayer';
   
   export function DashboardTable() {
     // Get component-specific content
     const content = useIntlayer('dashboard-table');
     
     // Get shared common content
     const common = useIntlayer('common');
     
     return (
       <div>
         <h2>{content.tableTitle}</h2>  {/* Component-specific */}
         <Button>{common.ui.save}</Button>  {/* Shared */}
         <Button>{common.ui.cancel}</Button>  {/* Shared */}
         <span>{content.noServersMessage}</span>  {/* Component-specific */}
       </div>
     );
   }
   ```
   
   For Server Components:
   ```typescript
   import { getContent } from 'intlayer';
   
   export default function DashboardPage() {
     const content = getContent('dashboard-page');
     const common = getContent('common');
     
     return <div>{content.title}</div>;
   }
   ```

2. UPDATE PRIORITY (by component group):
   
   A. Dashboard Components (src/components/dashboard/):
      - dashboard-table.tsx → useIntlayer('dashboard-table') + useIntlayer('common')
      - server-cards.tsx → useIntlayer('server-cards') + useIntlayer('common')
      - overview-cards.tsx → useIntlayer('overview-cards') + useIntlayer('common')
      - overview-charts-panel.tsx → useIntlayer('overview-charts-panel') + useIntlayer('common')
   
   B. Settings Components (src/components/settings/):
      - Each form component uses its own content + common
      - Example: server-settings-form.tsx → useIntlayer('server-settings-form') + useIntlayer('common')
   
   C. Server Details Components (src/components/server-details/):
      - server-backup-table.tsx → useIntlayer('server-backup-table') + useIntlayer('common')
      - server-detail-summary-items.tsx → useIntlayer('server-detail-summary-items') + useIntlayer('common')

3. DECISION GUIDE: When to Use Which Content
   
   Use common.ui.*:
   - Save, Cancel, Delete, Edit, Add, Remove
   - Search, Filter, Refresh, Clear, Reset
   - Close, Back, Next, Previous, Continue
   - Select, Copy, Export, Import, Download, Upload
   
   Use common.status.*:
   - Success, Error, Warning, Info, Loading
   - Pending, Failed, Completed, Cancelled
   - Unauthorized, Forbidden, Not Found
   
   Use common.navigation.*:
   - Dashboard, Settings, Servers, Logout
   
   Use common.time.*:
   - Today, Yesterday, Last 7 Days, Last 30 Days
   
   Use component content:
   - Everything else unique to that component

4. VALIDATION FOR EACH COMPONENT
   - [ ] Imports both useIntlayer('component-key') and useIntlayer('common')
   - [ ] Replaces all hard-coded strings
   - [ ] Uses common content for shared terms
   - [ ] Uses component content for unique strings
   - [ ] No TypeScript errors
   - [ ] Component renders correctly in all 5 languages
```

#### **Prompt 4.2: Update TypeScript Types**
```
Update type definitions for hybrid content structure:

1. LOCATION: src/app/[locale]/content/types.ts

2. CREATE INTERFACES
   
   ```typescript
   // Keep CommonContent interface (already exists)
   export interface CommonContent {
     ui: { save: string; cancel: string; ... };
     navigation: { dashboard: string; ... };
     status: { success: string; error: string; ... };
     time: { today: string; yesterday: string; ... };
   }
   
   // Add component-specific interfaces
   export interface DashboardTableContent {
     tableTitle: string;
     serverName: string;
     lastBackup: string;
     viewDetails: string;
     noServersMessage: string;
   }
   
   export interface ServerCardsContent {
     cardTitle: string;
     statusOnline: string;
     statusOffline: string;
     lastBackupLabel: string;
   }
   
   // Add interface for each component with content file
   export interface OverviewCardsContent { ... }
   export interface ServerSettingsFormContent { ... }
   // ... etc for each component
   ```

3. TYPE SAFETY
   - Ensure each content interface matches its .content.ts structure
   - Export all interfaces for use in components
   - TypeScript will catch missing translations or typos

4. VALIDATION
   - [x] Interface for common.content.ts (CommonContent interface exists)
   - [x] Interface for each component .content.ts file (All 25 content files have corresponding interfaces)
   - [x] Type definitions are correct (All interfaces match their .content.ts structures)
   - [x] All content keys typed correctly (All keys in ContentTypes interface and contentKeys array)
   
   **Status**: ✅ Type definitions are complete and correct. All 25 content files have corresponding TypeScript interfaces in types.ts:
   - CommonContent (common.content.ts)
   - 20 component-specific interfaces (dashboard, settings, server-details, ui components, pages)
   - 4 feature-level interfaces (settings, auth, api, notifications)
   
   **Note**: There are TypeScript errors in components (missing useIntlayer hooks), but these are implementation issues, not type definition problems. The type definitions themselves are correct and complete.
```

#### **Prompt 4.3: Test Component Integration**
```
Test all updated components in all 5 languages:

1. COMPONENT-BY-COMPONENT TESTING
   
   For each component:
   - Load in browser with locale parameter: /en/dashboard, /de/dashboard, etc.
   - Verify component-specific content loads correctly
   - Verify common content (buttons, status) loads correctly
   - Check for missing translations (fallback to English = error)
   - Test locale switching preserves functionality

2. TEST CHECKLIST BY COMPONENT GROUP
   
   Dashboard:
   - [ ] dashboard-table shows correct table headers in all languages
   - [ ] server-cards displays correct status messages
   - [ ] overview-cards shows correct metric names
   - [ ] Save/Cancel/Delete buttons use common content
   
   Settings:
   - [ ] All 8 form components load correct labels
   - [ ] Form validation messages appear in correct language
   - [ ] Common buttons (Save, Cancel) work across all forms
   
   Server Details:
   - [ ] Backup table headers translate correctly
   - [ ] Technical terms maintain accuracy
   - [ ] Common UI elements consistent across components

3. CROSS-LANGUAGE TESTING
   - English (en): Verify all features work as baseline
   - German (de): Check text expansion, compound words
   - French (fr): Verify accented characters, longer text
   - Spanish (es): Check accented characters, gender agreement
   - Portuguese (pt-BR): Verify regional terms

4. ISSUES TO WATCH FOR
   - Missing translations (text stays in English)
   - Broken imports (component can't find content)
   - Type errors (TypeScript complains about missing keys)
   - UI breaks with longer text (German/French)
   - Inconsistent terminology across components

Document any issues and fix before proceeding to Phase 5.
```

---

### **SESSION 5 PROMPTS (AI-Powered Translation - HYBRID STRUCTURE)**

#### **Prompt 5.1: Configure AI Translation for All Content Files**
```
Configure AI translation for both common and component-specific content:

1. SET UP AI TRANSLATION IN intlayer.config.ts
   
   ```typescript
   const config: IntlayerConfig = {
     internationalization: {
       locales: [Locales.ENGLISH, Locales.GERMAN, Locales.FRENCH, 
                 Locales.SPANISH, Locales.PORTUGUESE_BRAZIL],
       defaultLocale: Locales.ENGLISH,
     },
     ai: {
       enabled: true,
       provider: 'openai',  // or 'claude', 'deepl', etc.
       apiKey: process.env.AI_TRANSLATION_KEY,
       model: 'gpt-4',  // or appropriate model
       translationQuality: 'high',
       preserveTechnicalTerms: true,  // Important for backup/IT terms
     },
   };
   ```

2. PREPARE TRANSLATION GLOSSARY
   
   Create glossary for consistent technical terminology:
   - "Backup" → maintain accuracy across all languages
   - "Server" → consistent translation
   - "Database" → technical precision
   - "Configuration" → exact terminology
   - Status terms (Success, Failed, Pending) → consistent across all content

3. CONTENT FILES TO TRANSLATE
   
   Priority order:
   1. common.content.ts (foundation - 50+ terms)
   2. Dashboard component content (5-6 files)
   3. Settings component content (8 files)
   4. Server details component content (3-4 files)
   5. Page-level content (2-3 files)
   6. UI component content (2-3 files)
   
   Total: ~25-30 content files

4. TRANSLATION VALIDATION SETUP
   - Verify all 5 languages present for each key
   - Check technical term consistency
   - Validate German compound words (not too long)
   - Verify French/Spanish gender agreement
   - Check Portuguese regional variations
```

#### **Prompt 5.2: Generate Batch Translations for All Content Files**
```
Run AI translation on all content files (common + component-specific):

1. TRANSLATION EXECUTION
   
   Run Intlayer AI translation command for all .content.ts files:
   ```bash
   # Translate all content files
   npx intlayer translate
   
   # Or translate specific files
   npx intlayer translate src/app/[locale]/content/common.content.ts
   npx intlayer translate src/components/dashboard/dashboard-table.content.ts
   ```

2. TRANSLATION CHALLENGES TO HANDLE
   
   Technical terminology:
   - "Backup" terminology - ensure consistency
   - "Server", "Database", "Configuration" - technical precision
   - Status messages - maintain clarity
   
   Language-specific:
   - German: Watch for overly long compound words in UI elements
   - French: Gender agreement, text expansion (~25% longer)
   - Spanish: Accented characters, gender agreement
   - Portuguese (pt-BR): Regional Brazilian variations, not European Portuguese

3. BATCH TRANSLATION PROCESS
   
   For each content file:
   a. AI translates English (en) to 4 target languages
   b. Verify all keys have translations
   c. Check for missing language variants
   d. Validate technical term consistency
   e. Review context accuracy

4. POST-TRANSLATION CHECKS
   
   Common content (common.content.ts):
   - [ ] All 50+ UI terms translated consistently
   - [ ] Navigation terms accurate
   - [ ] Status messages clear and precise
   - [ ] Time terms correct for each locale
   
   Component content (all 24-29 files):
   - [ ] Component-specific terminology accurate
   - [ ] Technical terms consistent with common content
   - [ ] Context-appropriate translations
   - [ ] No missing translations

5. VERIFICATION COMMAND
   ```bash
   # Build to verify all translations compile correctly
   pnpm build
   
   # Check for missing translations
   grep -r "TODO.*translation" src/
   ```
```

#### **Prompt 5.3: Manual Review and Refinement**
```
Perform manual review of AI translations across all content files:

1. REVIEW COMMON CONTENT FIRST (Foundation)
   
   File: src/app/[locale]/content/common.content.ts
   
   Focus areas:
   - UI actions (Save, Cancel, Delete) - must be natural, not literal
   - Status terms (Success, Error, Loading) - clear and concise
   - Navigation (Dashboard, Settings) - match industry standards
   - Time terms (Today, Yesterday) - culturally appropriate
   
   Verify consistency: These terms will be used across ALL components

2. REVIEW COMPONENT-SPECIFIC CONTENT
   
   Priority review order:
   
   A. Dashboard components (high visibility):
      - dashboard-table.content.ts: Table headers, tooltips
      - overview-cards.content.ts: Metric names, descriptions
      - Review for clarity and technical accuracy
   
   B. Settings components (extensive content):
      - Review form labels for clarity
      - Validate help text makes sense in each language
      - Check validation messages are understandable
   
   C. Server details (technical content):
      - Verify backup terminology accuracy
      - Check technical descriptions maintain precision
      - Validate status messages

3. COMMON AI TRANSLATION ISSUES TO FIX
   
   Overly literal translations:
   - AI often translates word-by-word, missing idiomatic usage
   - Example: "Log in" might become overly formal in some languages
   
   Cultural inappropriateness:
   - Some phrases don't translate culturally
   - Adjust for natural language usage
   
   Technical inaccuracy:
   - AI might not know specialized backup/IT terminology
   - Verify with technical glossaries or native IT professionals
   
   German compound words:
   - AI may create overly long compound words
   - Simplify if they break UI layout

4. REFINEMENT PROCESS
   
   For each language:
   - German (de): Simplify compound words, check formality level
   - French (fr): Verify gender agreement, check text expansion
   - Spanish (es): Check regional appropriateness (neutral Spanish vs specific)
   - Portuguese (pt-BR): Ensure Brazilian Portuguese, not European

5. NATIVE SPEAKER REVIEW (Optional but Recommended)
   - Have native speakers review key components
   - Focus on dashboard and settings (most user-facing)
   - Validate technical terminology makes sense
   - Check for cultural appropriateness

6. FINAL VALIDATION
   - [ ] Common content reviewed and refined
   - [ ] All component content reviewed
   - [ ] Technical terminology consistent
   - [ ] No awkward or literal translations
   - [ ] Cultural appropriateness verified
   - [ ] Text expansion acceptable for UI
```

---

### **SESSION 6 PROMPTS (Advanced Localization Features)**

#### **Prompt 6.1: Enhance Date/Time Localization**
```
Enhance date/time localization using existing locale-aware code:

1. Integrate Intlayer's date/time utilities with existing date-fns usage
2. Support locale-specific date formats:
   - English: MM/DD/YYYY
   - German: DD.MM.YYYY
   - French: DD/MM/YYYY
   - Spanish: DD/MM/YYYY
   - Portuguese: DD/MM/YYYY

3. Enhance time localization:
   - 12h vs 24h format based on locale
   - Time zone handling
   - Relative time formatting

4. Update all date displays in:
   - Charts and graphs
   - Backup history tables
   - Server status indicators
   - Log viewers

Leverage existing locale-aware code but integrate with Intlayer.

Current date handling uses:
- date-fns library
- Intl.NumberFormat
- Browser locale detection
```

#### **Prompt 6.2: Improve Number Formatting**
```
Improve number formatting using existing locale-aware code:

1. Integrate Intlayer's number utilities with existing Intl.NumberFormat usage
2. Support locale-specific number formats:
   - English: 1,234.56
   - German: 1.234,56
   - French: 1 234,56
   - Spanish: 1.234,56
   - Portuguese: 1.234,56

3. Update number displays in:
   - File sizes and storage metrics
   - Backup statistics
   - Server performance metrics
   - Charts and graphs

4. Handle currency formatting if needed

Maintain existing functionality but integrate with Intlayer's system.

Current number handling uses:
- Intl.NumberFormat
- Custom formatting functions
- Browser locale detection
```

#### **Prompt 6.3: Prepare RTL Support**
```
Prepare RTL (right-to-left) support for future languages:

1. Add CSS variables for text direction:
   - Direction switching for future RTL languages
   - Margin/padding adjustments
   - Icon and image mirroring

2. Update layout components:
   - Navigation direction awareness
   - Table layouts for RTL
   - Form field ordering

3. Test with CSS direction: rtl for:
   - Navigation components
   - Tables and lists
   - Forms and inputs

Current languages are all LTR, but prepare foundation for future RTL languages.

Current CSS structure:
- Tailwind CSS utilities
- Custom CSS variables
- shadcn/ui components
```

---

### **SESSION 7 PROMPTS (Testing and Validation)**

#### **Prompt 7.1: Functionality Testing**
```
Perform comprehensive functionality testing for all 5 languages:

1. Test each language thoroughly:
   - English (en): Default functionality
   - German (de): Text expansion, compound words
   - French (fr): Accented characters, longer text
   - Spanish (es): Accented characters, gender agreement
   - Portuguese (pt-BR): Accented characters, regional terms

2. Test core functionality:
   - Locale switching
   - URL routing (/en/dashboard, /de/dashboard, etc.)
   - Session persistence
   - Browser language detection

3. Test all pages and components:
   - Dashboard with charts and metrics
   - Settings forms and validation
   - Authentication flow
   - Server detail views

4. Verify complete translation coverage:
   - No missing translations
   - No fallback to English errors
   - Consistent terminology

Document any issues found and create fix plan.
```

#### **Prompt 7.2: Visual Testing**
```
Perform visual testing for text expansion and character support:

1. Test text expansion handling:
   - German compound words in buttons and labels
   - French/Spanish 25-35% longer text
   - Portuguese text expansion
   - Responsive design with longer text

2. Test character display:
   - Accented characters (é, ñ, ã, ç, etc.)
   - Special characters in all languages
   - Font rendering consistency

3. Test UI elements:
   - Button text fitting
   - Table column widths
   - Form label alignment
   - Navigation menu layout

4. Test responsive design:
   - Mobile views with longer text
   - Tablet and desktop layouts
   - Chart and graph displays

Identify any UI elements that need adjustment for longer text.
```

#### **Prompt 7.3: Performance Testing**
```
Perform performance testing for internationalisation impact:

1. Measure bundle size impact:
   - Build size with all 5 languages
   - Individual locale bundle sizes
   - Tree-shaking effectiveness
   - Compare with baseline (pre-i18n)

2. Test loading performance:
   - Initial page load times
   - Locale switching speed
   - Content loading performance
   - Static site generation impact

3. Test runtime performance:
   - Memory usage with multiple locales
   - Translation lookup performance
   - Component rendering performance

4. Analyze results:
   - Bundle size increase (target: <20%)
   - Load time impact (target: <10%)
   - Memory usage impact

Document performance metrics and optimization recommendations.
```

---

### **SESSION 8 PROMPTS (Visual Editor and CMS Setup)**

#### **Prompt 8.1: Configure Intlayer Visual Editor**
```
Configure Intlayer visual editor for future content management:

1. Enable editor in intlayer.config.ts:
   - Set enabled: true
   - Configure editor URL
   - Set up development server
   - Configure authentication if needed

2. Set up editor development workflow:
   - npm run editor script
   - Concurrent development server and editor
   - Hot reload for translation changes

3. Test editor functionality:
   - Content editing interface
   - Translation management
   - Preview functionality

4. Document editor usage for team:
   - How to access and use editor
   - Translation workflow
   - Quality assurance process

Configure but keep optional for future use as requested.
```

#### **Prompt 8.2: Prepare CMS Integration**
```
Prepare CMS integration for non-technical translation management:

1. Set up CMS configuration:
   - Content synchronization
   - User role management
   - Translation workflow
   - Version control integration

2. Prepare documentation:
   - CMS usage guide
   - Translation guidelines
   - Quality assurance process
   - Deployment workflow

3. Test CMS features:
   - Content editing capabilities
   - Translation workflow
   - Preview and testing
   - Deployment process

Prepare CMS infrastructure but keep disabled initially.
```

---

## Quick Resume Prompts for Multi-Session Implementation

### **To Resume at Session 1 (Phase 1)**
```
Continue internationalisation implementation from Session 1. Current status: duplistatus Next.js 16 app needs Intlayer setup for 5 languages (en, de, fr, es, pt-BR). Start with dependencies and configuration.

Current project details:
- Next.js 16 with App Router
- Uses pnpm package manager
- Port 8666 for development
- Has better-sqlite3 integration
- Uses shadcn/ui and Tailwind CSS
- Current locale-aware features: basic number/date formatting

Begin with Phase 1.1: Install Intlayer dependencies.
```

### **To Resume at Session 2 (Phase 2)**
```
Continue internationalisation implementation from Session 2. Phase 1 completed. Current status: Intlayer dependencies installed, intlayer.config.ts created. Need to implement URL routing and middleware for 5-language support (en, de, fr, es, pt-BR).

Current setup:
- intlayer.config.ts configured for 5 languages
- Dependencies installed via pnpm
- TypeScript configuration updated
- Next.js configuration integrated

Begin with Phase 2.1: Implement dynamic locale routing.
```

### **To Resume at Session 3 (Phase 3) - HYBRID APPROACH**
```
Continue internationalisation from Session 3. Phases 1-2 completed. 
Current status: Intlayer configured with routing and middleware. 
Need to create HYBRID content structure (common + per-component).

Completed setup:
- Dynamic locale routing (/[locale]/)
- Middleware for locale detection
- Root layout updated for locale support
- Configuration files ready

HYBRID ARCHITECTURE:
- Centralized: common.content.ts (50+ shared UI terms)
- Co-located: .content.ts files next to each component (24-29 files)

Begin with Phase 3.1: Create hybrid content structure.
```

### **To Resume at Session 4 (Phase 4) - HYBRID APPROACH**
```
Continue internationalisation from Session 4. Phases 1-3 completed. 
Current status: HYBRID content structure created with common + component files.

Completed:
- common.content.ts with 50+ shared UI terms
- 24-29 component-specific .content.ts files co-located with components
- All strings extracted and categorized
- 5-language translation framework ready

NEXT: Update components to use HYBRID approach:
- Import both useIntlayer('component-key') and useIntlayer('common')
- Use common content for shared UI (Save, Cancel, Delete, etc.)
- Use component content for unique strings

Begin with Phase 4.1: Update components to hybrid content pattern.
```

### **To Resume at Session 5 (Phase 5) - HYBRID APPROACH**
```
Continue internationalisation from Session 5. Phases 1-4 completed. 
Current status: All components updated with hybrid content approach.

Completed:
- All components use useIntlayer('component-key') + useIntlayer('common')
- Common content shared across all components
- Component-specific content co-located with components
- Type safety implemented for all content files

Content files ready for translation:
- 1 common.content.ts file
- 24-29 component-specific .content.ts files
- Total: ~25-30 files needing AI translation

Begin with Phase 5.1: Configure AI translation for all content files.
```

### **To Resume at Session 6 (Phase 6)**
```
Continue internationalisation implementation from Session 6. Phases 1-5 completed. Current status: AI translations generated and reviewed for all 5 languages. Need to enhance date/time and number formatting.

Completed:
- AI translation provider configured
- Batch translations generated for en, de, fr, es, pt-BR
- Manual review and refinement completed
- Technical terminology validated

Begin with Phase 6.1: Enhance date/time localization.
```

### **To Resume at Session 7 (Phase 7)**
```
Continue internationalisation implementation from Session 7. Phases 1-6 completed. Current status: Advanced localization features implemented. Need comprehensive testing for all 5 languages.

Completed:
- Date/time localization enhanced
- Number formatting improved
- RTL support prepared
- All localization features integrated

Begin with Phase 7.1: Perform functionality testing for all languages.
```

### **To Resume at Session 8 (Phase 8)**
```
Continue internationalisation implementation from Session 8. Phases 1-7 completed. Current status: All testing completed, functionality verified. Need to set up visual editor and CMS integration.

Completed:
- Functionality testing passed
- Visual testing passed
- Performance testing within limits
- All languages working correctly

Begin with Phase 8.1: Configure Intlayer visual editor.
```

---

## Implementation Guidelines and Best Practices

### Hybrid Architecture Pattern

**HYBRID = Centralized Common + Co-located Component Content**

```typescript
// PATTERN 1: Client Component with Hybrid Content
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
      <span>{content.noServersFound}</span>  {/* Component-specific */}
    </div>
  );
}

// PATTERN 2: Server Component with Hybrid Content
import { getContent } from 'intlayer';

export default function DashboardPage() {
  const content = getContent('dashboard-page');
  const common = getContent('common');
  
  return (
    <div>
      <h1>{content.pageTitle}</h1>
      <button>{common.ui.refresh}</button>
    </div>
  );
}
```

### Code Style Guidelines

```typescript
// ✅ GOOD: Use descriptive content keys
const content = useIntlayer('dashboard-table');
const common = useIntlayer('common');

// ✅ GOOD: Destructure for cleaner code
const { tableTitle, noServersFound } = useIntlayer('dashboard-table');
const { ui, navigation, status } = useIntlayer('common');

// ✅ GOOD: Use common content for shared terms
<Button>{common.ui.save}</Button>
<Button>{common.ui.cancel}</Button>

// ❌ BAD: Don't duplicate shared terms in component content
// Instead of creating "save" in dashboard-table.content.ts,
// use common.ui.save

// ✅ GOOD: Maintain type safety
import type { Dictionary } from "intlayer";

export default {
  key: 'dashboard-table',
  content: {
    // ...
  },
} satisfies Dictionary;

// ✅ GOOD: Handle missing translations gracefully (fallback)
const title = content.title || "Dashboard";
```

### Content Organization Guidelines

**When to use common.content.ts:**
- ✅ UI actions used across multiple components (Save, Cancel, Delete, Edit)
- ✅ Status messages (Success, Error, Loading, Pending)
- ✅ Navigation terms (Dashboard, Settings, Logout)
- ✅ Time terms (Today, Yesterday, Last 7 Days)
- ✅ Generic status (Online, Offline, Active, Inactive)

**When to create component .content.ts:**
- ✅ Component-specific headings and titles
- ✅ Feature-specific terminology
- ✅ Context-specific messages
- ✅ Component-unique tooltips
- ✅ Technical terms for that component

**When NOT to create .content.ts:**
- ❌ Component only uses common terms
- ❌ Generic UI components (Button, Label, Input)
- ❌ Components with no text content

### File Organization

```
src/
├── app/[locale]/
│   ├── content/
│   │   ├── common.content.ts          ← Shared UI (50+ terms)
│   │   └── types.ts                    ← TypeScript interfaces
│   ├── page.tsx
│   └── page.content.ts                 ← Page-level content
│
└── components/
    ├── dashboard/
    │   ├── dashboard-table.tsx
    │   ├── dashboard-table.content.ts  ← Co-located content
    │   ├── server-cards.tsx
    │   └── server-cards.content.ts     ← Co-located content
    │
    └── ui/
        ├── button.tsx                  ← No content (uses common)
        └── backup-tooltip.tsx
            └── backup-tooltip.content.ts  ← Only if has unique strings
```

### Translation Guidelines
- Keep translations concise but natural (not overly literal)
- Use consistent terminology across ALL content files
- Consider text expansion in UI design (German +30%, French/Spanish +25%)
- Test accent character display thoroughly (é, ñ, ã, ç)
- Maintain technical accuracy in all languages

### Testing Guidelines
- Test each language thoroughly before deployment
- Verify responsive design with longer text (especially German/French)
- Check for broken layouts with text expansion
- Validate date/number formatting per locale
- Test locale switching maintains component state

### Performance Guidelines
- Enable tree-shaking for unused translations (Intlayer automatic)
- Use static generation where possible
- Monitor bundle size impact (target: <20% increase)
- Optimize for mobile performance
- Leverage Intlayer's automatic bundle optimization

---

## Success Metrics

### Technical Metrics
- [ ] 100% translation coverage for all 5 languages
- [ ] Bundle size increase < 20% (Intlayer tree-shaking active)
- [ ] Page load time impact < 10%
- [ ] Zero console errors in all locales
- [ ] All pages render correctly in all languages

### Architecture Metrics (Hybrid Approach)
- [ ] common.content.ts has 50+ shared UI terms
- [ ] 24-29 component-specific .content.ts files co-located with components
- [ ] No centralized feature-level content files (dashboard.content.ts removed)
- [ ] All components use hybrid pattern (common + component-specific)
- [ ] Component content automatically removed when component deleted
- [ ] No duplication of shared terms across component files

### User Experience Metrics
- [ ] Seamless locale switching (/en → /de → /fr → /es → /pt-BR)
- [ ] Proper text expansion handling (German, French, Spanish)
- [ ] Consistent terminology across languages and components
- [ ] Correct date/number formatting per locale
- [ ] Accurate accent character display (é, ñ, ã, ç, ü, etc.)

---

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue: Missing Translations
```
Problem: Text shows in English instead of target language
Solution: 
1. Check content file exists for component
2. Verify translation key spelling
3. Ensure all language variants present
4. Check intlayer build output
```

#### Issue: Text Overflow
```
Problem: Longer text breaks UI layout
Solution:
1. Identify problematic components
2. Add responsive text sizing
3. Implement text truncation with tooltips
4. Adjust container widths
```

---

## Final Implementation Checklist

### Pre-Launch Checklist (Hybrid Approach)
- [ ] common.content.ts created with 50+ shared UI terms
- [ ] 24-29 component-specific .content.ts files co-located with components
- [ ] All components updated with hybrid pattern (common + component-specific)
- [ ] TypeScript types created for all content files
- [ ] URL routing works for all 5 languages (/en, /de, /fr, /es, /pt-BR)
- [ ] Middleware handles locale detection correctly
- [ ] Date/number formatting works per locale
- [ ] No missing translations in any language
- [ ] Responsive design works with text expansion (German/French)
- [ ] Performance impact within acceptable limits (<20% bundle increase)
- [ ] No centralized feature-level content files (dashboard, settings)
- [ ] Visual editor configured but disabled
- [ ] Documentation updated

### Post-Launch Checklist
- [ ] Monitor error logs for i18n issues
- [ ] Collect user feedback on translations
- [ ] Track performance metrics (bundle size, load times)
- [ ] Plan translation improvements based on feedback
- [ ] Schedule regular maintenance for content updates
- [ ] Test component deletion removes content automatically
- [ ] Enable visual editor when ready

---

## Quick Reference Commands

### Development Commands
```bash
# Start development server
pnpm dev

# Start Intlayer editor (when enabled)
pnpm editor

# Build with all locales
pnpm build

# Test specific locale
curl http://localhost:8666/de/dashboard
```

### Testing Commands
```bash
# Build test
pnpm build

# Lint check
pnpm lint

# Type check
pnpm type-check

# Test all locales
pnpm test:i18n
```

---

**This comprehensive plan provides detailed AI prompts for each session and phase, using Intlayer's HYBRID PER-COMPONENT management approach: centralized common content (common.content.ts) combined with co-located component-specific content files. This architecture ensures automatic cleanup, optimal bundling, and no duplication while maintaining ease of maintenance.**

### Key Differences from Traditional Approach

| Aspect | Traditional Centralized | Hybrid Per-Component |
|--------|------------------------|---------------------|
| Common strings | Duplicated in each file | Single source (common.content.ts) |
| Component content | Centralized by feature | Co-located with components |
| Automatic cleanup | Manual | Automatic (remove component = remove content) |
| Bundle optimization | Limited | Optimal (tree-shaking per component) |
| Maintainability | Medium | High |
| Organization | Feature-based | Component-based + shared |

### Benefits Achieved

✅ **No duplication**: Common UI terms (50+) defined once, reused everywhere  
✅ **Automatic cleanup**: Remove component → content removed automatically  
✅ **Better organization**: Translations next to component code  
✅ **Optimal bundling**: Tree-shaking of unused component content  
✅ **Easier maintenance**: Clear separation (shared vs unique)  
✅ **Scalability**: Add components without bloating centralized files