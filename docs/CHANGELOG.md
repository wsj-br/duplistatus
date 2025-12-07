# Changelog

## [Unreleased]

### Changed
- Reduced console logging from AuditLogger: Only failed login attempts are now logged to console with `[AuditLogger]` prefix. All other audit log entries are still written to the database but no longer logged to console.
