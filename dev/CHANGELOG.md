# Changelog

## [Unreleased]

### Fixed
- Fixed database restore failing with "Invalid CSRF token" or "invalid or expired session" errors when restoring from another system with a different `.duplistatus.key` file. The restore operation now preserves the authentication context before the database is replaced, ensuring the restore completes successfully even when the restored database has different sessions.

### Added
- Added automatic detection of master key file changes: After login, the system now automatically checks if the `.duplistatus.key` file has changed by attempting to decrypt an existing password (server or SMTP). If the key has changed:
  - All encrypted passwords are automatically cleared (SMTP passwords and Duplicati server passwords)
  - A modal popup is shown to inform the user that passwords need to be reconfigured
  - The event is logged in the audit log with action `master_key_changed`
  - This prevents errors when restoring from backups or migrating to a new system with a different key file
  - If no passwords are configured, the check is skipped (not relevant)
- Added database backup functionality: Administrators can now create backups of the entire database from the Database Maintenance settings page. Supports two formats:
  - **Database File (.db)**: Binary format using SQLite's backup API for fast, exact database copies
  - **SQL Dump (.sql)**: Human-readable SQL text format for inspection, migration, or editing before restore
  - Backups are automatically downloaded with timestamped filenames
  - All backup operations are logged in the audit log
- Added database restore functionality: Administrators can restore the database from previously created backup files:
  - Supports both .db (binary) and .sql (text) file formats
  - Automatic safety backup creation before restore operations
  - Database integrity validation before and after restore
  - Automatic cleanup of old safety backups (keeps only the last 5)
  - WAL and SHM file handling during restore operations
  - All sessions are cleared after restore for security (users must log in again)
  - Automatic rollback to safety backup if restore fails integrity checks
  - Maximum file size limit of 100MB for security
  - All restore operations are logged in the audit log
- Enhanced backup notification settings with advanced features:
  - **Auto-save functionality**: Settings are automatically saved 500ms after changes with visual feedback (progress cursor)
  - **Bulk operations**: Select multiple backup jobs to update or clear additional notification destinations in bulk
  - **Server name filtering**: Filter backup jobs by server name or alias for easier management
  - **Select all functionality**: Quickly enable/disable all NTFY or Email notifications with a single checkbox
  - **Additional destinations per backup**: Configure additional email addresses and NTFY topics for individual backup jobs, independent of global notification settings
  - **Row expansion**: Expandable rows in desktop view to show/hide additional destination settings
  - **Mobile-responsive design**: Card-based layout for mobile devices with accordion for additional destinations

### Changed
- Changed default behavior: All user sessions are now automatically cleared on server restart. Users must log in again after the server restarts, even if they have an open browser window with an active session. This improves security by ensuring that sessions don't persist across server restarts. **Note**: This does not interfere with database restore operations - restore operations capture authentication context before clearing sessions and have their own independent session clearing logic that runs after restore completes.
- Added automatic cleanup of old safety backup files: Database restore operations now automatically maintain only the last 5 safety backups, preventing accumulation of old backup files in the data directory. Older safety backups are automatically deleted after creating a new one.

### Removed

### Fixed
- Fixed post-database-restore login redirect loop in dev mode by sharing the underlying `dbOps` across module instances (HMR/Turbopack), preventing session validation from reading stale/uninitialized database operations.
- Fixed post-database-restore “The database connection is not open” console spam by routing `db` operations through the current `global.__dbInstance` (avoids stale closed handles after dev hot reload).

## [1.1.0]

### Added
- Added automatic DNS configuration detection for Podman containers and pods:
  - `scripts/podman_testing/start.duplistatus` and `pod.testing` now include `get_dns_config()` function
  - Automatically extracts DNS servers and search domains from host using `resolvectl status` (systemd-resolved)
  - Falls back to parsing `/etc/resolv.conf` on non-systemd systems
  - Filters out localhost addresses (127.0.0.53) and IPv6 nameservers to avoid musl libc issues
  - Deduplicates DNS servers and search domains
  - Works automatically with Tailscale MagicDNS, corporate DNS, and standard network configurations
- Added right-click context menu on auto-refresh button: Right-clicking on the auto-refresh button in the application toolbar now opens the Display Settings page for quick access to display preferences
- `scripts/take-screenshots.ts`: Added user menu dropdown screenshot capture for both admin and regular users:
  - New `captureUserMenu()` function to capture the user menu dropdown from the app header
  - Captures admin user menu showing "Change Password", "Admin Users", "Audit Log", and "Logout" options
  - Captures regular user menu showing "Change Password", "Audit Log", and "Logout" options (no Admin Users option)
  - Screenshots saved as `screen-user-menu-admin.png` and `screen-user-menu-user.png`
  - Added `data-screenshot-target="user-menu"` attribute to `DropdownMenuContent` in `app-header.tsx` for reliable screenshot targeting
  - Captures both the user button and dropdown menu together with 5px external margin for better context
  - Uses Puppeteer's native click with temporary data attribute for more reliable dropdown triggering
- `scripts/take-screenshots.ts`: Reorganized screenshot capture order for efficiency and clarity:
  - Dashboard screenshots are taken first (card mode, hover cards, tooltips, summary, side panels)
  - Auto-refresh controls captured while still on dashboard (component only renders on dashboard/detail pages)
  - Then toolbar elements that work on `/blank`: collect button popups, Duplicati config, user menu
  - Toolbar functions navigate based on component requirements:
    - `captureAutoRefreshControls()` assumes already on dashboard (no navigation)
    - `captureCollectButtonPopup()`, `captureDuplicatiConfiguration()`, `captureUserMenu()` each navigate to `/blank` for clean backgrounds
  - This order avoids unnecessary navigation back to dashboard after visiting `/blank`
  - Added increased wait times and better error handling with visibility checks for toolbar element captures
  - Added navigation log messages with 🌐 emoji to track page transitions during script execution

### Changed
- Improved collect backups modal UX: Changed Password label text from "(optional - leave empty to use stored)" to "(only fill if password changed)" when a server is selected from the list, making it clearer that users only need to fill this field if the password has changed. Also fixed the condition logic to properly show the help text when a server is selected (previously the condition required hostname to be empty, but hostname is auto-filled when selecting a server)
- Updated `.gitignore` to ignore `scripts/podman_testing/.env` and `documentation/pnpm-lock.yaml`
- Updated `.dockerignore` to exclude development files (`dev/`, `tmp/`, `production.yml`) and testing scripts while keeping build-required scripts (`pre-checks.sh`, `ensure-key-file.sh`, `update-version.sh`, `bundle-cron-service.cjs`)
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
- Reduced console logging from AuditLogger: Only failed login attempts are now logged to console with `[AuditLogger]` prefix. All other audit log entries are still written to the database but no longer logged to console.
- Docker/runtime now runs Next.js standalone (`server.js`) and bundles the cron service into a single JS file to avoid shipping a separate full `node_modules` for cron.

### Removed
- Deleted obsolete `scripts/admin-recovery.ts` (TypeScript version). The shell script `/admin-recovery` at project root is the production version used for password recovery

### Fixed
- Fixed SMTP configuration storing encrypted values for empty username and password fields:
  - Updated `setSMTPConfig()` to only encrypt non-empty username and password strings (empty strings are stored as-is)
  - Updated `getSMTPConfig()` to only decrypt non-empty encrypted values (prevents decryption errors on empty strings)
  - Updated POST `/api/configuration/email` endpoint to accept explicit empty password/username values to allow clearing them
  - Updated email configuration form to send empty strings when fields are cleared
  - Previously, clearing password or username in the UI would still store encrypted values in the database; now empty fields are properly stored as empty strings
- **Critical**: Fixed Podman pod networking issues preventing external access to the application:
  - Changed `docker-entrypoint.sh` to set `HOSTNAME=0.0.0.0` as environment variable instead of CLI argument
  - Next.js standalone server doesn't accept `--hostname` CLI flag; it only reads the `HOSTNAME` environment variable
  - Podman pods override the `HOSTNAME` env var with the pod name, requiring explicit setting in the entrypoint
  - Server now correctly binds to all interfaces (`0.0.0.0:9666`) in both Podman pod and standalone container modes
- **Critical**: Fixed DNS resolution for Tailscale hostnames in Podman containers:
  - Podman containers/pods don't automatically inherit Tailscale MagicDNS configuration from the host
  - Alpine Linux's musl libc prefers IPv6 (AAAA) DNS records over IPv4 (A) records, causing resolution to public IPs
  - Solution: Automatically detect and configure DNS servers from host (including Tailscale's 100.100.100.100)
  - Both pod and standalone container modes now use `--dns` and `--dns-search` flags with auto-detected values
  - Works with any DNS configuration (Tailscale, custom DNS servers, standard network setup)
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
