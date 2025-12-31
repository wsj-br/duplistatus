# Migration Guide

This guide explains how to upgrade between versions of duplistatus. Migrations are automatic—the database schema updates itself when you start a new version.

Manual steps are only required if you have customised notification templates (version 0.8.x changed template variables) or external API integrations that need updating (version 0.7.x changed API field names, version 0.9.x requires authentication).

## Overview

duplistatus automatically migrates your database schema when upgrading. The system:

1. Creates a backup of your database before making changes
2. Updates the database schema to the latest version
3. Preserves all existing data (servers, backups, configuration)
4. Verifies the migration completed successfully

> [!NOTE]
> Current version: **1.1.0** (Schema v4.0). The migration system supports upgrading from any version 0.6.x or later.

## Automatic Migration Process

When you start a new version, migrations run automatically:

1. **Backup Creation**: A timestamped backup is created in your data directory
2. **Schema Update**: Database tables and fields are updated as needed
3. **Data Migration**: All existing data is preserved and migrated
4. **Verification**: Migration success is logged

### Monitoring Migration

Check Docker logs to monitor migration progress:

```bash
docker logs <container-name>
```

Look for messages like:
- `"Found X pending migrations"`
- `"Running consolidated migration X.0..."`
- `"Migration X.0 completed successfully"`
- `"Database backup created: /path/to/backups-copy-YYYY-MM-DDTHH-MM-SS.db"`
- `"All migrations completed successfully"`

## Version-Specific Migration Notes

### Upgrading to Version 0.9.x or Later (Schema v4.0)

> [!WARNING]
> **Authentication is now required.** All users must log in after upgrading.

#### What Changes Automatically

- Database schema migrates from v3.1 to v4.0
- New tables created: `users`, `sessions`, `audit_log`
- Default admin account created automatically
- All existing sessions invalidated

#### What You Must Do

1. **Log in** with default admin credentials:
   - Username: `admin`
   - Password: `Duplistatus09`
2. **Change the password** when prompted (required on first login)
3. **Create user accounts** for other users (Settings → Users)
4. **Update external API integrations** to include authentication (see [API Breaking Changes](api-changes.md))
5. **Configure audit log retention** if needed (Settings → Audit Log)

#### If You're Locked Out

Use the admin recovery tool:

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

See [Admin Recovery Guide](../user-guide/admin-recovery.md) for details.

### Upgrading to Version 0.8.x

#### What Changes Automatically

- Database schema updated to v3.1
- Master key generated for encryption (stored in `.duplistatus.key`)
- Sessions invalidated (new CSRF-protected sessions created)
- Passwords encrypted using new system

#### What You Must Do

1. **Update notification templates** if you customised them:
   - Replace `{backup_interval_value}` and `{backup_interval_type}` with `{backup_interval}`
   - Default templates are updated automatically

#### Security Notes

- Ensure `.duplistatus.key` file is backed up (has 0400 permissions)
- Sessions expire after 24 hours

### Upgrading to Version 0.7.x

#### What Changes Automatically

- `machines` table renamed to `servers`
- `machine_id` fields renamed to `server_id`
- New fields added: `alias`, `notes`, `created_at`, `updated_at`

#### What You Must Do

1. **Update external API integrations**:
   - Change `totalMachines` → `totalServers` in `/api/summary`
   - Change `machine` → `server` in API response objects
   - Change `backup_types_count` → `backup_jobs_count` in `/api/lastbackups/{serverId}`
   - Update endpoint paths from `/api/machines/...` to `/api/servers/...`
2. **Update notification templates**:
   - Replace `{machine_name}` with `{server_name}`

See [API Breaking Changes](api-changes.md) for detailed API migration steps.

## Post-Migration Checklist

After upgrading, verify:

- [ ] All servers appear correctly in the dashboard
- [ ] Backup history is complete and accessible
- [ ] Notifications work (test NTFY/email)
- [ ] External API integrations work (if applicable)
- [ ] Settings are accessible and correct
- [ ] Overdue monitoring works correctly
- [ ] Logged in successfully (0.9.x+)
- [ ] Changed default admin password (0.9.x+)
- [ ] Created user accounts for other users (0.9.x+)
- [ ] Updated external API integrations with authentication (0.9.x+)

## Troubleshooting

### Migration Fails

1. Check disk space (backup requires space)
2. Verify write permissions on data directory
3. Review container logs for specific errors
4. Restore from backup if needed (see Rollback below)

### Data Missing After Migration

1. Verify backup was created (check data directory)
2. Review container logs for backup creation messages
3. Check database file integrity

### Authentication Issues (0.9.x+)

1. Verify default admin account exists (check logs)
2. Try default credentials: `admin` / `Duplistatus09`
3. Use admin recovery tool if locked out
4. Verify `users` table exists in database

### API Errors

1. Review [API Breaking Changes](api-changes.md) for endpoint updates
2. Update external integrations with new field names
3. Add authentication to API requests (0.9.x+)
4. Test API endpoints after migration

### Master Key Issues (0.8.x+)

1. Ensure `.duplistatus.key` file is accessible
2. Verify file permissions are 0400
3. Check container logs for key generation errors

## Rollback Procedure

If you need to rollback to a previous version:

1. **Stop the container**: `docker stop <container-name>`
2. **Find your backup**: Located in the data directory (timestamped `.db` files)
3. **Restore the database**: Replace `backups.db` with the backup file
4. **Use previous image version**: Pull and run the previous container image
5. **Start the container**: Start with the previous version

> [!WARNING]
> Rolling back may cause data loss if the newer schema is incompatible with the older version. Always ensure you have a recent backup before attempting rollback.

## Database Schema Versions

| Application Version | Schema Version | Key Changes |
|---------------------|----------------|-------------|
| 0.6.x and earlier | v1.0 | Initial schema |
| 0.7.x | v2.0, v3.0 | Added configurations, renamed machines → servers |
| 0.8.x | v3.1 | Enhanced backup fields, encryption support |
| 0.9.x, 1.0.x, 1.1.x | v4.0 | User access control, authentication, audit logging |

## Getting Help

- **Documentation**: [User Guide](../user-guide/overview.md)
- **API Reference**: [API Documentation](../api-reference/overview.md)
- **API Changes**: [API Breaking Changes](api-changes.md)
- **Release Notes**: Check version-specific release notes for detailed changes
- **Community**: [GitHub Discussions](https://github.com/wsj-br/duplistatus/discussions)
- **Issues**: [GitHub Issues](https://github.com/wsj-br/duplistatus/issues)
