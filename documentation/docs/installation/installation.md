

# Installation Guide

The application can be deployed using Docker, [Portainer Stacks](https://docs.portainer.io/user/docker/stacks), or Podman. After the installation, you may want to configure the TIMEZONE and LANGUAGE, as described in the [Configure Timezone and Language](configure-tz-lang.md) and need to configure the Duplicati servers to send backup logs to **duplistatus**, as outlined in the [Duplicati Configuration](duplicati-server-configuration.md) section.

## Prerequisites

Ensure you have the following installed:

- Docker Engine - [Debian installation guide](https://docs.docker.com/engine/install/debian/)
- Docker Compose - [Linux installation guide](https://docs.docker.com/compose/install/linux/)
- Portainer (optional) - [Docker installation guide](https://docs.portainer.io/start/install-ce/server/docker/linux)
- Podman (optional) - [Installation guide](http://podman.io/docs/installation#debian)


## Authentication

**duplistatus** since version 0.9.x requires user authentication. A default `admin` account is created automatically when installing the application for the first time or upgrading from an earlier version: 
    - username: `admin`
    - password: `Duplistatus09` 

You can create additional users accounts in [Settings > Users](user-guide/settings/user-management-settings.md) after the first login.


### Container Images

You can use the images from:

- **Docker Hub**: `docker.io/wsjbr/duplistatus:latest`
- **GitHub Container Registry**: `ghcr.io/wsj-br/duplistatus:latest`

### Option 1: Using Docker Compose

This is the recommended method for local deployments or when you want to customise the configuration. It uses a `docker compose` file to define and run the container with all its settings.

```bash	
# download the compose file
wget https://github.com/wsj-br/duplistatus/raw/refs/heads/master/production.yml -O duplistatus.yml
# start the container
docker compose -f duplistatus.yml up -d
```

Check the [Timezone and Locale](installation/configure-tz-lang.md) section to more details on how to adjust the timezone and number/date/time format.

### Option 2: Using Portainer Stacks (Docker Compose)

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
      - LANG=en_GB
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

5. Check the [Timezone and Locale](installation/configure-tz-lang.md) section to more details on how to adjust the timezone and number/date/time format.
6. Click "Deploy the stack".

### Option 3: Using Portainer Stacks (GitHub Repository)

1. In [Portainer](https://docs.portainer.io/user/docker/stacks), go to "Stacks" and click "Add stack".
2. Name your stack (e.g., "duplistatus").
3. Choose "Build method" as "Repository".
4. Enter the repository URL: `https://github.com/wsj-br/duplistatus.git`
5. In the "Compose path" field, enter: `production.yml`
6. (optional) Set the `TZ` and `LANG` environment variables in the "Environment variables" section. Check the [Timezone and Locale](installation/configure-tz-lang.md) section to more details on how to adjust the timezone and number/date/time format. 
6. Click "Deploy the stack".

### Option 4: Using Docker CLI

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

### Option 5: Using Podman (CLI) `rootless`

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

>[!IMPORTANT]
> Start the `duplistatus` container as a standalone container. If it is installed in a Pod, it will not listen on port 9666.
> This is due to a Podman (Pod) security restriction.


Check the [Timezone and Locale](installation/configure-tz-lang.md) section to more details on how to adjust the timezone and number/date/time format.

### Option 6: Using Podman Compose (CLI) `rootless`

```bash
# download the compose file
wget https://github.com/wsj-br/duplistatus/raw/refs/heads/master/production.yml -O duplistatus.yml
# start the container
podman-compose -f duplistatus.yml up -d
```

Check the [Timezone and Locale](installation/configure-tz-lang.md) section to more details on how to adjust the timezone and number/date/time format.
