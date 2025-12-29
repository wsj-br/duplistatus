![duplistatus](../documentation/static/img/duplistatus_banner.png)

# TODO List

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Fix](#fix)
- [Changes needed](#changes-needed)
- [New Features (planned or under analysis)](#new-features-planned-or-under-analysis)
- [Nice to have](#nice-to-have)
- [List of changes](#list-of-changes)
  - [Implemented in Version 0.3.8 ✅](#implemented-in-version-038-)
  - [Implemented in Version 0.4.0 ✅](#implemented-in-version-040-)
  - [Implemented in Version 0.5.0 ✅](#implemented-in-version-050-)
  - [Implemented in Version 0.6.1 ✅](#implemented-in-version-061-)
  - [Implemented in Version 0.7.27 ✅](#implemented-in-version-0727-)
  - [Implemented in Version 0.8.x ✅](#implemented-in-version-08x-)
  - [Implemented in Version 0.9.x ✅](#implemented-in-version-09x-)
  - [Implemented in Version 1.0.x ✅](#implemented-in-version-10x-)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

<br/><br/>

## Fix

none

<br/>


## Changes needed


- When collecting backups, if the server is not available, the application should include the server name in the error message.

  Current error message:
  ```
  2025-11-09T02:15:13.897668838Z Error collecting backups: Could not establish connection with any protocol. Attempts failed:
  2025-11-09T02:15:13.897727778Z HTTPS: Connection timed out after 15000ms
  2025-11-09T02:15:13.897741138Z HTTP: Idle timeout after 15000ms
  ````

  Expected error message:
  ```
  2025-11-09T02:15:13.897668838Z Error collecting backups server "server-name": Could not establish connection with any protocol. Attempts failed:
  2025-11-09T02:15:13.897727778Z HTTPS: Connection timed out after 15000ms (https://server-name:8200)
  2025-11-09T02:15:13.897741138Z HTTP: Idle timeout after 15000ms (http://server-name:8200)
  ```

- make the sidebar on the settings page collapsible, showing only the icons when collapsed.

- adjust the tab collumns width on the overdue monitoring page to avoid horizontal scrolling.



<br/>

## New Features (planned or under analysis)

- make the documentation button be aware of the current page and open the correct documentation page.

<br/>

## Nice to have

none



<br/><br/>

---

<br/><br/>

## List of changes

### Implemented in Version 0.3.8 ✅

- Fixed documentation on Duplicati server configuration (upload URL was incorrect). Thanks @Taomyn.
- Added support to collect backup logs using HTTPS

### Implemented in Version 0.4.0 ✅

- Improved support for multiple backups on the same server:
  - In the dashboard table, show each backup in a row
  - When clicking on a row, go to the detail page of the selected backup
  - When clicking on the server name, go to the detail page of all backups for the selected server
  - On the detail page, the user can select all backups or a specific backup name
- Included the chart on the detail page (same as the dashboard page)
- Added a link to the GitHub repo in the footer of the pages.
- Changed the handling of the "Fatal" status with a red badge instead of the default grey.

### Implemented in Version 0.5.0 ✅

- Changed labels/fields from `Total Backed Up Size` to `Total Backup Size`
- Added version number to the page footer
- Corrected the return link on the backup detail page
- Improved error management for `JSON.parse` and the `backups/collect` API endpoint
- Upgraded all dependencies/frameworks/tools to the latest available versions
- Reduced HTTP/HTTPS timeout to 30 seconds
- Updated documentation and added Podman install guide

### Implemented in Version 0.6.1 ✅

**New Features:**
- Application table sorting (Dashboard/Detail views)
  - Requested by @Taomyn (#4)
  - Client-side persistence of sort preferences
- Enhanced backup version visibility:
  - Version icons in tables
  - Click-to-view available versions
  - Version display in detail page summary
- Send notifications using ntfy.sh
- Check periodically for overdue scheduled backups

**UI/Navigation Improvements:**
- Added "Return to Dashboard" link on detail pages
- Status badges now link directly to backup details
- Standardized the column titles of available versions to "Available Versions" (was "Available Backups" in some places)
- Navigate to the dashboard once 'Collect Backup Logs' has been successful
- Add a button to the application header that allows users to configure notifications and overdue scheduled backup alerts
- Add a button to the application header to check overdue backups (this shows only if there is at least one monitored backup)

**Notification System:**
- **ntfy Integration:**
  - Customizable notifications for backup logs
  - Configurable title, priority, tags, and message templates
  - Variable support in templates
  - Status-based notification filtering

- **Overdue Backup Alerts:**
  - Configurable notification settings
  - Flexible timing options:
    - Check interval for overdue backups
    - Notification frequency (one time/daily/weekly/monthly)


### Implemented in Version 0.7.27 ✅

**New Features:**
- Duplicati Server Web Interface Integration
  - Automatic server URL registration when executing `Collect Backup Logs`
  - Centralized address management in Settings > `Server Addresses`
  - One-click access to open Duplicati configuration from dashboard, server detail, and backup detail pages
- Enhanced Dashboard and Server Cards
  - Replaced old dashboard with new dashboard using cards (previous table format still available)
  - Cards can be sorted by server name, last backup status, or date
- Advanced Metrics Panel
  - Show all metrics at the same time
  - Interactive tooltips showing datapoint information (date, value)

**UI/Navigation Improvements:**
- Application toolbar integration with Duplicati connection button
  - Dashboard view: presents list of available servers to connect to
  - Server-specific pages: direct connection to selected server's Duplicati server
- Change the nomenclature from machines to servers.

**Technical Improvements:**
- Enhanced backup log collection with server URL persistence
- Improved database schema to store server address information
- Optimized UI components for better integration with Duplicati web interface

**API Response Changes Warning**

**IMPORTANT:** If you have external integrations, scripts, or applications that consume the following API endpoints, you **MUST** update them immediately as the JSON response structure has changed:

- **`/api/summary`** - The `totalMachines` field has been renamed to `totalServers` ([API Documentation](../documentation/docs/api-reference/external-apis.md#get-overall-summary---apisummary))
- **`/api/lastbackup/{serverId}`** - The response object key has changed from `machine` to `server` ([API Documentation](../documentation/docs/api-reference/external-apis.md#get-latest-backup---apilastbackupserverid))
- **`/api/lastbackups/{serverId}`** - The response object key has changed from `machine` to `server`, and the `backup_types_count` field has been renamed to `backup_jobs_count` ([API Documentation](../documentation/docs/api-reference/external-apis.md#get-latest-backups---apilastbackupsserverid))


### Implemented in Version 0.8.x ✅

**Server Management Enhancements:**
- Automatic server URL and password persistence when collecting backups for the first time
  - Users can update URL and password using two methods:
     - Re-collecting backups with updated values
     - Modifying settings in `Settings → Server Settings`

**Enhanced Overdue Monitoring:**
- New `Overdue Monitoring` configuration tab with Duplicati server-compatible interval settings
    - Support for custom intervals (e.g., "1D12h")
    - Automatic overdue interval updates from Duplicati configuration during backup log collection
    - **Recommended:** Run collection after changing backup job intervals in Duplicati server to synchronise duplistatus configuration

**NTFY Device Configuration:**
- QR code generation for automatic device configuration to receive notifications
   - Right-click on `View NTFY Messages` button in the application toolbar
   - "Configure Device" button in `Settings → NTFY Settings`

**Improved Backup Collection:**
- Server selection dropdown in `Collect Backup Logs` interface for direct server-specific collection
- Single-server backup collection buttons added to `Settings → Overdue Monitoring` and `Settings → Server Settings`
- Bulk collection functionality for all servers with valid configuration
   - Collection buttons in `Settings → Overdue Monitoring` and `Settings → Server Settings`
   - Right-click context menu on `Collect Backup Logs` button in application toolbar

**Enhanced Notification System:**
- **SMTP Email Notification Support:**
    - SMTP server configuration in `Settings → Email Settings`
    - Per-backup job configuration for NTFY and/or email notifications
    - HTML-formatted templates using existing `Settings → Notification Templates`
- **Per-Backup Job Notification Configuration:**
    - Individual notification preferences in `Settings → Backup Notifications`
    - Visual indicators (greyed icons) when NTFY or email is not properly configured

**Security Enhancements:**
- **CSRF Protection:**
    - Session-based authentication with robust session management
    - CSRF token validation enforced for all state-changing API requests
    - Sessions expire automatically after 24 hours; CSRF tokens refresh every 30 minutes
    - Ensures protection against Cross-Site Request Forgery while preserving compatibility with external APIs
- **Plaintext Password Minimization:**
    - Passwords can only be set via the user interface; no API endpoint exposes stored passwords
    - Plaintext password transmission is minimized throughout the system
- **Advanced Cryptography for Sensitive Data:**
    - Sensitive data (e.g., passwords, SMTP credentials) encrypted using AES-256-GCM
    - Master key is generated automatically and stored securely in `.duplistatus.key`
    - PBKDF2 with 100,000 iterations used for key derivation to strengthen security
    - Authentication tags are verified and memory is securely cleared after use
    - Master key file permissions are strictly set to 0400 for maximum protection

**User Interface Improvements:**
- Enhanced application styling with new colour scheme and iconography for improved usability



### Implemented in Version 0.9.x ✅

**User Access Control & Security System:**

- **Authentication System:**
  - User login/logout functionality with secure session management
  - Password-based authentication with bcrypt hashing (cost factor 12)
  - Account lockout mechanism (5 failed attempts, 15-minute lockout)
  - Forced password change on first login
  - Password policy enforcement (minimum 8 characters, uppercase, lowercase, number required; special characters optional)
  - "Remember me" functionality with username persistence in localStorage
  - Session-based authentication with database-backed sessions (replaces in-memory)
  - CSRF protection integrated with authentication
  - HTTP-only cookies for session security
  - IP address and user agent tracking for security monitoring

- **User Management (Admin Only):**
  - User creation with automatic temporary password generation
  - User list with search, pagination, and filtering
  - User editing (username, admin status, password change requirement)
  - Password reset functionality with temporary password display
  - User deletion with safeguards (prevents deletion of last admin)
  - Role-based access control (Admin/User roles)
  - Status indicators (Active, Locked, Must Change Password)
  - Last login tracking and display

- **Audit Logging System:**
  - Comprehensive audit trail for all system changes and user actions
  - Audit log viewer with advanced filtering (date range, user, action, category, status)
  - Export functionality (CSV and JSON formats)
  - Audit log statistics and analytics
  - Configurable retention period (30-365 days, default: 90 days)
  - Automatic cleanup cron job (runs daily at 2 AM UTC)
  - Manual cleanup API with dry-run support
  - Audit logging for:
    - Authentication events (login, logout, password changes, account lockouts)
    - User management operations (create, update, delete, password resets)
    - Configuration changes (email, NTFY, templates, overdue tolerance, backup settings)
    - Backup operations (collection, deletion, cleanup)
    - Server management (add, update, delete)
    - System operations (migrations, cleanup, overdue checks, notifications)

- **Database Schema v4.0:**
  - New tables: `users`, `sessions`, `audit_log`
  - Automatic migration from v3.1 to v4.0 for existing installations
  - New installations start directly with schema v4.0 (no migration needed)
  - Default admin user seeded (username: `admin`, password: `Duplistatus09` - must change on first login)
  - Database-backed session storage (sessions persist across server restarts)
  - Comprehensive indexes for optimal performance

- **Settings Page Redesign:**
  - Modern sidebar navigation with collapsible sidebar
  - User-specific sidebar state persistence (collapsed/expanded preference saved per user)
  - Grouped settings sections:
    - **Notifications**: Backup Notifications, Overdue Monitoring, Templates
    - **Integrations**: NTFY, Email
    - **System**: Servers, Users (admin only), Audit Log
  - Sticky sidebar that remains visible while scrolling
  - Responsive design with optimized spacing
  - Settings icon and "System Settings" title in sidebar header
  - Back button integrated into app header

- **User Interface Enhancements:**
  - Standalone login page with modern design
  - "Remember me" checkbox on login form for username persistence
  - Show/hide password buttons on login and password change forms
  - Change password modal with real-time validation checklist
  - User indicator and logout button in app header
  - Role-based UI visibility (admin-only features hidden from regular users)
  - Status badges and indicators throughout the UI
  - User-specific preferences stored in localStorage (e.g., sidebar collapsed state)

- **Security Features:**
  - Password hashing with bcrypt (industry-standard)
  - Sensitive data sanitization in audit logs (passwords, tokens, secrets never logged)
  - Rate limiting for login attempts
  - Session expiration (24 hours)
  - CSRF token validation for all state-changing operations
  - Admin recovery CLI tool for password reset if locked out

- **API Endpoints:**
  - `POST /api/auth/login` - User authentication
  - `POST /api/auth/logout` - Session termination
  - `GET /api/auth/me` - Current user information
  - `POST /api/auth/change-password` - Password change
  - `GET /api/users` - List users (admin only)
  - `POST /api/users` - Create user (admin only)
  - `PATCH /api/users/{id}` - Update user (admin only)
  - `DELETE /api/users/{id}` - Delete user (admin only)
  - `GET /api/audit-log` - Query audit logs
  - `GET /api/audit-log/download` - Export audit logs
  - `GET /api/audit-log/stats` - Audit statistics
  - `POST /api/audit-log/cleanup` - Manual cleanup (admin only)
  - `GET /api/audit-log/retention` - Get retention setting
  - `PATCH /api/audit-log/retention` - Update retention (admin only)

- **Developer Tools:**
  - Admin recovery CLI script (`scripts/admin-recovery.ts`)
  - Shell wrapper script (`admin-recovery`) for easy execution in Docker containers
  - Works both locally and in Docker with automatic path detection
  - Comprehensive TypeScript interfaces (no `any` types)
  - Authentication middleware for route protection
  - Audit logger utility class with convenience methods

**Technical Improvements:**
- Database operations use prepared statements for performance and security
- Graceful error handling throughout authentication flow
- Backward compatibility maintained during migration
- Automatic database backup before migration
- Session cleanup on database initialization
- All new code follows DRY principles and project conventions
- Docker integration for admin recovery tool:
  - Scripts directory copied to Docker container (`/app/scripts`)
  - Shell wrapper script available at `/app/admin-recovery` in containers
  - Uses `pnpm exec tsx` for consistent package manager usage
  - Fixed ES module compatibility (replaced CommonJS `require` with ES `import`)
  - Documentation updated with Docker usage instructions



### Implemented in Version 1.0.x ✅

**New Features:**
- Added a new function in the Database maintenance form to detect duplicate servers and merge them into a single server.
- User can change the server password clicking on the key icon in the server detail page.
- Added audit log entry when a new backup log is uploaded via the `/api/upload` endpoint. The audit log includes details about the backup (server ID, server name, backup name, status, date, duration, file counts, sizes, warnings, and errors) along with the client IP address and user agent for tracking purposes.

**Documentation enhancements:**
- Completed the take screenshots script to capture all the screenshots for the documentation.


**Email Configuration Enhancements:**
- Configuration incomplete notice displayed when email settings are not properly configured
- "(disabled)" labels shown on notification checkboxes when services are not configured
- Customizable sender name and from address fields in email configuration
- SMTP authentication requirement toggle (supports servers without authentication)
- Email format validation for recipient and from address fields
- Enhanced test email content showing connection details and configuration

**SMTP Connection Type Support:**
- Added `Sender Name` and `From Address` fields to email configuration
   - Note that some email providers will override the `From Address` with the `SMTP Server Username`.
- Added support for plain SMTP connections (no encryption) on port 25
- Connection type selection: `Plain SMTP`, `STARTTLS`, or `Direct SSL/TLS`
- Default connection type changed to `Direct SSL/TLS` for new configurations
- `From Address` field required for `Plain SMTP` connections

**Bug Fixes:**
- Fixed missing `From` header in email messages causing RFC 5322 compliance errors
- Fixed Docker entrypoint script dropping log messages
- Fixed email encryption for `STARTTLS` connections (port 587)
- Fixed `Plain SMTP` connections failing with TLS negotiation errors
- Fixed unsaved email configuration being cleared when changing password
- Fixed stale SMTP configuration in test email endpoint
- Added a recalculation of the `Next Run` date after collecting backups logs. This ensures that the `Next Run` date is updated correctly after collecting backups logs.
- Fixed the behaviour of the view password in the password change form, now clicking on the eye icon will show the password of both password fields.







