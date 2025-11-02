

# Troubleshooting

### Dashboard Not Loading
- Check if the container is running: `docker ps`
- Verify port 9666 is accessible
- Check container logs: `docker logs duplistatus`

### No Backup Data
- Verify Duplicati server configuration
- Check network connectivity between servers
- Review duplistatus logs for errors
- Ensure backup jobs are running

### Notifications Not Working
- Check notification configuration
- Verify NTFY server connectivity (if using NTFY)
- Test notification settings
- Check notification logs

### New Backups Not Showing

If you see Duplicati server warnings like `HTTP Response request failed for:` and `Failed to send message: System.Net.Http.HttpRequestException:`, and new backups do not appear in the dashboard or backup history:

- **Check Duplicati Configuration**: Confirm that Duplicati is configured correctly to send data to **duplistatus**. Verify the HTTP URL settings in Duplicati.
- **Check Network Connectivity**: Ensure the Duplicati server can connect to the **duplistatus** server. Confirm the port is correct (default: `9666`).
- **Review Duplicati Logs**: Check for HTTP request errors in the Duplicati logs.

### Notifications Not Working (Detailed)

If notifications are not being sent or received:

- **Check NTFY Configuration**: Ensure the NTFY URL and topic are correct. Use the `Send Test Notification` button to test.
- **Check Network Connectivity**: Verify that **duplistatus** can reach your NTFY server. Review firewall settings if applicable.
- **Check Notification Settings**: Confirm that notifications are enabled for the relevant backups.

### Available Versions Not Appearing

If backup versions are not shown on the dashboard or details page:

- **Check Duplicati Configuration**: Ensure `send-http-log-level=Information` and `send-http-max-log-lines=0` are configured in Duplicati's advanced options.

### Overdue Backup Alerts Not Working

If overdue backup notifications are not being sent:

- **Check Overdue Configuration**: Confirm that overdue monitoring is enabled for the backup. Verify the expected interval and tolerance settings.
- **Check Notification Frequency**: If set to `One time`, alerts are only sent once per overdue event.
- **Check Cron Service**: Ensure the cron service that monitors for overdue backups is running correctly. Check the application logs for errors. Verify the cron service is accessible at the configured port (default: `8667`).

### Collect Backup Logs Not Working

If the manual backup log collection fails:

- **Check Duplicati Server Access**: Verify the Duplicati server hostname and port are correct. Confirm remote access is enabled in Duplicati. Ensure the authentication password and protocol (HTTP/HTTPS) are correct.
- **Check Network Connectivity**: Test connectivity from **duplistatus** to the Duplicati server. Confirm the Duplicati server port is accessible (default: `8200`).

If you still experience issues, try the following steps:

1.  **Inspect Application Logs**: If using Docker, run `docker logs <container-name>` to review detailed error information.
2.  **Validate Configuration**: Double-check all configuration settings in your container management tool (Docker, Portainer, Podman, etc.) including ports, network, and permissions.
3.  **Verify Network Connectivity**: Confirm all network connections are stable. If using Docker, you can use `docker exec -it <container-name> /bin/sh` to access the container's command line and run network tools like `ping` and `curl`.
4.  **Check Cron Service**: Ensure the cron service is running alongside the main application. Check logs for both services.
5.  **Consult Documentation**: Refer to the Installation Guide and README for more information.
6.  **Report Issues**: If the problem persists, please submit a detailed issue on the [duplistatus GitHub repository](https://github.com/wsj-br/duplistatus/issues).

<br/>

# Additional Resources

- **Installation Guide**: [Installation Guide](../installation/installation.md)
- **Duplicati Documentation**: [docs.duplicati.com](https://docs.duplicati.com)
- **API Documentation**: [API Reference](../api-reference/overview.md)
- **GitHub Repository**: [wsj-br/duplistatus](https://github.com/wsj-br/duplistatus)
- **Development Guide**: [Development Guide](../development/setup.md)
- **Database Schema**: [Database Documentation](../development/database)

### Support
- **GitHub Issues**: [Report bugs or request features](https://github.com/wsj-br/duplistatus/issues)
