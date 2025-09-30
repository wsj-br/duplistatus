# Server Management

![duplistatus](../img/duplistatus_banner.png)

This section covers server management features including server settings, display configuration, and database maintenance.

## Server Settings

Configure individual server settings to customize how each server appears and behaves in the dashboard.

### Server Configuration

Access server settings through **Settings** → **Server Settings**:

- **Server Alias**: Give your server a friendly, memorable name
- **Server Notes**: Add descriptions, contact information, or important notes
- **Notification Settings**: Configure per-server notification preferences
- **Display Options**: Customize how the server appears in the dashboard

### Server Information

Each server entry includes:

- **Server ID**: Unique identifier for the server
- **Server Name**: Original name from Duplicati
- **Alias**: Custom name you've assigned
- **Notes**: Additional information about the server
- **Last Seen**: When the server last communicated with duplistatus
- **Backup Count**: Number of backup jobs configured
- **Status**: Current server status

## Display Settings

Configure how **duplistatus** displays data and information.

### Layout Options

- **Cards Layout**: Visual cards showing server information (default)
- **Table Layout**: Tabular view with detailed information
- **Compact View**: Show more information in less space
- **Detailed View**: Show comprehensive backup information

### Sort Options

Configure how servers are sorted in the dashboard:

- **Server name (a-z)**: Alphabetical by server name
- **Status (error > warning > success)**: By status priority
- **Last backup received (new > old)**: By most recent backup

### Refresh Settings

- **Auto-refresh**: Enable automatic dashboard updates
- **Refresh Interval**: Set how often the dashboard updates (30 seconds to 5 minutes)
- **Manual Refresh**: Force immediate data refresh

### Theme Options

- **Dark Theme**: Default dark theme (recommended)
- **Light Theme**: Light theme for bright environments
- **Auto Theme**: Follow system theme preferences

## Database Maintenance

Maintain and clean your duplistatus database to ensure optimal performance.

### Data Cleanup Period

Configure how long to keep backup data:

- **Backup Logs**: How long to keep individual backup logs
- **Server Data**: How long to keep server information
- **Statistics**: How long to keep performance statistics
- **Notifications**: How long to keep notification history

### Cleanup Options

#### Delete Backup Job Data
Remove data for specific backup jobs:

1. Go to **Database Maintenance**
2. Select **Delete Backup Job Data**
3. Choose the server and backup job
4. Confirm deletion

#### Delete Server Data
Remove all data for a specific server:

1. Go to **Database Maintenance**
2. Select **Delete Server Data**
3. Choose the server to remove
4. Confirm deletion

### Maintenance Tasks

#### Regular Maintenance
- **Weekly**: Review and clean old backup logs
- **Monthly**: Check database size and performance
- **Quarterly**: Review server configurations and settings

#### Performance Optimization
- **Database Indexing**: Ensure proper database indexes
- **Query Optimization**: Monitor and optimize database queries
- **Storage Management**: Manage disk space usage
- **Backup Verification**: Verify backup data integrity

## Duplicati Configuration

Access and manage Duplicati server configurations directly from duplistatus.

### Configuration Access

- **Web Interface**: Open Duplicati's web interface in a new tab
- **Server Settings**: Access server-specific configuration
- **Backup Jobs**: View and manage individual backup jobs
- **Schedules**: Check backup schedules and timing

### Configuration Management

#### Server Configuration
- **Remote Access**: Enable/disable remote access
- **Authentication**: Configure authentication settings
- **Network Settings**: Set network and port configurations
- **Logging**: Configure logging levels and destinations

#### Backup Job Configuration
- **Source Paths**: Configure what to backup
- **Destination**: Set backup destination
- **Schedule**: Configure backup timing
- **Options**: Set backup options and preferences

## Settings Management

Access and configure all duplistatus settings.

<a id="settings"></a>

### General Settings

- **Application Name**: Customize the application title
- **Default Timezone**: Set the default timezone
- **Language**: Choose display language
- **Date Format**: Configure date and time display format

### Security Settings

- **Authentication**: Enable user authentication
- **Access Control**: Configure user permissions
- **Session Management**: Set session timeout and security
- **API Security**: Configure API access and security

### Performance Settings

- **Cache Settings**: Configure data caching
- **Query Limits**: Set database query limits
- **Resource Limits**: Configure memory and CPU limits
- **Optimization**: Enable performance optimizations

## Troubleshooting Server Issues

### Common Server Problems

#### Server Not Appearing
- **Check Configuration**: Verify Duplicati server configuration
- **Network Connectivity**: Test network connection
- **Firewall Rules**: Check firewall and port access
- **Service Status**: Verify Duplicati service is running

#### Missing Backup Data
- **Backup Jobs**: Check if backup jobs are configured
- **Schedule**: Verify backup schedules are active
- **Logs**: Review Duplicati and duplistatus logs
- **API Endpoints**: Test API connectivity

#### Performance Issues
- **Database Size**: Check database size and performance
- **Resource Usage**: Monitor CPU and memory usage
- **Network Latency**: Test network performance
- **Query Performance**: Analyze database query performance

### Diagnostic Tools

#### Server Diagnostics
- **Connection Test**: Test connection to Duplicati server
- **API Test**: Verify API endpoints are working
- **Log Analysis**: Analyze server and application logs
- **Performance Metrics**: Monitor server performance

#### Database Diagnostics
- **Database Health**: Check database integrity
- **Query Performance**: Analyze slow queries
- **Index Usage**: Monitor database index usage
- **Storage Analysis**: Analyze storage usage patterns

## Best Practices

### Server Organization
- **Naming Convention**: Use consistent server naming
- **Documentation**: Keep detailed server documentation
- **Monitoring**: Set up comprehensive monitoring
- **Backup Verification**: Regularly verify backup integrity

### Maintenance Schedule
- **Daily**: Check backup status and notifications
- **Weekly**: Review server performance and logs
- **Monthly**: Clean old data and optimize database
- **Quarterly**: Review and update configurations

### Security Practices
- **Access Control**: Implement proper access controls
- **Network Security**: Secure network communications
- **Data Protection**: Protect sensitive backup data
- **Audit Logging**: Enable comprehensive audit logging

## Next Steps

- **Notifications**: Set up [Notification System](notifications.md)
- **Backup Monitoring**: Monitor [Backup Operations](backup-monitoring.md)
- **API Integration**: Use [API Reference](../api-reference/overview.md)
- **Troubleshooting**: Common issues and [Troubleshooting Guide](troubleshooting.md)
