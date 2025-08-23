
![duplistatus](img/duplistatus_banner.png)

# TODO List

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Fix](#fix)
- [Changes needed](#changes-needed)
- [New Features (planned or under analysis)](#new-features-planned-or-under-analysis)
  - [Implemented in Version 0.3.8 ✅](#implemented-in-version-038-)
  - [Implemented in Version 0.4.0 ✅](#implemented-in-version-040-)
  - [Implemented in Version 0.5.0 ✅](#implemented-in-version-050-)
  - [Implemented in Version 0.6.0](#implemented-in-version-060)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->



## Fix

none

## Changes needed

none


## New Features (planned or under analysis)

- Include in the documentation how to serve using HTTPS (nginx/certbot or Caddy) 🔍
- Check to add support to send emails / support 

---

### Implemented in Version 0.3.8 ✅

- Fixed documentation on Duplicati server configuration (upload URL incorrect). Thanks @Taomyn.
- Added support to collect backup logs using HTTPS

### Implemented in Version 0.4.0 ✅

- Improved support for multiple backups on the same machine:
  - In the dashboard table, show each backup in a row.
  - When clicking on a row, go to the detail page of the selected backup.
  - When clicking on the machine name, go to the detail page of all backups for the selected machine.
  - On the detail page, the user can select all backups or a specific backup name.
- Included the chart on the detail page (same as the dashboard page).
- Added a link to the GitHub repo in the footer of the pages.
- Changed the handling of the "Fatal" status with a red badge instead of the default grey.

### Implemented in Version 0.5.0 ✅

- Changed labels/fields from `Total Backuped Size` to `Total Backup Size`.
- Added version number in the page footer.
- Corrected the return link on the backup detail page.
- Improved error management for `JSON.parse` and the `backups/collect` API endpoint.
- Upgraded all dependencies/frameworks/tools to the latest available version.
- Reduced HTTP/HTTPS timeout to 30 seconds.
- Updated documentation, added Podman install guide.

### Implemented in Version 0.6.1 

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
- Standardise the column titles of available versions to "Available Versions" (was "Available Backups" in some places)
- Navigate to the dashboard once 'Collect Backup Logs' has been successful.
- Add a button to the application header that allows users to configure notifications and overdue scheduled backup alerts.
- Add a button to the application header to check the overdue backups (this shows only if there is at least one monitored backup).


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


