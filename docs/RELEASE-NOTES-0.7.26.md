<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Release Notes: duplistatus Version 0.7.26](#release-notes-duplistatus-version-0726)
  - [⚠️ Major Change: "Machine" to "Server" Terminology](#-major-change-machine-to-server-terminology)
  - [✨ New Features](#-new-features)
    - [Dashboard Cards Layout](#dashboard-cards-layout)
    - [Duplicati Web Interface Integration](#duplicati-web-interface-integration)
    - [Server Management and Customisation](#server-management-and-customisation)
  - [🎨 User Interface Improvements](#-user-interface-improvements)
  - [🔄 Major API Changes](#-major-api-changes)
    - [/api/summary](#apisummary)
    - [/api/lastbackup](#apilastbackup)
    - [/api/lastbackups](#apilastbackups)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


# Release Notes: duplistatus Version 0.7.26

We're excited to announce the release of **duplistatus version 0.7.26**. This is a significant update that introduces a major redesign of the user interface, new features for better integration and customisation, and important terminology changes across the application.

This release focuses on improving user experience, providing more intuitive navigation, and streamlining how you monitor your Duplicati backups.

---

## ⚠️ Major Change: "Machine" to "Server" Terminology

One of the most significant updates in this version is the migration of terminology from "Machine" to "Server" throughout the entire application. This change has been made to align more closely with Duplicati's nomenclature and provide a more intuitive user experience.

This is a **breaking change** that affects the database schema, API endpoints, and configuration files. Upon upgrading from a version prior to 0.7.x, the application will **automatically migrate your database schema**. However, any custom integrations or scripts interacting with the API will need to be updated.

* **Database:** The `machines` table has been renamed to `servers`, and related columns like `machine_id` are now `server_id`.
* **API:** All API endpoints previously using `/api/machines/...` now use `/api/servers/...`.
* **Configuration Keys:** Configuration keys for backup settings have been updated from `machine_name:backup_name` to `server_id:backup_name`.
* **Notification Templates:** Due to the terminology change, notification template variables have been updated. For example, the `{machine_name}` variable is now `{server_name}`. Your existing custom templates will not work correctly until they are updated.
    **Action Required:** You must update your notification templates. The recommended methods are:
    * **Reset to Default:** Navigate to `Settings → Notification Templates` and use the "Reset to Default" button to apply the new default templates.
    * **Manual Update:** Manually edit your templates to replace `{machine_name}` with `{server_name}` and take advantage of new variables like `{server_alias}` and `{server_note}`.

---

## ✨ New Features

### Dashboard Cards Layout

The dashboard has been completely redesigned, introducing a new **Cards Layout** as the default view. This layout provides a clearer, at-a-glance overview of each server's backup status. The previous table layout remains available and can be toggled from the Dashboard Summary section.

* **Server Status:** Each card displays the overall status of a server, summary information (total files, size), and the status history of the last 10 backups for each job.
* **Sorting Options:** You can now sort the cards by **Server name**, **Status**, or **Last backup received** time directly from the Display Settings.
* **Side Panel:** The cards layout includes a new side panel that can be toggled to show either consolidated **statistics** or **metrics charts** for a selected server.

### Duplicati Web Interface Integration

You can now directly access your Duplicati server's web interface from within `duplistatus`.

* A new **Duplicati configuration** button has been added to the application toolbar.
* Server addresses are automatically saved when you use the **Collect Backup Logs** feature.
* You can manage all server addresses centrally in **Settings → Server Settings**.

### Server Management and Customisation

* **Server Aliases:** You can now assign a custom alias to each server for easier identification throughout the user interface. The alias can be configured in `Settings → Server Settings`.
* **Descriptive Notes:** Add a note to each server to document its purpose, location, or any other relevant information. This note is displayed alongside the server's name or alias in the UI for quick reference.

---

## 🎨 User Interface Improvements

* **Redesigned Dashboard:** The new default view is the cleaner and more modern Cards Layout. The previous table format is still accessible via a layout toggle button.
* **Enhanced Server Details:** The pages previously named "Machine Details" are now "Server Details," showing statistics, metrics, and backup history for each server.
* **Interactive Metrics Charts:** The backup metrics charts are now more interactive, with tooltips that display detailed information for each data point upon hover.
* **Consolidated Settings:** All application settings, including notifications, server addresses, and templates, are now managed under a unified "Settings" section.

---

## 🔄 Major API Changes

This release introduces breaking changes to several key API endpoints to align with the new "Server" terminology.

### /api/summary

The `/api/summary` endpoint, used for the overall backup statistics, has been updated.

* **Previous (v0.6.1):** The response payload included the field `totalMachines`.
* **New (v0.7.26):** The `totalMachines` field has been renamed to `totalServers`.

### /api/lastbackup

The endpoint for fetching the last backup for a specific server has been renamed and its response structure updated.

* **Previous (v0.6.1):** The endpoint was `/api/lastbackup/:machineId`. The response object contained a `machine` key.
* **New (v0.7.26):** The endpoint is now `/api/lastbackup/:serverId`. The response object now contains a `server` key.

### /api/lastbackups

Similarly, the endpoint for fetching the last backups for all jobs on a server has been updated.

* **Previous (v0.6.1):** The endpoint was `/api/lastbackups/:machineId`. The response object contained a `machine` key and a `backup_types_count` field.
* **New (v0.7.26):** The endpoint is now `/api/lastbackups/:serverId`. The response object now contains a `server` key, and the `backup_types_count` field has been renamed to `backup_jobs_count`.