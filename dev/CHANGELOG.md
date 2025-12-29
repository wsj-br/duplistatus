# Changelog

## [Unreleased]

### Added
- Added right-click context menu on auto-refresh button: Right-clicking on the auto-refresh button in the application toolbar now opens the Display Settings page for quick access to display preferences

### Changed
- Removed documentation from Docker container image. Documentation is now hosted on GitHub Pages at https://wsj-br.github.io/duplistatus/user-guide/overview
- Updated app header User Guide link to point to GitHub Pages documentation instead of local /documentation route
- Simplified proxy.ts by removing Docusaurus URL rewriting logic (no longer needed)
- `scripts/generate-test-data.ts`: Added logic to pre-configure notification settings (disabling `ntfy`) for newly generated test servers, preventing notification spam during testing.
- `scripts/generate-test-data.ts`: Fixed `deleteRecentBackupsForOverdue` function to properly create overdue backups:
  - Deletes up to 3 most recent backups (ensuring at least 1 backup remains) to guarantee overdue status
  - Clears caches and recalculates backup settings after deletion
  - Explicitly sets the `time` field to the last backup date (not a future expected date) so `GetNextBackupRunDate` calculates an overdue expected date
  - Enables `overdueBackupCheckEnabled` for affected backup jobs
  - Adds verification logging to show the last backup date and days since last backup

### Fixed
- **Critical**: Fixed overdue backup detection by properly implementing the `time` field as a moving target:
  - Added `lastBackupDate` field to `BackupNotificationConfig` to track actual backup receipts
  - The `time` field represents the next expected backup date, calculated using the algorithm: `while (time <= lastBackupDate) { time = time + interval }`
  - This algorithm preserves the original schedule time-of-day even when manual backups arrive (manual backup at 10pm won't change the 2pm schedule)
  - `time` is automatically updated in `getConfigBackupSettings()` whenever a new backup arrives
  - For new servers without Duplicati sync: `time = lastBackupDate + interval` (uses backup time-of-day as schedule reference)
  - Updated `isBackupOverdueByInterval()` to simply check `currentTime > time + tolerance` (no recalculation needed)
  - Updated sync-schedule and collect endpoints to set both `time` (Schedule.Time) and `lastBackupDate` (Schedule.LastRun) from Duplicati when available
  - Fixed "Next Run" column in overdue monitoring settings showing incorrect dates
  - Added `expectedBackupDate` and `lastBackupDate` fields to `ServerWithBackup` interface
  - Updated unified configuration API to use pre-calculated `time` field directly as `expectedBackupDate`
  - Overdue monitoring form now displays correctly calculated next expected backup dates
  - Works correctly with direct database writes (e.g., generate-test-data) because `getConfigBackupSettings()` is called after data generation
  - Both `/api/upload` and `/api/backups/collect` call `getConfigBackupSettings()` immediately after receiving backups for quick updates
- Fixed ES module compatibility issues with Node.js 25.x by replacing `require()` statements with proper ES6 `import` statements:
  - `db.ts`: Removed `require('bcrypt')` and `require('util')` - using top-level imports instead
  - `next.config.ts`: Stopped importing `webpack` directly; use the `webpack` argument provided by Next.js config instead
  - `tailwind.config.ts`: Replaced `require('tailwindcss-animate')` with `import tailwindcssAnimate`
  - `documentation/src/components/SvgButton.js` and `SvgIcon.js`: Replaced `require('@docusaurus/core/lib/client/exports/useBaseUrl')` with `import useBaseUrl from '@docusaurus/useBaseUrl'`
- Fixed missing `.ts` file extensions in import statements to comply with strict ES module resolution:
  - `db.ts`: Added `.ts` extensions to dynamic imports (`default-config.ts`, `db-utils.ts`)
  - `scripts/take-screenshots.ts`: Added `.ts` extensions to dynamic imports (`db.ts`, `db-utils.ts`, `secrets.ts`)
- Fixed React linter errors and warnings:
  - Fixed unescaped apostrophe in `database-maintenance-form.tsx`
  - Added eslint-disable comment for legitimate set-state-in-effect pattern in `display-settings-form.tsx`
  - Removed 13 unused eslint-disable directives across multiple files
  - Fixed missing dependencies in useEffect hooks for `database-maintenance-form.tsx` and `user-management-form.tsx`

- Updated Next proxy file (`src/proxy.ts`) to provide `x-pathname` / `x-search-params` headers for server components and to rewrite Docusaurus clean URLs under `/docs` to `index.html`.
 - Removed the custom Node server (`duplistatus-server.ts`) in favor of Next.js standalone output + proxy.
- Fixed `pnpm start-local` script to properly serve static files when running the production server locally. Updated `build-local` to copy static files and public directory to standalone build directory (as per Next.js standalone mode best practices), and added safety check in `start-local` to ensure files exist before starting the server. This resolves 404 errors for JavaScript chunks.
- Fixed `pnpm build-local` to build Docusaurus documentation and copy it to `public/documentation` before building Next.js, ensuring docs are available when running `pnpm start-local` in standalone mode.

### Changed
- Reduced console logging from AuditLogger: Only failed login attempts are now logged to console with `[AuditLogger]` prefix. All other audit log entries are still written to the database but no longer logged to console.
- Docker/runtime now runs Next.js standalone (`server.js`) and bundles the cron service into a single JS file to avoid shipping a separate full `node_modules` for cron.
