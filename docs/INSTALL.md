![duplistatus](img/duplistatus_banner.png)


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [First Steps](#first-steps)
  - [Quick Start Checklist](#quick-start-checklist)
  - [Accessing the Dashboard](#accessing-the-dashboard)
  - [Initial Setup](#initial-setup)
    - [1. Verify Installation](#1-verify-installation)
    - [2. Configure Your First Duplicati Server](#2-configure-your-first-duplicati-server)
    - [3. Basic Configuration](#3-basic-configuration)
      - [Server Settings](#server-settings)
      - [Display Settings](#display-settings)
  - [Understanding the Dashboard](#understanding-the-dashboard)
    - [Dashboard Overview](#dashboard-overview)
    - [Key Features](#key-features)
  - [Common Tasks](#common-tasks)
    - [Adding a New Server](#adding-a-new-server)
    - [Setting Up Notifications](#setting-up-notifications)
    - [Monitoring Backups](#monitoring-backups)
  - [Troubleshooting](#troubleshooting)
    - [Dashboard Not Loading](#dashboard-not-loading)
    - [No Backup Data](#no-backup-data)
    - [Notifications Not Working](#notifications-not-working)
  - [Getting Help](#getting-help)
    - [Documentation](#documentation)
    - [Support](#support)
  - [Next Steps](#next-steps)
  - [Tips for Success](#tips-for-success)
- [Installation Guide](#installation-guide)
  - [Prerequisites](#prerequisites)
  - [Container Images](#container-images)
  - [Installation](#installation)
    - [Container Images](#container-images-1)
    - [Option 1: Using Docker Compose](#option-1-using-docker-compose)
    - [Option 2: Using Portainer Stacks (Docker Compose)](#option-2-using-portainer-stacks-docker-compose)
    - [Option 3: Using Portainer Stacks (GitHub Repository)](#option-3-using-portainer-stacks-github-repository)
    - [Option 4: Using Docker CLI](#option-4-using-docker-cli)
    - [Option 5: Using Podman with Pod (CLI)](#option-5-using-podman-with-pod-cli)
    - [Option 6: Using Podman Compose (CLI)](#option-6-using-podman-compose-cli)
  - [Configuring the timezone (for notifications and logs)](#configuring-the-timezone-for-notifications-and-logs)
    - [Using your Linux Configuration](#using-your-linux-configuration)
    - [List of Timezones](#list-of-timezones)
  - [Configuring the Locale (for notifications and logs)](#configuring-the-locale-for-notifications-and-logs)
    - [Using your Linux Configuration](#using-your-linux-configuration-1)
    - [List of Locales](#list-of-locales)
  - [HTTPS Setup (Optional)](#https-setup-optional)
    - [Option 1: Nginx with Certbot (Let's Encrypt)](#option-1-nginx-with-certbot-lets-encrypt)
    - [Option 2: Caddy](#option-2-caddy)
    - [Important Notes](#important-notes)
  - [Environment Variables](#environment-variables)
  - [Duplicati Server Configuration (Required)](#duplicati-server-configuration-required)
  - [Next Steps](#next-steps-1)
  - [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# First Steps

Welcome to **duplistatus**! This guide will help you get started with monitoring your Duplicati backups.

## Quick Start Checklist

- [ ] **Install duplistatus** - [Installation Guide](installation.md)
- [ ] **Configure Duplicati servers** - [Configuration Guide](configuration.md)
- [ ] **Access the dashboard** - Open `http://your-server:9666`
- [ ] **Set up notifications** - [Notifications Guide](../user-guide/notifications.md)
- [ ] **Configure server settings** - [Server Management Guide](../user-guide/server-management.md)

## Accessing the Dashboard

Once duplistatus is running, you can access the web interface at:

```
http://your-server:9666
```

Replace `your-server` with the IP address or hostname where duplistatus is running.

## Initial Setup

### 1. Verify Installation

After installation, you should see:
- The duplistatus dashboard loads without errors
- The interface shows "No servers configured" or similar message
- No error messages in the browser console

### 2. Configure Your First Duplicati Server

1. **Configure Duplicati** - Follow the [Configuration Guide](configuration.md)
2. **Run a backup** - Execute a backup job on your Duplicati server
3. **Check the dashboard** - The server should appear in the duplistatus dashboard

### 3. Basic Configuration

#### Server Settings
- **Server Alias**: Give your server a friendly name
- **Server Notes**: Add a description or notes about the server
- **Notification Settings**: Configure backup notifications

#### Display Settings
- **Layout**: Choose between Cards or Table layout
- **Timezone**: Set your preferred timezone
- **Refresh Interval**: Configure how often the dashboard updates

## Understanding the Dashboard

### Dashboard Overview
- **Summary Cards**: Overview of all your backup servers
- **Server List**: Detailed view of each server's backup status
- **Navigation**: Easy access to different sections

### Key Features
- **Backup Status**: Real-time status of all backup jobs
- **History**: Detailed backup history for each server
- **Metrics**: Charts and statistics about backup performance
- **Notifications**: Alerts for failed or overdue backups

## Common Tasks

### Adding a New Server
1. Configure the Duplicati server to send reports to duplistatus
2. Run a backup job
3. The server will automatically appear in the dashboard
4. Configure server settings (alias, notes, notifications)

### Setting Up Notifications
1. Go to **Settings** → **Notifications**
2. Configure your notification preferences
3. Set up NTFY or email notifications
4. Test the notification system

### Monitoring Backups
1. Check the dashboard regularly for backup status
2. Set up notifications for failed backups
3. Review backup history and metrics
4. Monitor overdue backups

## Troubleshooting

### Dashboard Not Loading
- Check if the container is running: `docker ps`
- Verify port 9666 is accessible
- Check container logs: `docker logs duplistatus`

### No Backup Data
- Verify Duplicati server configuration
- Check network connectivity between servers
- Review duplistatus logs for errors
- Ensure backup jobs are running

### Notifications Not Working
- Check notification configuration
- Verify NTFY server connectivity (if using NTFY)
- Test notification settings
- Check notification logs

## Getting Help

### Documentation
- **User Guide**: [Complete User Guide](../user-guide/overview.md)
- **API Reference**: [API Documentation](../api-reference/overview.md)
- **Development**: [Development Guide](../development/setup.md)

### Support
- **GitHub Issues**: [Report bugs or request features](https://github.com/wsj-br/duplistatus/issues)
- **GitHub Discussions**: [Community support](https://github.com/wsj-br/duplistatus/discussions)

## Next Steps

Now that you have duplistatus running:

1. **Explore the User Guide** - Learn about all features in detail
2. **Set up notifications** - Get alerted about backup issues
3. **Configure multiple servers** - Monitor all your Duplicati instances
4. **Integrate with Homepage** - Use the API to integrate with other tools
5. **Contribute** - Help improve duplistatus by contributing code or documentation

## Tips for Success

- **Regular Monitoring**: Check the dashboard regularly to ensure backups are running
- **Notification Setup**: Configure notifications to stay informed about backup status
- **Server Organization**: Use aliases and notes to organize your servers
- **Backup Testing**: Regularly test your backup and restore procedures
- **Documentation**: Keep notes about your backup configuration and procedures

Welcome to duplistatus! You're now ready to monitor your Duplicati backups effectively.



# Installation Guide



This document describes how to install and configure the **duplistatus** server. It also describes an important configuration that needs to be performed on **Duplicati** servers.

<br/>

<br/>

## Prerequisites

Ensure you have the following installed:

- Docker Engine - [Debian installation guide](https://docs.docker.com/engine/install/debian/)
- Docker Compose - [Linux installation guide](https://docs.docker.com/compose/install/linux/)
- Portainer (optional) - [Docker installation guide](https://docs.portainer.io/start/install-ce/server/docker/linux)
- Podman (optional) - [Installation guide](http://podman.io/docs/installation#debian)

<br/>

## Container Images

You can use the images from:

- **Docker Hub**: `wsjbr/duplistatus:latest`
- **GitHub Container Registry**: `ghcr.io/wsj-br/duplistatus:latest`

<br/>

## Installation

The application can be deployed using Docker, [Portainer Stacks](https://docs.portainer.io/user/docker/stacks), or Podman.

<br/>

### Container Images

You can use the images from:

- **Docker Hub**: `wsjbr/duplistatus:latest`
- **GitHub Container Registry**: `ghcr.io/wsj-br/duplistatus:latest`

<br/>

### Option 1: Using Docker Compose

This is the recommended method for local deployments or when you want to customize the configuration. It uses a `docker compose` file to define and run the container with all its settings.

Create a file called `duplistatus.yml` containing the following:

```yaml
services:
  duplistatus:
    image: wsjbr/duplistatus:latest
    labels:
      - "com.centurylinklabs.watchtower.enable=false"
    container_name: duplistatus
    restart: unless-stopped
    ports:
      - "9666:9666"
    volumes:
      - duplistatus_data:/app/data
    networks:
      - duplistatus_network

networks:
  duplistatus_network:
    driver: bridge

volumes:
  duplistatus_data:
    name: duplistatus_data
    external: true
```

After creating the file, execute the `docker compose` command to start the container in the background (`-d`):

```bash
docker compose -f duplistatus.yml up -d
```

<br/>

### Option 2: Using Portainer Stacks (Docker Compose)

1. Go to "Stacks" in your [Portainer](https://docs.portainer.io/user/docker/stacks) server and click "Add stack".
2. Name your stack (e.g., "duplistatus").
3. Choose "Build method" as "Web editor".
4. Copy and paste the content of `duplistatus.yml` from "Option 1"
5. Click "Deploy the stack".

<br/>

### Option 3: Using Portainer Stacks (GitHub Repository)

1. In [Portainer](https://docs.portainer.io/user/docker/stacks), go to "Stacks" and click "Add stack".
2. Name your stack (e.g., "duplistatus").
3. Choose "Build method" as "Repository".
4. Enter the repository URL: `https://github.com/wsj-br/duplistatus.git`
5. In the "Compose path" field, enter: `docker-compose.yml`
6. Click "Deploy the stack".

<br/>

### Option 4: Using Docker CLI

```bash
# Create the volume
docker volume create duplistatus_data

# Start the container
docker run -d \
  --name duplistatus \
  -p 9666:9666 \
  -v duplistatus_data:/app/data \
  wsjbr/duplistatus:latest
```

- The `duplistatus_data` volume is used for persistent storage.

<br/>

### Option 5: Using Podman with Pod (CLI)

```bash
# Create a pod for the container
podman pod create --name Duplistatus --publish 9666:9666/tcp

# Create and start the container
podman create \
  --name duplistatus \
  --pod Duplistatus \
  --user root \
  -v /root/duplistatus_home/data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Start the pod (which starts the container)
podman pod start Duplistatus
```

<br/>

### Option 6: Using Podman Compose (CLI)

Create the `duplistatus.yml` file as instructed in Option 1 above, and then run:

```bash
podman-compose -f duplistatus.yml up -d
```

## Configuring the timezone (for notifications and logs)

The application user interface date and time will be displayed according to the browser's settings. However, for logging and notification purposes, the application will use the value defined in the `TZ` environment variable to format time zones.

The default value is `TZ=Europe/London` if this environment variable is not set.

<br/>

For example, to change the timezone to São Paulo, add these lines to the `duplistatus.yml` under `duplistatus:`:

```yaml
environment:
  - TZ=America/Sao_Paulo
```

or pass the environment variable in the command line:

```bash
  --env TZ=America/Sao_Paulo
```

<br/>

### Using your Linux Configuration

To obtain your Linux host's configuration, you can execute:

```bash
echo TZ=\"$(</etc/timezone)\"
```

<br/>

### List of Timezones

You can find a list of timezones here: [Wikipedia: List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)

<br/>

## Configuring the Locale (for notifications and logs)

The application user interface dates and numbers will be displayed according to the browser's settings. However, for logging and notification purposes, the application will use the value defined in the `LANG` environment variable to format dates and numbers.

The default value is `LANG=en_GB` if this environment variable is not set.
<br/>

For example, to change the locale to Brazilian Portuguese, add these lines to the `duplistatus.yml` under `duplistatus:`:

```yaml
environment:
  - LANG=pt_BR
```

or pass the environment variable in the command line:

```bash
  --env LANG=pt_BR
```

<br/>

### Using your Linux Configuration

To obtain your Linux host's configuration, you can execute:

```bash
echo ${LANG%.*}
```

<br/>

### List of Locales

You can find a list of locales here: [LocalePlanet: International Components for Unicode (ICU) Data](https://www.localeplanet.com/icu/)

<br/>

> [!IMPORTANT]
> Don't include `.UTF8` or similar in the configuration, just the `language_country`, for instance `en_US`.

<br/>

## HTTPS Setup (Optional)

For production deployments, it's recommended to serve **duplistatus** over HTTPS using a reverse proxy. This section provides configuration examples for popular reverse proxy solutions.

<br/>

### Option 1: Nginx with Certbot (Let's Encrypt)

[Nginx](https://nginx.org/) is a popular web server that can act as a reverse proxy, and [Certbot](https://certbot.eff.org/) provides free SSL certificates from Let's Encrypt.

**Prerequisites:**

- Domain name pointing to your server
- Nginx installed on your system
- Certbot installed for your operating system

**Step 1: Install Nginx and Certbot**

For Ubuntu/Debian:

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

**Step 2: Create Nginx configuration**

Create `/etc/nginx/sites-available/duplistatus`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:9666;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Step 3: Enable the site and obtain SSL certificate**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/duplistatus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com
```

Certbot will automatically update your Nginx configuration to include SSL settings and redirect HTTP to HTTPS.

**Documentation:**

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Certbot Documentation](https://certbot.eff.org/instructions)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

<br/>

### Option 2: Caddy

[Caddy](https://caddyserver.com/) is a modern web server with automatic HTTPS that simplifies SSL certificate management.

**Prerequisites:**

- Domain name pointing to your server
- Caddy installed on your system

**Step 1: Install Caddy**

Follow the [official installation guide](https://caddyserver.com/docs/install) for your operating system.

**Step 2: Create Caddyfile**

Create a `Caddyfile` with the following content:

```caddy
your-domain.com {
    reverse_proxy localhost:9666
}
```

**Step 3: Run Caddy**

```bash
sudo caddy run --config Caddyfile
```

Or use it as a system service:

```bash
sudo caddy start --config Caddyfile
```

Caddy will automatically obtain and manage SSL certificates from Let's Encrypt.

**Documentation:**

- [Caddy Documentation](https://caddyserver.com/docs/)
- [Caddy Reverse Proxy Guide](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

<br/>

### Important Notes

> [!IMPORTANT]
> After setting up HTTPS, remember to update your Duplicati server configuration to use the HTTPS URL:
>
> ```bash
> --send-http-url=https://your-domain.com/api/upload
> ```

> [!TIP]
>
> - Replace `your-domain.com` with your actual domain name
> - Ensure your domain's DNS A record points to your server's IP address
> - Both solutions will automatically renew SSL certificates
> - Consider setting up a firewall to only allow HTTP/HTTPS traffic

<br/>

## Environment Variables

The application supports the following environment variables for configuration:

| Variable                  | Description                                            | Default         |
| ------------------------- | ------------------------------------------------------ | :-------------- |
| `PORT`                    | Port for the main web application                      | `9666`          |
| `CRON_PORT`               | Port for the cron service. If not set, uses `PORT + 1` | `8667`          |
| `NODE_ENV`                | Node.js environment (`development` or `production`)    | `production`    |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry                              | `1`             |
| `TZ`                      | Timezone for the application                           | `Europe/London` |
| `LANG`                    | Locale for the application (e.g., `en_US`, `pt_BR`)    | `en_GB`         |

<br/>

> [!NOTE] > **Email Notifications Configuration:**
>
> - Email notifications are enabled by default, but will only work if they are properly configured.
> - Email notifications can be used alongside, or as an alternative to, NTFY notifications.
> - Settings are configured in the web interface under `Settings → Email Configuration`.
> - Refer to the [User Guide](USER-GUIDE.md#email-configuration) for detailed setup instructions.

## Duplicati Server Configuration (Required)

In order for this application to work properly, the Duplicati server needs to be configured to send HTTP reports for each backup run to the **duplistatus** server.

Apply this configuration to all your Duplicati servers:

1. **Allow remote access:** Log in to [Duplicati's UI](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui), select `Settings`, and allow remote access, including a list of hostnames (or use `*`).

<div>

![Duplicati settings](img/duplicati-settings.png)

<br/>

</div>

> [!CAUTION]
> Only enable remote access if your Duplicati server is protected by a secure network
> (e.g., VPN, private LAN, or firewall rules). Exposing the Duplicati interface to the public Internet
> without proper security measures could lead to unauthorised access.

<br/>

2. **Configure backup result reporting:** On the Duplicati configuration page, select `Settings` and, in the `Default Options` section, include the following options. Replace 'my.local.server' with your server name or IP address where **duplistatus** is running.

<div>

| Advanced option                  | Value                                    |
| -------------------------------- | ---------------------------------------- |
| `send-http-url`                  | `http://my.local.server:9666/api/upload` |
| `send-http-result-output-format` | `Json`                                   |
| `send-http-log-level`            | `Information`                            |
| `send-http-max-log-lines`        | `0`                                      |

</div>

> [!TIP]
> Click on `Edit as text` and copy the lines below, replacing `my.local.server` with your actual server address.

<div>

```bash
--send-http-url=http://my.local.server:9666/api/upload
--send-http-result-output-format=Json
--send-http-log-level=Information
--send-http-max-log-lines=0
```

<br/>

![Duplicati configuration](img/duplicati-options.png)

<br/>

**Important notes on messages sent by Duplicati:**

- If you omit `--send-http-log-level=Information`, no log messages will be sent to **duplistatus**, only statistics. This will prevent the available versions feature from working.
- The recommended configuration is `--send-http-max-log-lines=0` for unlimited messages, since the Duplicati default of 100 messages may prevent the available versions from being received in the log.
- If you limit the number of messages, the log messages required to obtain the available backup versions may not be received. This will prevent those versions from being displayed for that backup run.

<br/>

</div>

> [!TIP]
> After configuring the **duplistatus** server, collect the backup logs for all your Duplicati servers using [Collect Backup Logs](USER-GUIDE.md#collect-backup-logs).

<br/>

## Next Steps

Check the [User Guide](USER-GUIDE.md) on how to use **duplistatus**.

<br/>

## License

The project is licensed under the [Apache License 2.0](https://github.com/wsj-br/duplistatus/blob/main/LICENSE).

**Copyright © 2025 Waldemar Scudeller Jr.**
