<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [API-ENDPOINTS new doc structure](#api-endpoints-new-doc-structure)
  - [overview.md:](#overviewmd)
  - [external-apis.md](#external-apismd)
  - [core-operations.md](#core-operationsmd)
  - [chart-data-apis.md](#chart-data-apismd)
  - [configuration-apis.md](#configuration-apismd)
  - [notification-apis.md](#notification-apismd)
  - [cron-service-apis.md](#cron-service-apismd)
  - [monitoring-apis.md](#monitoring-apismd)
  - [administration-apis.md](#administration-apismd)
  - [session-management-apis.md](#session-management-apismd)
  - [authentication-security.md](#authentication-securitymd)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# API-ENDPOINTS new doc structure

This file is used to create the new doc structure for docusaurus based on the old docs/API-ENDPOINTS.md file.

The new files will be created in the ./website/docs/api-reference directory.

Below, each section will be a file in the ./website/docs/api-reference directory, and the content will be the content of the section in the old docs/API-ENDPOINTS.md file, listed in the section contents.

## overview.md:
    - [API Endpoints](#api-endpoints)
    - [Error Handling](#error-handling)
    - [Data Type Notes](#data-type-notes)
        - [Message Arrays](#message-arrays)
        - [Available Backups](#available-backups)
        - [Duration Fields](#duration-fields)
        - [File Size Fields](#file-size-fields)

## external-apis.md

- [External APIs](#external-apis)
  - [Get Overall Summary - `/api/summary`](#get-overall-summary---apisummary)
  - [Get Latest Backup - `/api/lastbackup/:serverId`](#get-latest-backup---apilastbackupserverid)
  - [Get Latest Backups - `/api/lastbackups/:serverId`](#get-latest-backups---apilastbackupsserverid)
  - [Upload Backup Data - `/api/upload`](#upload-backup-data---apiupload)

## core-operations.md

- [Core Operations](#core-operations)
  - [Get Dashboard Data (Consolidated) - `/api/dashboard`](#get-dashboard-data-consolidated---apidashboard)
  - [Get All Servers - `/api/servers`](#get-all-servers---apiservers)
  - [Get Server Details - `/api/servers/:id`](#get-server-details---apiserversid)
  - [Update Server - `/api/servers/:id`](#update-server---apiserversid)
  - [Delete Server - `/api/servers/:id`](#delete-server---apiserversid)
  - [Get Server Data with Overdue Info - `/api/detail/:serverId`](#get-server-data-with-overdue-info---apidetailserverid)

## chart-data-apis.md

- [Chart Data](#chart-data)
  - [Get Aggregated Chart Data - `/api/chart-data/aggregated`](#get-aggregated-chart-data---apichart-dataaggregated)
  - [Get Server Chart Data - `/api/chart-data/server/:serverId`](#get-server-chart-data---apichart-dataserverserverid)
  - [Get Server Backup Chart Data - `/api/chart-data/server/:serverId/backup/:backupName`](#get-server-backup-chart-data---apichart-dataserverserveridbackupbackupname)

## configuration-apis.md

- [Configuration Management](#configuration-management)
  - [Get Email Configuration - `/api/configuration/email`](#get-email-configuration---apiconfigurationemail)
  - [Update Email Configuration - `/api/configuration/email`](#update-email-configuration---apiconfigurationemail)
  - [Delete Email Configuration - `/api/configuration/email`](#delete-email-configuration---apiconfigurationemail)
  - [Update Email Password - `/api/configuration/email/password`](#update-email-password---apiconfigurationemailpassword)
  - [Get Email Password CSRF Token - `/api/configuration/email/password`](#get-email-password-csrf-token---apiconfigurationemailpassword)
  - [Get Unified Configuration - `/api/configuration/unified`](#get-unified-configuration---apiconfigurationunified)
  - [Get NTFY Configuration - `/api/configuration/ntfy`](#get-ntfy-configuration---apiconfigurationntfy)
  - [Update Notification Configuration - `/api/configuration/notifications`](#update-notification-configuration---apiconfigurationnotifications)
  - [Update Backup Settings - `/api/configuration/backup-settings`](#update-backup-settings---apiconfigurationbackup-settings)
  - [Update Notification Templates - `/api/configuration/templates`](#update-notification-templates---apiconfigurationtemplates)
  - [Get Overdue Tolerance - `/api/configuration/overdue-tolerance`](#get-overdue-tolerance---apiconfigurationoverdue-tolerance)
  - [Update Overdue Tolerance - `/api/configuration/overdue-tolerance`](#update-overdue-tolerance---apiconfigurationoverdue-tolerance)

## notification-apis.md

- [Notification System](#notification-system)
  - [Test Notification - `/api/notifications/test`](#test-notification---apinotificationstest)
  - [Check Overdue Backups - `/api/notifications/check-overdue`](#check-overdue-backups---apinotificationscheck-overdue)
  - [Clear Overdue Timestamps - `/api/notifications/clear-overdue-timestamps`](#clear-overdue-timestamps---apinotificationsclear-overdue-timestamps)

## cron-service-apis.md
- [Cron Service Management](#cron-service-management)
  - [Get Cron Configuration - `/api/cron-config`](#get-cron-configuration---apicron-config)
  - [Update Cron Configuration - `/api/cron-config`](#update-cron-configuration---apicron-config)
  - [Cron Service Proxy - `/api/cron/*`](#cron-service-proxy---apicron)

## monitoring-apis.md
- [Monitoring & Health](#monitoring--health)
  - [Health Check - `/api/health`](#health-check---apihealth)

## administration-apis.md
- [Administration](#administration)
  - [Collect Backups - `/api/backups/collect`](#collect-backups---apibackupscollect)
  - [Cleanup Backups - `/api/backups/cleanup`](#cleanup-backups---apibackupscleanup)
  - [Delete Backup - `/api/backups/:backupId`](#delete-backup---apibackupsbackupid)
  - [Delete Backup Job - `/api/backups/delete-job`](#delete-backup-job---apibackupsdelete-job)
  - [Test Server Connection - `/api/servers/test-connection`](#test-server-connection---apiserverstest-connection)
  - [Get Server URL - `/api/servers/:serverId/server-url`](#get-server-url---apiserversserveridserver-url)
  - [Update Server URL - `/api/servers/:serverId/server-url`](#update-server-url---apiserversserveridserver-url)
  - [Get Server Password - `/api/servers/:serverId/password`](#get-server-password---apiserversserveridpassword)
  - [Update Server Password - `/api/servers/:serverId/password`](#update-server-password---apiserversserveridpassword)

## session-management-apis.md

- [Session Management](#session-management)
  - [Create Session - `/api/session`](#create-session---apisession)
  - [Validate Session - `/api/session`](#validate-session---apisession)
  - [Delete Session - `/api/session`](#delete-session---apisession)
  - [Get CSRF Token - `/api/csrf`](#get-csrf-token---apicsrf)

## authentication-security.md
- [Authentication & Security](#authentication--security)
  - [Session-Based Authentication](#session-based-authentication)
    - [Session Management](#session-management-1)
    - [CSRF Protection](#csrf-protection)
    - [Protected Endpoints](#protected-endpoints)
    - [Unprotected Endpoints](#unprotected-endpoints)
    - [Usage Example (Session + CSRF)](#usage-example-session--csrf)
    - [Error Responses](#error-responses)