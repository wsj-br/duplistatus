# Internationalisation Implementation Plan for duplistatus

## Project Overview
**Application**: duplistatus - Duplicati backup monitoring dashboard  
**Framework**: Next.js 16 + React 19 + TypeScript + Tailwind CSS  
**Target Languages**: English (en), German (de), French (fr), Spanish (es), Brazilian Portuguese (pt-BR)  
**i18n Framework**: Intlayer with AI-powered translation  
**Implementation Method**: Multi-session AI agent execution  

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
- [ ] Phase 3.1: Content structure created
- [ ] Phase 3.2: String extraction completed
- [ ] Phase 3.3: Content files populated

### Session 4 - [Date]
- [ ] Phase 4.1: Component integration started
- [ ] Phase 4.2: Dashboard components updated
- [ ] Phase 4.3: Settings components updated

### Session 5 - [Date]
- [ ] Phase 5.1: AI translation configured
- [ ] Phase 5.2: Batch translations generated
- [ ] Phase 5.3: Manual review completed

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

### **SESSION 3 PROMPTS (Content Structure Creation)**

#### **Prompt 3.1: Create Content Directory Structure**
```
Create content directory structure for Intlayer content files:

1. Create /src/app/[locale]/content/ directory
2. Set up content file structure:
   - common.content.ts (shared UI elements)
   - dashboard.content.ts (dashboard-specific)
   - settings.content.ts (settings pages)
   - auth.content.ts (authentication)
   - api.content.ts (API messages)
   - notifications.content.ts (email/NTFY messages)
3. Create TypeScript types for content organization
4. Set up proper imports and exports

Structure should be scalable and maintainable for 5 languages.
```

#### **Prompt 3.2: Extract All Hard-coded Strings**
```
Systematically extract all hard-coded strings from duplistatus application:

1. Scan all components and pages for hard-coded text:
   - Navigation elements (header, menu items)
   - Button labels and tooltips
   - Form labels, placeholders, validation messages
   - Table headers and filter options
   - Status indicators and messages
   - Chart labels and legends
   - Error messages and notifications

2. Focus on key directories:
   - src/components/dashboard/
   - src/components/settings/
   - src/components/ui/
   - src/app/detail/
   - src/app/login/
   - src/app/api/

3. Categorize strings by component/page:
   - Dashboard components
   - Settings forms
   - Authentication pages
   - Server detail views
   - API responses

4. Create comprehensive list with context for each string
5. Identify strings requiring special formatting (dates, numbers, plurals)

Focus on user-facing text, not code comments or internal identifiers.
```

#### **Prompt 3.3: Create Content Files with 5-Language Structure**
```
Create comprehensive content files for all 5 languages (en, de, fr, es, pt-BR):

1. Create common.content.ts with shared UI elements:
   - Navigation items (Dashboard, Settings, Servers, Logout)
   - Common actions (Save, Cancel, Delete, Edit)
   - Status messages (Success, Error, Loading)
   - Form elements (Submit, Reset, Required)

2. Create dashboard.content.ts:
   - Dashboard title and headings
   - Server status indicators
   - Backup terminology
   - Chart labels and tooltips
   - Time-related terms

3. Create settings.content.ts:
   - Settings section titles
   - Form labels and descriptions
   - Configuration options
   - Help text and tooltips

4. Create auth.content.ts:
   - Login form labels
   - Authentication messages
   - Password requirements
   - Session management

5. Create api.content.ts:
   - Success/error messages
   - Validation responses
   - Status descriptions

Each file should use t() function with all 5 language variants.

Key translations to focus on:
- "Backup" → "Sicherung" (DE), "sauvegarde" (FR), "copia de seguridad" (ES), "backup" (PT-BR)
- "Server" → "Server" (DE), "serveur" (FR), "servidor" (ES/PT-BR)
- "Dashboard" → "Dashboard" (DE), "tableau de bord" (FR), "panel de control" (ES), "painel" (PT-BR)
```

---

### **SESSION 4 PROMPTS (Component Integration)**

#### **Prompt 4.1: Update Dashboard Components**
```
Update dashboard components to use Intlayer translations:

1. Modify /src/app/[locale]/page.tsx:
   - Import useIntlayer hook
   - Replace hard-coded strings with content keys
   - Test all dashboard elements are translated

2. Update dashboard component files:
   - /src/components/dashboard/*.tsx files
   - Server cards and status indicators
   - Backup tables and charts
   - Filter and search elements

3. Ensure proper type safety:
   - TypeScript types for content keys
   - Handle missing translations gracefully
   - Maintain existing functionality

4. Test responsive design with longer text (German, French, Spanish, Portuguese)

Focus on main dashboard components first for pilot testing.

Current dashboard components include:
- Server status cards
- Backup history tables
- Charts and graphs
- Filter controls
- Search functionality
```

#### **Prompt 4.2: Update Settings Components**
```
Update settings components to use Intlayer translations:

1. Modify settings pages:
   - /src/app/[locale]/settings/page.tsx
   - All settings sub-pages

2. Update settings components:
   - /src/components/settings/*.tsx files
   - Server configuration forms
   - User management interfaces
   - Notification settings
   - Email/NTFY configuration

3. Handle form-specific translations:
   - Labels and placeholders
   - Validation messages
   - Help text and descriptions
   - Success/error notifications

4. Ensure form validation works with all languages

Settings have extensive forms - ensure complete translation coverage.

Current settings include:
- Server configuration
- User management
- Email/NTFY notifications
- Audit logs
- Application settings
```

#### **Prompt 4.3: Update Authentication Components**
```
Update authentication components to use Intlayer translations:

1. Modify authentication pages:
   - /src/app/[locale]/login/page.tsx
   - Password change modals

2. Update auth components:
   - Login forms
   - Password validation
   - Session management

3. Handle security-related translations:
   - Error messages
   - Security warnings
   - Password requirements

4. Ensure authentication flow works in all languages

Authentication is critical - ensure accuracy and security across all languages.

Current auth features:
- Login page
- Password requirements
- Session management
- User authentication
```

#### **Prompt 4.4: Update Server Detail Components**
```
Update server detail components to use Intlayer translations:

1. Modify server detail pages:
   - /src/app/[locale]/detail/[id]/page.tsx
   - All server detail sub-pages

2. Update server detail components:
   - /src/components/server-details/*.tsx files
   - Server status information
   - Backup history tables
   - Log viewers

3. Handle technical terminology:
   - Backup-specific terms
   - Server status indicators
   - Technical descriptions

4. Ensure technical accuracy in all languages

Server details contain technical terms - ensure precise translations.
```

---

### **SESSION 5 PROMPTS (AI-Powered Translation)**

#### **Prompt 5.1: Configure AI Translation Provider**
```
Configure AI translation provider for Intlayer:

1. Set up AI translation configuration in intlayer.config.ts:
   - Choose AI provider (OpenAI, Claude, etc.)
   - Configure API key and settings
   - Set translation quality parameters
   - Configure target languages (en, de, fr, es, pt-BR)

2. Test AI translation with sample content
3. Validate translation quality for technical terms
4. Set up translation validation rules

Focus on backup/IT terminology accuracy for technical content.
```

#### **Prompt 5.2: Generate Batch Translations**
```
Generate AI translations for all content files:

1. Run Intlayer AI translation on all content files:
   - common.content.ts
   - dashboard.content.ts
   - settings.content.ts
   - auth.content.ts
   - api.content.ts

2. Handle specific translation challenges:
   - Technical backup terminology
   - German compound words
   - French/Spanish gender agreement
   - Portuguese variations

3. Validate translation completeness:
   - Ensure all keys have translations
   - Check for missing language variants
   - Verify consistent terminology

4. Review translations for context accuracy

Generate high-quality initial translations for all 5 languages.
```

#### **Prompt 5.3: Manual Review and Refinement**
```
Perform manual review and refinement of AI translations:

1. Review technical terminology:
   - "Backup" terminology in each language
   - "Server" and status terms
   - UI consistency terms

2. Check for common AI translation issues:
   - Literal translations vs idiomatic usage
   - Cultural appropriateness
   - Technical accuracy

3. Refine translations:
   - German compound words (if too long)
   - French/Spanish text expansion issues
   - Portuguese regional variations

4. Validate with native speakers if possible

Focus on technical accuracy and user experience in each language.
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

### **To Resume at Session 3 (Phase 3)**
```
Continue internationalisation implementation from Session 3. Phases 1-2 completed. Current status: Intlayer configured with routing and middleware. Need to create content structure and extract strings for 5 languages (en, de, fr, es, pt-BR).

Completed setup:
- Dynamic locale routing (/[locale]/)
- Middleware for locale detection
- Root layout updated for locale support
- Configuration files ready

Begin with Phase 3.1: Create content directory structure and extract strings.
```

### **To Resume at Session 4 (Phase 4)**
```
Continue internationalisation implementation from Session 4. Phases 1-3 completed. Current status: Content structure created, strings extracted, content files populated with 5-language translations.

Completed:
- Content files: common.content.ts, dashboard.content.ts, settings.content.ts, auth.content.ts, api.content.ts
- All strings categorized and structured
- 5-language translation framework ready

Begin with Phase 4.1: Update dashboard components to use useIntlayer hook.
```

### **To Resume at Session 5 (Phase 5)**
```
Continue internationalisation implementation from Session 5. Phases 1-4 completed. Current status: All components updated with useIntlayer hook, content structure in place. Need to configure AI translation and generate translations.

Completed:
- Dashboard, settings, auth, server detail components updated
- All hard-coded strings replaced with content keys
- Type safety implemented
- Component integration tested

Begin with Phase 5.1: Configure AI translation provider for 5 languages.
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

### Code Style Guidelines
```typescript
// Use descriptive content keys
const { dashboardTitle, serverStatus } = useIntlayer("dashboard");

// Maintain type safety
import type { Dictionary } from "intlayer";

// Handle missing translations gracefully
const title = dashboardTitle || "Dashboard"; // Fallback
```

### Translation Guidelines
- Keep translations concise but natural
- Use consistent terminology across components
- Consider text expansion in UI design (German +30%, French/Spanish +25%)
- Test accent character display thoroughly

### Testing Guidelines
- Test each language thoroughly before deployment
- Verify responsive design with longer text
- Check for broken layouts with text expansion
- Validate date/number formatting per locale

### Performance Guidelines
- Enable tree-shaking for unused translations
- Use static generation where possible
- Monitor bundle size impact
- Optimize for mobile performance

---

## Success Metrics

### Technical Metrics
- [ ] 100% translation coverage for all 5 languages
- [ ] Bundle size increase < 20%
- [ ] Page load time impact < 10%
- [ ] Zero console errors in all locales
- [ ] All pages render correctly in all languages

### User Experience Metrics
- [ ] Seamless locale switching
- [ ] Proper text expansion handling
- [ ] Consistent terminology across languages
- [ ] Correct date/number formatting
- [ ] Accurate accent character display

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

### Pre-Launch Checklist
- [ ] All content files created and populated
- [ ] All components updated with useIntlayer hook
- [ ] URL routing works for all 5 languages
- [ ] Middleware handles locale detection correctly
- [ ] Date/number formatting works per locale
- [ ] No missing translations in any language
- [ ] Responsive design works with text expansion
- [ ] Performance impact within acceptable limits
- [ ] Visual editor configured but disabled
- [ ] Documentation updated

### Post-Launch Checklist
- [ ] Monitor error logs for i18n issues
- [ ] Collect user feedback on translations
- [ ] Track performance metrics
- [ ] Plan translation improvements
- [ ] Schedule regular maintenance
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

**This comprehensive plan provides detailed AI prompts for each session and phase, enabling multi-session implementation with clear continuity and specific instructions for duplistatus internationalisation using Intlayer.**