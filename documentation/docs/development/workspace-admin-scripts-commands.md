

# Workspace Admin Scripts & Commands {#workspace-admin-scripts-commands}

## Clean Database {#clean-database}

```bash
./scripts/clean-db.sh
```
Cleans the database by removing all data while preserving the database schema and structure.

>[!CAUTION]
> Use with caution as this will delete all existing data.

## Clean build artefacts and dependencies {#clean-build-artefacts-and-dependencies}

```bash
scripts/clean-workspace.sh
```
Removes all build artefacts, node_modules directory, and other generated files to ensure a clean state. This is useful when you need to perform a fresh installation or resolve dependency issues. The command will delete:
- `node_modules/` directory
- `.next/` build directory
- `dist/` directory
- `out/` directory
- `.turbo/` directory
- `pnpm-lock.yaml`
- `data/*.json` (development JSON backup files)
- `public/documentation`
- `documentation/.docusaurus`, `.cache`, `.cache-*`, `build`, `node_modules`, `pnpm-lock.yaml`
- `.genkit/` directory
- `*.tsbuildinfo` files
- pnpm store cache (via `pnpm store prune`)
- Docker build cache and system prune (images, networks, volumes)

## Clean Docker Compose and Docker environment {#clean-docker-compose-and-docker-environment}

```bash
scripts/clean-docker.sh
```
Perform a complete Docker cleanup, which is useful for:
- Freeing up disk space
- Removing old/unused Docker artefacts
- Cleaning up after development or testing sessions
- Maintaining a clean Docker environment

## Update the packages to the latest version {#update-the-packages-to-the-latest-version}

You can update packages manually using:
```bash
ncu --upgrade
pnpm update
```

Or use the automated script:
```bash
./scripts/upgrade-dependencies.sh
```

The `upgrade-dependencies.sh` script automates the entire dependency upgrade process:
- Updates `package.json` with latest versions using `npm-check-updates`
- Updates the pnpm lockfile and installs updated dependencies
- Updates the browserslist database
- Checks for vulnerabilities using `pnpm audit`
- Automatically fixes vulnerabilities using `pnpm audit fix`
- Re-checks for vulnerabilities after fixing to verify the fixes

This script provides a complete workflow for keeping dependencies up to date and secure.

## Check for unused packages {#check-for-unused-packages}

```bash
pnpm depcheck
```

## Update version information {#update-version-information}

```bash
./scripts/update-version.sh
```

This script automatically updates version information across multiple files to keep them synchronized. It:
- Extracts the version from `package.json`
- Updates the `.env` file with the `VERSION` variable (creates it if it doesn't exist)
- Updates the `Dockerfile` with the `VERSION` variable (if it exists)
- Updates the `documentation/package.json` version field (if it exists)
- Only updates if the version has changed
- Provides feedback on each operation

## Pre-checks script {#pre-checks-script}

```bash
./scripts/pre-checks.sh
```

This script runs pre-checks before starting the development server, building, or starting the production server. It:
- Ensures the `.duplistatus.key` file exists (via `ensure-key-file.sh`)
- Updates the version information (via `update-version.sh`)

This script is automatically called by `pnpm dev`, `pnpm build`, and `pnpm start-local`.

## Ensure key file exists {#ensure-key-file-exists}

```bash
./scripts/ensure-key-file.sh
```

This script ensures the `.duplistatus.key` file exists in the `data` directory. It:
- Creates the `data` directory if it doesn't exist
- Generates a new 32-byte random key file if missing
- Sets file permissions to 0400 (read-only for owner)
- Fixes permissions if they are incorrect

The key file is used for cryptographic operations in the application.

## Admin account recovery {#admin-account-recovery}

```bash
./admin-recovery <username> <new-password>
```

This script allows recovery of admin accounts if locked out or password forgotten. It:
- Resets the password for the specified user
- Unlocks the account if it was locked
- Resets failed login attempts counter
- Clears the "must change password" flag
- Validates password meets security requirements
- Logs the action to the audit log

**Example:**
```bash
./admin-recovery admin NewPassword123
```

>[!CAUTION]
> This script directly modifies the database. Use only when necessary for account recovery.

## Copy images {#copy-images}

```bash
./scripts/copy-images.sh
```

Copies image files from `documentation/static/img` to their appropriate locations in the application:
- Copies `favicon.ico` to `src/app/`
- Copies `duplistatus_logo.png` to `public/images/`
- Copies `duplistatus_banner.png` to `public/images/`

Useful for keeping application images synchronized with documentation images.

## Compare versions between development and Docker {#compare-versions-between-development-and-docker}

```bash
./scripts/compare-versions.sh
```

This script compares versions between your development environment and a running Docker container. It:
- Compares SQLite versions by major version only (e.g., 3.45.1 vs 3.51.1 are considered compatible, shown as "✅ (major)")
- Compares Node, npm, and Duplistatus versions exactly (must match exactly)
- Displays a formatted table showing all version comparisons
- Provides a summary with color-coded results (✅ for matches, ❌ for mismatches)
- Exits with code 0 if all versions match, 1 if there are mismatches

**Requirements:**
- Docker container named `duplistatus` must be running
- The script reads version information from Docker container logs

**Example output:**
```
┌─────────────────────────┬──────────────────────────────┬──────────────────────────────┬──────────────┐
│ Component               │ Development                  │ Docker                       │   Match      │
├─────────────────────────┼──────────────────────────────┼──────────────────────────────┼──────────────┤
│ SQLite                  │ 3.45.1                       │ 3.51.1                       │ ✅ (major)   │
│ Node                    │ 24.12.0                      │ 24.12.0                      │ ✅           │
│ npm                     │ 10.9.2                       │ 10.9.2                       │ ✅           │
│ Duplistatus             │ 1.2.1                        │ 1.2.1                        │ ✅           │
└─────────────────────────┴──────────────────────────────┴──────────────────────────────┴──────────────┘
```

**Note:** SQLite versions are compared by major version only because different patch versions within the same major version are generally compatible. The script will indicate if SQLite versions match at the major level but differ in patch versions.

## Viewing the configurations in the database {#viewing-the-configurations-in-the-database}

```bash
sqlite3 data/backups.db "SELECT key, value FROM configurations;" | awk -F'|' '
  {print "\n" $1 ": "; 
   if(index($2,"{")>0) {print $2 |"jq -C ."; close("jq -C .")} 
   else {print $2;}}' | less -R
```

```bash
sqlite3 /var/lib/docker/volumes/duplistatus_data/_data/backups.db "SELECT key, value FROM configurations;" | awk -F'|' '
  {print "\n" $1 ": "; 
   if(index($2,"{")>0) {print $2 |"jq -C ."; close("jq -C .")} 
   else {print $2;}}' | less -R
```

## Show backup settings {#show-backup-settings}

```bash
./scripts/show-backup-settings.sh [database_path]
```

Displays the contents of the `backup_settings` value in the configurations table in a formatted table. Useful for debugging notification configurations. Default database path: `data/backups.db`.
