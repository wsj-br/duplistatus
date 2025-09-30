# API Breaking Changes

![duplistatus](../img/duplistatus_banner.png)

Detailed documentation of API breaking changes between versions.

## Overview

This document outlines the breaking changes in the duplistatus API that require updates to external integrations, scripts, and applications.

## Version 0.7.x Breaking Changes

### Summary Endpoint Changes

#### `/api/summary` Response Format

**Before (0.6.x)**:
```json
{
  "status": "success",
  "data": {
    "totalMachines": 5,
    "totalBackupJobs": 12,
    "totalBackupRuns": 156,
    "successfulBackups": 150,
    "failedBackups": 6
  }
}
```

**After (0.7.x)**:
```json
{
  "status": "success",
  "data": {
    "totalServers": 5,
    "totalBackupJobs": 12,
    "totalBackupRuns": 156,
    "successfulBackups": 150,
    "failedBackups": 6
  }
}
```

**Change**: `totalMachines` renamed to `totalServers`

### Last Backup Endpoint Changes

#### `/api/lastbackup/:serverId` Response Format

**Before (0.6.x)**:
```json
{
  "status": "success",
  "data": {
    "machine": {
      "id": 1,
      "name": "server-01"
    },
    "lastBackup": {
      "id": 123,
      "name": "daily-backup",
      "status": "success",
      "startTime": "2024-01-15T02:00:00.000Z"
    }
  }
}
```

**After (0.7.x)**:
```json
{
  "status": "success",
  "data": {
    "server": {
      "id": 1,
      "name": "server-01",
      "alias": "Production Server"
    },
    "lastBackup": {
      "id": 123,
      "name": "daily-backup",
      "status": "success",
      "startTime": "2024-01-15T02:00:00.000Z"
    }
  }
}
```

**Change**: `machine` object renamed to `server`, added `alias` field

### Latest Backups Endpoint Changes

#### `/api/lastbackups/:serverId` Response Format

**Before (0.6.x)**:
```json
{
  "status": "success",
  "data": {
    "machine": {
      "id": 1,
      "name": "server-01"
    },
    "backups": [
      {
        "id": 123,
        "name": "daily-backup",
        "status": "success"
      }
    ],
    "backup_types_count": 3
  }
}
```

**After (0.7.x)**:
```json
{
  "status": "success",
  "data": {
    "server": {
      "id": 1,
      "name": "server-01",
      "alias": "Production Server"
    },
    "backups": [
      {
        "id": 123,
        "name": "daily-backup",
        "status": "success"
      }
    ],
    "backupJobsCount": 3
  }
}
```

**Changes**:
- `machine` object renamed to `server`
- `backup_types_count` renamed to `backupJobsCount`
- Added `alias` field to server object

## Impact Assessment

### High Impact Changes
These changes will break existing integrations:

1. **Field Renaming**: `totalMachines` → `totalServers`
2. **Object Renaming**: `machine` → `server`
3. **Field Renaming**: `backup_types_count` → `backupJobsCount`

### Medium Impact Changes
These changes add new fields but don't break existing code:

1. **New Fields**: `alias`, `notes`, `created_at`, `updated_at`
2. **Enhanced Responses**: Additional metadata in responses

### Low Impact Changes
These changes are backward compatible:

1. **New Endpoints**: Additional API endpoints
2. **Enhanced Error Messages**: Better error descriptions

## Migration Guide for External Integrations

### Homepage Integration

#### Before (0.6.x)
```yaml
- duplistatus:
    title: Backup Status
    url: http://localhost:9666
    api: /api/summary
    # Parses totalMachines field
```

#### After (0.7.x)
```yaml
- duplistatus:
    title: Backup Status
    url: http://localhost:9666
    api: /api/summary
    # Now parses totalServers field
```

**Required Changes**:
- Update parsing logic to use `totalServers` instead of `totalMachines`
- Update server object parsing to use `server` instead of `machine`

### Custom Scripts

#### Before (0.6.x)
```javascript
// Parse summary response
const response = await fetch('/api/summary');
const data = await response.json();
const totalMachines = data.data.totalMachines;
```

#### After (0.7.x)
```javascript
// Parse summary response
const response = await fetch('/api/summary');
const data = await response.json();
const totalServers = data.data.totalServers;
```

**Required Changes**:
- Update variable names and field access
- Update server object parsing
- Test with new response format

### Monitoring Tools

#### Before (0.6.x)
```python
# Parse last backup response
response = requests.get('/api/lastbackup/1')
data = response.json()
machine_name = data['data']['machine']['name']
```

#### After (0.7.x)
```python
# Parse last backup response
response = requests.get('/api/lastbackup/1')
data = response.json()
server_name = data['data']['server']['name']
server_alias = data['data']['server'].get('alias', server_name)
```

**Required Changes**:
- Update field access from `machine` to `server`
- Handle new `alias` field
- Update variable names

## Testing Your Integration

### Test Script
Create a test script to verify your integration:

```javascript
// Test API compatibility
async function testAPICompatibility() {
  try {
    // Test summary endpoint
    const summaryResponse = await fetch('/api/summary');
    const summaryData = await summaryResponse.json();
    
    if (summaryData.data.totalServers === undefined) {
      console.error('❌ totalServers field missing');
    } else {
      console.log('✅ totalServers field present');
    }
    
    // Test last backup endpoint
    const lastBackupResponse = await fetch('/api/lastbackup/1');
    const lastBackupData = await lastBackupResponse.json();
    
    if (lastBackupData.data.server === undefined) {
      console.error('❌ server object missing');
    } else {
      console.log('✅ server object present');
    }
    
    console.log('✅ API compatibility test passed');
  } catch (error) {
    console.error('❌ API compatibility test failed:', error);
  }
}
```

### Validation Checklist
- [ ] Summary endpoint returns `totalServers`
- [ ] Last backup endpoint returns `server` object
- [ ] Latest backups endpoint returns `backupJobsCount`
- [ ] All existing functionality works
- [ ] New fields are handled gracefully
- [ ] Error handling still works

## Backward Compatibility

### What's Still Compatible
- **HTTP Methods**: All HTTP methods remain the same
- **URL Structure**: All endpoint URLs remain the same
- **Authentication**: No changes to authentication
- **Error Format**: Error response format remains the same

### What's Not Compatible
- **Field Names**: Some field names have changed
- **Object Names**: Some object names have changed
- **Response Structure**: Some response structures have changed

## Version Detection

### Check API Version
You can check the API version:

```bash
curl http://localhost:9666/api/health
```

Response includes version information:
```json
{
  "status": "success",
  "data": {
    "version": "0.7.27",
    "apiVersion": "1.0"
  }
}
```

### Conditional Parsing
Handle both old and new formats:

```javascript
function parseSummaryResponse(data) {
  // Handle both old and new formats
  const totalServers = data.data.totalServers || data.data.totalMachines;
  
  if (totalServers === undefined) {
    throw new Error('Invalid API response format');
  }
  
  return totalServers;
}
```

## Support and Resources

### Getting Help
If you need help updating your integration:

1. **Check this guide**: Follow the migration steps
2. **Test thoroughly**: Use the provided test scripts
3. **Community support**: Ask in GitHub discussions
4. **Report issues**: Open GitHub issues for bugs

### Resources
- **API Documentation**: [API Reference](../api-reference/overview.md)
- **Migration Guide**: [Version 0.7 Migration](version-0.7.md)
- **Release Notes**: [Version 0.7.27 Release Notes](../release-notes/0.7.27.md)
- **Community**: [GitHub Discussions](https://github.com/wsj-br/duplistatus/discussions)

## Timeline

### Migration Timeline
- **Version 0.7.0**: Initial release with breaking changes
- **Version 0.7.27**: Latest stable release
- **Future versions**: Will maintain API compatibility

### Support Timeline
- **0.6.x**: Deprecated, no longer supported
- **0.7.x**: Current supported version
- **0.8.x**: Future version with new features

## Conclusion

The API changes in version 0.7.x are necessary for improving consistency and adding new features. While they require updates to external integrations, the changes are well-documented and the migration path is clear.

Take the time to update your integrations properly, test thoroughly, and take advantage of the new features and improvements in version 0.7.x.
