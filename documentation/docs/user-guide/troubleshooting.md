

# Troubleshooting {#troubleshooting}

### Dashboard Not Loading {#dashboard-not-loading}
- Check if the container is running: `docker ps`
- Verify port 9666 is accessible
- Check container logs: `docker logs duplistatus`

### No Backup Data {#no-backup-data}
- Verify Duplicati server configuration
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

- **Check Duplicati Configuration**: Confirm that Duplicati is configured correctly to send JSON to **duplistatus**. On Duplicati 2.0.9.106 and later, use `--send-http-json-urls` pointing at `/api/upload`. On older Duplicati, use `--send-http-url` with `--send-http-result-output-format=Json`. See [Duplicati Server Configuration](../installation/duplicati-server-configuration.md).
- **Check Network Connectivity**: Ensure the Duplicati server can connect to the **duplistatus** server. Confirm the port is correct (default: `9666`).
- **HTTP 401**: API keys are required and the upload URL is missing a valid upload-scope key. Add `?api_key=` as described in [API Keys](settings/api-keys-settings.md).
- **HTTP 403**: The key scope is wrong (a read key cannot upload), or the Duplicati host is not on the [external API IP allowlist](settings/ip-allowlist-settings.md).
- **HTTP 413**: The JSON report is larger than the upload size limit (default 5 MB). Lower `--send-http-max-log-lines` or raise the limit in Settings → API Keys.
- **HTTP 429**: The per-IP upload rate limit was exceeded. Wait for `Retry-After`, or raise the limits if many jobs finish at the same time.
- **Review Duplicati Logs**: Check for HTTP request errors in the Duplicati logs.
- **Dual reporting**: If you also send form reports to [Duplicati Monitoring](https://www.duplicati-monitoring.com/), a failure or HTTP 500 from that service can stop Duplicati from sending the JSON report to **duplistatus**. Form URLs are sent first. See [Reporting to duplistatus and Duplicati Monitoring](../installation/duplicati-server-configuration.md#reporting-to-duplistatus-and-duplicati-monitoring).

### Duplicate Servers on the Dashboard {#duplicate-servers-on-the-dashboard}

If the same server appears more than once on the dashboard, this most often happens after [collecting backup logs](collect-backup-logs.md), or after reinstalling or upgrading the Duplicati server.

**Causes:**

- **Changed `machine_id`**: When you reinstall or upgrade Duplicati, the server's `machine_id` may change, and **duplistatus** then treats it as a new server.
- **Duplicati API bug**: In newer versions of Duplicati there is a bug where some API endpoints mix the `identity` id and the `machine_id`. This inconsistency causes **duplistatus** to register the same server under different IDs, generating duplicates.

**Workaround:**

1.  On the **Duplicati server**, do **one** of the following:
    - Edit the `identity.txt` and `machineid.txt` files so that both files contain the **same** id; or
    - Open **Duplicati → Settings → Advanced Options → Machine-id** and set a value (it is auto-filled — just accept the suggested value).
2.  **Restart** the Duplicati server so the change takes effect.
3.  In **duplistatus**, consolidate the duplicate entries using [Settings → Database Maintenance → Merge Duplicate Servers](settings/database-maintenance.md#merge-duplicate-servers).

### Notifications Not Working (Detailed) {#notifications-not-working-detailed}

If notifications are not being sent or received:

- **Check NTFY Configuration**: Ensure the NTFY URL and topic are correct. Use the **Send Test Notification** button to test.
- **Check Network Connectivity**: Verify that **duplistatus** can reach your NTFY server. Review firewall settings if applicable.
- **Check Notification Settings**: Confirm that notifications are enabled for the relevant backups.

### Available Versions Not Appearing {#available-versions-not-appearing}

If backup versions are not shown on the dashboard or details page:

- **Check Duplicati Configuration**: Ensure `send-http-log-level=Information` and `send-http-max-log-lines=500` are configured in Duplicati's advanced options. Duplicati keeps the first N log lines. If the version list is still missing, raise the cap or use `0` when you are not also sending reports to Duplicati Monitoring. The version **count** can still appear from the JSON statistics when the detailed list is missing. See [Log lines and available versions](../installation/duplicati-server-configuration.md#log-lines-and-available-versions).

### Overdue Backup Alerts Not Working {#overdue-backup-alerts-not-working}

If overdue backup notifications are not being sent:

- **Check Overdue Configuration**: Confirm that backup monitoring is enabled for the backup. Verify the expected interval and tolerance settings.
- **Check Notification Frequency**: If set to **One time**, alerts are only sent once per overdue event.
- **Check Cron Service**: Ensure the cron service that monitors for overdue backups is running correctly. Check the application logs for errors. Verify the cron service is accessible at the configured port (default: `8667`).

### Collect Backup Logs Not Working {#collect-backup-logs-not-working}

If the manual backup log collection fails:

- **Check Duplicati Server Access**: Verify the Duplicati server hostname and port are correct. Confirm remote access is enabled in Duplicati. Ensure the authentication password is correct.
- **Check Network Connectivity**: Test connectivity from **duplistatus** to the Duplicati server. Confirm the Duplicati server port is accessible (default: `8200`).
  For example, if you are using Docker, you can use `docker exec -it <container-name> /bin/sh` to access the container's command line and run network tools like `ping` and `curl`.

    ```bash
    docker exec -it duplistatus /bin/sh
    ping duplicati-server.local
    curl -I http://duplicati-server.local:8200
    ```
  Also check for the DNS configuration inside the container (see more at [DNS Configuration for Podman Containers](../installation/installation.md#configuring-dns-for-podman-containers))

- On **Duplicati 2.4 and later**, `/api/v1/systeminfo` lists `machine-id` with an empty default. **duplistatus** reads the configured id from Duplicati server settings. If collection still cannot identify the server, set **Duplicati → Settings → Advanced Options → Machine-id** and retry.


### Upgrade from an earlier version (before 0.9.x) and can't login {#upgrade-from-an-earlier-version-before-09x-and-cant-login}

**duplistatus** since version 0.9.x requires user authentication. A default `admin` account is created automatically when installing the application for the first time or upgrading from an earlier version: 
    - username: `admin`
    - password: `Duplistatus09` 

You can create additional users accounts in [Settings > Users](settings/user-management-settings.md) after the first login.


### Lost Admin Password or Locked Out {#lost-admin-password-or-locked-out}

If you've lost your administrator password or been locked out of your account (you can still open `/login`):

- **Use Admin Recovery Script**: See the [Admin Account Recovery](admin-recovery.md) guide for instructions on recovering administrator access in Docker environments.
- **Verify Container Access**: Ensure you have Docker exec access to the container to run the recovery script.

If the browser shows **Access denied** (HTTP 403) before login, that is an [IP allowlist lockout](#locked-out-by-ip-allowlist), not a forgotten password. The admin-recovery script cannot bypass it.

### Locked Out by IP Allowlist {#locked-out-by-ip-allowlist}

If Settings → [IP Allowlist](settings/ip-allowlist-settings.md) is enabled with a missing or wrong CIDR, the proxy rejects the request before authentication. Typical symptoms:

- Pages (`/`, `/login`, `/settings`, …) return plain-text **Access denied** (HTTP 403).
- Session and admin APIs return JSON `{ "errorCode": "IP_NOT_ALLOWED" }`.
- `/api/health` and `/api/ping` still respond (they are exempt). Login cookies do not help.

The save path tries to prevent this: you cannot enable the **admin** list unless your current IP is already in the CIDRs (except when saving from loopback). You can still lock yourself out by using a CIDR that matches now but not later (VPN, DHCP, another network), by misconfiguring trusted proxies, or by enabling the list from `127.0.0.1` / `::1` without adding that address.

Environment variables override the database, so you can recover without the UI. They do not rewrite Settings; restart is required so the process picks them up.

**Disable the admin list** (usual recovery):

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

**Or keep it enabled and inject a CIDR that includes your current IP:**

```bash
ADMIN_IP_ALLOWLIST=203.0.113.10/32
```

Then restart the application:

- **Docker Compose**: set the same keys under `environment` in `docker-compose.yml` (the file includes commented examples) and recreate the app container. `docker exec` does not change environment variables of a running container.
- **Local / systemd**: export the variable in the service environment and restart the Next.js process (not only the cron service).

After you can open the UI again:

1. Log in and fix the CIDRs and trusted proxies in Settings → IP Allowlist.
2. Remove the environment override so Settings is the source of truth again.

The **external API** allowlist (`/api/upload`, `/api/summary`, `/api/lastbackup*`) does not lock the dashboard. Recover it the same way with `EXTERNAL_API_IP_ALLOWLIST_ENABLED=false` or `EXTERNAL_API_IP_ALLOWLIST`. If Duplicati uploads fail with HTTP 403 after you enable that list, see [New Backups Not Showing](#new-backups-not-showing). Trusted-proxy recovery uses `IP_TRUSTED_PROXIES` (a non-empty value also implies trust-proxy).

See [IP Allowlist](settings/ip-allowlist-settings.md#environment-overrides) and [Environment Variables](../installation/environment-variables.md).

### Database Backup and Migration {#database-backup-and-migration}

When migrating from previous versions or creating a database backup:

**If you're running version 1.2.1 or later:**
- Use the built-in database backup function in [Settings → Database Maintenance](user-guide/settings/database-maintenance.md)
- Select your preferred format (.db or .sql) and click **Download Backup**
- The backup file will be downloaded to your computer
- See [Database Maintenance](settings/database-maintenance.md#database-backup) for detailed instructions

**If you're running a version before 1.2.1:**
- You'll need to manually backup.  see the [Migration Guide](../migration/version_upgrade.md#backing-up-your-database-before-migration) for more information.

If you still experience issues, try the following steps:

1.  **Inspect Application Logs**: If using Docker, run `docker logs <container-name>` to review detailed error information.
2.  **Validate Configuration**: Double-check all configuration settings in your container management tool (Docker, Portainer, Podman, etc.) including ports, network, and permissions.
3.  **Verify Network Connectivity**: Confirm all network connections are stable. 
4.  **Check Cron Service**: Ensure the cron service is running alongside the main application. Check logs for both services.
5.  **Consult Documentation**: Refer to the Installation Guide and README for more information.
6.  **Report Issues**: If the problem persists, please submit a detailed issue on the [duplistatus GitHub repository](https://github.com/wsj-br/duplistatus/issues).

<br/>


# Additional Resources {#additional-resources}

- **Installation Guide**: [Installation Guide](../installation/installation.md)
- **Duplicati Documentation**: [docs.duplicati.com](https://docs.duplicati.com)
- **API Documentation**: [API Reference](../api-reference/overview.md)
- **GitHub Repository**: [wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **Development Guide**: [Development Guide](../development/setup.md)
- **Database Schema**: [Database Documentation](../development/database)

### Support {#support}
- **GitHub Issues**: [Report bugs or request features](https://github.com/wsj-br/duplistatus/issues)
