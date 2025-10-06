<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Development new doc structure](#development-new-doc-structure)
  - [setup.md:](#setupmd)
  - [coding.md:](#codingmd)
  - [cron-service.md:](#cron-servicemd)
  - [test-scripts.md:](#test-scriptsmd)
  - [workspace-admin-scripts-commands.md:](#workspace-admin-scripts-commandsmd)
  - [documentation-tools.md:](#documentation-toolsmd)
  - [podman-testing.md:](#podman-testingmd)
  - [release-management.md:](#release-managementmd)
  - [development-guidelines.md:](#development-guidelinesmd)
  - [frameworks-libraries-and-tools-used.md:](#frameworks-libraries-and-tools-usedmd)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Development new doc structure

This file is used to create the new doc structure for docusaurus based on the old docs/DEVELOPMENT.md file.

The new files will be created in the ./website/docs/development directory.

Below, each section will be a file in the ./website/docs/development directory, and the content will be the content of the section in the old docs/DEVELOPMENT.md file, listed in the section contents.

## setup.md:
  - [Prerequisites](#prerequisites)
  - [Steps](#steps)
  - [Available Scripts](#available-scripts)
    - [Development Scripts](#development-scripts)
    - [Production Scripts](#production-scripts)
    - [Docker Scripts](#docker-scripts)
    - [Cron Service Scripts](#cron-service-scripts)
    - [Test Scripts](#test-scripts)
    

## coding.md:
  - [Development Mode Features](#development-mode-features)
    - [Build the application for production](#build-the-application-for-production)
    - [Start the production server (in development environment):](#start-the-production-server-in-development-environment)
    - [Start a Docker stack (Docker Compose)](#start-a-docker-stack-docker-compose)
    - [Stop a Docker stack (Docker Compose)](#stop-a-docker-stack-docker-compose)
    - [Clean Docker environment](#clean-docker-environment)
    - [Create a development image (to test locally or with Podman)](#create-a-development-image-to-test-locally-or-with-podman)

## cron-service.md:
  - [Cron Service](#cron-service)
      - [Start cron service in development mode:](#start-cron-service-in-development-mode)
      - [Start cron service in production mode:](#start-cron-service-in-production-mode)
      - [Start cron service locally (for testing):](#start-cron-service-locally-for-testing)

## test-scripts.md:
  - [Test Scripts](#test-scripts)
    - [Generate Test Data](#generate-test-data)
    - [Show the overdue notifications contents (to debug notification system)](#show-the-overdue-notifications-contents-to-debug-notification-system)
    - [Run overdue-check at a specific date/time (to debug notification system)](#run-overdue-check-at-a-specific-datetime-to-debug-notification-system)
    - [Test cron service port connectivity](#test-cron-service-port-connectivity)

## workspace-admin-scripts-commands.md:
  - [Workspace admin scripts & commands](#workspace-admin-scripts--commands)
    - [Clean Database](#clean-database)
    - [Clean build artefacts and dependencies](#clean-build-artefacts-and-dependencies)
    - [Clean Docker Compose and Docker environment](#clean-docker-compose-and-docker-environment)
    - [Generate the logo/favicon and banner from SVG images](#generate-the-logofavicon-and-banner-from-svg-images)
    - [Update the packages to the latest version](#update-the-packages-to-the-latest-version)
    - [Check for unused packages](#check-for-unused-packages)
    - [Update version information](#update-version-information)
    - [Viewing the configurations in the database](#viewing-the-configurations-in-the-database)
    - [SQL Scripts for Debugging and Maintenance](#sql-scripts-for-debugging-and-maintenance)
      - [Delete Backup Settings](#delete-backup-settings)
      - [Delete Last Backup](#delete-last-backup)

## documentation-tools.md:
  - [Documentation tools](#documentation-tools)
    - [Update documentation](#update-documentation)
    - [Checking for broken links](#checking-for-broken-links)

## podman-testing.md:
  - [Podman Testing](#podman-testing)
    - [Initial Setup and Management](#initial-setup-and-management)
    - [Monitoring and Health Checks](#monitoring-and-health-checks)
    - [Debugging Commands](#debugging-commands)
    - [Usage Workflow](#usage-workflow)

## release-management.md:
  - [Release Management](#release-management)
    - [Versioning (Semantic Versioning)](#versioning-semantic-versioning)
    - [Merging `devel-MAJOR.MINOR.PATCH` to `master` using command line](#merging-devel-majorminorpatch-to-master-using-command-line)
      - [1. Merge the `devel-MAJOR.MINOR.PATCH` Branch into `master`](#1-merge-the-devel-majorminorpatch-branch-into-master)
      - [2. Tag the New Release](#2-tag-the-new-release)
      - [3. Push to GitHub](#3-push-to-github)
    - [Merging `devel-MAJOR.MINOR.PATCH` to `master` using GitHub](#merging-devel-majorminorpatch-to-master-using-github)
    - [Creating a GitHub Release](#creating-a-github-release)
    - [Manual Docker Image Build](#manual-docker-image-build)

## development-guidelines.md:
  - [Development Guidelines](#development-guidelines)
    - [Code Organisation](#code-organisation)
    - [Testing](#testing)
    - [Debugging](#debugging)
    - [API Development](#api-development)
    - [Database Development](#database-development)
    - [UI Development](#ui-development)

## frameworks-libraries-and-tools-used.md:
  - [Frameworks, libraries and tools used](#frameworks-libraries-and-tools-used)
