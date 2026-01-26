

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

- **Check Duplicati Configuration**: Confirm that Duplicati is configured correctly to send data to **duplistatus**. Verify the HTTP URL settings in Duplicati.
- **Check Network Connectivity**: Ensure the Duplicati server can connect to the **duplistatus** server. Confirm the port is correct (default: `9666`).
- **Review Duplicati Logs**: Check for HTTP request errors in the Duplicati logs.

### Notifications Not Working (Detailed) {#notifications-not-working-detailed}

If notifications are not being sent or received:

- **Check NTFY Configuration**: Ensure the NTFY URL and topic are correct. Use the `Send Test Notification` button to test.
- **Check Network Connectivity**: Verify that **duplistatus** can reach your NTFY server. Review firewall settings if applicable.
- **Check Notification Settings**: Confirm that notifications are enabled for the relevant backups.

### Available Versions Not Appearing {#available-versions-not-appearing}

If backup versions are not shown on the dashboard or details page:

- **Check Duplicati Configuration**: Ensure `send-http-log-level=Information` and `send-http-max-log-lines=0` are configured in Duplicati's advanced options.

### Overdue Backup Alerts Not Working {#overdue-backup-alerts-not-working}

If overdue backup notifications are not being sent:

- **Check Overdue Configuration**: Confirm that overdue monitoring is enabled for the backup. Verify the expected interval and tolerance settings.
- **Check Notification Frequency**: If set to `One time`, alerts are only sent once per overdue event.
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


### Upgrade from an earlier version (\<0.9.x) and can't login {#upgrade-from-an-earlier-version-09x-and-cant-login}

**duplistatus** since version 0.9.x requires user authentication. A default `admin` account is created automatically when installing the application for the first time or upgrading from an earlier version: 
    - username: `admin`
    - password: `Duplistatus09` 

You can create additional users accounts in [Settings > Users](settings/user-management-settings.md) after the first login.


### Lost Admin Password or Locked Out {#lost-admin-password-or-locked-out}

If you've lost your administrator password or been locked out of your account:

- **Use Admin Recovery Script**: See the [Admin Account Recovery](admin-recovery.md) guide for instructions on recovering administrator access in Docker environments.
- **Verify Container Access**: Ensure you have Docker exec access to the container to run the recovery script.

### Database Backup and Migration {#database-backup-and-migration}

When migrating from previous versions or creating a database backup:

**If you're running version 1.2.1 or later:**
- Use the built-in database backup function in `Settings → Database Maintenance`
- Select your preferred format (.db or .sql) and click `Download Backup`
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
