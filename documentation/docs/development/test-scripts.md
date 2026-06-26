

# Test Scripts {#test-scripts}

The project includes several test scripts to help with development and testing:

> [!NOTE]
> Legacy repository-root `pnpm` helpers for overdue debugging, SMTP matrix testing, and cron port checks were removed. Use the application UI (**Settings → Backup monitoring**), authenticated HTTP APIs, and `curl` against the cron service as documented below.

## Generate Test Data {#generate-test-data}

```bash
pnpm generate-test-data --servers=N
```
This script generates test backup data for multiple servers and backups. 

The `--servers=N` parameter is **mandatory** and specifies the number of servers to generate (1-30).

Use the option `--upload` to send the generated data to the `/api/upload`

```bash
pnpm generate-test-data --servers=N --upload
```

**Examples:**
```bash
# Generate data for 5 servers
pnpm generate-test-data --servers=5

# Generate data for 1 server with upload mode
pnpm generate-test-data --upload --servers=1

# Generate data for all 30 servers
pnpm generate-test-data --servers=30
```

>[!CAUTION]
> This script deletes all previous data in the database and replaces it with test data.
> Back up your database before running this script.

## Overdue checks and cron connectivity (development) {#overdue-checks-and-cron-connectivity-development}

### Run an overdue backup check {#run-an-overdue-backup-check}

While the app is running:

- **UI (recommended):** open **Settings → Backup monitoring** and use **Test overdue backups**. That runs the same logic as the scheduled job via authenticated `POST /api/notifications/check-overdue`.

### Cron service health {#cron-service-health}

```bash
curl http://localhost:8667/health
curl http://localhost:8666/api/cron/health
```

### Simulating a specific date or time {#simulating-a-specific-date-or-time}

There is no bundled CLI for injecting a simulated “current” time. For the algorithm and manual testing ideas, see the repository file `dev/OVERDUE_DETECTION_ALGORITHM.md` and the implementation in `src/lib/overdue-backup-checker.ts`.

## Validate CSV export {#validate-csv-export}

```bash
pnpm validate-csv-export
```

This script validates the CSV export functionality. It:
- Tests CSV export generation
- Verifies data format and structure
- Checks for data integrity in exported files

Useful for ensuring CSV exports work correctly before releases.

## Temporarily block NTFY server (for testing) {#temporarily-block-ntfy-server-for-testing}

```bash
sudo ./scripts/temporary_ntfy.sh_block.sh
```

This script temporarily blocks outgoing network access to the NTFY server (`ntfy.sh`) to test the notification retry mechanism. It:
- Resolves the IP address of the NTFY server
- Adds an iptables rule to block outgoing traffic
- Blocks for 10 seconds (configurable)
- Automatically removes the block rule on exit
- Requires root privileges (sudo)

>[!CAUTION]
> This script modifies iptables rules and requires root privileges. Use only for testing notification retry mechanisms.

## Database Migration Testing {#database-migration-testing}

The project includes scripts to test database migrations from older versions to the current version. These scripts ensure that database migrations work correctly and preserve data integrity.

### Generate Migration Test Data {#generate-migration-test-data}

```bash
./scripts/generate-migration-test-data.sh
```

This script generates test databases for multiple historical versions of the application. It:

1. **Stops and removes** any existing Docker container
2. **For each version** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21):
   - Removes existing database files
   - Creates a version tag file
   - Starts a Docker container with the specific version
   - Waits for the container to be ready
   - Generates test data using `pnpm generate-test-data`
   - Takes a screenshot of the UI with test data
   - Stops and removes the container
   - Flushes WAL files and saves the database schema
   - Copies the database file to `scripts/migration_test_data/`

**Requirements:**
- Docker must be installed and configured
- Chromium (via Playwright) must be installed
- Root/sudo access for Docker operations
- The Docker volume `duplistatus_data` must exist

**Output:**
- Database files: `scripts/migration_test_data/backups_<VERSION>.db`
- Schema files: `scripts/migration_test_data/backups_<VERSION>.schema`
- Screenshots: `scripts/migration_test_data/duplistatus_test_data_<VERSION>.png`

**Configuration:**
- Number of servers: Set via `SERVERS` variable (default: 3)
- Data directory: `/var/lib/docker/volumes/duplistatus_data/_data`
- Port: 9666 (Docker container port)

>[!CAUTION]
> This script requires Docker and will stop/remove existing containers. It also requires sudo access for Docker operations and file system access. Run `pnpm take-screenshots:install` first to install the Playwright Chromium browser if you haven't already.

>[!IMPORTANT]
> This script was supposed to run only once, as new versions the developer can copy the database file and screenshots directly to the `scripts/migration_test_data/` directory. During development, just run the `./scripts/test-migrations.sh` script to test the migrations.

### Test Database Migrations {#test-database-migrations}

```bash
./scripts/test-migrations.sh
```

This script tests database migrations from old versions to the current version (4.0). It:

1. **For each version** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21):
   - Creates a temporary copy of the test database
   - Runs the migration process using `test-migration.ts`
   - Validates the migrated database structure
   - Checks for required tables and columns
   - Verifies the database version is 4.0
   - Cleans up temporary files

**Requirements:**
- Test databases must exist in `scripts/migration_test_data/`
- Generated by running `generate-migration-test-data.sh` first

**Output:**
- Color-coded test results (green for pass, red for fail)
- Summary of passed and failed versions
- Detailed error messages for failed migrations
- Exit code 0 if all tests pass, 1 if any fail

**What it validates:**
- Database version is 4.0 after migration
- All required tables exist: `servers`, `backups`, `configurations`, `users`, `sessions`, `audit_log`, `db_version`
- Required columns exist in each table
- Database structure is correct

**Example output:**
```
==========================================
Database Migration Test Suite
==========================================

Testing migrations from old versions to version 4.0
Test data directory: /path/to/migration_test_data
Temporary directory: /path/to/migration_test_data/.tmp

----------------------------------------
Testing version: v0.4.0
----------------------------------------
  Copying database file to temporary location...
  Running migration test...
✅ Version v0.4.0: Migration test PASSED

==========================================
Test Summary
==========================================

✅ Passed versions (5):
  ✓ v0.4.0
  ✓ v0.5.0
  ✓ v0.6.1
  ✓ 0.7.27
  ✓ 0.8.21

All migration tests passed!
```

**Usage:**
```bash
# Run all migration tests
./scripts/test-migrations.sh

# Check exit code
echo $?  # 0 = all passed, 1 = some failed
```

>[!NOTE]
> This script uses the TypeScript migration test script (`test-migration.ts`) internally. The test script validates the database structure after migration and ensures data integrity.

## SMTP and email (development) {#smtp-and-email-development}

Configure SMTP under **Settings → Email** and use the in-app email test and notification flows. The former `pnpm set-smtp-test-config` and `pnpm test-smtp-connections` helper scripts were removed from the repository.

## Test Docker Entrypoint Script {#test-docker-entrypoint-script}

```bash
pnpm test-entrypoint
```

This script provides a test wrapper for `docker-entrypoint.sh` in local development. It sets up the environment to test the entrypoint logging functionality and ensures logs are written to `data/logs/` so the application can access them.

**What it does:**

1. **Always builds a fresh version**: Automatically runs `pnpm build-local` to create a fresh build before testing (no need to manually build first)
2. **Builds cron service**: Ensures the cron service is built (`dist/cron-service.cjs`)
3. **Sets up Docker-like structure**: Creates necessary symlinks and directory structure to mimic the Docker environment
4. **Runs entrypoint script**: Executes `docker-entrypoint.sh` with proper environment variables
5. **Cleans up**: Automatically removes temporary files on exit

**Usage:**
```bash
# Run the test (builds fresh version automatically)
pnpm test-entrypoint
```

**Environment Variables:**
- `PORT=8666` - Port for the Next.js server (matches `start-local`)
- `CRON_PORT=8667` - Port for the cron service
- `VERSION` - Automatically set to `test-YYYYMMDD-HHMMSS` format

**Output:**
- Logs are written to `data/logs/application.log` (accessible by the application)
- Console output shows the entrypoint script execution
- Press Ctrl+C to stop and test log flushing

**Requirements:**
- Script must be run from the repository root directory (pnpm handles this automatically)
- The script automatically handles all prerequisites (build, cron service, etc.)

**Use Cases:**
- Testing entrypoint script changes locally before Docker deployment
- Verifying log rotation and logging functionality
- Testing graceful shutdown and signal handling
- Debugging entrypoint script behavior in a local environment


