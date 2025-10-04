![duplistatus](//img/duplistatus_banner.png)

# Release Notes: duplistatus Version 0.8.10

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  

- [✨ New Features](#-new-features)
  - [Server Management Enhancements](#server-management-enhancements)
  - [Enhanced Overdue Monitoring](#enhanced-overdue-monitoring)
  - [NTFY Device Configuration](#ntfy-device-configuration)
  - [Improved Backup Collection](#improved-backup-collection)
  - [Enhanced Notification System](#enhanced-notification-system)
- [🔒 Security Enhancements](#-security-enhancements)
  - [CSRF Protection](#csrf-protection)
  - [Plaintext Password Minimization](#plaintext-password-minimization)
  - [Advanced Cryptography for Sensitive Data](#advanced-cryptography-for-sensitive-data)
- [🎨 User Interface Improvements](#-user-interface-improvements)
- [📚 Documentation Updates](#-documentation-updates)
- [🔧 Technical Improvements](#-technical-improvements)
- [🚀 Migration Notes](#-migration-notes)
  - [From Version 0.7.x](#from-version-07x)
  - [Security Considerations](#security-considerations)
- [🐛 Bug Fixes](#-bug-fixes)
- [📦 Dependencies](#-dependencies)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

We're excited to announce the release of **duplistatus version 0.8.10**. This is a major update that introduces significant security enhancements, improved server management capabilities, and a comprehensive notification system with SMTP email support. This release focuses on strengthening security, enhancing user experience, and providing more flexible backup monitoring options.

---

## ✨ New Features

### Server Management Enhancements

- **Automatic server URL and password persistence** when collecting backups
  - Users can update URL and password using two methods:
     - Re-collecting backups with updated values
     - Modifying settings in `Settings → Server Settings`

### Enhanced Overdue Monitoring

- **New `Overdue Monitoring` configuration tab** with Duplicati server-compatible interval settings
    - Support for custom intervals (e.g., "1D12h")
    - Automatic overdue interval updates from Duplicati configuration during backup log collection
    - **Recommended:** Run collection after changing backup job intervals in Duplicati server to synchronise duplistatus configuration

### NTFY Device Configuration

- **QR code generation** for automatic device configuration to receive notifications from **duplistatus**
   - Right-click on `View NTFY Messages` button in the application toolbar
   - "Configure Device" button in `Settings → NTFY Settings`

### Improved Backup Collection

- **Server selection dropdown** in `Collect Backup Logs` interface for direct server-specific collection
- **Single-server backup collection buttons** added to `Settings → Overdue Monitoring` and `Settings → Server Settings`
- **Bulk collection functionality** for all servers with valid configuration (url and password)
   - Collection buttons in `Settings → Overdue Monitoring` and `Settings → Server Settings`
   - Right-click context menu on `Collect Backup Logs` button in application toolbar

### Enhanced Notification System

- **SMTP Email Notification Support:**
    - SMTP server configuration in `Settings → Email Settings`
    - Per-backup job configuration for NTFY and/or email notifications
    - HTML-formatted templates using existing `Settings → Notification Templates`
- **Per-Backup Job Notification Configuration:**
    - Individual notification preferences in `Settings → Backup Notifications`
    - Visual indicators (greyed icons) when NTFY or email is not properly configured

---

## 🔒 Security Enhancements

### CSRF Protection

- **Session-based authentication** with robust session management
- **CSRF token validation** enforced for all state-changing API requests
- **Sessions expire automatically** after 24 hours; CSRF tokens refresh every 30 minutes
- Ensures protection against Cross-Site Request Forgery while preserving compatibility with external APIs

### Plaintext Password Minimization

- **Passwords can only be set via the user interface**; no API endpoint exposes stored passwords
- **Plaintext password manipulation is minimized** throughout the system

### Advanced Cryptography for Sensitive Data

- **Sensitive data encryption** (e.g., passwords, SMTP credentials) using AES-256-GCM
- **Master key is generated automatically** and stored securely in `.duplistatus.key`
- **PBKDF2 with 100,000 iterations** used for key derivation to strengthen security
- **Authentication tags are verified** and memory is securely cleared after use
- **Master key file permissions** are strictly set to 0400 for maximum protection

---

## 🎨 User Interface Improvements

- **Enhanced application styling** with new colour scheme and iconography for improved usability
- **Modern design system** with improved status indicators
- **Colored icons and progress indicators** for better visual feedback
- **Streamlined API interactions** and improved user experience

---

## 📚 Documentation Updates

- **Comprehensive documentation** using Docusaurus for improved navigation and search
- **Enhanced API documentation** with detailed endpoint descriptions
- **Updated user guides** covering new features and security enhancements
- **Installation guides** with improved setup instructions
- **Development documentation** for contributors

---

## 🔧 Technical Improvements

- **Enhanced Next.js configuration** with improved performance and user experience
- **Optimized bundle splitting** to reduce preload warnings
- **Improved error handling** for connection issues and API interactions
- **Refactored backup settings management** for better configuration handling
- **Enhanced session management** and CSRF protection across API interactions
- **Improved database migrations** and schema updates

---

## 🚀 Migration Notes

### From Version 0.7.x

This release includes significant security enhancements and new features. When upgrading from version 0.7.x:

1. **Automatic Database Migration:** The application will automatically migrate your database schema to support new features
2. **Master Key Generation:** A new master key will be generated for encryption of sensitive data
3. **Session Management:** Existing sessions will be invalidated and new CSRF-protected sessions will be established
4. **Configuration Updates:** Some configuration keys have been updated to support new features

### Security Considerations

- **Master Key File:** Ensure the `.duplistatus.key` file is properly backed up and secured
- **File Permissions:** The master key file will have restricted permissions (0400) for security
- **Password Encryption:** Existing passwords will be encrypted using the new cryptographic system

---

## 🐛 Bug Fixes

- Fixed relative time formatting to return "just now" for time differences under 15 seconds
- Improved error handling for missing environment variables
- Enhanced connection testing and validation
- Fixed various UI inconsistencies and improved user feedback

---

## 📦 Dependencies

- Updated to Next.js 15.5.4 for improved performance
- Enhanced React 19.1.1 support
- Added new dependencies for QR code generation and email functionality
- Updated TypeScript to 5.9.2 for better type safety
- Improved Tailwind CSS integration with version 4.1.13

---

This release represents a significant step forward in security, usability, and functionality. We recommend upgrading to take advantage of the new features and security enhancements.
