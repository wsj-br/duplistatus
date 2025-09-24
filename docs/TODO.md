
![duplistatus](img/duplistatus_banner.png)

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
  - [Implemented in Version 0.7.x ✅](#implemented-in-version-07x-)
  - [Implemented in Version 0.8.x 🚧](#implemented-in-version-08x-)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Fix

none

## Changes needed





- replace the documentation to use Docusaurus

## New Features (planned or under analysis)

- Include SMTP/EMAIL support (to send notifications)




### Nice to have
- Include in the documentation how to serve using HTTPS (nginx/certbot or Caddy) 🔍


---

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


### Implemented in Version 0.7.x ✅

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

- **`/api/summary`** - The `totalMachines` field has been renamed to `totalServers` ([API Documentation](API-ENDPOINTS.md#get-overall-summary---apisummary)
- **`/api/lastbackup/{serverId}`** - The response object key has changed from `machine` to `server` ([API Documentation](API-ENDPOINTS.md#get-latest-backup---apilastbackupserverid))
- **`/api/lastbackups/{serverId}`** - The response object key has changed from `machine` to `server`, and the `backup_types_count` field has been renamed to `backup_jobs_count` ([API Documentation](API-ENDPOINTS.md#get-latest-backups---apilastbackupsserverid))


### Implemented in Version 0.8.x 🚧

- A new `Overdue Monitoring` tab that accepts the expected interval similar to the Duplicati server.
    - You can now configure custom intervals (for instance "1D12h")
    - When collecting backup logs, the overdue interval is automatically updated from the Duplicati configuration
- New function to show a QR code containing the topic for automatically configuring your device to receive notifications. Available at:
   - Right-click on `View NTFY messages` button on the application toolbar.
   - In the `Settings > NTFY Settings`, button "Configure Device"
- in collectbackup, have a select box to show the list of server_url to pre-fill the form for repeated collection.
- added a button to collect backups directly from the Configure Overdue Monitoring table

  

