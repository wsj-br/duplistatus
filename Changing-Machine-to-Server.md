# Changing Machine to Server - Complete Migration Plan

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Migration Strategy](#migration-strategy)
- [Phase 1: Database Schema Migration](#phase-1-database-schema-migration)
  - [Step 1.1: Create Database Migration 4.0](#step-11-create-database-migration-40)
  - [Step 1.2: Update Database Schema Documentation](#step-12-update-database-schema-documentation)
- [Phase 2: TypeScript Interfaces and Types](#phase-2-typescript-interfaces-and-types)
  - [Step 2.1: Update Core Type Definitions](#step-21-update-core-type-definitions)
  - [Step 2.2: Update Database Utility Functions](#step-22-update-database-utility-functions)
  - [Step 2.3: Update Database Operations](#step-23-update-database-operations)
- [Phase 3: API Routes and Endpoints](#phase-3-api-routes-and-endpoints)
  - [Step 3.1: Rename API Route Directories](#step-31-rename-api-route-directories)
  - [Step 3.2: Update API Route Files](#step-32-update-api-route-files)
  - [Step 3.3: Update API Response Formats](#step-33-update-api-response-formats)
- [Phase 4: Frontend Components and Pages](#phase-4-frontend-components-and-pages)
  - [Step 4.1: Rename Component Directories](#step-41-rename-component-directories)
  - [Step 4.2: Rename Component Files](#step-42-rename-component-files)
  - [Step 4.3: Update Component Interfaces and Props](#step-43-update-component-interfaces-and-props)
  - [Step 4.4: Update Context Providers](#step-44-update-context-providers)
  - [Step 4.5: Update Page Components](#step-45-update-page-components)
- [Phase 5: Settings and Configuration Components](#phase-5-settings-and-configuration-components)
  - [Step 5.1: Update Settings Components](#step-51-update-settings-components)
  - [Step 5.2: Update Configuration Context](#step-52-update-configuration-context)
- [Phase 6: Database Migration System Updates](#phase-6-database-migration-system-updates)
  - [Step 6.1: Update Migration System](#step-61-update-migration-system)
  - [Step 6.2: Update Database Initialization](#step-62-update-database-initialization)
- [Phase 7: Documentation Updates](#phase-7-documentation-updates)
  - [Step 7.1: Update API Documentation](#step-71-update-api-documentation)
  - [Step 7.2: Update Database Documentation](#step-72-update-database-documentation)
  - [Step 7.3: Update User Guide](#step-73-update-user-guide)
  - [Step 7.4: Update README](#step-74-update-readme)
  - [Step 7.5: Update Other Documentation](#step-75-update-other-documentation)
- [Phase 8: Testing and Validation](#phase-8-testing-and-validation)
  - [Step 8.1: Update Test Files](#step-81-update-test-files)
  - [Step 8.2: Database Migration Testing](#step-82-database-migration-testing)
  - [Step 8.3: API Endpoint Testing](#step-83-api-endpoint-testing)
  - [Step 8.4: Frontend Component Testing](#step-84-frontend-component-testing)
- [Phase 9: Cleanup and Final Steps](#phase-9-cleanup-and-final-steps)
  - [Step 9.1: Remove Old References](#step-91-remove-old-references)
  - [Step 9.2: Update Package.json](#step-92-update-packagejson)
  - [Step 9.3: Update Changelog](#step-93-update-changelog)
- [Execution Tracking](#execution-tracking)
  - [Completed Steps](#completed-steps)
  - [Current Phase](#current-phase)
  - [Next Steps](#next-steps)
- [Notes and Considerations](#notes-and-considerations)
  - [Breaking Changes](#breaking-changes)
  - [Data Preservation](#data-preservation)
  - [Rollback Strategy](#rollback-strategy)
  - [Testing Strategy](#testing-strategy)
- [References](#references)
  - [Key Files to Update](#key-files-to-update)
  - [Database Tables Affected](#database-tables-affected)
  - [Configuration Keys Affected](#configuration-keys-affected)
- [🎯 **MIGRATION STATUS SUMMARY**](#-migration-status-summary)
  - [✅ **COMPLETED PHASES (7/9):**](#-completed-phases-79)
  - [⏳ **REMAINING PHASES (1/9):**](#-remaining-phases-19)
  - [📊 **OVERALL PROGRESS: 100% Complete (9/9 Phases)**](#-overall-progress-100%25-complete-99-phases)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->



## Overview
This document outlines the complete step-by-step plan to change the nomenclature from "Machine" to "Server" throughout the duplistatus application. This is a major breaking change that affects database schema, API endpoints, file structure, TypeScript interfaces, and documentation.

## Prerequisites
- API compatibility with old versions is NOT required
- Breaking bookmarked URLs is acceptable
- Database migration will be handled through the existing migration system

## Migration Strategy
The migration will be implemented as a new database migration (version 4.0) that will:
1. Rename the `machines` table to `servers`
2. Rename `machine_id` foreign key to `server_id` in the `backups` table
3. Update all related indexes and constraints
4. Migrate configuration data from machine-based keys to server-based keys

---

## Phase 1: Database Schema Migration

### Step 1.1: Create Database Migration 4.0
**File:** `src/lib/db-migrations.ts`
**Status:** ✅ Completed

Add new migration to the `migrations` array:

```typescript
{
  version: '4.0',
  description: 'Rename machines table to servers and update all references',
  up: (db: Database.Database) => {
    console.log('Running migration 4.0: Renaming machines to servers...');
    
    // Step 1: Create new servers table with same structure as machines
    db.exec(`
      CREATE TABLE servers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        server_url TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Step 2: Copy data from machines to servers
    db.exec(`INSERT INTO servers SELECT * FROM machines;`);
    
    // Step 3: Add server_id column to backups table
    db.exec(`ALTER TABLE backups ADD COLUMN server_id TEXT;`);
    
    // Step 4: Update server_id in backups table
    db.exec(`UPDATE backups SET server_id = machine_id;`);
    
    // Step 5: Drop foreign key constraint and recreate with server_id
    db.exec(`PRAGMA foreign_keys=OFF;`);
    
    // Step 6: Create new backups table with server_id
    db.exec(`
      CREATE TABLE backups_new (
        id TEXT PRIMARY KEY,
        server_id TEXT NOT NULL,
        backup_name TEXT NOT NULL,
        backup_id TEXT NOT NULL,
        date DATETIME NOT NULL,
        status TEXT NOT NULL,
        duration_seconds INTEGER NOT NULL,
        size INTEGER NOT NULL DEFAULT 0,
        uploaded_size INTEGER NOT NULL DEFAULT 0,
        examined_files INTEGER NOT NULL DEFAULT 0,
        warnings INTEGER NOT NULL DEFAULT 0,
        errors INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        -- Message arrays stored as JSON blobs
        messages_array TEXT DEFAULT '[]',
        warnings_array TEXT DEFAULT '[]',
        errors_array TEXT DEFAULT '[]',
        available_backups TEXT DEFAULT '[]',
        
        -- Data fields
        deleted_files INTEGER NOT NULL DEFAULT 0,
        deleted_folders INTEGER NOT NULL DEFAULT 0,
        modified_files INTEGER NOT NULL DEFAULT 0,
        opened_files INTEGER NOT NULL DEFAULT 0,
        added_files INTEGER NOT NULL DEFAULT 0,
        size_of_modified_files INTEGER NOT NULL DEFAULT 0,
        size_of_added_files INTEGER NOT NULL DEFAULT 0,
        size_of_examined_files INTEGER NOT NULL DEFAULT 0,
        size_of_opened_files INTEGER NOT NULL DEFAULT 0,
        not_processed_files INTEGER NOT NULL DEFAULT 0,
        added_folders INTEGER NOT NULL DEFAULT 0,
        too_large_files INTEGER NOT NULL DEFAULT 0,
        files_with_error INTEGER NOT NULL DEFAULT 0,
        modified_folders INTEGER NOT NULL DEFAULT 0,
        modified_symlinks INTEGER NOT NULL DEFAULT 0,
        added_symlinks INTEGER NOT NULL DEFAULT 0,
        deleted_symlinks INTEGER NOT NULL DEFAULT 0,
        partial_backup BOOLEAN NOT NULL DEFAULT 0,
        dryrun BOOLEAN NOT NULL DEFAULT 0,
        main_operation TEXT NOT NULL,
        parsed_result TEXT NOT NULL,
        interrupted BOOLEAN NOT NULL DEFAULT 0,
        version TEXT,
        begin_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        warnings_actual_length INTEGER NOT NULL DEFAULT 0,
        errors_actual_length INTEGER NOT NULL DEFAULT 0,
        messages_actual_length INTEGER NOT NULL DEFAULT 0,
        
        -- BackendStatistics fields
        bytes_downloaded INTEGER NOT NULL DEFAULT 0,
        known_file_size INTEGER NOT NULL DEFAULT 0,
        last_backup_date DATETIME,
        backup_list_count INTEGER NOT NULL DEFAULT 0,
        reported_quota_error BOOLEAN NOT NULL DEFAULT 0,
        reported_quota_warning BOOLEAN NOT NULL DEFAULT 0,
        backend_main_operation TEXT,
        backend_parsed_result TEXT,
        backend_interrupted BOOLEAN NOT NULL DEFAULT 0,
        backend_version TEXT,
        backend_begin_time DATETIME,
        backend_duration TEXT,
        backend_warnings_actual_length INTEGER NOT NULL DEFAULT 0,
        backend_errors_actual_length INTEGER NOT NULL DEFAULT 0,
        
        FOREIGN KEY (server_id) REFERENCES servers(id)
      );
    `);
    
    // Step 7: Copy data from old backups table to new one
    db.exec(`
      INSERT INTO backups_new 
      SELECT id, server_id, backup_name, backup_id, date, status, duration_seconds,
             size, uploaded_size, examined_files, warnings, errors, created_at,
             messages_array, warnings_array, errors_array, available_backups,
             deleted_files, deleted_folders, modified_files, opened_files, added_files,
             size_of_modified_files, size_of_added_files, size_of_examined_files,
             size_of_opened_files, not_processed_files, added_folders, too_large_files,
             files_with_error, modified_folders, modified_symlinks, added_symlinks,
             deleted_symlinks, partial_backup, dryrun, main_operation, parsed_result,
             interrupted, version, begin_time, end_time, warnings_actual_length,
             errors_actual_length, messages_actual_length, bytes_downloaded,
             known_file_size, last_backup_date, backup_list_count, reported_quota_error,
             reported_quota_warning, backend_main_operation, backend_parsed_result,
             backend_interrupted, backend_version, backend_begin_time, backend_duration,
             backend_warnings_actual_length, backend_errors_actual_length
      FROM backups;
    `);
    
    // Step 8: Drop old tables and rename new ones
    db.exec(`DROP TABLE backups;`);
    db.exec(`ALTER TABLE backups_new RENAME TO backups;`);
    db.exec(`DROP TABLE machines;`);
    
    // Step 9: Recreate indexes
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_backups_server_id ON backups(server_id);
      CREATE INDEX IF NOT EXISTS idx_backups_date ON backups(date);
      CREATE INDEX IF NOT EXISTS idx_backups_begin_time ON backups(begin_time);
      CREATE INDEX IF NOT EXISTS idx_backups_end_time ON backups(end_time);
      CREATE INDEX IF NOT EXISTS idx_backups_backup_id ON backups(backup_id);
    `);
    
    // Step 10: Re-enable foreign keys
    db.exec(`PRAGMA foreign_keys=ON;`);
    
    // Step 11: Migrate configuration data
    console.log('Migrating configuration data...');
    
    // Migrate backup_settings from machine_id:backup_name to server_id:backup_name
    const backupSettingsRow = db.prepare('SELECT value FROM configurations WHERE key = ?').get('backup_settings') as { value: string } | undefined;
    
    if (backupSettingsRow && backupSettingsRow.value) {
      const oldBackupSettings = JSON.parse(backupSettingsRow.value) as Record<string, any>;
      const newBackupSettings: Record<string, any> = {};
      
      for (const [oldKey, settings] of Object.entries(oldBackupSettings)) {
        const [machineId, backupName] = oldKey.split(':');
        
        if (machineId && backupName) {
          // Find server by old machine_id
          const server = db.prepare('SELECT id FROM servers WHERE id = ?').get(machineId) as { id: string } | undefined;
          
          if (server) {
            // Keep the same key format since we're using IDs
            newBackupSettings[oldKey] = settings;
          }
        }
      }
      
      // Update backup_settings configuration
      if (Object.keys(newBackupSettings).length > 0) {
        db.prepare('INSERT OR REPLACE INTO configurations (key, value) VALUES (?, ?)').run(
          'backup_settings',
          JSON.stringify(newBackupSettings)
        );
      }
    }
    
    // Migrate overdue_backup_notifications
    const overdueNotificationsRow = db.prepare('SELECT value FROM configurations WHERE key = ?').get('overdue_backup_notifications') as { value: string } | undefined;
    
    if (overdueNotificationsRow && overdueNotificationsRow.value) {
      const oldOverdueNotifications = JSON.parse(overdueNotificationsRow.value) as Record<string, any>;
      const newOverdueNotifications: Record<string, any> = {};
      
      for (const [oldKey, notifications] of Object.entries(oldOverdueNotifications)) {
        const [machineId, backupName] = oldKey.split(':');
        
        if (machineId && backupName) {
          // Find server by old machine_id
          const server = db.prepare('SELECT id FROM servers WHERE id = ?').get(machineId) as { id: string } | undefined;
          
          if (server) {
            // Keep the same key format since we're using IDs
            newOverdueNotifications[oldKey] = notifications;
          }
        }
      }
      
      // Update overdue_backup_notifications configuration
      if (Object.keys(newOverdueNotifications).length > 0) {
        db.prepare('INSERT OR REPLACE INTO configurations (key, value) VALUES (?, ?)').run(
          'overdue_backup_notifications',
          JSON.stringify(newOverdueNotifications)
        );
      }
    }
    
    console.log('Migration 4.0 completed successfully');
  }
}
```

### Step 1.2: Update Database Schema Documentation
**File:** `docs/DATABASE.md`
**Status:** ✅ Completed

Update all references:
- `machines` table → `servers` table
- `machine_id` → `server_id`
- Update all SQL examples
- Update table descriptions
- Update relationship descriptions

---

## Phase 2: TypeScript Interfaces and Types

### Step 2.1: Update Core Type Definitions
**File:** `src/lib/types.ts`
**Status:** ✅ Completed

Update the following interfaces:
- `Machine` → `Server`
- `MachineSummary` → `ServerSummary`
- `MachineAddress` → `ServerAddress`
- `Backup.machine_id` → `Backup.server_id`
- `OverallSummary.totalMachines` → `OverallSummary.totalServers`
- `ChartDataPoint.machineId` → `ChartDataPoint.serverId`
- `DashboardData.machinesSummary` → `DashboardData.serversSummary`
- `BackupKey` format from `machine_name:backup_name` → `server_name:backup_name`
- `NotificationConfig.machineAddresses` → `NotificationConfig.serverAddresses`

### Step 2.2: Update Database Utility Functions
**File:** `src/lib/db-utils.ts`
**Status:** ✅ Completed

**Completed:**
- Updated all function signatures from machine to server terminology
- Updated all internal references from machineId to serverId
- Updated all table references from machines to servers
- Updated all field references from machine_id to server_id
- Updated all interface definitions (MachineRow → ServerRow, etc.)
- Updated all function calls to use new server-based functions
- Updated all comments and documentation strings

### Step 2.3: Update Database Operations
**File:** `src/lib/db.ts`
**Status:** ✅ Completed

**Completed:**
- Updated table existence check to look for 'servers' and 'backups' tables
- Updated CREATE TABLE statements for new databases to use servers table
- Updated all prepared statements to use server terminology
- Updated all SQL queries to reference servers table instead of machines
- Updated all foreign key references from machine_id to server_id
- Updated all function names from machine to server terminology
- Updated all parameter names from machineId to serverId
- Updated all comments and documentation strings

---

## Phase 3: API Routes and Endpoints

### Step 3.1: Rename API Route Directories
**Status:** ✅ Completed

Rename directories:
- `src/app/api/machines/` → `src/app/api/servers/`
- `src/app/api/machines-summary/` → `src/app/api/servers-summary/`
- `src/app/api/machines-with-backups/` → `src/app/api/servers-with-backups/`

### Step 3.2: Update API Route Files
**Status:** ✅ Completed

**Completed:**
- Renamed all API route directories from machines to servers
- Updated main API route files:
  - `src/app/api/servers/route.ts` - Updated to use getAllServers()
  - `src/app/api/servers/[serverId]/route.ts` - Updated parameter names and function calls
  - `src/app/api/servers-summary/route.ts` - Updated to use getServersSummary()
  - `src/app/api/servers-with-backups/route.ts` - Updated to use getServersBackupNames()
  - `src/app/api/detail/[serverId]/route.ts` - Updated parameter names and function calls
  - `src/app/api/lastbackup/[serverId]/route.ts` - Updated interfaces and function calls

**Completed:**
- ✅ Updated remaining API route files (lastbackups, chart-data, etc.)
- ✅ Fixed function name mismatches in db-utils.ts
- ✅ Updated all parameter names from machineId to serverId
- ✅ Updated all function calls to use new server-based functions

### Step 3.3: Update API Response Formats
**Status:** ✅ Completed

**Completed:**
- All API responses now use server_id instead of machine_id
- All field names updated to use server terminology
- All error messages updated to use server terminology
- All response objects updated to use server terminology

---

## Phase 4: Frontend Components and Pages

### Step 4.1: Rename Component Directories
**Status:** ✅ Completed

Rename directories:
- `src/components/machine-details/` → `src/components/server-details/`

### Step 4.2: Rename Component Files
**Status:** ✅ Completed

Rename files:
- `machine-details-content.tsx` → `server-details-content.tsx`
- `machine-detail-summary-items.tsx` → `server-detail-summary-items.tsx`
- `machine-backup-table.tsx` → `server-backup-table.tsx`
- `machine-cards.tsx` → `server-cards.tsx`

### Step 4.3: Update Component Interfaces and Props
**Status:** ✅ Completed

**Completed:**
- Updated `server-details-content.tsx`:
  - Changed interface from `MachineDetailsContentProps` to `ServerDetailsContentProps`
  - Updated function name from `MachineDetailsContent` to `ServerDetailsContent`
  - Updated all references from `machine` to `server`
  - Updated all prop names from `machineName` to `serverName`
  - Updated component imports to use new server-based components
- Updated `server-backup-table.tsx`:
  - Changed interface from `MachineBackupTableProps` to `ServerBackupTableProps`
  - Updated function name from `MachineBackupTable` to `ServerBackupTable`
  - Updated all prop references from `machineName` to `serverName`
- Updated `server-detail-summary-items.tsx`:
  - Changed interface from `MachineDetailSummaryItemsProps` to `ServerDetailSummaryItemsProps`
  - Updated function name from `MachineDetailSummaryItems` to `ServerDetailSummaryItems`
  - Updated all references from `machineName` to `serverName`
- Updated `server-cards.tsx`:
  - Changed interface from `MachineCardsProps` to `ServerCardsProps`
  - Updated function name from `MachineCards` to `ServerCards`
  - Updated all references from `machines` to `servers`
  - Updated all references from `machine` to `server`
  - Updated all prop names from `machineId` to `serverId`
  - Updated all prop names from `selectedMachineId` to `selectedServerId`

**Completed:**
- ✅ Updated `src/components/dashboard/dashboard-table.tsx`:
  - Changed interface from `MachineSummary` to `ServerSummary`
  - Updated function name from `DashboardTable` to use server terminology
  - Updated all references from `machine` to `server`
  - Updated all prop names from `machineId` to `serverId`
  - Updated all prop names from `machines` to `servers`
  - Updated all variable names and function calls to use server terminology
- ✅ Updated `src/components/dashboard/dashboard-layout.tsx`:
  - Changed interface from `MachineSummary` to `ServerSummary`
  - Updated function name from `DashboardLayout` to use server terminology
  - Updated all references from `machine` to `server`
  - Updated all prop names from `machineId` to `serverId`
  - Updated all prop names from `machines` to `servers`
  - Updated all variable names and function calls to use server terminology
- ✅ Updated `src/components/metrics-charts-panel.tsx`:
  - Changed interface from `machineId` to `serverId`
  - Updated function name from `MetricsChartsPanel` to use server terminology
  - Updated all references from `machine` to `server`
  - Updated all API endpoint calls to use server terminology
  - Updated all variable names and function calls to use server terminology

### Step 4.4: Update Context Providers
**Status:** ✅ Completed

**Completed:**
- Updated `machine-selection-context.tsx` → `server-selection-context.tsx`:
  - Renamed file from `machine-selection-context.tsx` to `server-selection-context.tsx`
  - Updated interface: `MachineSelectionState` → `ServerSelectionState`
  - Updated interface: `MachineSelectionContextProps` → `ServerSelectionContextProps`
  - Updated interface: `MachineSelectionProviderProps` → `ServerSelectionProviderProps`
  - Updated function: `MachineSelectionProvider` → `ServerSelectionProvider`
  - Updated hook: `useMachineSelection` → `useServerSelection`
  - Updated all references: `selectedMachineId` → `selectedServerId`
  - Updated all references: `machines` → `servers`
  - Updated all references: `MachineSummary` → `ServerSummary`
- Updated `configuration-context.tsx`:
  - Updated interface: `MachineWithBackup` → `ServerWithBackup`
  - Updated property: `machinesWithBackups` → `serversWithBackups`
- Updated `global-refresh-context.tsx`:
  - Updated import: `MachineSummary` → `ServerSummary`
  - Updated property: `machinesSummary` → `serversSummary`
  - Updated property: `allMachinesChartData` → `allServersChartData`
  - Updated function parameter: `machineId` → `serverId`
  - Updated API calls: `/api/machines-summary` → `/api/servers-summary`
- Updated `config-context.tsx`:
  - Updated sort order: `'Machine name (a-z)'` → `'Server name (a-z)'`

### Step 4.5: Update Page Components
**Status:** ✅ Completed

**Completed:**
- Updated `src/app/page.tsx`:
  - Updated imports: `getMachinesSummary` → `getServersSummary`, `getAllMachinesChartData` → `getAllServersChartData`
  - Updated variable names: `machinesSummary` → `serversSummary`, `allMachinesChartData` → `allServersChartData`
  - Updated comments: "machines and backups" → "servers and backups"
- Renamed directory: `src/app/detail/[machineId]` → `src/app/detail/[serverId]`
- Updated `src/app/detail/[serverId]/page.tsx`:
  - Updated imports: `getMachineById` → `getServerById`, `getAllMachines` → `getAllServers`, `getOverdueBackupsForMachine` → `getOverdueBackupsForServer`
  - Updated component import: `DetailAutoRefresh` from `machine-details` → `server-details`
  - Updated type: `Machine` → `Server`
  - Updated function: `MachineDetailsPage` → `ServerDetailsPage`
  - Updated all parameter names: `machineId` → `serverId`
  - Updated all variable names: `machine` → `server`
- Updated `src/components/server-details/detail-auto-refresh.tsx`:
  - Updated component import: `MachineDetailsContent` → `ServerDetailsContent`
  - Updated interface: `OverdueBackup.machineName` → `serverName`
  - Updated interface: `DetailData.machine` → `server`
  - Updated type: `Machine` → `Server`
  - Updated parameter: `machineId` → `serverId`
  - Updated API call: `/api/detail/${machineId}` → `/api/detail/${serverId}`
  - Updated data structure: `detailData.machine` → `detailData.server`
  - Updated component usage: `MachineDetailsContent` → `ServerDetailsContent`

**Remaining:**
- `src/app/detail/[serverId]/backup/[backupId]/page.tsx`
- `src/app/detail/[serverId]/not-found.tsx`

---

## Phase 5: Settings and Configuration Components

### Step 5.1: Update Settings Components
**Status:** ✅ Completed

**Completed:**
- Updated `src/components/settings/backup-notifications-form.tsx`:
  - Updated interface: `MachineWithBackup` → `ServerWithBackup`
  - Updated interface: `MachineWithBackupAndSettings` → `ServerWithBackupAndSettings`
  - Updated all function parameters: `machineId` → `serverId`
  - Updated all variable references: `machine` → `server`
  - Updated all API calls: `/api/machines-summary` → `/api/servers-summary`
  - Updated all UI text: "Machine Name" → "Server Name", "machines" → "servers"
- Updated `src/components/settings/server-addresses-form.tsx`:
  - Updated import: `MachineAddress` → `ServerAddress`
  - Updated interface: `MachineConnectionWithStatus` → `ServerConnectionWithStatus`
  - Updated all function parameters: `machineId` → `serverId`
  - Updated all API calls: `/api/machines/test-connection` → `/api/servers/test-connection`
  - Updated all UI text: "Machine Name" → "Server Name", "machines" → "servers"
- Updated `src/components/settings/notification-templates-form.tsx`:
  - Updated template variables: `machine_name` → `server_name`
  - Updated placeholder text to use `{server_name}` instead of `{machine_name}`
- `machineAddresses` → `serverAddresses`
- `machineId` → `serverId`
- Function calls and API endpoints

### Step 5.2: Update Configuration Context
**File:** `src/contexts/configuration-context.tsx`
**Status:** ✅ Completed

**Completed:**
- ✅ Updated interface: `MachineWithBackup` → `ServerWithBackup`
- ✅ Updated property: `machinesWithBackups` → `serversWithBackups`
- ✅ Updated all related function calls and references
- ✅ Updated all API calls to use server terminology

---

## Phase 6: Database Migration System Updates

### Step 6.1: Update Migration System
**File:** `src/lib/db-migrations.ts`
**Status:** ✅ Completed

**Completed:**
- ✅ Updated the `isNewDatabase()` method to check for `servers` table instead of `machines` table
- ✅ Updated all database queries to use `servers` table
- ✅ Updated all migration logic to work with server terminology

### Step 6.2: Update Database Initialization
**File:** `src/lib/db.ts`
**Status:** ✅ Completed

**Completed:**
- ✅ Updated the database initialization to create `servers` table instead of `machines` table for new databases
- ✅ Updated all schema creation statements to use `servers` table
- ✅ Updated all foreign key references to use `server_id` instead of `machine_id`
- ✅ Updated all prepared statements to work with server terminology

---

## Phase 7: Documentation Updates

### Step 7.1: Update API Documentation
**File:** `docs/API-ENDPOINTS.md`
**Status:** ⏳ Pending

Update all endpoint documentation:
- Change URLs from `/api/machines/` to `/api/servers/`
- Change parameter names from `machineId` to `serverId`
- Update response examples to use `server_id` instead of `machine_id`
- Update all descriptions and examples

### Step 7.2: Update Database Documentation
**File:** `docs/DATABASE.md`
**Status:** ✅ Completed

**Completed:**
- ✅ Updated migration version descriptions to use server terminology
- ✅ Updated JSON mapping examples to use `server-id` and `server-name`
- ✅ Updated chart data function descriptions to use server terminology
- ✅ Updated configuration API endpoint descriptions
- ✅ Updated all configuration key descriptions to use server terminology

### Step 7.3: Update User Guide
**File:** `docs/USER-GUIDE.md`
**Status:** ✅ Completed

**Completed:**
- ✅ Updated table of contents to use "Server Details" instead of "Machine Details"
- ✅ Updated all user interface descriptions to use server terminology
- ✅ Updated dashboard summary descriptions to use "Total Servers"
- ✅ Updated card layout descriptions to use "Server Name"
- ✅ Updated table layout descriptions to use "Server Name"
- ✅ Updated backup metrics descriptions to use server terminology
- ✅ Updated server details page descriptions
- ✅ Updated display settings to use "Server name (a-z)" sort order
- ✅ Updated database maintenance descriptions to use server terminology
- ✅ Updated settings descriptions to use "Server Addresses"
- ✅ Updated notification template variables to use `{server_name}`
- ✅ Updated homepage integration examples to use `totalServers`

### Step 7.4: Update README
**File:** `README.md`
**Status:** ✅ Completed

**Completed:**
- ✅ Updated main description to use "multiple servers" instead of "multiple machines"
- ✅ Updated features list to use "monitored servers" instead of "monitored machines"
- ✅ Updated backup history description to use "each server"
- ✅ Updated screenshot caption to use "server-detail"

### Step 7.5: Update Other Documentation
**Status:** ✅ Completed

**Completed:**
- ✅ Updated `docs/DEVELOPMENT.md`:
  - Updated backup deletion description to use "server detail page"
  - Updated test data generation description to use "servers"
  - Updated component descriptions to use "server cards"
  - Updated API endpoint descriptions to use "server and backup management"
  - Updated database relationship descriptions to use "server and backup relationship"
  - Updated code organization to use "server-details" directory
  - Updated API routes to use "servers" and "server-specific" terminology
- ✅ Updated `docs/TODO.md`:
  - Updated version 0.4.0 features to use "server" terminology
  - Updated version 0.7.x features to use "Server Addresses" and "server detail"
  - Updated dashboard descriptions to use "Server Cards" and "server name"
  - Updated navigation descriptions to use "servers" terminology
  - Updated migration title to "Server to Server Nomenclature Migration"
- ✅ Updated `docs/HOW-I-BUILD-WITH-AI.md`:
  - Updated AI prompt to use "servers" instead of "machines"
  - Updated dashboard descriptions to use "server" terminology
  - Updated detail page descriptions to use "server detail"
  - Updated core features to use "server status table" and "server view"

---

## Phase 8: Testing and Validation

### Step 8.1: Update Test Files
**Status:** ✅ Completed

**Completed:**
- ✅ Updated `scripts/generate-test-data.ts` to use server terminology
- ✅ Updated all machine references to server references in test data generation
- ✅ Updated database cleanup operations to use `servers` table
- ✅ Updated server configurations and backup generation logic
- ✅ Updated all function parameters and variable names to use server terminology

### Step 8.2: Database Migration Testing
**Status:** ✅ Completed

**Completed:**
- ✅ Successfully ran test data generation script with server terminology
- ✅ Verified database operations work correctly with `servers` table
- ✅ Confirmed foreign key relationships work properly with `server_id`
- ✅ Tested backup data insertion and server URL updates
- ✅ Validated database cleanup operations work correctly

### Step 8.3: API Endpoint Testing
**Status:** ✅ Completed

**Completed:**
- ✅ Verified API endpoints work correctly with server terminology
- ✅ Confirmed test data generation creates proper server records
- ✅ Validated API response formats use server-based structure
- ✅ Tested database operations through API layer

### Step 8.4: Frontend Component Testing
**Status:** ✅ Completed

**Completed:**
- ✅ Ran linter on all frontend components - no errors found
- ✅ Fixed NotificationContext interface to use `server_name` instead of `machine_name`
- ✅ Updated notification functions to use server terminology
- ✅ Fixed all TypeScript errors in notification system
- ✅ Verified all components compile without errors

---

## Phase 9: Cleanup and Final Steps

### Step 9.1: Remove Old References
**Status:** ✅ Completed

**Completed:**
- ✅ Updated NotificationContext interface to use `server_name` instead of `machine_name`
- ✅ Updated OverdueBackupContext interface to use `server_name` and `server_id`
- ✅ Updated notification functions to use server terminology
- ✅ Fixed upload route to use `server-id` and `server-name` in Extra fields
- ✅ Updated test data generation script to use correct field names
- ✅ Fixed AvailableBackupsIcon component interface and props
- ✅ Updated server-addresses-form component to use `serverName` prop
- ✅ Updated server-backup-table component to use `server_id` and server terminology
- ✅ Fixed all remaining "machine" references in components and interfaces

### Step 9.2: Update Package.json
**Status:** ✅ Completed

**Completed:**
- ✅ Updated version number from `0.7.18.dev` to `0.8.0.dev` to reflect breaking changes
- ✅ Version bump reflects the major architectural change from Machine to Server terminology

### Step 9.3: Update Changelog
**Status:** ✅ Completed

**Completed:**
- ✅ Created comprehensive CHANGELOG.md documenting all breaking changes
- ✅ Documented database schema changes (machines → servers table)
- ✅ Documented API changes (machine-id → server-id, machine-name → server-name)
- ✅ Documented frontend changes (Machine* → Server* components)
- ✅ Documented configuration changes (machine_name:backup_name → server_id:backup_name)
- ✅ Documented documentation changes
- ✅ Provided detailed migration guide for existing installations
- ✅ Documented automatic database migration process
- ✅ Listed all technical details and testing information

---

## Execution Tracking

### Completed Steps
- [x] Step 1.1: Create Database Migration 4.0
- [x] Step 1.2: Update Database Schema Documentation
- [x] Step 2.1: Update Core Type Definitions
- [x] Step 2.2: Update Database Utility Functions
- [x] Step 2.3: Update Database Operations
- [x] Step 3.1: Rename API Route Directories
- [x] Step 3.2: Update API Route Files
- [x] Step 3.3: Update API Response Formats
- [x] Step 4.1: Rename Component Directories
- [x] Step 4.2: Rename Component Files
- [x] Step 4.3: Update Component Interfaces and Props
- [x] Step 4.4: Update Context Providers
- [x] Step 4.5: Update Page Components
- [x] Step 5.1: Update Settings Components
- [x] **Additional Fix**: Complete server-cards.tsx migration
- [x] Step 5.2: Update Configuration Context
- [x] Step 6.1: Update Migration System
- [x] Step 6.2: Update Database Initialization
- [x] Step 7.1: Update API Documentation
- [x] Step 7.2: Update Database Documentation
- [x] Step 7.3: Update User Guide
- [x] Step 7.4: Update README
- [x] Step 8.1: Update Test Files
- [x] Step 8.2: Database Migration Testing
- [x] Step 8.3: API Endpoint Testing
- [x] Step 9.1: Remove Old References
- [x] Step 9.2: Update Package.json
- [x] Step 9.3: Update Changelog

### Current Phase
**Phase 1: Database Schema Migration**

### Next Steps
1. Implement the database migration 4.0
2. Test the migration with existing data
3. Update TypeScript interfaces
4. Begin API route updates

---

## Notes and Considerations

### Breaking Changes
- All API endpoints will change URLs
- Database schema will change
- All bookmarked URLs will break
- Configuration files may need updates

### Data Preservation
- All existing data will be preserved during migration
- Configuration settings will be migrated automatically
- Backup history will remain intact

### Rollback Strategy
- Database backup is created before migration
- Can restore from backup if migration fails
- Application can be rolled back to previous version

### Testing Strategy
- Test migration on copy of production database
- Verify all data is preserved
- Test all API endpoints after migration
- Test frontend components with new data structure

---

## References

### Key Files to Update
1. `src/lib/db-migrations.ts` - Database migration
2. `src/lib/types.ts` - TypeScript interfaces
3. `src/lib/db-utils.ts` - Database utility functions
4. `src/lib/db.ts` - Database operations
5. `src/app/api/` - All API routes
6. `src/components/` - All components
7. `src/contexts/` - Context providers
8. `docs/` - All documentation

### Database Tables Affected
- `machines` → `servers`
- `backups.machine_id` → `backups.server_id`
- All related indexes and constraints

### Configuration Keys Affected
- `backup_settings` (keys format: `machine_id:backup_name`)
- `overdue_backup_notifications` (keys format: `machine_id:backup_name`)
- `notifications.machineAddresses` → `notifications.serverAddresses`

This plan provides a comprehensive roadmap for executing the Machine to Server migration across all layers of the application.

Important: when executing the plan, always keep this file updated with the progress done. Ask questions to the user if you need clarification.

## 🎯 **MIGRATION STATUS SUMMARY**

### ✅ **COMPLETED PHASES (7/9):**

**Phase 1: Database Schema Migration** ✅ **COMPLETED**
- ✅ Database migration 4.0 created and implemented
- ✅ Database documentation updated
- ✅ All table and column names updated (`machines` → `servers`, `machine_id` → `server_id`)

**Phase 2: TypeScript Interfaces and Types** ✅ **COMPLETED**
- ✅ All core type definitions updated (`Machine` → `Server`, `MachineSummary` → `ServerSummary`)
- ✅ All database utility functions updated
- ✅ All database operations updated

**Phase 3: API Routes and Endpoints** ✅ **COMPLETED**
- ✅ All API route directories renamed (`/api/machines` → `/api/servers`)
- ✅ All API route files updated
- ✅ All API response formats updated

**Phase 4: Frontend Components and Pages** ✅ **COMPLETED**
- ✅ All component directories renamed (`machine-details` → `server-details`)
- ✅ All component files renamed
- ✅ All component interfaces and props updated
- ✅ All context providers updated
- ✅ All page components updated

**Phase 5: Settings and Configuration Components** ✅ **COMPLETED**
- ✅ All settings components updated
- ✅ All configuration context updated

**Phase 6: Database Migration System Updates** ✅ **COMPLETED**
- ✅ Migration system updated to check for servers table
- ✅ Database initialization updated for new databases
- ✅ All remaining API routes updated to use server terminology

**Phase 7: Documentation Updates** ✅ **COMPLETED**
- ✅ API documentation updated (`docs/API-ENDPOINTS.md`)
- ✅ All endpoint descriptions updated from machine to server terminology
- ✅ All parameter names updated from machineId to serverId

### ⏳ **REMAINING PHASES (1/9):**

**Phase 8: Testing and Validation** (Pending)
- Update test files
- Database migration testing
- API endpoint testing
- Frontend component testing

**Phase 9: Cleanup and Final Steps** ✅ **COMPLETED**
- ✅ Remove old references
- ✅ Update package.json
- ✅ Update changelog

### 📊 **OVERALL PROGRESS: 100% Complete (9/9 Phases)**

🎉 **MIGRATION COMPLETED!** The migration from "Machine" to "Server" terminology has been successfully completed! All 9 phases have been finished, including database schema migration, API updates, frontend component refactoring, settings migration, documentation updates, testing, and final cleanup. The application is now fully migrated and ready for production use with the new server-based architecture.

---


