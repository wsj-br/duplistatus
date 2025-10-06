---
sidebar_position: 1
---

# Installation

![duplistatus](img/duplistatus_banner.png)

This document describes how to install and configure the **duplistatus** server.

## Prerequisites

Ensure you have the following installed:

- Docker Engine - [Debian installation guide](https://docs.docker.com/engine/install/debian/)
- Docker Compose - [Linux installation guide](https://docs.docker.com/compose/install/linux/)
- Portainer (optional) - [Docker installation guide](https://docs.portainer.io/start/install-ce/server/docker/linux)
- Podman (optional) - [Installation guide](http://podman.io/docs/installation#debian)

## Container Images

You can use the images from:

- **Docker Hub**: `wsjbr/duplistatus:latest`
- **GitHub Container Registry**: `ghcr.io/wsj-br/duplistatus:latest`

## Installation Options

The application can be deployed using Docker, [Portainer Stacks](https://docs.portainer.io/user/docker/stacks), or Podman.

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
```

Then run:

```bash
docker compose -f duplistatus.yml up -d
```

### Option 2: Using Portainer Stacks (Docker Compose)

1. In Portainer, go to **Stacks** → **Add stack**
2. Name your stack (e.g., `duplistatus`)
3. Paste the Docker Compose configuration above
4. Click **Deploy the stack**

### Option 3: Using Portainer Stacks (GitHub Repository)

1. In Portainer, go to **Stacks** → **Add stack**
2. Name your stack (e.g., `duplistatus`)
3. Select **Repository** as the build method
4. Enter the repository URL: `https://github.com/wsj-br/duplistatus`
5. Enter the path to the compose file: `docker-compose.yml`
6. Click **Deploy the stack**

### Option 4: Using Docker CLI

```bash
docker run -d \
  --name duplistatus \
  --restart unless-stopped \
  -p 9666:9666 \
  -v duplistatus_data:/app/data \
  wsjbr/duplistatus:latest
```

### Option 5: Using Podman with Pod (CLI)

```bash
# Create a pod
podman pod create --name duplistatus-pod -p 9666:9666

# Run the container in the pod
podman run -d \
  --name duplistatus \
  --pod duplistatus-pod \
  --restart unless-stopped \
  -v duplistatus_data:/app/data \
  wsjbr/duplistatus:latest
```

### Option 6: Using Podman Compose (CLI)

Create a `docker-compose.yml` file and run:

```bash
podman-compose up -d
```

## Configuring the Timezone

### Using your Linux Configuration

To use your Linux system's timezone configuration, add the following to your Docker Compose file:

```yaml
services:
  duplistatus:
    # ... other configuration
    volumes:
      - duplistatus_data:/app/data
      - /etc/localtime:/etc/localtime:ro
      - /etc/timezone:/etc/timezone:ro
```

### List of Timezones

You can also set a specific timezone using environment variables:

```yaml
services:
  duplistatus:
    # ... other configuration
    environment:
      - TZ=America/New_York
```

Common timezones:
- `UTC`
- `America/New_York`
- `America/Chicago`
- `America/Denver`
- `America/Los_Angeles`
- `Europe/London`
- `Europe/Paris`
- `Asia/Tokyo`

## HTTPS Setup (Optional)

### Option 1: Nginx with Certbot (Let's Encrypt)

1. Install Nginx and Certbot
2. Configure Nginx as a reverse proxy
3. Obtain SSL certificates with Certbot
4. Update your Docker Compose to use the reverse proxy

### Option 2: Caddy

Caddy automatically handles HTTPS certificates:

```yaml
services:
  caddy:
    image: caddy:2
    container_name: caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - duplistatus_network

  duplistatus:
    # ... existing configuration
    networks:
      - duplistatus_network
```

## Environment Variables

You can customize the application using environment variables:

```yaml
services:
  duplistatus:
    # ... other configuration
    environment:
      - TZ=UTC
      - PORT=9666
      - NODE_ENV=production
```

## Next Steps

1. **Configure Duplicati servers** - See [Configuration Guide](configuration.md)
2. **Set up notifications** - See [User Guide - Notifications](../user-guide/notifications.md)
3. **Explore the dashboard** - See [User Guide - Overview](../user-guide/overview.md)

## Troubleshooting

### Container won't start
- Check Docker logs: `docker logs duplistatus`
- Verify port 9666 is not in use: `netstat -tulpn | grep 9666`
- Ensure Docker is running: `systemctl status docker`

### Can't access the web interface
- Verify the container is running: `docker ps`
- Check if the port is exposed: `docker port duplistatus`
- Try accessing `http://localhost:9666`

### Data persistence issues
- Check volume mount: `docker volume inspect duplistatus_data`
- Verify permissions on the host directory
- Check container logs for database errors
