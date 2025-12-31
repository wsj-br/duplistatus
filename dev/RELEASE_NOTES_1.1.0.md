# Release Notes - Version 1.1.0

## 🎯 Overview

Version 1.1.0 is a minor release that addresses critical issues with overdue backup detection, improves Node.js 25.x compatibility, and introduces significant container architecture improvements. This version requires special configuration when running inside a Pod (podman) and is designed to work inside a standard podman container.

## 🔴 Critical Fixes

### Overdue Backup Detection - Complete Reimplementation

This release includes a **complete reimplementation** of the overdue backup detection system. The new algorithm properly implements the `time` field as a moving target that preserves the original schedule time-of-day, even when manual backups arrive at different times.

#### Key Improvements

- **Preserves Schedule Time-of-Day**: Manual backups at off-schedule times (e.g., 10pm) no longer shift the schedule. The next expected backup time remains at the original schedule time (e.g., 2pm).
- **Automatic Updates**: The `time` field is automatically recalculated whenever a backup is received, ensuring accurate overdue detection.
- **Fixed "Next Run" Column**: The overdue monitoring settings page now displays correctly calculated next expected backup dates.
- **Works Without Duplicati Sync**: For new servers that haven't synced with Duplicati, the system uses the first backup's time-of-day as the schedule reference.

#### How It Works

The new algorithm uses a moving target approach:

1. The `time` field represents the next expected backup date
2. When a backup arrives, the algorithm advances `time` by the interval until it's in the future
3. This preserves the original schedule time-of-day (e.g., daily at 2pm stays at 2pm)
4. Overdue detection simply checks: `currentTime > time + tolerance`

#### Technical Details

- Added `lastBackupDate` field to `BackupNotificationConfig` to track actual backup receipts
- The `time` field is calculated using: `while (time <= lastBackupDate) { time = time + interval }`
- Both `/api/upload` and `/api/backups/collect` endpoints now immediately update backup settings after receiving backups
- Works correctly with direct database writes (e.g., generate-test-data script)

For more details, see the [Overdue Detection Algorithm documentation](OVERDUE_DETECTION_ALGORITHM.md).

## 🚀 New Features

### User Interface Enhancements

- **Right-click context menu on auto-refresh button**: Right-clicking on the auto-refresh button in the application toolbar now opens the Display Settings page for quick access to display preferences
- **Improved collect backups modal**: Password field label now clearly indicates "(only fill if password changed)" when a server is selected from the list, making it clearer that users only need to fill this field if the password has changed

### Documentation Improvements

- **Documentation hosting migration**: Documentation has been moved from the Docker container image to GitHub Pages at https://wsj-br.github.io/duplistatus/user-guide/overview for improved accessibility and easier updates
- The User Guide link in the app header now points to the external documentation site

### Container Architecture

- **Next.js standalone mode**: Docker/runtime now runs Next.js standalone (`server.js`) and bundles the cron service into a single JS file to reduce container size and improve efficiency
- **Podman container support**: Version 1.1.0 is designed to work inside a standard podman container and requires special configuration when running inside a Pod (podman)

## 🐛 Bug Fixes

### Node.js 25.x Compatibility

- **Fixed ES module compatibility**: Replaced all `require()` statements with proper ES6 `import` statements across the codebase:
  - Updated `db.ts`, `next.config.ts`, `tailwind.config.ts`, and Docusaurus components
  - Ensures full compatibility with Node.js 25.x strict ES module requirements

- **Fixed missing file extensions**: Added `.ts` file extensions to dynamic imports to comply with strict ES module resolution in `db.ts` and `scripts/take-screenshots.ts`

### Code Quality

- **Fixed React linter errors and warnings**:
  - Fixed unescaped apostrophe in database maintenance form
  - Added proper eslint-disable comment for legitimate set-state-in-effect pattern
  - Removed 13 unused eslint-disable directives
  - Fixed missing dependencies in useEffect hooks

### Build and Development

- **Fixed Next.js proxy and build issues**:
  - Updated proxy to provide `x-pathname` / `x-search-params` headers for server components
  - Removed custom Node server in favor of Next.js standalone output + proxy
  - Fixed `pnpm start-local` to properly serve static files in standalone mode
  - Fixed `pnpm build-local` to build and copy Docusaurus documentation before Next.js build

### System Improvements

- **Reduced console logging**: AuditLogger now only logs failed login attempts to console; all other audit entries are written to database only
- **Simplified proxy.ts**: Removed Docusaurus URL rewriting logic (no longer needed)

### Test Data Generation

- **Improved test data generation**: Updated `generate-test-data.ts` to:
  - Pre-configure notification settings (disabling `ntfy`) for newly generated test servers, preventing notification spam during testing
  - Properly create overdue backups with correct date calculations

## 📋 Changes Summary

### Added
- Right-click context menu on auto-refresh button to open Display Settings
- Improved password field label in collect backups modal ("only fill if password changed")
- `lastBackupDate` field to `BackupNotificationConfig` for tracking backup receipts
- `expectedBackupDate` and `lastBackupDate` fields to `ServerWithBackup` interface

### Changed
- Improved collect backups modal UX: Password label text changed from "(optional - leave empty to use stored)" to "(only fill if password changed)" when a server is selected
- Removed documentation from Docker container image (now hosted on GitHub Pages)
- Updated app header User Guide link to point to GitHub Pages documentation
- Simplified proxy.ts by removing Docusaurus URL rewriting logic
- Reduced console logging from AuditLogger (only failed login attempts logged to console)
- Docker/runtime now runs Next.js standalone and bundles cron service into single JS file
- Updated `generate-test-data.ts` to pre-configure notification settings and improve overdue backup generation

### Fixed
- **Critical**: Overdue backup detection by properly implementing `time` field as moving target
- ES module compatibility issues with Node.js 25.x (replaced `require()` with ES6 `import`)
- Missing `.ts` file extensions in import statements for strict ES module resolution
- React linter errors and warnings (unescaped apostrophes, missing dependencies, unused directives)
- Next.js proxy file to provide proper headers for server components
- Removed custom Node server in favor of Next.js standalone output + proxy
- `pnpm start-local` script to properly serve static files in standalone mode
- `pnpm build-local` to build Docusaurus documentation before Next.js build
- "Next Run" column in overdue monitoring settings showing incorrect dates

## 🔄 Migration Notes

### From Version 1.0.x

When upgrading to version 1.1.0:

1. **Documentation Location Change**: Documentation is now hosted on GitHub Pages instead of being included in the Docker container. The User Guide link in the app header now points to the external documentation site.

2. **Podman Container Configuration**: Version 1.1.0 requires special configuration to work inside a Pod (podman). Ensure your podman container is configured according to the standard podman container requirements.

3. **Container Architecture**: The container now uses Next.js standalone mode and bundles the cron service into a single file, which may affect resource usage and startup behavior.

4. **Overdue Backup Detection**: The overdue backup detection system has been completely reimplemented. Existing overdue monitoring configurations will continue to work, but the underlying calculation method has been improved for accuracy. You may notice more accurate "Next Run" dates in the overdue monitoring settings.

5. **No Database Migration Required**: This release does not require any database schema changes.

### Node.js Version

This version is fully compatible with Node.js 25.x. If you're upgrading from an older Node.js version, ensure you're running Node.js >=24.12.0 (as specified in package.json).

## 📦 Installation

### Docker

```bash
docker pull wsjbr/duplistatus:1.1.0
# or
docker pull ghcr.io/wsj-br/duplistatus:1.1.0
```

### Podman

When using podman, ensure your container is configured according to the standard podman container requirements. See the installation documentation for podman-specific configuration details.

## 🔗 Links

- **Documentation**: [User Guide](https://wsj-br.github.io/duplistatus/user-guide/overview)
- **GitHub Repository**: [wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **Issues**: [GitHub Issues](https://github.com/wsj-br/duplistatus/issues)
- **Discussions**: [GitHub Discussions](https://github.com/wsj-br/duplistatus/discussions)

## 📝 Reporting Issues

When reporting bugs or issues, please include:
- Version: 1.1.0
- Operating system and version
- Docker/podman version
- Container type (Docker or podman/Pod)
- Error messages and logs
- Steps to reproduce
- Podman configuration details (if running in podman/Pod)

## 🙏 Acknowledgments

Thank you to all contributors and users who reported issues and provided feedback that helped improve this release.

---

**Copyright © 2025 Waldemar Scudeller Jr.**

This project is licensed under the [Apache License 2.0](https://github.com/wsj-br/duplistatus/blob/main/LICENSE).

