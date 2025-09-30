# Backup Monitoring

![duplistatus](../img/duplistatus_banner.png)

Monitor and track your backup operations with comprehensive monitoring features.

## Overview

duplistatus provides comprehensive backup monitoring capabilities to help you track, analyze, and manage your backup operations across multiple Duplicati servers.

## Collect Backup Logs

Collect backup logs from your Duplicati servers to populate the duplistatus database.

### Steps to Collect Backup Logs

#### Manual Collection (All Servers)

1. **Access Collection Tool**: Go to **Settings** → **Database Maintenance** → **Collect Logs**
2. **Select Servers**: Choose which servers to collect logs from
3. **Configure Options**: Set collection options and preferences
4. **Start Collection**: Begin the log collection process
5. **Monitor Progress**: Watch the collection progress and status
6. **Review Results**: Check collected logs and verify data

#### Quick Collection (Version 0.8.x)

Enhanced quick collection features:

- **One-Click Collection**: Collect logs from all servers with one click
- **Smart Collection**: Automatically detect and collect from new servers
- **Background Collection**: Collect logs in the background without blocking the interface
- **Incremental Collection**: Only collect new logs since last collection

#### Automatic Configuration Updates

- **Auto-Discovery**: Automatically discover new Duplicati servers
- **Configuration Sync**: Sync configuration changes automatically
- **Health Monitoring**: Monitor server health and connectivity
- **Error Recovery**: Automatically retry failed collection attempts

### How the Collection Process Works

#### Collection Methods

1. **HTTP API**: Connect to Duplicati's HTTP API to retrieve logs
2. **Database Access**: Direct access to Duplicati's database (if available)
3. **Log Files**: Parse Duplicati log files
4. **Web Interface**: Extract data from Duplicati's web interface

#### Data Processing

1. **Log Parsing**: Parse backup logs and extract relevant information
2. **Data Validation**: Validate collected data for accuracy
3. **Database Storage**: Store processed data in the duplistatus database
4. **Indexing**: Create indexes for fast data retrieval
5. **Cleanup**: Remove old or duplicate data

#### Error Handling

- **Connection Errors**: Handle network connectivity issues
- **Authentication Errors**: Manage authentication failures
- **Data Errors**: Handle corrupted or invalid data
- **Retry Logic**: Implement retry mechanisms for failed operations

## Backup Metrics

Monitor backup performance and trends with comprehensive metrics.

### Performance Metrics

#### Duration Metrics
- **Average Duration**: Mean backup duration over time
- **Duration Trends**: Track how backup duration changes
- **Peak Duration**: Identify longest backup operations
- **Duration Distribution**: Analyze duration patterns

#### Size Metrics
- **Data Growth**: Monitor data growth over time
- **Backup Size**: Track individual backup sizes
- **Storage Usage**: Monitor storage consumption
- **Compression Ratios**: Analyze compression effectiveness

#### Success Metrics
- **Success Rate**: Percentage of successful backups
- **Failure Rate**: Percentage of failed backups
- **Recovery Time**: Time to recover from failures
- **Uptime**: System and backup uptime statistics

### Trend Analysis

#### Historical Trends
- **Long-term Trends**: Analyze trends over months and years
- **Seasonal Patterns**: Identify seasonal backup patterns
- **Growth Projections**: Project future backup requirements
- **Capacity Planning**: Plan for future storage needs

#### Comparative Analysis
- **Server Comparison**: Compare performance across servers
- **Time Period Comparison**: Compare different time periods
- **Backup Job Comparison**: Compare different backup jobs
- **Performance Benchmarking**: Benchmark against industry standards

### Custom Metrics

#### User-Defined Metrics
- **Custom KPIs**: Define custom key performance indicators
- **Business Metrics**: Track business-relevant metrics
- **Compliance Metrics**: Monitor compliance-related metrics
- **Cost Metrics**: Track backup-related costs

#### Metric Aggregation
- **Rollup Aggregation**: Aggregate metrics across time periods
- **Server Aggregation**: Aggregate metrics across servers
- **Job Aggregation**: Aggregate metrics across backup jobs
- **Custom Aggregation**: Define custom aggregation rules

## Server Details

Detailed view of individual server backup operations and statistics.

### Server/Backup Statistics

#### Overview Statistics
- **Total Backups**: Number of backup operations
- **Successful Backups**: Number of successful operations
- **Failed Backups**: Number of failed operations
- **Average Duration**: Mean backup duration
- **Total Data**: Total amount of data backed up
- **Storage Used**: Total storage space used

#### Performance Statistics
- **Success Rate**: Percentage of successful backups
- **Average Speed**: Average backup speed
- **Peak Performance**: Best performance achieved
- **Resource Usage**: CPU, memory, and network usage
- **Error Rate**: Frequency of errors and warnings

#### Trend Statistics
- **Growth Rate**: Rate of data growth
- **Performance Trends**: How performance changes over time
- **Error Trends**: How error rates change over time
- **Capacity Trends**: How capacity usage changes

### Backup History

Comprehensive history of backup operations for each server.

#### Historical Data
- **Backup Timeline**: Chronological list of all backups
- **Status History**: History of backup status changes
- **Performance History**: Historical performance data
- **Error History**: History of errors and warnings

#### Data Visualization
- **Timeline Charts**: Visual timeline of backup operations
- **Status Charts**: Charts showing status distribution
- **Performance Charts**: Charts showing performance trends
- **Error Charts**: Charts showing error patterns

#### Data Export
- **CSV Export**: Export backup history to CSV format
- **JSON Export**: Export data in JSON format
- **PDF Reports**: Generate PDF reports of backup history
- **Custom Reports**: Create custom reports with specific data

## Backup Details

Detailed information about individual backup operations.

### Backup Information

#### Basic Information
- **Backup ID**: Unique identifier for the backup
- **Server Name**: Name of the source server
- **Backup Name**: Name of the backup job
- **Start Time**: When the backup started
- **End Time**: When the backup completed
- **Duration**: How long the backup took
- **Status**: Final status of the backup

#### Data Information
- **Files Processed**: Number of files backed up
- **Data Size**: Size of the data backed up
- **Storage Used**: Storage space used for the backup
- **Compression Ratio**: How much the data was compressed
- **Upload Speed**: Speed of data upload

#### Technical Details
- **Backup Method**: Method used for the backup
- **Encryption**: Encryption settings used
- **Compression**: Compression settings used
- **Network**: Network information and performance
- **System Resources**: System resource usage during backup

### Log Analysis

#### Log Messages
- **Execution Logs**: Detailed execution logs
- **Warning Messages**: Warning messages and alerts
- **Error Messages**: Error messages and failures
- **Debug Information**: Debug information and diagnostics

#### Log Filtering
- **Level Filtering**: Filter by log level (Info, Warning, Error)
- **Time Filtering**: Filter by time range
- **Message Filtering**: Filter by message content
- **Source Filtering**: Filter by log source

#### Log Export
- **Text Export**: Export logs as text files
- **JSON Export**: Export logs in JSON format
- **HTML Export**: Export logs as HTML reports
- **Custom Export**: Create custom log exports

## Overdue Check Process

Automated process for detecting and managing overdue backups.

### Detection Logic

#### Schedule Analysis
- **Schedule Parsing**: Parse backup schedules from Duplicati
- **Pattern Recognition**: Recognize backup patterns and variations
- **Exception Handling**: Handle exceptions and special cases
- **Grace Periods**: Apply grace periods before marking as overdue

#### Detection Methods
- **Time-based Detection**: Detect overdue backups based on time
- **Pattern-based Detection**: Detect based on backup patterns
- **Threshold-based Detection**: Detect based on configurable thresholds
- **Machine Learning**: Use ML to improve detection accuracy

### Notification System

#### Notification Types
- **Initial Alert**: First notification when backup becomes overdue
- **Escalation Alerts**: Follow-up notifications for persistent issues
- **Recovery Notifications**: Notifications when overdue backups are resolved
- **Summary Reports**: Periodic summary reports

#### Notification Channels
- **NTFY**: Push notifications to mobile devices
- **Email**: Email notifications via SMTP
- **Webhooks**: Custom webhook integrations
- **Dashboard Alerts**: Visual alerts in the dashboard

### Management Features

#### Overdue Dashboard
- **Overdue List**: List of all overdue backups
- **Priority Levels**: Different priority levels for overdue backups
- **Action Items**: Suggested actions for resolving overdue backups
- **Progress Tracking**: Track progress in resolving overdue backups

#### Resolution Tracking
- **Resolution Time**: Track how long it takes to resolve overdue backups
- **Resolution Methods**: Track how overdue backups are resolved
- **Prevention Measures**: Identify measures to prevent future overdue backups
- **Performance Impact**: Measure impact of overdue backups on system performance

## Monitoring Best Practices

### Setup Best Practices
- **Comprehensive Monitoring**: Monitor all aspects of backup operations
- **Proactive Monitoring**: Set up proactive monitoring and alerting
- **Regular Review**: Regularly review monitoring data and trends
- **Continuous Improvement**: Continuously improve monitoring based on insights

### Performance Best Practices
- **Baseline Establishment**: Establish performance baselines
- **Trend Analysis**: Regularly analyze performance trends
- **Capacity Planning**: Plan for future capacity needs
- **Optimization**: Continuously optimize backup performance

### Troubleshooting Best Practices
- **Root Cause Analysis**: Perform root cause analysis for issues
- **Documentation**: Document issues and resolutions
- **Knowledge Base**: Maintain a knowledge base of common issues
- **Training**: Train staff on monitoring and troubleshooting

## Troubleshooting Monitoring Issues

### Common Issues

#### Data Collection Issues
- **Connection Problems**: Issues connecting to Duplicati servers
- **Authentication Failures**: Problems with authentication
- **Data Parsing Errors**: Errors in parsing backup data
- **Storage Issues**: Problems with data storage

#### Performance Issues
- **Slow Queries**: Database queries running slowly
- **High Resource Usage**: High CPU or memory usage
- **Network Latency**: Network performance issues
- **Storage Limitations**: Storage capacity issues

#### Alerting Issues
- **Missing Alerts**: Alerts not being sent
- **False Positives**: Too many false positive alerts
- **Alert Fatigue**: Too many alerts causing fatigue
- **Delivery Problems**: Problems delivering alerts

### Diagnostic Tools

#### Monitoring Diagnostics
- **Health Checks**: Comprehensive health checks
- **Performance Tests**: Performance testing tools
- **Connectivity Tests**: Network connectivity testing
- **Data Validation**: Data integrity validation

#### Troubleshooting Tools
- **Log Analysis**: Advanced log analysis tools
- **Performance Profiling**: Performance profiling tools
- **Network Diagnostics**: Network diagnostic tools
- **Database Diagnostics**: Database diagnostic tools

## Next Steps

- **Server Management**: Learn about [Server Settings](server-management.md)
- **Notifications**: Set up [Notification System](notifications.md)
- **API Integration**: Use [API Reference](../api-reference/overview.md)
- **Troubleshooting**: Common issues and [Troubleshooting Guide](troubleshooting.md)
