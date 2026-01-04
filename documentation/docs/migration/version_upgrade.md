# Migration Guide

This guide explains how to upgrade between versions of duplistatus. Migrations are automatic—the database schema updates itself when you start a new version.

Manual steps are only required if you have customised notification templates (version 0.8.x changed template variables) or external API integrations that need updating (version 0.7.x changed API field names, version 0.9.x requires authentication).

## Overview

duplistatus automatically migrates your database schema when upgrading. The system:

1. Creates a backup of your database before making changes
2. Updates the database schema to the latest version
3. Preserves all existing data (servers, backups, configuration)
4. Verifies the migration completed successfully



## Backing Up Your Database Before Migration

Before upgrading to a new version, it's recommended to create a backup of your database. This ensures you can restore your data if something goes wrong during the migration process.

### If You're Running Version 1.2.1 or Later

Use the built-in database backup function:

1. Navigate to `Settings → Database Maintenance` in the web interface
2. In the **Database Backup** section, select a backup format:
   - **Database File (.db)**: Binary format - fastest backup, preserves all database structure exactly
   - **SQL Dump (.sql)**: Text format - human-readable SQL statements
3. Click `Download Backup`
4. The backup file will be downloaded to your computer with a timestamped filename

For more details, see the [Database Maintenance](../user-guide/settings/database-maintenance.md#database-backup) documentation.

### If You're Running a Version Before 1.2.1

#### Backup

You must manually back up the database before proceeding. The database file is located at `/app/data/backups.db` inside the container.

##### For Linux Users
If you are on Linux, don't worry about spinning up helper containers. You can use the native `cp` command to extract the database directly from the running container to your host.

###### Using Docker or Podman:

```bash
# Replace 'duplistatus' with your actual container name if different
docker cp duplistatus:/app/data/backups.db ./duplistatus-backup-$(date +%Y%m%d).db
```
(If using Podman, simply replace `docker` with `podman` in the command above.)

##### For Windows Users
If you are running Docker Desktop on Windows, you have two simple ways to handle this without using the command line:

###### Option A: Use Docker Desktop (Easiest)
1. Open the Docker Desktop Dashboard.
2. Go to the Containers tab and click on your duplistatus container.
3. Cick on the Files tab.
4. Navigate to `/app/data/`.
5. Right-click `backups.db` and select **Save as...** to download it to your Windows folders.

###### Option B: Use PowerShell
If you prefer the terminal, you can use PowerShell to copy the file to your Desktop:

```powershell
docker cp duplistatus:/app/data/backups.db $HOME\Desktop\duplistatus-backup.db
```

##### If You Use Bind Mounts
If you originally set up your container using a bind mount (e.g., you mapped a local folder like `/opt/duplistatus` to the container), you don't need Docker commands at all. Just copy the file using your file manager:
- Linux: `cp /path/to/your/folder/backups.db ~/backups.db`
- Windows: Simply copy the file in **File Explorer** from the folder you designated during setup.


#### Restoring Your Data
If you need to restore your database from a previous backup, follow the steps below based on your operating system.

>[!IMPORTANT] 
> Stop the container before restoring the database to prevent file corruption.

##### For Linux Users
The easiest way to restore is to "push" the backup file back into the container's internal storage path.

###### Using Docker or Podman:

```bash
# stop the container
docker stop duplistatus

# Replace 'duplistatus-backup.db' with your actual backup filename
docker cp ./duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```

##### For Windows Users
If you are using Docker Desktop, you can perform the restore via the GUI or PowerShell.

###### Option A: Use Docker Desktop (GUI)
1. Ensure the duplistatus container is Running (Docker Desktop requires the container to be active to upload files via the GUI).
2. Go to the Files tab in your container settings.
3. Navigate to `/app/data/`.
4. Right-click the existing backups.db and select Delete.
5. Click the Import button (or right-click in the folder area) and select your backup file from your computer.

Rename the imported file to exactly backups.db if it has a timestamp in the name.

Restart the container.

###### Option B: Use PowerShell

```powershell
# Copy the file from your Desktop back into the container
docker cp $HOME\Desktop\duplistatus-backup.db duplistatus:/app/data/backups.db

# Restart the container
docker start duplistatus
```


##### If You Use Bind Mounts
If you are using a local folder mapped to the container, you don't need any special commands.

1. Stop the container.
2. Manually copy your backup file into your mapped folder (e.g., `/opt/duplistatus` or `C:\duplistatus_data`).
3. Ensure the file is named exactly `backups.db`.
4. Start the container.


>[!NOTE]
> If you restore the database manually, you may encounter permission errors. 
>
> Check the container logs and adjust the permissions if necessary. See the [Troubleshooting](#troubleshooting-your-restore--rollback) section below for more information. 

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

### Podman DNS Configuration

If you're using Podman and experiencing network connectivity issues after upgrading, you may need to configure DNS settings for your container. See the [DNS configuration section](../installation/installation.md#configuring-dns-for-podman-containers) in the installation guide for details.

## Rollback Procedure

If you need to rollback to a previous version:

1. **Stop the container**: `docker stop <container-name>` (or `podman stop <container-name>`)
2. **Find your backup**: 
   - If you created a backup using the web interface (version 1.2.1+), use that downloaded backup file
   - If you created a manual volume backup, extract it first
   - Automatic migration backups are located in the data directory (timestamped `.db` files)
3. **Restore the database**: 
   - **For web interface backups (version 1.2.1+)**: Use the restore function in `Settings → Database Maintenance` (see [Database Maintenance](../user-guide/settings/database-maintenance.md#database-restore))
   - **For manual backups**: Replace `backups.db` in your data directory/volume with the backup file
4. **Use previous image version**: Pull and run the previous container image
5. **Start the container**: Start with the previous version

> [!WARNING]
> Rolling back may cause data loss if the newer schema is incompatible with the older version. Always ensure you have a recent backup before attempting rollback.

### Troubleshooting Your Restore / Rollback

If the application doesn't start or your data isn't appearing after a restore or rollback, check the following common issues:

#### 1. Database File Permissions (Linux/Podman)

If you restored the file as the `root` user, the application inside the container might not have permission to read or write to it.

* **The Symptom:** Logs show "Permission Denied" or "Read-only database."
* **The Fix:** Reset the permissions of the file inside the container to ensure it is accessible.

```bash
# Set ownership (usually UID 1000 or the app user)
docker exec -u 0 duplistatus chown 1000:1000 /app/data/backups.db
# Set read/write permissions
docker exec -u 0 duplistatus chmod 664 /app/data/backups.db
```



#### 2. Incorrect Filename

The application looks specifically for a file named `backups.db`.

* **The Symptom:** The application starts but looks "empty" (like a fresh install).
* **The Fix:** Check the `/app/data/` directory. If your file is named `duplistatus-backup-2024.db` or has a `.sqlite` extension, the app will ignore it. Use the `mv` command or Docker Desktop GUI to rename it exactly to `backups.db`.

#### 3. Container Not Restarted

On some systems, using `docker cp` while the container is running may not immediately "refresh" the application's connection to the database.

* **The Fix:** Always perform a full restart after a restore:
```bash
docker restart duplistatus
```



#### 4. Database Version Mismatch

If you are restoring a backup from a much newer version of duplistatus into an older version of the app, the database schema might be incompatible.

* **The Fix:** Always ensure you are running the same (or a newer) version of the duplistatus image as the one that created the backup. Check your version with:
```bash
docker inspect duplistatus --format '{{.Config.Image}}'
```


## Database Schema Versions

| Application Version        | Schema Version | Key Changes                                        |
|----------------------------|----------------|----------------------------------------------------|
| 0.6.x and earlier          | v1.0           | Initial schema                                     |
| 0.7.x                      | v2.0, v3.0     | Added configurations, renamed machines → servers   |
| 0.8.x                      | v3.1           | Enhanced backup fields, encryption support         |
| 0.9.x, 1.0.x, 1.1.x, 1.2.x | v4.0           | User access control, authentication, audit logging |

## Getting Help

- **Documentation**: [User Guide](../user-guide/overview.md)
- **API Reference**: [API Documentation](../api-reference/overview.md)
- **API Changes**: [API Breaking Changes](api-changes.md)
- **Release Notes**: Check version-specific release notes for detailed changes
- **Community**: [GitHub Discussions](https://github.com/wsj-br/duplistatus/discussions)
- **Issues**: [GitHub Issues](https://github.com/wsj-br/duplistatus/issues)
