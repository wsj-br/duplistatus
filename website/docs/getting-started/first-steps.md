---
sidebar_position: 1
---

# First Steps

Welcome to **duplistatus**! This guide will help you get started with monitoring your Duplicati backups.

## Quick Start Checklist

- [ ] **Install duplistatus** - [Installation Guide](installation.md)
- [ ] **Configure Duplicati servers** - [Configuration Guide](duplicati-server-configuration.md)
- [ ] **Access the dashboard** - Open `http://your-server:9666`
- [ ] **Set up notifications** - [Notifications Guide](../user-guide/backup-notifications-settings.md)
- [ ] **Configure server settings** - [Server Management Guide](../user-guide/server-settings.md)

## Accessing the Dashboard

Once duplistatus is running, you can access the web interface at:

```
http://your-server:9666
```

Replace `your-server` with the IP address or hostname where duplistatus is running.

## Initial Setup

### 1. Verify Installation

After installation, you should see:
- The duplistatus dashboard loads without errors
- The interface shows "No servers configured" or similar message
- No error messages in the browser console

### 2. Configure Your First Duplicati Server

1. **Configure Duplicati** - Follow the [Configuration Guide](duplicati-server-configuration.md)
2. **Run a backup** - Execute a backup job on your Duplicati server
3. **Check the dashboard** - The server should appear in the duplistatus dashboard

### 3. Basic Configuration

#### Server Settings
- **Server Alias**: Give your server a friendly name
- **Server Notes**: Add a description or notes about the server
- **Notification Settings**: Configure backup notifications

#### Display Settings
- **Layout**: Choose between Cards or Table layout
- **Timezone**: Set your preferred timezone
- **Refresh Interval**: Configure how often the dashboard updates

## Understanding the Dashboard

### Dashboard Overview
- **Summary Cards**: Overview of all your backup servers
- **Server List**: Detailed view of each server's backup status
- **Navigation**: Easy access to different sections

### Key Features
- **Backup Status**: Real-time status of all backup jobs
- **History**: Detailed backup history for each server
- **Metrics**: Charts and statistics about backup performance
- **Notifications**: Alerts for failed or overdue backups

## Common Tasks

### Adding a New Server
1. Configure the Duplicati server to send reports to duplistatus
2. Run a backup job
3. The server will automatically appear in the dashboard
4. Configure server settings (alias, notes, notifications)

### Setting Up Notifications
1. Go to **Settings** → **Notifications**
2. Configure your notification preferences
3. Set up NTFY or email notifications
4. Test the notification system

### Monitoring Backups
1. Check the dashboard regularly for backup status
2. Set up notifications for failed backups
3. Review backup history and metrics
4. Monitor overdue backups

## Troubleshooting

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

## Getting Help

### Documentation
- **User Guide**: [Complete User Guide](../user-guide/overview.md)
- **API Reference**: [API Documentation](../api-reference/overview.md)
- **Development**: [Development Guide](../development/setup.md)

### Support
- **GitHub Issues**: [Report bugs or request features](https://github.com/wsj-br/duplistatus/issues)
- **GitHub Discussions**: [Community support](https://github.com/wsj-br/duplistatus/discussions)

## Next Steps

Now that you have duplistatus running:

1. **Explore the User Guide** - Learn about all features in detail
2. **Set up notifications** - Get alerted about backup issues
3. **Configure multiple servers** - Monitor all your Duplicati instances
4. **Integrate with Homepage** - Use the API to integrate with other tools
5. **Contribute** - Help improve duplistatus by contributing code or documentation

## Tips for Success

- **Regular Monitoring**: Check the dashboard regularly to ensure backups are running
- **Notification Setup**: Configure notifications to stay informed about backup status
- **Server Organization**: Use aliases and notes to organize your servers
- **Backup Testing**: Regularly test your backup and restore procedures
- **Documentation**: Keep notes about your backup configuration and procedures

Welcome to duplistatus! You're now ready to monitor your Duplicati backups effectively.
