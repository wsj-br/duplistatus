

# Duplicati Server Configuration

![duplistatus](img/duplistatus_banner.png)

This document describes the required configuration for your **Duplicati** servers to work with **duplistatus**.

> [!IMPORTANT]
> This configuration is **required** for duplistatus to function properly. Without this configuration, the dashboard will not display any backup information.

## Overview

In order for **duplistatus** to work properly, each Duplicati server needs to be configured to send HTTP reports for each backup run to the **duplistatus** server.

## Step 1: Allow Remote Access

1. Log in to [Duplicati's UI](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui)
2. Select `Settings`
3. Allow remote access, including a list of hostnames (or use `*`)

![Duplicati settings](img/duplicati-settings.png)

> [!CAUTION]
> Only enable remote access if your Duplicati server is protected by a secure network
> (e.g., VPN, private LAN, or firewall rules). Exposing the Duplicati interface to the public Internet
> without proper security measures could lead to unauthorised access.

## Step 2: Configure Backup Result Reporting

On the Duplicati configuration page, select `Settings` and, in the `Default Options` section, include the following options. Replace 'my.local.server' with your server name or IP address where **duplistatus** is running.

| Advanced option                  | Value                                    |
| -------------------------------- | ---------------------------------------- |
| `send-http-url`                  | `http://my.local.server:9666/api/upload` |
| `send-http-result-output-format` | `Json`                                   |
| `send-http-log-level`            | `Information`                            |
| `send-http-max-log-lines`        | `0`                                      |

### Configuration Details

- **`send-http-url`**: The URL where duplistatus is running. Replace `my.local.server` with your actual server IP or hostname.
- **`send-http-result-output-format`**: Must be set to `Json` for proper parsing.
- **`send-http-log-level`**: Set to `Information` to get detailed backup information.
- **`send-http-max-log-lines`**: Set to `0` to send all log lines (no limit).

## Step 3: Apply Configuration

1. Click `Save` to apply the settings
2. The configuration will be applied to all existing and new backup jobs
3. Restart any running backup jobs to ensure the new configuration takes effect

## HTTPS Configuration

If you're using HTTPS for your duplistatus server, update the URL accordingly:

```
https://my.local.server:9666/api/upload
```

## Verification

To verify the configuration is working:

1. Run a backup job on your Duplicati server
2. Check the duplistatus dashboard - you should see the backup information appear
3. Check the duplistatus logs for any errors:

```bash
docker logs duplistatus
```

## Troubleshooting

### Backup information not appearing

1. **Check network connectivity**: Ensure the Duplicati server can reach the duplistatus server
2. **Verify URL**: Make sure the URL in the configuration is correct
3. **Check firewall**: Ensure port 9666 is open between the servers
4. **Check logs**: Look for errors in both Duplicati and duplistatus logs

### Common Issues

**Issue**: "Connection refused" errors
- **Solution**: Check if duplistatus is running and accessible on the specified port

**Issue**: "404 Not Found" errors
- **Solution**: Verify the URL path is correct (`/api/upload`)

**Issue**: "Timeout" errors
- **Solution**: Check network connectivity and firewall rules

### Testing the Connection

You can test the connection from your Duplicati server:

```bash
# Test HTTP connectivity
curl -X POST http://my.local.server:9666/api/upload \
  -H "Content-Type: application/json" \
  -d '{"test": "connection"}'
```

## Security Considerations

1. **Network Security**: Ensure duplistatus is only accessible from trusted networks
2. **Firewall Rules**: Configure firewall rules to restrict access to port 9666
3. **HTTPS**: Use HTTPS in production environments
4. **Authentication**: Consider implementing authentication for the duplistatus API

## Next Steps

After configuring your Duplicati servers:

1. **Set up notifications** - See [User Guide - Notifications](../user-guide/notifications.md)
2. **Configure server settings** - See [User Guide - Server Management](../user-guide/server-management.md)
3. **Explore the dashboard** - See [User Guide - Overview](../user-guide/overview.md)
