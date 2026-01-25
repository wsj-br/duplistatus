# Most used commands

## Run in dev mode

```bash
pnpm dev
```

- **JSON File Storage**: All received backup data is stored as JSON files in the `data` directory. These files are named using the timestamp of when they were received, in the format `YYYY-MM-DDTHH-mm-ss-sssZ.json` (UTC time). This feature is only active in development mode and helps with debugging by preserving the raw data received from Duplicati.

- **Verbose Logging**: The application logs more detailed information about database operations and API requests when running in development mode.

- **Version Update**: The development server automatically updates the version information before starting, ensuring the latest version is displayed in the application.

- **Backup Deletion**: On the server detail page, a delete button appears in the backups table that allows you to delete individual backups. This feature is especially useful for testing and debugging the overdue backups functionality.

## Start the production server (in development environment)

First, build the application for local production:

```bash
pnpm build-local
```

Then start the production server:

```bash
pnpm start-local
```

## Start a Docker stack (Docker Compose)

```bash
pnpm docker-up
```

Or manually:

```bash
docker compose up --build -d
```

## Stop a Docker stack (Docker Compose)

```bash
pnpm docker-down
```

Or manually:

```bash
docker compose down
```

## Clean Docker environment

```bash
pnpm docker-clean
```

Or manually:

```bash
./scripts/clean-docker.sh
```

This script performs a complete Docker cleanup, which is useful for:

- Freeing up disk space
- Removing old/unused Docker artefacts
- Cleaning up after development or testing sessions
- Maintaining a clean Docker environment

## Create a development image (to test locally or with Podman)

```bash
export $(grep -v '^#' .env | xargs) && docker build . -t wsj-br/duplistatus:devel-$VERSION
```
