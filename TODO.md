# TODO list 

## fix

   - (no issues identified)


## changes

   - include a page refresh after the sucessfull "Collect Backup Logs" 🆕
   - standardize the columns titles: Available Backup Versions/Available Versions 🛠️



## new features

   - send ntfy messages (https://ntfy.sh/) to a topic when receive a backup log (/api/upload) ❓
   - send email messages to an address(es) when receive a backup log (/api/upload) ❓
   - include in documentation how to serve using HTTPS (nginx/certbot or caddy) 🔍
   - enable sort in the tables ⬇️⬆️
   - add link/icon to version to Available Backup Versions/Available Versions, get the information from the log (messages) received, check these lines below:  🔃

```
2025-07-14 04:02:24 +01 - Backups outside of all time frames and thus getting deleted:
2025-07-14 04:02:24 +01 - Backups to consider: 14/07/2025 00:05:06, 12/07/2025 04:02:10, 11/07/2025 04:02:01, 10/07/2025 04:02:01, 09/07/2025 04:02:01, 07/07/2025 04:02:02, 02/07/2025 04:00:01, 24/06/2025 04:00:01, 16/06/2025 04:00:01, 08/06/2025 18:12:19
2025-07-14 04:02:24 +01 - All backups to delete: 07/07/2025 04:02:02, 16/06/2025 04:00:01
```


<br>

---

<br>

### implemented on version 0.3.8 ✅

   - fix documentation on duplicati server configuration (upload URL incorrected). Thanks @Taomyn. 
   - add support to collect backups logs using HTTPS 

<br>

### implemented on version 0.4.0 ✅

   * improved support for multiple backups in the same machine
      -  in the dashboard table, show each backup in a row. 
      -  when clicking on the row, goes to the detail page of the selected backup
      -  when clicking on the machine name, goes to the detail page of all backups of the selected machine
      -  in the detail page, user can select all backups or a specific backup name.
      
   * included the chart on the detail page too (same as dashboard page).
   * added a link to github repo on the footer of the pages
   * change the handling of the status "Fatal"  with a red badge instead of the default gray.

<br>


### implemented on version 0.5.0 ✅

   * change labels/fields from  `Total Backuped Size` to `Total Backup size`.
   * add version number on the pages's footer.
   * correct the return link on the backup detail page.
   * add better error management on `JSON.parser` and `backups/collect` API endpoint.
   * upgrade all dependencies/framework/tools to the last version available.
   * reduce the http/https timeout to 30 seconds.
   * update documentation, add podman install guide.

<br>

### implemented on version 0.6.0 🚧

   * add sort functions to the applications table (dashboard/detail)
   * persist the sort order selected by the user on the dashboard table
   * add a return to dashboard link in the detail page to improve navegability.

<br>




