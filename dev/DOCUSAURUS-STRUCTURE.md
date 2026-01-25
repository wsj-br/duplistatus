# Docusaurus Documentation Structure and Configuration

This document provides a comprehensive technical overview of the Docusaurus documentation setup for the duplistatus project.

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Configuration Files](#configuration-files)
- [Dependencies](#dependencies)
- [Documentation Organization](#documentation-organization)
- [Custom Components](#custom-components)
- [Styling and Theming](#styling-and-theming)
- [Plugins and Features](#plugins-and-features)
- [Deployment Configuration](#deployment-configuration)
- [Development Workflow](#development-workflow)

## Overview

The documentation is built using **Docusaurus 3.9.2**, a modern static website generator optimized for documentation sites. The site is configured for deployment on GitHub Pages at `https://wsj-br.github.io/duplistatus/`.

### Key Characteristics

- **Framework**: Docusaurus 3.9.2 (with v4 compatibility flag enabled)
- **Language**: TypeScript for configuration, React for components
- **Deployment**: GitHub Pages (`gh-pages` branch)
- **Base URL**: `/duplistatus/` (configurable via `BASE_URL` environment variable)
- **Default Route**: Documentation root (`/`) - no separate homepage
- **Blog**: Disabled
- **Internationalization**: English only (`en` locale)

## Project Structure

```
documentation/
├── .gitignore              # Git ignore rules for build artifacts
├── docusaurus.config.ts    # Main Docusaurus configuration
├── sidebars.ts             # Sidebar navigation structure
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── README.md               # Basic documentation setup guide
├── setup-git-credentials.sh # Git credentials helper script
├── blog/                   # Blog directory (disabled, contains README only)
├── docs/                   # Documentation source files
│   ├── intro.md           # Landing page (redirects from root)
│   ├── installation/      # Installation guides
│   ├── user-guide/        # User documentation
│   ├── migration/         # Migration guides
│   ├── api-reference/     # API documentation
│   ├── development/       # Developer documentation
│   ├── release-notes/     # Version release notes
│   └── LICENSE.md         # License information
├── static/                 # Static assets
│   ├── .nojekyll          # Prevents Jekyll processing on GitHub Pages
│   └── img/               # Images and graphics (64 PNG, 16 SVG files)
└── src/                    # Source code for customizations
    ├── components/         # Custom React components
    ├── css/               # Custom stylesheets
    ├── pages/             # Custom pages
    └── theme/             # Theme customizations
```

## Configuration Files

### `docusaurus.config.ts`

Main configuration file defining:

#### Site Metadata
- **Title**: `duplistatus`
- **Tagline**: `A dashboard to monitor your Duplicati backups`
- **URL**: `https://wsj-br.github.io/`
- **Base URL**: `/duplistatus/` (default, configurable via `BASE_URL` env var)
- **Favicon**: `img/favicon.ico`
- **Social Card**: `img/duplistatus_banner.png`

#### GitHub Pages Configuration
- **Organization**: `wsj-br`
- **Project Name**: `duplistatus`
- **Deployment Branch**: `gh-pages`
- **Trailing Slash**: `false`

#### Documentation Settings
- **Route Base Path**: `/` (docs are the homepage)
- **Sidebar Path**: `./sidebars.ts`
- **Docs Path**: `./docs`
- **Edit Links**: Disabled
- **Last Update**: Disabled (both time and author)
- **Markdown**: Mermaid diagrams enabled, broken link/image warnings

#### Theme Configuration

**Color Mode**:
- Default: Dark mode
- Switch: Enabled
- Respects system preference: No (forced dark by default)

**Navbar**:
- Title: `duplistatus`
- Logo: `img/duplistatus_logo.png` (40x40px, same for light/dark)
- Items:
  - Documentation sidebar link (left)
  - Search (right)
  - GitHub icon link (right, custom HTML)

**Footer**:
- Style: Dark
- Links organized into:
  - Documentation (Installation, User Guide, Migration)
  - Development (Development Setup, API Reference)
  - More (GitHub, Docker Hub links with SVG icons)
- Copyright: `Copyright © Waldemar Scudeller Jr.`

**Code Highlighting**:
- Light theme: GitHub
- Dark theme: Night Owl
- Additional languages: `bash`, `yaml`, `docker`, `json`, `python`, `sql`

### `sidebars.ts`

Defines the sidebar navigation structure with hierarchical categories:

1. **Intro** (`intro`) - Landing page
2. **Installation** - Setup guides (5 items)
3. **User Guide** - User documentation (13 items + nested Settings category)
4. **Migration** - Version upgrade guides (2 items)
5. **API Reference** - API documentation (11 items)
6. **Development** - Developer guides (10 items)
7. **Release Notes** - Version history (7 items)

Each category includes:
- Custom icons (via `customProps.icon`)
- Expandable behavior (`className: 'sidebar-category-expandable'`)
- Hierarchical nesting support

### `package.json`

#### Scripts
- `start`: Development server with `BASE_URL=/`
- `build`: Production build
- `deploy`: Deploy to GitHub Pages (`GIT_USER=wsj-br`)
- `serve`: Serve production build locally
- `clear`: Clear Docusaurus cache
- `swizzle`: Swizzle theme components
- `write-translations`: Generate translation files
- `write-heading-ids`: Add heading IDs to markdown
- `typecheck`: TypeScript type checking

#### Dependencies

**Core**:
- `@docusaurus/core`: `3.9.2`
- `@docusaurus/preset-classic`: `3.9.2`
- `@docusaurus/theme-common`: `3.9.2`
- `react`: `^19.2.0`
- `react-dom`: `^19.2.0`

**Plugins**:
- `@docusaurus/theme-mermaid`: `^3.9.2` - Mermaid diagram support
- `@cmfcmf/docusaurus-search-local`: `^2.0.1` - Local search (Lunr-based)
- `docusaurus-plugin-image-zoom`: `^3.0.1` - Image zoom functionality
- `remark-github-alerts`: `^0.1.1` - GitHub-style alert blocks

**Utilities**:
- `@iconify/react`: `^6.0.2` - Icon library
- `@mdx-js/react`: `^3.1.1` - MDX support
- `prism-react-renderer`: `^2.4.1` - Code syntax highlighting
- `clsx`: `^2.1.1` - Conditional class names

**Dev Dependencies**:
- TypeScript: `~5.9.3`
- ESLint: `^9.39.1`
- Docusaurus TypeScript types and configs

#### Browser Support
- **Production**: `>0.5%`, not dead, not op_mini all
- **Development**: Last 3 Chrome, last 3 Firefox, last 5 Safari

#### Node.js Requirement
- Minimum: `>=18.0`

### `tsconfig.json`

Extends `@docusaurus/tsconfig` with:
- `baseUrl`: `.`
- Excludes: `.docusaurus`, `build`

## Documentation Organization

### Directory Structure

```
docs/
├── intro.md                          # Landing page
├── LICENSE.md                        # License information
├── installation/                     # Installation guides
│   ├── installation.md
│   ├── configure-tz-lang.md
│   ├── environment-variables.md
│   ├── duplicati-server-configuration.md
│   └── https-setup.md
├── user-guide/                       # User documentation
│   ├── overview.md
│   ├── dashboard.md
│   ├── server-details.md
│   ├── backup-metrics.md
│   ├── collect-backup-logs.md
│   ├── overdue-monitoring.md
│   ├── duplicati-configuration.md
│   ├── homepage-integration.md
│   ├── troubleshooting.md
│   ├── admin-recovery.md
│   └── settings/                     # Settings subcategory
│       ├── overview.md
│       ├── backup-notifications-settings.md
│       ├── overdue-settings.md
│       ├── notification-templates.md
│       ├── ntfy-settings.md
│       ├── email-settings.md
│       ├── server-settings.md
│       ├── display-settings.md
│       ├── database-maintenance.md
│       ├── user-management-settings.md
│       ├── audit-logs-viewer.md
│       ├── audit-logs-retention.md
│       └── application-logs-settings.md
├── migration/                        # Migration guides
│   ├── version_upgrade.md
│   └── api-changes.md
├── api-reference/                   # API documentation
│   ├── overview.md
│   ├── authentication-security.md
│   ├── core-operations.md
│   ├── administration-apis.md
│   ├── chart-data-apis.md
│   ├── configuration-apis.md
│   ├── cron-service-apis.md
│   ├── external-apis.md
│   ├── monitoring-apis.md
│   ├── notification-apis.md
│   ├── session-management-apis.md
│   ├── api-endpoint-list.md
│   └── database_values.json         # API data reference
├── development/                     # Developer documentation
│   ├── setup.md
│   ├── devel.md
│   ├── database.md
│   ├── documentation-tools.md
│   ├── podman-testing.md
│   ├── release-management.md
│   ├── test-scripts.md
│   ├── workspace-admin-scripts-commands.md
│   ├── cron-service.md
│   ├── development-guidelines.md
│   └── how-i-build-with-ai.md
└── release-notes/                   # Version history
    ├── 1.3.0.md
    ├── 1.2.1.md
    ├── 1.1.x.md
    ├── 1.0.x.md
    ├── 0.9.x.md
    ├── 0.8.x.md
    └── 0.7.x.md
```

### Content Statistics

- **Total Documentation Files**: ~64 markdown files
- **Images**: 64 PNG files, 16 SVG files
- **Categories**: 7 main categories
- **Nested Categories**: 1 (Settings under User Guide)

## Custom Components

### Location: `src/components/`

Custom React components available in MDX:

1. **`IconButton.js`** - Icon button component
2. **`SvgButton.js`** - SVG button component
3. **`SvgIcon.js`** - SVG icon component
4. **`IIcon2.js`** - Iconify icon component variant
5. **`ZoomMermaid.jsx`** - Mermaid diagram with zoom functionality

### MDX Component Mapping (`src/theme/MDXComponents.js`)

- `IIcon`: Iconify Icon component (`@iconify/react`)
- `IconButton`: Custom icon button
- `SvgButton`: SVG button variant
- `SvgIcon`: SVG icon variant
- `IIcon2`: Iconify icon variant

These components can be used directly in markdown files.

## Styling and Theming

### Custom CSS: `src/css/custom.css`

Comprehensive custom stylesheet (~1065 lines) implementing:

#### Color Scheme

**Light Mode**:
- Primary: Blue (`#3b82f6`)
- Background: White (`#ffffff`)
- Surface: Light gray (`#f9fafb`)
- Text: Dark gray (`#1f2937`)

**Dark Mode** (Default):
- Primary: Blue (`#3b82f6`)
- Background: Deep dark blue-black (`#141824`)
- Navbar: Darker (`#0a0e1a`)
- Footer: Darkest (`#050810`)
- Text: Light gray (`#e5e7eb`)

#### Styled Components

1. **Navbar**
   - Custom logo sizing and visibility
   - Brand title styling
   - Link hover effects
   - GitHub icon integration

2. **Sidebar**
   - Hierarchical styling with visual guides
   - Category vs. page differentiation
   - Active state highlighting with blue accent
   - Hover effects
   - Icon integration

3. **Tables**
   - Modern rounded borders
   - Dark mode optimized colors
   - Header styling with uppercase text
   - Row hover effects
   - Alternating row colors

4. **Code Blocks**
   - Dark background (`#1a1f2e`)
   - Syntax highlighting themes
   - Border styling

5. **Admonitions** (Callouts)
   - Note/Info: Muted blue-gray
   - Tip/Success: Green (`#10b981`)
   - Warning: Yellow (`#fbbf24`)
   - Danger/Important: Red (`#ef4444`)
   - Custom border and shadow styling

6. **Search Component**
   - Custom color variables for highlighting
   - Dark mode input styling

7. **Footer**
   - Dark background
   - Link hover effects
   - Icon button styling

8. **GitHub Alerts**
   - GitHub-style alert blocks
   - Color-coded by type
   - Dark mode variants

9. **Mermaid Diagrams**
   - Zoom functionality for Gantt charts
   - Scale transform support

### Theme Customizations: `src/theme/`

1. **`Admonition/index.tsx`** - Custom admonition component
2. **`ColorModeToggle/index.tsx`** - Custom color mode toggle
3. **`DocSidebarItem/index.tsx`** - Custom sidebar item rendering
4. **`MDXComponents.js`** - MDX component mapping

### Custom Pages: `src/pages/`

- **`index.tsx`**: Redirects root to `/intro`

## Plugins and Features

### Active Plugins

1. **`@docusaurus/theme-mermaid`**
   - Enables Mermaid diagram rendering
   - Supports flowcharts, Gantt charts, sequence diagrams, etc.

2. **`@cmfcmf/docusaurus-search-local`**
   - Local search using Lunr.js
   - Indexes documentation only (not blog/pages)
   - English language tokenization
   - Max 8 search results
   - Custom separator: `/[\s\-]+/`

3. **`docusaurus-plugin-image-zoom`**
   - Click-to-zoom on images
   - Selector: `.markdown img:not(.no-zoom)`
   - Custom background colors for light/dark modes
   - Excludes images with `.no-zoom` class

4. **`remark-github-alerts`**
   - Adds GitHub-style alert blocks
   - Supports: note, tip, warning, caution
   - Integrated as remark plugin

### Preset Configuration

**`@docusaurus/preset-classic`**:
- Docs enabled (route base: `/`)
- Blog disabled
- Custom CSS: `./src/css/custom.css`
- GitHub alerts remark plugin enabled

### Future Flags

- `v4: true` - Enables Docusaurus v4 compatibility improvements

## Deployment Configuration

### GitHub Pages

- **Repository**: `wsj-br/duplistatus`
- **Branch**: `gh-pages`
- **Base URL**: `/duplistatus/`
- **Deployment Method**: Docusaurus deploy command
- **Git User**: `wsj-br` (configured in deploy script)

### Build Output

- **Directory**: `build/` (generated, gitignored)
- **Static Assets**: Copied from `static/`
- **`.nojekyll`**: Present in `static/` to prevent Jekyll processing

### Environment Variables

- `BASE_URL`: Controls base URL (default: `/duplistatus/`)
- `GIT_USER`: GitHub username for deployment (default: `wsj-br`)

## Development Workflow

### Local Development

1. **Install Dependencies**:
   ```bash
   cd documentation
   pnpm install  # or yarn/npm
   ```

2. **Start Development Server**:
   ```bash
   pnpm start
   # Starts on http://localhost:3000 with BASE_URL=/
   ```

3. **Build for Production**:
   ```bash
   pnpm build
   # Outputs to build/
   ```

4. **Serve Production Build**:
   ```bash
   pnpm serve
   # Serves build/ locally
   ```

5. **Deploy to GitHub Pages**:
   ```bash
   pnpm deploy
   # Builds and pushes to gh-pages branch
   ```

### File Management

- **Add New Documentation**: Add `.md` files to `docs/` directory
- **Update Sidebar**: Edit `sidebars.ts` to add new items
- **Custom Components**: Add to `src/components/` and register in `MDXComponents.js`
- **Styling**: Edit `src/css/custom.css`
- **Images**: Add to `static/img/` and reference as `/img/filename.png`

### Type Checking

```bash
pnpm typecheck
```

Runs TypeScript compiler to check for type errors in configuration and components.

## Key Implementation Details

### Routing

- Root (`/`) redirects to `/intro` via custom page component
- All documentation routes are under `/` (routeBasePath)
- No trailing slashes (`trailingSlash: false`)

### Search Configuration

- **Index**: Documentation only
- **Language**: English
- **Engine**: Lunr.js
- **Results**: Maximum 8
- **Tokenizer**: Space and hyphen separators

### Image Handling

- **Location**: `static/img/`
- **Zoom**: Enabled by default (can be disabled with `.no-zoom` class)
- **Formats**: PNG (64 files), SVG (16 files)
- **Reference**: Use `/img/filename.png` in markdown

### Markdown Features

- **Mermaid Diagrams**: Enabled via plugin
- **GitHub Alerts**: Supported via remark plugin
- **Code Highlighting**: Prism themes (GitHub/Night Owl)
- **Table of Contents**: Auto-generated
- **Breadcrumbs**: Enabled
- **Last Update**: Disabled

### Accessibility

- **Color Contrast**: Optimized for both light and dark modes
- **Keyboard Navigation**: Standard Docusaurus support
- **Screen Readers**: Semantic HTML structure
- **Focus Indicators**: Custom styling for interactive elements

## Maintenance Notes

### Version Updates

- Docusaurus version: `3.9.2` (check for updates periodically)
- React version: `^19.2.0` (aligned with main project)
- TypeScript: `~5.9.3` (aligned with main project)

### Breaking Changes

- Docusaurus v4 compatibility flag enabled - monitor for v4 migration requirements
- React 19 used - ensure component compatibility

### Performance Considerations

- Local search index built at build time
- Static assets optimized during build
- Code splitting handled by Docusaurus
- Image optimization: Manual (consider adding image optimization plugin)

## Related Documentation

- [Docusaurus Documentation](https://docusaurus.io/docs)
- [MDX Documentation](https://mdxjs.com/)
- [Mermaid Documentation](https://mermaid.js.org/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

---

**Last Updated**: Generated from current codebase structure
**Docusaurus Version**: 3.9.2
**Documentation Version**: 1.3.1
