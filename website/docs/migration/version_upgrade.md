

# Migration Guide

This guide provides detailed information about migrating between versions of duplistatus. It covers automatic migration processes, manual steps required, and version-specific changes.

## Overview

duplistatus uses an automatic migration system that updates your database schema when upgrading between versions. This document outlines what to expect during migration and any manual steps that may be required.

## Automatic Migration

The migration process happens automatically when you start a new version:

### Migration Process

1. **Backup Creation**: Automatic database backup is created before any changes
2. **Schema Update**: Database schema is updated automatically
3. **Data Migration**: Existing data is preserved and migrated to the new schema
4. **Verification**: Migration is verified and logged

### What Gets Migrated

- **Database Schema**: Tables are renamed, fields are added, and structure is updated as needed
- **Data Preservation**: All existing backup data is preserved
- **Server Information**: Server data is migrated to new schema
- **Backup History**: All backup logs are preserved
- **Configuration**: Settings and preferences are migrated when applicable

## Manual Steps Required

### 1. Update External Integrations

If you have external tools or scripts using the API, you may need to update them:

- **Homepage Integration**: Update API field references if endpoints changed
- **Custom Scripts**: Update field names and endpoint paths in your scripts
- **Monitoring Tools**: Update any monitoring integrations that consume API endpoints
- **Webhooks**: Update webhook payload handling if response structure changed

> [!NOTE]
> For details on external API endpoint changes, see the [API Breaking Changes](api-changes.md) guide.

### 2. Test Functionality

After migration, verify that all features work correctly:

- **Dashboard**: Check that all servers appear correctly
- **Backup History**: Verify backup history is displayed
- **Notifications**: Test notification functionality
- **API Endpoints**: Test any external API usage
- **Settings**: Verify all configuration settings are accessible

### 3. Update Documentation

Update any custom documentation or notes:

- **Internal Documentation**: Update field references and endpoint paths
- **Integration Guides**: Update API examples
- **Troubleshooting Guides**: Update error message references

## Version-Specific Changes

### Version 0.9.x

When upgrading to version 0.9.x from 0.8.x or earlier:

#### Breaking Changes

> [!WARNING]
> **Version 0.9.x introduces authentication requirements. All users must log in after upgrade.**

1. **Authentication Required**: All pages and API endpoints now require authentication
2. **Default Admin Account**: A default admin account is created automatically:
   - Username: `admin`
   - Password: `Duplistatus09` (must be changed on first login)
3. **Session Invalidation**: All existing sessions are invalidated
4. **API Authentication**: External API integrations must include authentication

#### Automatic Changes

1. **Database Migration**: The application will automatically migrate your database schema from v3.1 to v4.0
2. **Database Backup**: An automatic backup is created before migration
3. **New Tables**: Three new tables are created:
   - `users`: User account information
   - `sessions`: Session management
   - `audit_log`: Audit trail of all actions
4. **Default Admin User**: A default admin user is created with credentials above
5. **Session Storage**: Sessions are now stored in the database (persist across restarts)

#### Manual Actions Required

1. **First Login**: Log in with default admin credentials (`admin` / `Duplistatus09`)
2. **Change Password**: Change the default admin password when prompted (forced on first login)
3. **Create User Accounts**: Create individual user accounts for each person who needs access (Settings → Users)
4. **Update External Integrations**: Update any external tools or scripts using the API to include authentication:
   - API requests must include session cookies
   - Or use authenticated requests with proper credentials
   - See [API Reference](../api-reference/authentication-security.md) for details
5. **Configure Audit Log Retention**: Set appropriate audit log retention period if needed (Settings → Audit Log)

#### Security Considerations

- **Change Default Password**: Change the default admin password immediately after first login
- **Create User Accounts**: Create individual accounts for each user (don't share admin credentials)
- **Review Audit Logs**: Check audit logs regularly for security monitoring
- **Configure Retention**: Set appropriate audit log retention period based on compliance requirements
- **Master Key File**: If upgrading from 0.8.x, ensure the `.duplistatus.key` file is backed up (still used for encrypted data)

#### New Features

- **User Access Control**: Complete authentication and authorization system
- **User Management**: Create, edit, and manage user accounts with role-based access
- **Audit Logging**: Comprehensive audit trail of all system changes and user actions
- **Settings Redesign**: Modern settings page with collapsible sidebar
- **Admin Recovery Tool**: CLI tool for recovering locked admin accounts
- **Password Policy**: Enforced password requirements for security
- **Account Lockout**: Protection against brute-force attacks

#### Migration Process

The migration from v3.1 to v4.0 happens automatically:

1. **Backup Creation**: Database backup is created automatically
2. **Schema Update**: New tables (`users`, `sessions`, `audit_log`) are created
3. **Default User**: Admin user is seeded with default credentials
4. **Session Migration**: Existing sessions are invalidated (users must log in)
5. **Data Preservation**: All existing backup data, servers, and configuration are preserved

#### Post-Migration Steps

After migration completes:

1. Log in with default admin credentials
2. Change admin password when prompted
3. Create user accounts for other users
4. Review audit logs to verify system is working
5. Update external API integrations to include authentication
6. Configure audit log retention if needed

### Version 0.8.x

When upgrading to version 0.8.x from 0.7.x or earlier:

#### Automatic Changes

1. **Database Migration**: The application will automatically migrate your database schema to support new features
2. **Master Key Generation**: A new master key will be generated for encryption of sensitive data (stored in `.duplistatus.key`)
3. **Session Management**: Existing sessions will be invalidated and new CSRF-protected sessions will be established
4. **Configuration Updates**: Some configuration keys have been updated to support new features
5. **Password Encryption**: Existing passwords will be encrypted using the new cryptographic system

#### Manual Actions Required

1. **Notification Templates**: The variables `{backup_interval_value}` and `{backup_interval_type}` were replaced by `{backup_interval}`. Default templates will be adjusted automatically, but customised templates will not be migrated. Please review and update your custom templates.

#### Security Considerations

- **Master Key File**: Ensure the `.duplistatus.key` file is properly backed up and secured
- **File Permissions**: The master key file will have restricted permissions (0400) for security
- **Session Expiration**: Sessions now expire automatically after 24 hours

#### New Features

- **Enhanced Security**: CSRF protection, password encryption, and secure session management
- **SMTP Email Support**: Configure email notifications in addition to NTFY
- **Improved Backup Collection**: Automatic HTTP/HTTPS detection and bulk collection functionality
- **Enhanced Overdue Monitoring**: Custom intervals compatible with Duplicati server configuration

### Version 0.7.x

When upgrading to version 0.7.x from 0.6.x or earlier:

#### Database Changes

**Table Renaming:**
- **`machines`** → **`servers`**
- **`machine_id`** → **`server_id`** (in related tables)

**New Fields Added:**
- **`alias`**: Friendly server name
- **`notes`**: Server description/notes
- **`created_at`**: Server creation timestamp
- **`updated_at`**: Last update timestamp

**Schema Improvements:**
- **Better Indexing**: Improved query performance
- **Data Validation**: Enhanced data integrity
- **Foreign Key Constraints**: Better referential integrity

#### API Changes

> [!IMPORTANT]
> Version 0.7.x introduced breaking changes to external API endpoints. If you have external integrations, scripts, or applications that consume the API, you **MUST** update them. See the [API Breaking Changes](api-changes.md) guide for detailed information about API response changes.

**Key Changes:**
- Field renaming: `totalMachines` → `totalServers` in `/api/summary` endpoint
- Object renaming: `machine` → `server` in API response objects
- Field renaming: `backup_types_count` → `backup_jobs_count` in `/api/lastbackups/{serverId}` endpoint

#### Configuration Changes

- **API Endpoints**: All API endpoints previously using `/api/machines/...` now use `/api/servers/...`
- **Configuration Keys**: Configuration keys for backup settings have been updated from `machine_name:backup_name` to `server_id:backup_name`
- **Notification Templates**: Template variables have been updated (e.g., `{machine_name}` → `{server_name}`). Custom templates will need manual updates.

## Database Changes Summary

The following table summarises major database schema changes across versions:

| Version | Change Type | Details |
|---------|-------------|---------|
| 0.9.x | Schema | Added `users`, `sessions`, `audit_log` tables (v4.0) |
| 0.9.x | Security | Complete authentication and authorization system |
| 0.9.x | Breaking | All pages and APIs now require authentication |
| 0.8.x | Security | Added encryption support for sensitive data, master key system |
| 0.8.x | Schema | Enhanced session management and CSRF token storage |
| 0.7.x | Table Rename | `machines` → `servers`, `machine_id` → `server_id` |
| 0.7.x | New Fields | Added `alias`, `notes`, `created_at`, `updated_at` to servers table |

## API Changes

### External API Endpoints

For detailed information about changes to external API endpoints and response structures, please refer to the [API Breaking Changes](api-changes.md) guide. This document covers:

- Field renaming in API responses
- Response structure changes
- Endpoint path changes
- Migration steps for external integrations

### Internal API Changes

Internal API endpoints used by the web interface are automatically handled during migration. No manual intervention is required for internal API usage.

## Troubleshooting

### Common Issues

1. **Migration Fails**: Check disk space and permissions
   - Ensure sufficient disk space for database backup
   - Verify write permissions on the data directory
   
2. **Data Missing**: Verify database backup was created
   - Check the backup location (typically in the data directory)
   - Review container logs for backup creation messages
   
3. **API Errors**: Update external integrations
   - Review [API Breaking Changes](api-changes.md) for endpoint updates
   - Test API endpoints after migration
   
4. **Performance Issues**: Check database indexes
   - Verify database file integrity
   - Review container logs for migration warnings

5. **Master Key Issues** (0.8.x+): 
   - Ensure `.duplistatus.key` file is accessible
   - Verify file permissions are set correctly (0400)
   - Check container logs for key generation errors

6. **Authentication Issues** (0.9.x+):
   - Verify default admin account was created (check logs)
   - Try logging in with default credentials (`admin` / `Duplistatus09`)
   - If locked out, use admin recovery tool: `docker exec -it duplistatus /app/admin-recovery admin NewPassword123`
   - Check that database migration completed successfully
   - Verify `users` table exists in database

### Recovery Steps

If migration fails:

1. **Stop Container**: Stop the duplistatus container
2. **Restore Backup**: Replace database with backup file (located in the data directory)
3. **Check Logs**: Review container logs for errors
   ```bash
   docker logs <container-name>
   ```
4. **Report Issue**: Open GitHub issue with logs and migration details

### Monitoring Migration Progress

To monitor migration progress, check the Docker logs:

```bash
docker logs <container-name>
```

Look for these messages to confirm successful migration:

- `"Found X pending migrations"`
- `"Running consolidated migration X.0..."`
- `"Migration X.0 completed successfully"`
- `"Database backup created: /path/to/backups-copy-YYYY-MM-DDTHH-MM-SS.db"`
- `"All migrations completed successfully"`

### Getting Help

- **Documentation**: Check the [User Guide](../user-guide/overview.md)
- **API Reference**: Review [API Documentation](../api-reference/overview.md)
- **API Changes**: See [API Breaking Changes](api-changes.md) for external endpoint details
- **Community**: Ask questions on [GitHub Discussions](https://github.com/wsj-br/duplistatus/discussions)
- **Issues**: Report problems on [GitHub Issues](https://github.com/wsj-br/duplistatus/issues)

## Post-Migration Checklist

After completing migration, verify the following:

- [ ] Verify all servers appear in dashboard
- [ ] Check backup history is complete
- [ ] Test notification functionality
- [ ] Update external integrations (if applicable)
- [ ] Verify API endpoints work (test external integrations)
- [ ] Check performance is acceptable
- [ ] Update documentation (custom templates, scripts)
- [ ] Test backup collection
- [ ] Verify overdue monitoring works
- [ ] Check database size and performance
- [ ] Review and update notification templates (0.8.x+)
- [ ] Verify master key file exists and is secured (0.8.x+)
- [ ] Log in with default admin credentials (0.9.x+)
- [ ] Change default admin password (0.9.x+)
- [ ] Create user accounts for other users (0.9.x+)
- [ ] Update external API integrations with authentication (0.9.x+)
- [ ] Configure audit log retention (0.9.x+)
- [ ] Review audit logs to verify system operation (0.9.x+)

## Rollback Procedure

If you need to rollback to a previous version:

1. **Stop Container**: Stop the current duplistatus container
2. **Restore Database**: Replace current database with backup file
   - Default location: `/var/lib/docker/volumes/duplistatus_data/_data/`
   - To find exact path: `docker volume inspect duplistatus_data`
3. **Install Previous Version**: Use the previous container image version
4. **Start Container**: Start with previous version
5. **Report Issue**: Open GitHub issue with details and logs

> [!WARNING]
> Rolling back may cause data loss if the newer version's schema is incompatible with the older version. Always ensure you have a recent backup before attempting rollback.

## Support

For additional help with migration:

- **Documentation**: [User Guide](../user-guide/overview.md)
- **API Reference**: [API Documentation](../api-reference/overview.md)
- **API Changes**: [API Breaking Changes](api-changes.md)
- **Release Notes**: Check version-specific release notes for detailed feature information
- **Community**: [GitHub Discussions](https://github.com/wsj-br/duplistatus/discussions)
- **Issues**: [GitHub Issues](https://github.com/wsj-br/duplistatus/issues)
