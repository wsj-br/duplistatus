<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Changelog](#changelog)
  - [[0.8.0.dev] - 2025-01-09](#080dev---2025-01-09)
    - [⚠️ BREAKING CHANGES](#-breaking-changes)
      - [Database Schema Changes](#database-schema-changes)
      - [API Changes](#api-changes)
      - [Frontend Changes](#frontend-changes)
      - [Configuration Changes](#configuration-changes)
      - [Documentation Changes](#documentation-changes)
    - [Migration Guide](#migration-guide)
      - [For Existing Installations](#for-existing-installations)
      - [For New Installations](#for-new-installations)
    - [Added](#added)
    - [Changed](#changed)
    - [Fixed](#fixed)
    - [Technical Details](#technical-details)
  - [[0.7.18.dev] - Previous Version](#0718dev---previous-version)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.8.0.dev] - 2025-01-09

### ⚠️ BREAKING CHANGES

This release contains significant breaking changes due to the migration from "Machine" to "Server" terminology throughout the application.

#### Database Schema Changes
- **BREAKING**: Renamed `machines` table to `servers`
- **BREAKING**: Renamed `machine_id` column to `server_id` in `backups` table
- **BREAKING**: Updated all foreign key relationships to use `server_id`
- **BREAKING**: Database migration 4.0 automatically handles the transition from existing installations

#### API Changes
- **BREAKING**: Renamed API endpoints from `/api/machines/` to `/api/servers/`
- **BREAKING**: Updated API request/response formats to use `server-id` and `server-name` instead of `machine-id` and `machine-name`
- **BREAKING**: Updated all API route handlers to use server-based terminology

#### Frontend Changes
- **BREAKING**: Renamed all React components from `Machine*` to `Server*`
- **BREAKING**: Updated component props and interfaces to use server terminology
- **BREAKING**: Renamed context providers from `MachineSelectionContext` to `ServerSelectionContext`
- **BREAKING**: Updated all TypeScript interfaces and types

#### Configuration Changes
- **BREAKING**: Updated configuration keys from `machine_name:backup_name` to `server_id:backup_name`
- **BREAKING**: Updated notification templates to use `{server_name}` instead of `{machine_name}`
- **BREAKING**: Updated all configuration contexts and settings components

#### Documentation Changes
- **BREAKING**: Updated all documentation to use server terminology
- **BREAKING**: Updated API documentation, user guides, and development documentation
- **BREAKING**: Updated database schema documentation

### Migration Guide

#### For Existing Installations
1. **Database Migration**: The application will automatically run migration 4.0 on startup, which:
   - Creates a new `servers` table
   - Copies all data from `machines` to `servers`
   - Updates `backup` table to use `server_id`
   - Migrates configuration data to use new key format
   - Drops the old `machines` table

2. **Configuration Migration**: Backup settings and notification configurations will be automatically migrated from the old `machine_name:backup_name` format to the new `server_id:backup_name` format.

3. **API Integration**: If you have external integrations with the API, update your code to:
   - Use `/api/servers/` instead of `/api/machines/`
   - Use `server-id` and `server-name` in request payloads
   - Handle the updated response formats

#### For New Installations
- No migration required - the application will use the new server-based structure from the start

### Added
- Complete migration from "Machine" to "Server" terminology
- Updated test data generation scripts
- Comprehensive testing and validation of all components
- Updated documentation across all files

### Changed
- All user-facing text now uses "Server" instead of "Machine"
- All internal code now uses server-based naming conventions
- Database schema uses server-based table and column names
- API endpoints use server-based terminology

### Fixed
- All TypeScript interfaces updated to use server terminology
- All component props and context providers updated
- All notification templates updated
- All configuration management updated

### Technical Details
- **Database Migration**: Version 4.0 handles the complete transition
- **Backward Compatibility**: None - this is a breaking change release
- **Testing**: All components, API endpoints, and database operations have been tested
- **Documentation**: All documentation has been updated to reflect the new terminology

---

## [0.7.18.dev] - Previous Version

Previous development version before the Machine to Server migration.

[0.8.0.dev]: https://github.com/your-repo/duplistatus/compare/v0.7.18.dev...v0.8.0.dev
