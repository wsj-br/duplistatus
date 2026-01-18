# String Extraction Document for Hybrid Per-Component i18n

This document maps all hard-coded strings found in components to their appropriate content files (common vs component-specific).

## Extraction Status
- **Date**: Current
- **Method**: Hybrid per-component approach
- **Total Components Scanned**: In progress
- **Total Strings Found**: TBD

---

## Dashboard Components

### Component: `dashboard-table.tsx`
**Content File**: `src/components/dashboard/dashboard-table.content.ts`

**Strings Found** (to add to component content):
- ✅ "Server Name" → `servers.serverName` (already in content file)
- ✅ "Backup Name" → `backups.backupName` (already in content file)
- ❌ "Overdue / Next run" → **MISSING** - Add to `dashboard-table.content.ts`
- ❌ "Available Versions" → **MISSING** - Add to `dashboard-table.content.ts`
- ❌ "Backup Count" → **MISSING** - Add to `dashboard-table.content.ts`
- ❌ "Last Backup Date" → **MISSING** - Add to `dashboard-table.content.ts`
- ❌ "Last Backup Status" → **MISSING** - Add to `dashboard-table.content.ts`
- ❌ "Duration" → `backups.duration` (already in content file)
- ❌ "Warnings" → `backups.warnings` (already in content file)
- ❌ "Errors" → `backups.errors` (already in content file)
- ❌ "Settings/Actions" → **MISSING** - Add to `dashboard-table.content.ts`
- ❌ "No servers found" → `servers.noServersFound` (already in content file)
- ❌ "Collect data for your first server by clicking on" → **MISSING** - Add to `dashboard-table.content.ts`
- ❌ "(Collect backups logs)" → **MISSING** - Add to `dashboard-table.content.ts`

**Common Strings** (use `common.content.ts`):
- None identified (all are component-specific)

**Action Required**: Update `dashboard-table.content.ts` with missing strings.

---

### Component: `overview-cards.tsx`
**Content File**: `src/components/dashboard/overview-cards.content.ts`

**Strings Found**:
- ✅ All overview metrics already in `overview-cards.content.ts`

**Common Strings** (use `common.content.ts`):
- None identified

**Action Required**: Verify all strings extracted.

---

### Component: `dashboard-summary-cards.tsx`
**Content File**: `src/components/dashboard/dashboard-summary-cards.content.ts`

**Strings Found**:
- ✅ "Total Servers" → `totalServers` (already in content file)
- ✅ "Total Backup Jobs" → `totalBackupJobs` (already in content file)
- ✅ "Total Backup Runs" → `totalBackupRuns` (already in content file)
- ✅ "Total Backup Size" → `totalBackupSize` (already in content file)
- ✅ "Total Storage Used" → `totalStorageUsed` (already in content file)
- ✅ "Total Uploaded Size" → `totalUploadedSize` (already in content file)
- ✅ "Overdue Backups" → `overdueBackups` (already in content file)

**Common Strings** (use `common.content.ts`):
- None identified

**Action Required**: None - all strings already extracted.

---

### Component: `server-cards.tsx`
**Content File**: `src/components/dashboard/server-cards.content.ts`

**Strings Found**:
- ✅ Sort options already in `server-cards.content.ts`

**Common Strings** (use `common.content.ts`):
- None identified

**Action Required**: Verify all strings extracted.

---

### Component: `overview-charts-panel.tsx`
**Content File**: `src/components/dashboard/overview-charts-panel.content.ts`

**Strings Found**:
- ✅ All chart-related strings already in `overview-charts-panel.content.ts`

**Common Strings** (use `common.content.ts`):
- None identified

**Action Required**: Verify all strings extracted.

---

## Settings Components

### Component: `server-settings-form.tsx`
**Content File**: `src/components/settings/server-settings-form.content.ts`

**Status**: Basic structure created, needs full extraction from centralized `settings.content.ts`

**Action Required**: Extract all server-related strings from `settings.content.ts` → `servers.*` section.

---

### Component: `email-configuration-form.tsx`
**Content File**: `src/components/settings/email-configuration-form.content.ts`

**Status**: Basic structure created, needs full extraction from centralized `settings.content.ts`

**Action Required**: Extract all email/SMTP-related strings from `settings.content.ts` → `notifications.*` section.

---

### Component: `ntfy-form.tsx`
**Content File**: `src/components/settings/ntfy-form.content.ts`

**Status**: Basic structure created, needs full extraction from centralized `settings.content.ts`

**Action Required**: Extract all NTFY-related strings from `settings.content.ts` → `notifications.*` section.

---

### Component: `notification-templates-form.tsx`
**Content File**: `src/components/settings/notification-templates-form.content.ts`

**Status**: Basic structure created, needs full extraction

**Action Required**: Scan component for hard-coded strings and extract.

---

### Component: `overdue-monitoring-form.tsx`
**Content File**: `src/components/settings/overdue-monitoring-form.content.ts`

**Status**: Basic structure created, needs full extraction

**Action Required**: Scan component for hard-coded strings and extract.

---

### Component: `user-management-form.tsx`
**Content File**: `src/components/settings/user-management-form.content.ts`

**Status**: Basic structure created, needs full extraction from centralized `settings.content.ts`

**Action Required**: Extract all user-related strings from `settings.content.ts` → `users.*` section (if exists).

---

### Component: `audit-log-viewer.tsx`
**Content File**: `src/components/settings/audit-log-viewer.content.ts`

**Status**: Basic structure created, needs full extraction

**Action Required**: Scan component for hard-coded strings and extract.

---

### Component: `database-maintenance-form.tsx`
**Content File**: `src/components/settings/database-maintenance-form.content.ts`

**Status**: Basic structure created, needs full extraction

**Action Required**: Scan component for hard-coded strings and extract.

---

## Server Details Components

### Component: `server-backup-table.tsx`
**Content File**: `src/components/server-details/server-backup-table.content.ts`

**Status**: Basic structure created, needs verification

**Action Required**: Scan component for any missing table headers or labels.

---

### Component: `server-detail-summary-items.tsx`
**Content File**: `src/components/server-details/server-detail-summary-items.content.ts`

**Strings Found** (from code search):
- ❌ "Statistics" → **MISSING** - Add to content file
- ❌ "Machine Statistics" → **MISSING** - Add to content file
- ✅ Other summary items already in content file

**Action Required**: Add missing strings to `server-detail-summary-items.content.ts`.

---

### Component: `server-details-content.tsx`
**Content File**: `src/components/server-details/server-details-content.content.ts`

**Strings Found** (from code search):
- ❌ "Details for backup" → **MISSING** - Add to content file
- ❌ "Details for" → **MISSING** - Add to content file
- ❌ "all backups" → **MISSING** - Add to content file

**Action Required**: Add missing strings to `server-details-content.content.ts`.

---

## UI Components

### Component: `backup-tooltip-content.tsx`
**Content File**: `src/components/ui/backup-tooltip-content.content.ts`

**Strings Found** (from code search):
- ✅ "Last Backup Details" → `lastBackupDetails` (already in content file)
- ✅ "Date:", "Status:", "Duration:", etc. → Already in content file
- ❌ "Backup Overdue" → `backupOverdue` (already in content file)
- ❌ "Expected:" → `expected` (already in content file)
- ❌ "Overdue configuration" → `overdueConfiguration` (already in content file)

**Action Required**: Verify all strings extracted.

---

### Component: `available-backups-modal.tsx`
**Content File**: `src/components/ui/available-backups-modal.content.ts`

**Strings Found** (from code search):
- ✅ "Available Backup Versions" → `title` (already in content file)
- ✅ "Click to view available versions" → `clickToView` (already in content file)
- ✅ "Version info not received" → `versionInfoNotReceived` (already in content file)
- ✅ "Version", "Date" → Already in content file

**Action Required**: Verify all strings extracted.

---

## Pages

### Page: `src/app/[locale]/page.tsx` (Dashboard)
**Content File**: `src/app/[locale]/page.content.ts`

**Status**: Created with title, subtitle, and alerts

**Action Required**: Verify all page-level strings extracted.

---

### Page: `src/app/[locale]/login/page.tsx`
**Content File**: `src/app/[locale]/login/page.content.ts`

**Status**: Created with login form strings

**Action Required**: Verify all login strings extracted from centralized `auth.content.ts`.

---

## Common Content File

### File: `src/app/[locale]/content/common.content.ts`

**Status**: ✅ Complete with 50+ shared UI terms

**Content Includes**:
- UI actions (save, cancel, delete, edit, add, search, filter, refresh, close)
- Status messages (success, error, loading, pending, failed, completed)
- Navigation (dashboard, settings, servers, logout)
- Time terms (today, yesterday, last7Days, last30Days)
- Generic status (online, offline, active, inactive)

**Action Required**: None - comprehensive and complete.

---

## Missing Strings Summary

### Dashboard Table Component
- "Overdue / Next run"
- "Available Versions"
- "Backup Count"
- "Last Backup Date"
- "Last Backup Status"
- "Settings/Actions"
- "Collect data for your first server by clicking on"
- "(Collect backups logs)"

### Server Details Components
- "Statistics"
- "Machine Statistics"
- "Details for backup"
- "Details for"

---

## Next Steps

1. **Update Content Files**: Add missing strings identified above
2. **Scan Remaining Components**: Complete extraction for all settings and server-details components
3. **Verify Completeness**: Ensure all hard-coded strings are accounted for
4. **Update Components**: Replace hard-coded strings with `useIntlayer()` calls
5. **Test**: Verify all translations load correctly

---

## Extraction Guidelines

### Decision Tree for Each String

```
Is the string used in 3+ components?
├─ YES → Add to common.content.ts
└─ NO → Is it specific to one component?
    ├─ YES → Add to component .content.ts
    └─ NO (used in 2 components) → 
        ├─ If semantically related → Create shared content file
        └─ If different contexts → Add to each component .content.ts
```

### Common Patterns

**Always Common**:
- "Save", "Cancel", "Delete", "Edit", "Add", "Remove"
- "Search", "Filter", "Refresh", "Clear", "Reset"
- "Success", "Error", "Loading", "Pending"
- "Dashboard", "Settings", "Logout"

**Always Component-Specific**:
- Component titles and headings
- Feature-specific terminology
- Context-specific messages
- Technical terms unique to component

---

**Last Updated**: Current session
**Status**: In progress - content files created, extraction ongoing
