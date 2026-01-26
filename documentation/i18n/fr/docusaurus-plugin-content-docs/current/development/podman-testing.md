# Podman Testing {#podman-testing}

Copy and execute the scripts located at `scripts/podman_testing` on the Podman test server.

## Initial Setup and Management {#initial-setup-and-management}

1. `copy.docker.duplistatus.local`: Copies the Docker image from the local Docker daemon to Podman (for local testing).
2. `copy.docker.duplistatus.remote`: Copies the Docker image from a remote development server to Podman (requires SSH access).
   - Create the image on the development server using: `docker build . -t wsj-br/duplistatus:devel`
3. `start.duplistatus`: Starts the container in rootless mode.
4. `pod.testing`: Tests the container inside a Podman pod (with root privileges).
5. `stop.duplistatus`: Stops the pod and removes the container.
6. `clean.duplistatus`: Stops containers, removes pods, and cleans up old images.

## DNS Configuration {#dns-configuration}

The scripts automatically detect and configure DNS settings from the host system:

- **Automatic Detection**: Uses `resolvectl status` (systemd-resolved) to extract DNS servers and search domains
- **Fallback Support**: Falls back to parsing `/etc/resolv.conf` on non-systemd systems
- **Smart Filtering**: Automatically filters out localhost addresses and IPv6 nameservers
- **Works with**:
  - Tailscale MagicDNS (100.100.100.100)
  - Corporate DNS servers
  - Standard network configurations
  - Custom DNS setups

No manual DNS configuration is needed - the scripts handle it automatically!

## Monitoring and Health Checks {#monitoring-and-health-checks}

- `check.duplistatus`: Checks the logs, connectivity, and application health.

## Debugging Commands {#debugging-commands}

- `logs.duplistatus`: Shows the logs of the pod.
- `exec.shell.duplistatus`: Opens a shell in the container.
- `restart.duplistatus`: Stops the pod, removes the container, copies the image, creates the container, and starts the pod.

## Usage Workflow {#usage-workflow}

### Development Server {#development-server}

Create the Docker image on the development server:

```bash
docker build . -t wsj-br/duplistatus:devel
```

### Podman Server {#podman-server}

1. Transfer the Docker image:
   - Use `./copy.docker.duplistatus.local` if Docker and Podman are on the same machine
   - Use `./copy.docker.duplistatus.remote` if copying from a remote development server (requires `.env` file with `REMOTE_USER` and `REMOTE_HOST`)
2. Start the container with `./start.duplistatus` (standalone, rootless)
   - Or use `./pod.testing` to test in pod mode (with root)
3. Monitor with `./check.duplistatus` and `./logs.duplistatus`
4. Stop with `./stop.duplistatus` when done
5. Use `./restart.duplistatus` for a complete restart cycle (stop, copy image, start)
   - **Note**: This script currently references `copy.docker.duplistatus` which should be replaced with either `.local` or `.remote` variant
6. Use `./clean.duplistatus` to remove containers, pods, and old images

# Testing the Application {#testing-the-application}

If you are running the Podman server on the same machine, use `http://localhost:9666`.

If you are on another server, get the URL with:

```bash
echo "http://$(hostname -I | awk '{print $1}'):9666"
```

## Important Notes {#important-notes}

### Podman Pod Networking {#podman-pod-networking}

When running in Podman pods, the application requires:

- Explicit DNS configuration (automatically handled by `pod.testing` script)
- Port binding to all interfaces (`0.0.0.0:9666`)

The scripts handle these requirements automatically - no manual configuration needed.

### Rootless vs Root Mode {#rootless-vs-root-mode}

- **Standalone mode** (`start.duplistatus`): Runs rootless with `--userns=keep-id`
- **Pod mode** (`pod.testing`): Runs as root inside the pod for testing purposes

Both modes work correctly with the automatic DNS detection.

## Environment Configuration {#environment-configuration}

Both `copy.docker.duplistatus.local` and `copy.docker.duplistatus.remote` require a `.env` file in the `scripts/podman_testing` directory:

**For local copying** (`copy.docker.duplistatus.local`):

```
IMAGE=wsj-br/duplistatus:devel
```

**For remote copying** (`copy.docker.duplistatus.remote`):

```
IMAGE=wsj-br/duplistatus:devel
REMOTE_USER=your_username
REMOTE_HOST=your_hostname
```

The `start.duplistatus` script requires a `.env` file with at least the `IMAGE` variable:

```
IMAGE=wsj-br/duplistatus:devel
```

**Note**: The script's error message mentions `REMOTE_USER` and `REMOTE_HOST`, but these are not actually used by `start.duplistatus`—only `IMAGE` is required.
