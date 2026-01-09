# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Test Entrypoint Script**: New test script (`pnpm test-entrypoint`) to test the Docker entrypoint script in local development
  - Automatically builds a fresh version with `pnpm build-local` before testing
  - Sets up the environment to test entrypoint logging functionality
  - Logs are written to `data/logs/` so the application can access them
  - Script located in `scripts/test-entrypoint.sh` with pnpm shortcut
- **Application Logs Viewer**: New admin-only settings tab to view and export application logs
  - View logs from a single consolidated `data/logs/application.log` file
  - Access rotated log files (supports up to 10 rotated versions: `application.log.1`, `application.log.2`, etc.)
  - File version selector with intuitive display names ("Current" for active log, ".1", ".2", etc. for rotated files)
  - Configurable line count selector (100, 500, 1000, 5000, 10000 lines) to control how many lines are displayed
  - Real-time search filter with case-insensitive text matching and clear button (X icon)
  - Auto-scroll toggle for real-time log monitoring with automatic polling (every 2 seconds when enabled and viewing current file)
  - Auto-scroll only triggers when new log lines are actually added (tracks line count changes)
  - Copy to clipboard functionality for filtered log content
  - View logs via `/api/application-logs` endpoint (GET) with file selection and tail functionality
  - Export filtered logs as text file via `/api/application-logs/export` endpoint (GET)
  - Scroll navigation buttons (scroll to top/bottom) for easy navigation in long log files
  - File metadata display showing line count, file size (KB), and last modified timestamp
  - Automatic file switching if selected file becomes unavailable (handles log rotation gracefully)
  - Log rotation on container startup (per execution, keeping last 5 by default, configurable via `LOG_ROTATION_VERSIONS`)

### Changed

- **Application Logs Viewer**: Simplified and improved the application logs viewer interface
  - Removed log source selection (entrypoint/server/cron) - now reads from single `application.log` file
  - Removed log combining logic - simplified to read directly from `data/logs/application.log`
  - Improved UI layout: search filter field is 50% width and left-justified, with file selector, line count, and auto-scroll controls right-justified
  - Added search icon when filter is empty and X icon when filter has text (clicking X clears the filter)
  - Fixed log file path to correctly use `data/logs/application.log` instead of `data/application.log`
  - Added automatic polling (every 2 seconds) when viewing current log file with auto-scroll enabled
  - Improved auto-scroll behavior: only scrolls when new log lines are actually added (tracks line count), preventing constant scrolling
  - Polling only occurs when viewing the current log file (not rotated files) and auto-scroll is enabled
  - Added scroll to top/bottom navigation buttons in the log display header
  - Enhanced file metadata display with line count, file size in KB, and formatted last modified timestamp
  - Improved file selection logic: automatically switches to first available file if selected file becomes unavailable
  - File display names show "Current" for active log and ".N" format for rotated files (e.g., ".1", ".2")
  - Moved Application Logs menu item to the bottom of the settings sidebar
- **Docker entrypoint logging implementation**: Simplified and unified logging in the Docker entrypoint script
  - All output (entrypoint, server, and cron service) now writes to a single `data/logs/application.log` file
  - Removed separate `server.log` and `cron.log` files - all logs are consolidated into `application.log`
  - Removed timestamp prefix logic and FIFO complexity - logs now contain raw output without automatic timestamp prefixes
  - Changed log file name from `entrypoint.log` to `application.log` (variable renamed from `ENTRY_LOG` to `APP_LOG`)
  - Log rotation now only rotates `application.log` (previously rotated all three log files)
  - Added configurable `LOG_ROTATION_VERSIONS` setting (default: 5) in the configuration section to control how many rotated log versions are kept
  - Output is duplicated to both `application.log` file and Docker logs (via `docker logs` command) using `tee`
  - Simplified log rotation function to use the configurable version count instead of hardcoded values

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Context-aware User Guide button**: The User Guide button in the app header now dynamically opens documentation relevant to the current page. The button detects the current route and opens the corresponding documentation page (e.g., Dashboard documentation when on the dashboard, specific settings documentation based on the active tab, server details documentation when viewing server details). The tooltip also updates to show "Help for [Page Name]" to indicate which documentation will be opened. Falls back to the overview page for unmapped routes.
- **Server configuration button right-click**: Right-clicking the server configuration button or any server item in the server selection popover now opens the Duplicati old UI (`/ngax`) in a new tab, using the same hostname and port as the configured server URL. This provides an alternative way to access the Duplicati web interface to avoid login issues with the new UI.

### Fixed

- **TypeScript build error**: Fixed circular dependency issue in `backup-notifications-form.tsx` where `autoSaveTextInput` and `updateTextInputToMainState` were referencing each other in their dependency arrays. Resolved by reordering function definitions and removing unnecessary dependencies from useCallback hooks.
- **SMTP error handling improvements**: Enhanced error detection to accurately identify and report authentication failures, SSL/TLS version mismatches, and connection type issues. Error messages now prioritize showing the actual problem (e.g., "SMTP authentication failed") rather than suggesting incorrect connection type changes when the issue is authentication or SSL version related.

### Changed

- **Toast notification behavior**: 
  - Error toasts (destructive variant) now persist until manually closed by the user, instead of auto-dismissing after a few seconds. This ensures users don't miss important error messages.
  - Success and informational toasts continue to auto-dismiss, with the default duration changed from 5 seconds to 3 seconds for a less intrusive experience.
- **SMTP debug logging**: Verbose SMTP configuration and connection debug logs are now only displayed in development mode, reducing log noise in production environments.
- **Email success logging**: Enhanced email success messages to include recipient email address and timestamp for better traceability. Format: `"Email sent successfully to {recipient} at {timestamp} (messageId: {messageId})"`.
- **Notification settings table structure**: 
  - Removed "Backup Name" column from the notification settings table
  - Renamed "Server Name" column to "Server / Backup" to reflect combined display
  - Removed blue color coding from chevron icons (chevrons now use default styling)
  - Added contextual icons to indicate additional destination configuration:
    - `Settings2` icon for servers with default additional destinations configured
    - `ExternalLink` icon for backups (blue-400 for custom overrides, slate-500 for inherited server defaults)
  - Icons include tooltips explaining their state
  - Updated table column spans to accommodate the removed column

### Improved

- **SMTP error messages**: Error messages now provide more accurate guidance based on the actual error type:
  - Authentication errors show: "SMTP authentication failed. Please verify your username and password are correct."
  - SSL/TLS version errors show: "SSL/TLS version mismatch. The server may require a different TLS version or connection type."
  - Connection type errors only suggest connection type changes when the error actually indicates connection type issues.
  - Original error details are preserved in development mode for debugging purposes.

### Removed

- **Unused UI components**: Removed obsolete components that were migrated to the settings page:
  - `database-maintenance-menu.tsx` - Functionality moved to Database Maintenance settings
  - `display-menu.tsx` - Functionality moved to Display Settings
  - `overdue-backup-check-button.tsx` - Functionality moved to Overdue Monitoring settings
  - `theme-toggle-button.tsx` - Functionality moved to Display Settings
  - `read-only-notice.tsx` - Component was never used (read-only notices implemented inline)
- **Unused API endpoints**: Removed endpoints that were not being called by the application:
  - `DELETE /api/backups/[backupId]` - Development-only endpoint that was never used
  - `GET /api/audit-log/stats` - Endpoint was not called by the audit log viewer
