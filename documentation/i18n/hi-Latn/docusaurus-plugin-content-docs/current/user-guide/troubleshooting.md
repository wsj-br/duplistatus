# Troubleshooting {#troubleshooting}

### Dashboard Not Loading {#dashboard-not-loading}
- Check if the container is running: `docker ps`
- Verify port 9666 is accessible
- Check container logs: `docker logs duplistatus`

### No Backup Data {#no-backup-data}
- Verify Duplicati configuration
- Check network connectivity between servers
- Review duplistatus logs for errors
- Ensure backup jobs are running

### Notifications Not Working {#notifications-not-working}
- Check notification configuration
- Verify NTFY server connectivity (if using NTFY)
- Test notification settings
- Check notification logs

### New Backups Not Showing {#new-backups-not-showing}

If you see Duplicati server warnings like `HTTP Response request failed for:` and `Failed to send message: System.Net.Http.HttpRequestException:`, and new backups do not appear in the dashboard or backup history:

- **Check Duplicati Configuration**: Confirm that Duplicati is configured correctly to send data to **duplistatus**. Verify the HTTP URL settings in Duplicati.
- **Check Network Connectivity**: Ensure the Duplicati server can connect to the **duplistatus** server. Confirm the port is correct (default: `9666`).
- **Review Duplicati Logs**: Check for HTTP request errors in the Duplicati logs.

### Duplicate Servers on the Dashboard {#duplicate-servers-on-the-dashboard}

Yadi wahi server dashboard par ek se adhik baar dikhai deta hai, to yeh aksar [backup logs ikattha karne ke baad](collect-backup-logs.md), ya Duplicati server ko dobara install ya upgrade karne ke baad hota hai.

**Kaaran:**

- **Badla hua `machine_id`**: Jab aap Duplicati ko dobara install ya upgrade karte hain, to server ka `machine_id` badal sakta hai, aur **duplistatus** ise ek naye server ke roop mein treat karta hai.
- **Duplicati API bug**: Duplicati ke naye versions mein ek bug hai jahan kuch API endpoints `identity` id aur `machine_id` ko mila dete hain. Yeh asamanata **duplistatus** ko alag IDs ke tahat wahi server register karne par majboor karti hai, jo duplicates generate karti hai.

**Kaam ka tarika:**

1.  **Duplicati server** par, inmein se **ek** karein:
    - `identity.txt` aur `machineid.txt` files ko edit karein taaki dono files mein **same** id ho; ya
    - **Duplicati → Sammaan → Advanced Options → Machine-id** kholen aur ek value set karein (yeh auto-filled hai — bas sujhaav ki gayi value ko sweekar karein).
2.  **Restart** karein Duplicati server ko taaki badlaav prabhavit ho sake.
3.  **duplistatus** mein, duplicate entries ko [Sammaan → Database Maintenance → Duplicate servers merge karein](settings/database-maintenance.md#merge-duplicate-servers) ka upyog karke ek saath karein.

### Notifications Not Working (Detailed) {#notifications-not-working-detailed}

If notifications are not being sent or received:

- **Check NTFY Configuration**: Ensure the NTFY URL and topic are correct. Use the **Send Test Notification** button to test.
- **Check Network Connectivity**: Verify that **duplistatus** can reach your NTFY server. Review firewall settings if applicable.
- **Check Notification Settings**: Confirm that notifications are enabled for the relevant backups.

### Available Versions Not Appearing {#available-versions-not-appearing}

If backup versions are not shown on the dashboard or details page:

- **Check Duplicati Configuration**: Ensure `send-http-log-level=Information` and `send-http-max-log-lines=0` are configured in Duplicati's advanced options.

### Overdue Backup Alerts Not Working {#overdue-backup-alerts-not-working}

If overdue backup notifications are not being sent:

- **Overdue konfiguration ki jaanch karein**: Backup ke liye backup monitoring saksham kiya gaya hai, iski pushti karein. Apekshit antaraal aur tolerance setting ki jaanch karein.
- **Notification frequency ki jaanch karein**: Yadi **Ek baar** par set kiya gaya hai, to har overdue event ke liye alerts sirf ek baar bheje jaate hain.
- **Cron Service ki jaanch karein**: Sunishchit karein ki overdue backups ki nigrani karne wali cron service sahi dhang se chal rahi hai. Trutiyon ke liye application logs ki jaanch karein. PUSHTI KAREIN KI CRON SERVICE configured port (default: `8667`) par accessible hai.

### Backup Logs Ikattha Karein Kaam Nahi Kar Raha Hai {#collect-backup-logs-not-working}

Yadi manual backup log collection mein truti aati hai:

- **Duplicati Server Access ki Jaanch Karein**: PUSHTI KAREIN KI Duplicati server hostname aur port sahi hain. PUSHTI KAREIN KI Duplicati mein remote access saksham kiya gaya hai. Sunishchit karein ki authentication password sahi hai.
- **Network Connectivity ki Jaanch Karein**: **duplistatus** se Duplicati server tak connectivity ka parikshan karein. PUSHTI KAREIN KI Duplicati server port accessible hai (default: `8200`).
  Udaharan ke liye, yadi aap Docker ka upyog kar rahe hain, to aap container ke command line tak pahunchne ke liye `docker exec -it <container-name> /bin/sh` ka upyog kar sakte hain aur `ping` aur `curl` jaise network tools chala sakte hain.

    ```bash
    docker exec -it duplistatus /bin/sh
    ping duplicati-server.local
    curl -I http://duplicati-server.local:8200
    ```

Container ke andar DNS configuration ki bhi jaanch karein (dekhein [Podman Containers ke liye DNS Configuration](../installation/installation.md#configuring-dns-for-podman-containers) par adhik jaankari)

### Pichle sanskaran se upgrade (0.9.x se pehle) aur login nahi kar pa rahe hain {#upgrade-from-an-earlier-version-before-09x-and-cant-login}

**duplistatus** version 0.9.x se user authentication ki zaroorat hoti hai. Ek default `admin` account application ko pehli baar install karne ya pehle ke version se upgrade karne par automatically banaya jaata hai: 
    - username: `admin`
    - password: `Duplistatus09`

Aap pehle login ke baad [Sammaan > Upyogkarta](settings/user-management-settings.md) mein atirikt upyogkarta accounts bana sakte hain.

### Admin Password Kho Gaya Ya Lock Out Ho Gaya {#lost-admin-password-or-locked-out}

Yadi aapne apna administrator password kho diya hai ya aapke account se lock out ho gaye hain:

- **Admin Recovery Script ka Upyog Karein**: Docker environments mein administrator access ko recover karne ke instructions ke liye [Admin Account Recovery](admin-recovery.md) guide dekhein.
- **Container Access ki PUSHTI KAREIN**: Sunishchit karein ki aapke paas recovery script chalane ke liye container mein Docker exec access hai.

### Database Backup aur Migration {#database-backup-and-migration}

Pichle sanskaranon se migrate karte samay ya database backup banate samay:

**Yadi aap sanskaran 1.2.1 ya uske baad ka istemal kar rahe hain:**
- [Sammaan → Database Maintenance](user-guide/settings/database-maintenance.md) mein built-in database backup function ka upyog karein
- Apne pasandeeda format (.db ya .sql) ko chunein aur **Download Backup** par click karein
- Backup file aapke computer par download ho jayegi
- Vistrit instructions ke liye [Database Maintenance](settings/database-maintenance.md#database-backup) dekhein

**Yadi aap sanskaran 1.2.1 se pehle ka istemal kar rahe hain:**
- Aapko manual backup karna hoga. Adhik jaankari ke liye [Migration Guide](../migration/version_upgrade.md#backing-up-your-database-before-migration) dekhein.

Yadi aapko abhi bhi samasyayein aa rahi hain, to nimnalikhit kadam uthayein:

1.  **Application Logs ka Nirikshan Karein**: Yadi Docker ka upyog kar rahe hain, to vistrit truti jaankari ki samiksha karne ke liye `docker logs <container-name>` chalayein.
2.  **Configuration ki PUSHTI KAREIN**: Apne container management tool (Docker, Portainer, Podman, aadi) mein sabhi configuration settings ki dobara jaanch karein, jisme ports, network, aur permissions shamil hain.
3.  **Network Connectivity ki PUSHTI KAREIN**: PUSHTI KAREIN KI sabhi network connections sthir hain. 
4.  **Cron Service ki Jaanch Karein**: Sunishchit karein ki cron service mukhya application ke saath chal rahi hai. Dono services ke liye logs ki jaanch karein.
5.  **Documentation Dekhein**: Adhik jaankari ke liye Installation Guide aur README dekhein.
6.  **Issues Report Karein**: Yadi samasya bani rehti hai, kripya [duplistatus GitHub repository](https://github.com/wsj-br/duplistatus/issues) par ek vistrit issue submit karein.

<br/>

# Atirikt Sansadhan {#additional-resources}

- **Installation Guide**: [Installation Guide](../installation/installation.md)
- **Duplicati Documentation**: [docs.duplicati.com](https://docs.duplicati.com)
- **API Documentation**: [API Reference](../api-reference/overview.md)
- **GitHub Repository**: [wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **Vikas Margdarshak**: [Vikas Margdarshak](../development/setup.md)
- **Database Schema**: [Database Dastavezikaran](../development/database)

### Sahayata {#support}
- **GitHub Issues**: [Bugs Report Karen Ya Features Ka Anurodh Karen](https://github.com/wsj-br/duplistatus/issues)
