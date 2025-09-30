---
sidebar_position: 4
---

# Notifications

![duplistatus](//img/duplistatus_banner.png)

Configure and manage notification systems to stay informed about your backup operations.

## Overview

duplistatus supports multiple notification methods to keep you informed about backup status, failures, and overdue backups.

### Supported Notification Methods

- **NTFY**: Push notifications to your phone
- **Email**: Email notifications via SMTP
- **Webhooks**: Custom webhook integrations
- **Custom Templates**: Customizable notification messages

## Backup Notifications Settings

Configure notification preferences for backup operations.

### Configure Per-Backup Notification Settings

Set up notifications for individual backup jobs:

1. Go to **Settings** → **Backup Notifications**
2. Select the server and backup job
3. Configure notification preferences:
   - **Success Notifications**: Notify on successful backups
   - **Warning Notifications**: Notify on backup warnings
   - **Error Notifications**: Notify on backup failures
   - **Overdue Notifications**: Notify on overdue backups

### Global Configurations

Set default notification settings for all backups:

- **Default Notification Level**: Set the default notification level
- **Notification Frequency**: Configure how often to send notifications
- **Quiet Hours**: Set times when notifications should be suppressed
- **Escalation Rules**: Configure notification escalation for critical issues

### Action Buttons

Quick actions for notification management:

- **Test Notifications**: Send test notifications to verify configuration
- **Enable All**: Enable notifications for all backup jobs
- **Disable All**: Disable notifications for all backup jobs
- **Reset to Defaults**: Reset all notification settings to defaults

## Enhanced Overdue Monitoring (Version 0.8.x)

Advanced overdue backup monitoring with enhanced features.

### Enhanced Features

- **Smart Detection**: Intelligent overdue backup detection
- **Grace Periods**: Configurable grace periods before marking as overdue
- **Escalation**: Automatic notification escalation for critical overdue backups
- **Recovery Tracking**: Track when overdue backups are resolved

### Configuration Options

#### Overdue Detection
- **Detection Method**: Choose how overdue backups are detected
- **Grace Period**: Set extra time before marking as overdue
- **Check Frequency**: How often to check for overdue backups
- **Severity Levels**: Configure different severity levels

#### Notification Settings
- **Initial Notification**: First notification when backup becomes overdue
- **Escalation Notifications**: Follow-up notifications for persistent issues
- **Recovery Notifications**: Notifications when overdue backups are resolved
- **Summary Reports**: Periodic summary reports of overdue backups

### Automatic Configuration

- **Auto-Detection**: Automatically detect backup schedules
- **Smart Defaults**: Apply intelligent default settings
- **Learning Mode**: Learn from backup patterns to improve detection
- **Adaptive Thresholds**: Adjust thresholds based on historical data

## Overdue Check Process

How the overdue backup checking process works.

### Check Schedule
- **Frequency**: How often overdue checks are performed
- **Timing**: When checks are performed (e.g., during business hours)
- **Scope**: Which backups are checked
- **Performance**: Optimize check performance for large deployments

### Detection Logic
- **Schedule Analysis**: Analyze backup schedules to determine expected times
- **Pattern Recognition**: Recognize backup patterns and variations
- **Exception Handling**: Handle exceptions and special cases
- **False Positive Reduction**: Minimize false positive overdue detections

## NTFY Settings

Configure NTFY (Notify) for push notifications to your phone.

### Basic Configuration

1. Go to **Settings** → **NTFY Settings**
2. Configure the following:
   - **NTFY Server**: URL of your NTFY server (default: ntfy.sh)
   - **Topic**: NTFY topic for notifications
   - **Priority**: Notification priority level
   - **Tags**: Tags to categorize notifications

### Advanced Configuration

#### Authentication
- **Username**: NTFY username (if required)
- **Password**: NTFY password (if required)
- **API Key**: API key for authentication
- **Token**: Authentication token

#### Customization
- **Message Format**: Customize notification message format
- **Icons**: Set notification icons
- **Sounds**: Configure notification sounds
- **Actions**: Add action buttons to notifications

### Device Configuration (Version 0.8.x)

Enhanced device-specific configuration options.

#### Device Management
- **Device Registration**: Register devices for notifications
- **Device Groups**: Organize devices into groups
- **Device Preferences**: Set per-device notification preferences
- **Device Status**: Monitor device connectivity and status

#### Multi-Device Support
- **Primary Device**: Set primary device for critical notifications
- **Backup Devices**: Configure backup devices for redundancy
- **Device Rotation**: Rotate notifications across devices
- **Device Scheduling**: Schedule notifications per device

### About NTFY

NTFY (Notify) is a simple HTTP-based pub-sub notification service that allows you to send push notifications to your phone, desktop, or any other device.

#### Benefits
- **Simple Setup**: Easy to configure and use
- **Cross-Platform**: Works on iOS, Android, and desktop
- **Reliable**: Reliable delivery of notifications
- **Free**: Free service with optional paid features

#### Getting Started
1. **Install NTFY App**: Download the NTFY app for your device
2. **Subscribe to Topic**: Subscribe to your configured topic
3. **Test Notifications**: Send test notifications to verify setup
4. **Configure Preferences**: Set up notification preferences in the app

## Email Configuration

Configure email notifications via SMTP.

### Web Interface Configuration

1. Go to **Settings** → **Email Configuration**
2. Configure SMTP settings:
   - **SMTP Server**: SMTP server hostname
   - **Port**: SMTP server port (usually 587 or 465)
   - **Security**: SSL/TLS security settings
   - **Authentication**: Username and password

### Common SMTP Providers

#### Gmail
- **Server**: smtp.gmail.com
- **Port**: 587
- **Security**: TLS
- **Authentication**: Gmail username and app password

#### Outlook/Hotmail
- **Server**: smtp-mail.outlook.com
- **Port**: 587
- **Security**: TLS
- **Authentication**: Outlook username and password

#### Custom SMTP
- **Server**: Your SMTP server hostname
- **Port**: Your SMTP server port
- **Security**: Your security requirements
- **Authentication**: Your authentication method

### Security Features (Version 0.8.x)

Enhanced security features for email notifications.

#### Encryption
- **TLS/SSL**: Encrypt email communications
- **Certificate Validation**: Validate SMTP server certificates
- **Secure Authentication**: Use secure authentication methods
- **Password Protection**: Protect stored credentials

#### Privacy
- **Data Minimization**: Send only necessary information
- **Anonymization**: Anonymize sensitive data in notifications
- **Retention Policies**: Configure email retention policies
- **Access Controls**: Control who can access email settings

## Notification Templates

Customize notification messages and formats.

### Template Types

#### Success Templates
- **Backup Completed**: Notification when backup completes successfully
- **Recovery Completed**: Notification when overdue backup is resolved
- **System Health**: Notification about system health status

#### Warning Templates
- **Backup Warning**: Notification for backup warnings
- **Overdue Warning**: Notification for overdue backups
- **Performance Warning**: Notification for performance issues

#### Error Templates
- **Backup Failed**: Notification when backup fails
- **System Error**: Notification for system errors
- **Connection Error**: Notification for connection issues

### Template Customization

#### Message Format
- **Subject Line**: Customize email subject lines
- **Message Body**: Customize notification message content
- **Variables**: Use variables for dynamic content
- **Formatting**: Apply HTML or plain text formatting

#### Content Variables
- **Server Name**: Name of the server
- **Backup Name**: Name of the backup job
- **Status**: Current backup status
- **Timestamp**: When the event occurred
- **Duration**: How long the backup took
- **Size**: Backup size information
- **Error Details**: Detailed error information

### Template Management

#### Template Library
- **Pre-built Templates**: Use pre-built notification templates
- **Custom Templates**: Create your own custom templates
- **Template Sharing**: Share templates with other users
- **Template Versioning**: Version control for templates

#### Template Testing
- **Preview Mode**: Preview templates before applying
- **Test Notifications**: Send test notifications with templates
- **Validation**: Validate template syntax and variables
- **Performance Testing**: Test template rendering performance

## Notification Best Practices

### Configuration Best Practices
- **Start Simple**: Begin with basic notification settings
- **Test Thoroughly**: Test all notification methods
- **Monitor Performance**: Monitor notification system performance
- **Regular Review**: Regularly review and update notification settings

### Content Best Practices
- **Clear Messages**: Write clear, actionable notification messages
- **Appropriate Detail**: Include appropriate level of detail
- **Consistent Format**: Use consistent message formatting
- **Actionable Information**: Include information that helps resolve issues

### Performance Best Practices
- **Batch Notifications**: Batch similar notifications together
- **Rate Limiting**: Implement rate limiting to prevent spam
- **Priority Queuing**: Use priority queues for critical notifications
- **Monitoring**: Monitor notification delivery and performance

## Troubleshooting Notifications

### Common Issues

#### Notifications Not Sending
- **Configuration Check**: Verify notification configuration
- **Network Connectivity**: Test network connectivity to notification services
- **Authentication**: Verify authentication credentials
- **Service Status**: Check notification service status

#### Delivery Issues
- **Spam Filters**: Check spam filters and whitelist settings
- **Rate Limiting**: Check for rate limiting issues
- **Service Limits**: Verify service usage limits
- **Error Logs**: Review error logs for delivery issues

#### Performance Issues
- **Queue Backlog**: Check for notification queue backlogs
- **Resource Usage**: Monitor system resources
- **Database Performance**: Check database performance
- **Network Latency**: Test network latency to notification services

### Diagnostic Tools

#### Notification Testing
- **Test Notifications**: Send test notifications to verify configuration
- **Delivery Tracking**: Track notification delivery status
- **Performance Monitoring**: Monitor notification system performance
- **Error Analysis**: Analyze notification errors and failures

#### Configuration Validation
- **Settings Validation**: Validate notification settings
- **Template Validation**: Validate notification templates
- **Service Connectivity**: Test connectivity to notification services
- **Authentication Testing**: Test authentication with notification services

## Next Steps

- **Backup Monitoring**: Monitor [Backup Operations](backup-monitoring.md)
- **Server Management**: Learn about [Server Settings](server-management.md)
- **API Integration**: Use [API Reference](../api-reference/overview.md)
- **Troubleshooting**: Common issues and [Troubleshooting Guide](troubleshooting.md)
