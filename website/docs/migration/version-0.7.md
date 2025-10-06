---
sidebar_position: 2
---

# Version 0.7 Migration Guide

This guide provides detailed information about migrating to version 0.7.27 of duplistatus.

## Overview

Version 0.7.27 is a major release that introduces significant improvements to the database schema, API structure, and user interface. This version includes breaking changes that require updates to external integrations.

## Automatic Migration

The migration from version 0.6.x to 0.7.27 happens automatically when you start the new version:

### Migration Process

1. **Backup Creation**: Automatic database backup is created
2. **Schema Update**: Database schema is updated automatically
3. **Data Migration**: Existing data is preserved and migrated
4. **Verification**: Migration is verified and logged

### What Gets Migrated

- **Database Schema**: Tables are renamed and new fields are added
- **Data Preservation**: All existing backup data is preserved
- **Server Information**: Server data is migrated to new schema
- **Backup History**: All backup logs are preserved

## Manual Steps Required

### 1. Update External Integrations

If you have external tools or scripts using the API, you must update them:

- **Homepage Integration**: Update API field references
- **Custom Scripts**: Update field names in your scripts
- **Monitoring Tools**: Update any monitoring integrations
- **Webhooks**: Update webhook payload handling

### 2. Test Functionality

After migration, verify that all features work correctly:

- **Dashboard**: Check that all servers appear correctly
- **Backup History**: Verify backup history is displayed
- **Notifications**: Test notification functionality
- **API Endpoints**: Test any external API usage

### 3. Update Documentation

Update any custom documentation or notes:

- **Internal Documentation**: Update field references
- **Integration Guides**: Update API examples
- **Troubleshooting Guides**: Update error message references

## Database Changes

### Table Renaming

- **`machines`** → **`servers`**
- **`machine_id`** → **`server_id`** (in related tables)

### New Fields Added

- **`alias`**: Friendly server name
- **`notes`**: Server description/notes
- **`created_at`**: Server creation timestamp
- **`updated_at`**: Last update timestamp

### Schema Improvements

- **Better Indexing**: Improved query performance
- **Data Validation**: Enhanced data integrity
- **Foreign Key Constraints**: Better referential integrity

## API Changes

### Breaking Changes

See the [API Breaking Changes](api-changes.md) guide for detailed information about API changes.

### New Endpoints

- **Server Management**: New endpoints for server configuration
- **Enhanced Queries**: Improved data retrieval endpoints
- **Better Error Handling**: More descriptive error responses

## Troubleshooting

### Common Issues

1. **Migration Fails**: Check disk space and permissions
2. **Data Missing**: Verify database backup was created
3. **API Errors**: Update external integrations
4. **Performance Issues**: Check database indexes

### Recovery Steps

If migration fails:

1. **Stop Container**: Stop the duplistatus container
2. **Restore Backup**: Replace database with backup file
3. **Check Logs**: Review container logs for errors
4. **Report Issue**: Open GitHub issue with logs

### Getting Help

- **Documentation**: Check the [User Guide](../user-guide/overview.md)
- **API Reference**: Review [API Documentation](../api-reference/overview.md)
- **Community**: Ask questions on [GitHub Discussions](https://github.com/wsj-br/duplistatus/discussions)
- **Issues**: Report problems on [GitHub Issues](https://github.com/wsj-br/duplistatus/issues)

## Post-Migration Checklist

- [ ] Verify all servers appear in dashboard
- [ ] Check backup history is complete
- [ ] Test notification functionality
- [ ] Update external integrations
- [ ] Verify API endpoints work
- [ ] Check performance is acceptable
- [ ] Update documentation
- [ ] Test backup collection
- [ ] Verify overdue monitoring works
- [ ] Check database size and performance

## Rollback Procedure

If you need to rollback to a previous version:

1. **Stop Container**: Stop the current duplistatus container
2. **Restore Database**: Replace current database with backup
3. **Install Previous Version**: Use the previous container image
4. **Start Container**: Start with previous version
5. **Report Issue**: Open GitHub issue with details

## Support

For additional help with migration:

- **Documentation**: [User Guide](../user-guide/overview.md)
- **API Reference**: [API Documentation](../api-reference/overview.md)
- **Community**: [GitHub Discussions](https://github.com/wsj-br/duplistatus/discussions)
- **Issues**: [GitHub Issues](https://github.com/wsj-br/duplistatus/issues)
