

# Installation Guide {#installation-guide}

The application can be deployed using Docker, [Portainer Stacks](https://docs.portainer.io/user/docker/stacks), or Podman. After the installation, you may want to configure the TIMEZONE and LANGUAGE, as described in the [Configure Timezone](./configure-tz.md) and need to configure the Duplicati servers to send backup logs to **duplistatus**, as outlined in the [Duplicati Configuration](./duplicati-server-configuration.md) section.

## Prerequisites {#prerequisites}

Ensure you have the following installed:

- Docker Engine - [Debian installation guide](https://docs.docker.com/engine/install/debian/)
- Docker Compose - [Linux installation guide](https://docs.docker.com/compose/install/linux/)
- Portainer (optional) - [Docker installation guide](https://docs.portainer.io/start/install-ce/server/docker/linux)
- Podman (optional) - [Installation guide](http://podman.io/docs/installation#debian)


## Authentication {#authentication}

**duplistatus** since version 0.9.x requires user authentication. A default `admin` account is created automatically when installing the application for the first time or upgrading from an earlier version: 
    - username: `admin`
    - password: `Duplistatus09` 

You can create additional users accounts in [Settings > Users](../user-guide/settings/user-management-settings.md) after the first login.


::::info[IMPORTANT]
The system enforces a minimum password length and complexity. These requirements can be adjusted using the `PWD_ENFORCE` and `PWD_MIN_LEN` [environment variables](environment-variables.md). Using a password without sufficient complexity or with a short length can compromise security. Please use these settings carefully.
::::


### Container Images {#container-images}

You can use the images from:

- **Docker Hub**: `docker.io/wsjbr/duplistatus:latest`
- **GitHub Container Registry**: `ghcr.io/wsj-br/duplistatus:latest`

### Option 1: Using Docker Compose {#option-1-using-docker-compose}

This is the recommended method for local deployments or when you want to customise the configuration. It uses a `docker compose` file to define and run the container with all its settings.

```bash	
# download the compose file
wget https://github.com/wsj-br/duplistatus/raw/refs/heads/master/production.yml -O duplistatus.yml
# start the container
docker compose -f duplistatus.yml up -d
```

Check [Timezone](./configure-tz.md) section to more details on how to adjust timezone and number/date/time format.

### Option 2: Using Portainer Stacks (Docker Compose) {#option-2-using-portainer-stacks-docker-compose}

1. Go to "Stacks" in your [Portainer](https://docs.portainer.io/user/docker/stacks) server and click "Add stack".
2. Name your stack (e.g., "duplistatus").
3. Choose "Build method" as "Web editor".
4. Copy and paste this in the web editor:
```yaml
# duplistatus production compose.yml
services:
  duplistatus:
    image: ghcr.io/wsj-br/duplistatus:latest
    container_name: duplistatus
    restart: unless-stopped
    environment:
      - TZ=Europe/London
      - PWD_ENFORCE=true
      - PWD_MIN_LEN=8
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
``` 

5. Check the [Timezone](./configure-tz.md) section to more details on how to adjust the timezone and number/date/time format.
6. Click "Deploy the stack".

### Option 3: Using Portainer Stacks (GitHub Repository) {#option-3-using-portainer-stacks-github-repository}

1. In [Portainer](https://docs.portainer.io/user/docker/stacks), go to "Stacks" and click "Add stack".
2. Name your stack (e.g., "duplistatus").
3. Choose "Build method" as "Repository".
4. Enter the repository URL: `https://github.com/wsj-br/duplistatus.git`
5. In the "Compose path" field, enter: `production.yml`
6. (optional) Set the `TZ`, `LANG`, `PWD_ENFORCE` and `PWD_MIN_LEN` environment variables in the "Environment variables" section. Check the [Timezone](./configure-tz.md) section to more details on how to adjust the timezone and number/date/time format. 
6. Click "Deploy the stack".

### Option 4: Using Docker CLI {#option-4-using-docker-cli}

```bash
# Create the volume
docker volume create duplistatus_data

# Start the container
docker run -d \
  --name duplistatus \
  -p 9666:9666 \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest
```

- The `duplistatus_data` volume is used for persistent storage. The container image uses `Europe/London` as the default timezone and `en_GB` as the default locale (language).

### Option 5: Using Podman (CLI) `rootless` {#option-5-using-podman-cli-rootless}

For basic setups, you can start the container without DNS configuration:

```bash
mkdir -p ~/duplistatus_data
# Start the container (standalone)
podman run -d \
  --name duplistatus \
  --userns=keep-id \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -p 9666:9666 \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest
```

#### Configuring DNS for Podman Containers {#configuring-dns-for-podman-containers}

If you need custom DNS configuration (e.g., for Tailscale MagicDNS, corporate networks, or custom DNS setups), you can manually configure DNS servers and search domains.

**Finding your DNS configuration:**

1. **For systemd-resolved systems** (most modern Linux distributions):
   ```bash
   # Get DNS servers
   resolvectl status | grep "DNS Servers:" | awk '{print "--dns " $3}'
   
   # Get DNS search domains
   resolvectl status | grep "DNS Domain:" | awk '{print "--dns-search " $3}'
   ```

2. **For non-systemd systems** or as a fallback:
   ```bash
   cat /run/systemd/resolve/resolv.conf 2>/dev/null || cat /etc/resolv.conf
   ```
   
   Look for lines beginning with `nameserver` (for DNS servers) and `search` (for search domains). If you are unsure of your DNS settings or network search domains, consult your network administrator for this information.

**Example with DNS configuration:**

```bash
mkdir -p ~/duplistatus_data
# Start the container with DNS configuration
podman run -d \
  --name duplistatus \
  --userns=keep-id \
  --dns 100.100.100.100 \
  --dns-search example.com \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -p 9666:9666 \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest
```

You can specify multiple DNS servers by adding multiple `--dns` flags:
```bash
--dns 8.8.8.8 --dns 1.1.1.1
```

You can specify multiple search domains by adding multiple `--dns-search` flags:
```bash
--dns-search example.com --dns-search internal.local
```

**Note**: Skip IPv6 addresses (containing `:`) and localhost addresses (like `127.0.0.53`) when configuring DNS servers.

Check the [Timezone](./configure-tz.md) section for more details on how to adjust the timezone and number/date/time format.

### Option 6: Using Podman Pods {#option-6-using-podman-pods}

Podman pods allow you to run multiple containers in a shared network namespace. This is useful for testing or when you need to run duplistatus alongside other containers.

**Basic pod setup:**

```bash
mkdir -p ~/duplistatus_data

# Create the pod
podman pod create --name duplistatus-pod --publish 9666:9666/tcp

# Create the container in the pod
podman create --name duplistatus \
  --pod duplistatus-pod \
  --user root \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Start the pod
podman pod start duplistatus-pod
```

#### Configuring DNS for Podman Pods {#configuring-dns-for-podman-pods}

When using pods, DNS configuration must be set at the pod level, not the container level.
Use the same methods described in Option 5 to find your DNS servers and search domains.

**Example with DNS configuration:**

```bash
mkdir -p ~/duplistatus_data

# Create the pod with DNS configuration
podman pod create --name duplistatus-pod \
  --publish 9666:9666/tcp \
  --dns 100.100.100.100 \
  --dns-search example.com

# Create the container in the pod
podman create --name duplistatus \
  --pod duplistatus-pod \
  --user root \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Start the pod
podman pod start duplistatus-pod
```

**Managing the pod:**

```bash
# Stop the pod (stops all containers in the pod)
podman pod stop duplistatus-pod

# Start the pod
podman pod start duplistatus-pod

# Remove the pod and all containers
podman pod rm -f duplistatus-pod
```


## Essential Configuration {#essential-configuration}

1. Configure your [Duplicati servers](duplicati-server-configuration.md) to send backup log messages to duplistatus (required).
2. Log in to duplistatus – see instructions in the [User Guide](../user-guide/overview.md#accessing-the-dashboard).
3. Collect initial backup logs – use the [Collect Backup Logs](../user-guide/collect-backup-logs.md) feature to populate the database with historical backup data from all your Duplicati servers. This also automatically updates the backup monitoring intervals based on each server’s configuration.
4. Configure server settings – set up server aliases and notes in [Settings → Server](../user-guide/settings/server-settings.md) to make your dashboard more informative.
5. Configure NTFY settings – set up notifications via NTFY in [Settings → NTFY](../user-guide/settings/ntfy-settings.md).
6. Configure email settings – set up email notifications in [Settings → Email](../user-guide/settings/email-settings.md).
7. Configure backup notifications – set up per-backup or per-server notifications in [Settings → Backup Notifications](../user-guide/settings/backup-notifications-settings.md).

See the following sections to configure optional settings such as timezone, number format, and HTTPS.
