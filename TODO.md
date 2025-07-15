# TODO List  

## Fix  

- (No issues identified)  

## Changes  

- Include a page refresh after the successful "Collect Backup Logs" 🆕  
- Standardize the column titles: "Available Backup Versions" / "Available Versions" 🛠️  

## New Features  

- Send ntfy messages (https://ntfy.sh/) to a topic when receiving a backup log (`/api/upload`) ❓  
- Send email messages to an address(es) when receiving a backup log (`/api/upload`) ❓  
- Include in documentation how to serve using HTTPS (nginx/certbot or Caddy) 🔍  

<br>  

---  

<br>  

### Implemented in Version 0.3.8 ✅  

- Fix documentation on Duplicati server configuration (upload URL incorrect). Thanks @Taomyn.  
- Add support to collect backup logs using HTTPS  

<br>  

### Implemented in Version 0.4.0 ✅  

- Improved support for multiple backups on the same machine:  
  - In the dashboard table, show each backup in a row.  
  - When clicking on the row, go to the detail page of the selected backup.  
  - When clicking on the machine name, go to the detail page of all backups for the selected machine.  
  - On the detail page, the user can select all backups or a specific backup name.  
- Included the chart on the detail page (same as the dashboard page).  
- Added a link to the GitHub repo in the footer of the pages.  
- Changed the handling of the "Fatal" status with a red badge instead of the default gray.  

<br>  

### Implemented in Version 0.5.0 ✅  

- Changed labels/fields from `Total Backuped Size` to `Total Backup Size`.  
- Added version number in the page footer.  
- Corrected the return link on the backup detail page.  
- Improved error management for `JSON.parse` and the `backups/collect` API endpoint.  
- Upgraded all dependencies/frameworks/tools to the latest available version.  
- Reduced HTTP/HTTPS timeout to 30 seconds.  
- Updated documentation, added Podman install guide.  

<br>  

### Implemented in Version 0.6.0 🚧 (in progress)

- Added sorting functions to the applications table (dashboard/detail).  
- Persisted the user-selected sort order on the dashboard table.  
- Improved navigation:  
  - Added a "Return to Dashboard" link on the detail page.  
  - Clicking the status badge on the dashboard page now directly shows backup details.  
- Added display of available backup versions (this information is received via upload unless truncated by Duplicati):  
  - Included an icon in both dashboard and detail page tables.  
  - When clicked, shows a table of available backups at the time of the selected backup.  
  - On the detail page, versions are displayed in the summary box at the top.  

<br>  
