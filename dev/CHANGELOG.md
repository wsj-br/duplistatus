# Changelog

## [Unreleased]

### Fixed
- Fixed ES module compatibility issues with Node.js 25.x by replacing `require()` statements with proper ES6 `import` statements:
  - `db.ts`: Removed `require('bcrypt')` and `require('util')` - using top-level imports instead
  - `next.config.ts`: Stopped importing `webpack` directly; use the `webpack` argument provided by Next.js config instead
  - `tailwind.config.ts`: Replaced `require('tailwindcss-animate')` with `import tailwindcssAnimate`
  - `docs/src/components/SvgButton.js` and `SvgIcon.js`: Replaced `require('@docusaurus/core/lib/client/exports/useBaseUrl')` with `import useBaseUrl from '@docusaurus/useBaseUrl'`
- Fixed missing `.ts` file extensions in import statements to comply with strict ES module resolution:
  - `db.ts`: Added `.ts` extensions to dynamic imports (`default-config.ts`, `db-utils.ts`)
  - `scripts/take-screenshots.ts`: Added `.ts` extensions to dynamic imports (`db.ts`, `db-utils.ts`, `secrets.ts`)
- Fixed React linter errors and warnings:
  - Fixed unescaped apostrophe in `database-maintenance-form.tsx`
  - Added eslint-disable comment for legitimate set-state-in-effect pattern in `display-settings-form.tsx`
  - Removed 13 unused eslint-disable directives across multiple files
  - Fixed missing dependencies in useEffect hooks for `database-maintenance-form.tsx` and `user-management-form.tsx`

- Added Next middleware to provide `x-pathname` / `x-search-params` headers for server components and to rewrite Docusaurus clean URLs under `/docs` to `index.html`.
 - Removed the custom Node server (`duplistatus-server.ts`) in favor of Next.js standalone output + middleware.

### Changed
- Reduced console logging from AuditLogger: Only failed login attempts are now logged to console with `[AuditLogger]` prefix. All other audit log entries are still written to the database but no longer logged to console.
- Docker/runtime now runs Next.js standalone (`server.js`) and bundles the cron service into a single JS file to avoid shipping a separate full `node_modules` for cron.
