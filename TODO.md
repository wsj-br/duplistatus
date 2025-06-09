# TODO list 

## fix

- (no issues identified)


## changes

- (no planned changes)



## new features

- send ntfy messages (https://ntfy.sh/) to a topic when receive a backup log (/api/upload) ❓
- send email messages to an address(es) when receive a backup log (/api/upload) ❓
- add support to serve using HTTPS (nginx/certbot or caddy) 🔍

<br>

---

<br>

# implemented on version 0.3.8 ✅

- fix documentation on duplicati server configuration (upload URL incorrected). Thanks @Taomyn. 
- add support to collect backups logs using HTTPS 

# implemented on version 0.4.0 ✅

* improved support for multiple backups in the same machine
   -  in the dashboard table, show each backup in a row. 
   -  when clicking on the row, goes to the detail page of the selected backup
   -  when clicking on the machine name, goes to the detail page of all backups of the selected machine
   -  in the detail page, user can select all backups or a specific backup name.
   
* included the chart on the detail page too (same as dashboard page).
* added a link to github repo on the footer of the pages
* change the handling of the status "Fatal"  with a red badge instead of the default gray.

