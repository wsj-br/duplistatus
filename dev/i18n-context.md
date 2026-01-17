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
**Current State**: No dedicated i18n framework  
**Existing Locale Features**: 
- Basic number formatting with Intl.NumberFormat
- Date formatting with date-fns
- Browser locale detection (navigator.language)
- HTML lang attribute set to "en"

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
│   ├── api/               # API routes
│   ├── detail/            # Server detail pages
│   ├── settings/         # Settings pages
│   ├── login/            # Authentication page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Dashboard page
├── components/
│   ├── ui/              # shadcn/ui base components
│   ├── dashboard/        # Dashboard-specific components
│   ├── settings/         # Settings forms and panels
│   └── server-details/  # Server detail components
├── contexts/            # React context providers
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries and core logic
└── cron-service/        # Background service
```

## Key Features to Internationalise
1. **Navigation & UI**
   - App header with navigation menu
   - Button labels and tooltips
   - Form labels and placeholders
   - Error messages and notifications
   - Table headers and filters

2. **Dashboard Components**
   - Server cards and status indicators
   - Backup tables and history
   - Charts and metrics panels
   - Filter and search functionality

3. **Settings Pages**
   - Server settings forms
   - User management
   - Email/NTFY notification configuration
   - Audit log viewer
   - Application logs viewer

4. **Authentication**
   - Login page and forms
   - Password change modal
   - Session management

5. **API Responses**
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
- **Why Intlayer**: Modern, AI-powered, Next.js 16 compatible
- **Features**: Per-component i18n, TypeScript support, AI translation
- **Editor**: Visual editor configured but disabled initially
- **Build**: Tree-shaking, static rendering support

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

## Known Challenges
1. **Text Expansion**: French/Spanish 25-35% longer text
2. **Technical Terminology**: Backup/IT domain-specific terms
3. **Brazilian Portuguese**: Custom locale not in standard Intlayer
4. **Existing Locale Code**: Need to integrate with current date/number formatting
5. **Performance**: Multiple language support impact on bundle size

## Context Usage Instructions
When using the AI prompts from the internationalisation plan:
1. **DO NOT** include this entire context file in your prompts
2. **DO** assume the AI has access to this context
3. **DO** use prompts as written in the plan file
4. **DO** start with session-specific resume prompts when continuing
5. **DO** reference this file for project-specific details if needed

This context file provides all the background information needed for the AI prompts to execute effectively without repetitive context inclusion.