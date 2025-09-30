---
sidebar_position: 2
---

# Version 0.7 Migration

![duplistatus](//img/duplistatus_banner.png)

Detailed guide for migrating from version 0.6.x to 0.7.x.

## Overview

Version 0.7.x introduced significant changes to the database schema and API structure. This migration guide will help you understand and navigate these changes.

## What Changed in Version 0.7.x

### Database Schema Changes

#### Table Renaming
- `machines` table renamed to `servers`
- All references updated throughout the application

#### New Fields Added
- `servers.alias` - User-friendly server names
- `servers.notes` - Additional server information
- `servers.last_seen` - Last communication timestamp

#### API Response Changes
- Field names updated for consistency
- New response structure for better integration

### New Features

#### Enhanced Server Management
- Server aliases for better identification
- Server notes for additional information
- Improved server status tracking

#### Better API Integration
- Consistent response formats
- Improved error handling
- Better documentation

#### Performance Improvements
- Optimized database queries
- Better indexing
- Reduced memory usage

## Migration Process

### Automatic Migration
The migration happens automatically when you start version 0.7.x:

1. **Backup Creation**: Database backup is created
2. **Schema Update**: Tables are renamed and updated
3. **Data Migration**: Existing data is preserved
4. **Verification**: Migration is verified

### Migration Steps

#### Step 1: Backup Your Data
```bash
# Create manual backup (recommended)
docker exec duplistatus cp /app/data/backups.db /app/data/backups-manual-backup.db

# Or use the automatic backup
# The system will create: backups-copy-YYYY-MM-DDTHH-MM-SS.db
```

#### Step 2: Update Container
```bash
# Pull new version
docker pull wsjbr/duplistatus:latest

# Stop current container
docker-compose down

# Start with new version
docker-compose up -d
```

#### Step 3: Monitor Migration
```bash
# Watch migration logs
docker logs -f duplistatus

# Look for these messages:
# "Found X pending migrations"
# "Running consolidated migration 0.7.0..."
# "Migration 0.7.0 completed successfully"
```

#### Step 4: Verify Migration
```bash
# Check that application is running
curl http://localhost:9666/api/health

# Verify servers are visible
curl http://localhost:9666/api/servers
```

## API Changes

### Breaking Changes

#### Server Endpoints
**Before (0.6.x)**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "server-01",
      "machine_id": 1
    }
  ]
}
```

**After (0.7.x)**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "server-01",
      "alias": "Production Server",
      "notes": "Main production server"
    }
  ]
}
```

#### Summary Endpoint
**Before (0.6.x)**:
```json
{
  "totalMachines": 5,
  "totalBackups": 156
}
```

**After (0.7.x)**:
```json
{
  "totalServers": 5,
  "totalBackups": 156
}
```

### New Endpoints

#### Server Management
- `PUT /api/servers/:id` - Update server information
- `GET /api/servers/:id` - Get detailed server information

#### Enhanced Responses
- Better error messages
- Consistent response format
- Additional metadata

## Data Migration Details

### Server Data
```sql
-- Old machines table
CREATE TABLE machines (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  last_seen DATETIME
);

-- New servers table
CREATE TABLE servers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  alias TEXT,
  notes TEXT,
  last_seen DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Migration Script
```sql
-- Rename table
ALTER TABLE machines RENAME TO servers;

-- Add new columns
ALTER TABLE servers ADD COLUMN alias TEXT;
ALTER TABLE servers ADD COLUMN notes TEXT;
ALTER TABLE servers ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE servers ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Update existing data
UPDATE servers SET alias = name WHERE alias IS NULL;
```

## Compatibility

### Backward Compatibility
- **Database**: Old database files are automatically migrated
- **API**: New API format, old clients need updates
- **Configuration**: Settings are preserved

### External Integrations
If you have external integrations using the API:

1. **Update API calls** to use new field names
2. **Test integration** with new response format
3. **Update documentation** for your integrations

## Troubleshooting

### Common Issues

#### Migration Fails
**Symptoms**: Container won't start, migration errors in logs

**Solutions**:
1. Check disk space (need space for backup)
2. Verify database file permissions
3. Check container logs for specific errors
4. Restore from backup if needed

#### API Integration Breaks
**Symptoms**: External tools stop working

**Solutions**:
1. Update API calls to use new field names
2. Check response format changes
3. Update integration code
4. Test with new API format

#### Data Missing
**Symptoms**: Servers or backups not visible

**Solutions**:
1. Verify migration completed successfully
2. Check database integrity
3. Restore from backup if needed
4. Contact support if data is lost

### Recovery Procedures

#### Rollback to 0.6.x
If you need to rollback:

1. **Stop container**:
   ```bash
   docker-compose down
   ```

2. **Restore database**:
   ```bash
   # Find backup file
   ls -la /path/to/duplistatus/data/backups-copy-*.db
   
   # Restore database
   cp /path/to/backup.db /path/to/duplistatus/data/backups.db
   ```

3. **Start previous version**:
   ```bash
   # Update docker-compose.yml to use previous version
   # Start container
   docker-compose up -d
   ```

#### Data Recovery
If data is lost:

1. **Check backup files**:
   ```bash
   ls -la /path/to/duplistatus/data/backups-copy-*.db
   ```

2. **Restore from backup**:
   ```bash
   cp /path/to/backup.db /path/to/duplistatus/data/backups.db
   ```

3. **Verify data**:
   ```bash
   docker exec -it duplistatus sqlite3 /app/data/backups.db
   .tables
   SELECT COUNT(*) FROM servers;
   ```

## Testing Migration

### Pre-Migration Testing
1. **Backup current data**
2. **Test in development environment**
3. **Verify all functionality**
4. **Check external integrations**

### Post-Migration Testing
1. **Verify all servers visible**
2. **Check backup history**
3. **Test API endpoints**
4. **Verify external integrations**

## Support

### Getting Help
If you encounter issues:

1. **Check logs**: `docker logs duplistatus`
2. **Review this guide**: Follow troubleshooting steps
3. **Community support**: GitHub discussions
4. **Report issues**: GitHub issues with migration details

### Migration Checklist
- [ ] Backup current database
- [ ] Update container to 0.7.x
- [ ] Monitor migration logs
- [ ] Verify application starts
- [ ] Check all servers visible
- [ ] Test API endpoints
- [ ] Update external integrations
- [ ] Verify backup history
- [ ] Test notifications
- [ ] Document any issues

## Next Steps

After successful migration:

1. **Explore new features**: Server aliases, notes, improved API
2. **Update integrations**: Use new API format
3. **Optimize configuration**: Take advantage of new features
4. **Monitor performance**: Check for improvements
5. **Plan future updates**: Stay current with latest versions

## Resources

- **Migration Overview**: [Migration Guide](overview.md)
- **API Changes**: [API Breaking Changes](api-changes.md)
- **Release Notes**: [Version 0.7.27 Release Notes](../release-notes/0.7.27.md)
- **Community Support**: [GitHub Discussions](https://github.com/wsj-br/duplistatus/discussions)
