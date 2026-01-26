

# Test Scripts {#test-scripts}

The project includes several test scripts to help with development and testing:

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
# Generate data for 5 servers {#generate-data-for-5-servers}
pnpm generate-test-data --servers=5

# Generate data for 1 server with upload mode {#generate-data-for-1-server-with-upload-mode}
pnpm generate-test-data --upload --servers=1

# Generate data for all 30 servers {#generate-data-for-all-30-servers}
pnpm generate-test-data --servers=30
```

>[!CAUTION]
> This script deletes all previous data in the database and replaces it with test data.
> Back up your database before running this script.

## Show the overdue notifications contents (to debug notification system) {#show-the-overdue-notifications-contents-to-debug-notification-system}

```bash
pnpm show-overdue-notifications
```

## Run overdue-check at a specific date/time (to debug notification system) {#run-overdue-check-at-a-specific-datetime-to-debug-notification-system}

```bash
pnpm run-overdue-check "YYYY-MM-DD HH:MM:SS"
``` 

## Test cron service port connectivity {#test-cron-service-port-connectivity}

To test cron service connectivity, you can:

1. Check if the cron service is running:
```bash
curl http://localhost:8667/health
```

2. Or use the cron service API endpoints directly through the main application:
```bash
curl http://localhost:8666/api/cron/health
```

3. Use the test script to verify port connectivity:
```bash
pnpm test-cron-port
```

This script tests the connectivity to the cron service port and provides detailed information about the connection status.

## Test overdue detection {#test-overdue-detection}

```bash
pnpm test-overdue-detection
```

This script tests the overdue backup detection logic. It verifies:
- Overdue backup identification
- Notification triggering
- Date/time calculations for overdue status

Useful for debugging overdue backup detection and notification systems.

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
- Google Chrome (via Puppeteer) must be installed
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
> This script requires Docker and will stop/remove existing containers. It also requires sudo access for Docker operations and file system access. Need to run the `pnpm take-screenshots` script first to install Google Chrome if you haven't already.

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
# Run all migration tests {#run-all-migration-tests}
./scripts/test-migrations.sh

# Check exit code {#check-exit-code}
echo $?  # 0 = all passed, 1 = some failed
```

>[!NOTE]
> This script uses the TypeScript migration test script (`test-migration.ts`) internally. The test script validates the database structure after migration and ensures data integrity.

## Set SMTP Test Configuration {#set-smtp-test-configuration}

```bash
pnpm set-smtp-test-config <connectionType>
```

This script sets SMTP test configuration from environment variables. It accepts a `connectionType` parameter (`plain`, `starttls`, or `ssl`) and reads corresponding environment variables with prefixes (`PLAIN_`, `STARTTLS_`, `SSL_`) to update the SMTP configuration in the database.

For plain connections, the script reads `PLAIN_SMTP_FROM` environment variable to set the required From Address. This facilitates testing different SMTP connection types without manual database updates.

**Usage:**
```bash
# Set Plain SMTP configuration {#set-plain-smtp-configuration}
PLAIN_SMTP_HOST=smtp.example.com \
PLAIN_SMTP_PORT=25 \
PLAIN_SMTP_FROM=noreply@example.com \
pnpm set-smtp-test-config plain

# Set STARTTLS configuration {#set-starttls-configuration}
STARTTLS_SMTP_HOST=smtp.example.com \
STARTTLS_SMTP_PORT=587 \
STARTTLS_SMTP_USERNAME=user@example.com \
STARTTLS_SMTP_PASSWORD=password \
pnpm set-smtp-test-config starttls

# Set Direct SSL/TLS configuration {#set-direct-ssltls-configuration}
SSL_SMTP_HOST=smtp.example.com \
SSL_SMTP_PORT=465 \
SSL_SMTP_USERNAME=user@example.com \
SSL_SMTP_PASSWORD=password \
pnpm set-smtp-test-config ssl
```

**Requirements:**
- The application must be running
- Environment variables must be set with the appropriate prefix for the connection type
- For plain connections, `PLAIN_SMTP_FROM` is required

## Test SMTP Connection Type Cross-Compatibility {#test-smtp-connection-type-cross-compatibility}

```bash
pnpm test-smtp-connections
```

This script performs a comprehensive 3x3 matrix test that validates whether configurations meant for one connection type work correctly with different connection types. For each base configuration type (plain, starttls, ssl), the script:

1. Reads environment variables with corresponding prefixes (`PLAIN_*`, `STARTTLS_*`, `SSL_*`)
2. Tests all three connection types by modifying only the `connectionType` field
3. Sends test emails via the API
4. Records results in a matrix format
5. Displays a summary table
6. Saves detailed results to `smtp-test-results.json`

**Usage:**
```bash
# Set environment variables for all three connection types {#set-environment-variables-for-all-three-connection-types}
PLAIN_SMTP_HOST=smtp.example.com \
PLAIN_SMTP_PORT=25 \
PLAIN_SMTP_FROM=noreply@example.com \
STARTTLS_SMTP_HOST=smtp.example.com \
STARTTLS_SMTP_PORT=587 \
STARTTLS_SMTP_USERNAME=user@example.com \
STARTTLS_SMTP_PASSWORD=password \
SSL_SMTP_HOST=smtp.example.com \
SSL_SMTP_PORT=465 \
SSL_SMTP_USERNAME=user@example.com \
SSL_SMTP_PASSWORD=password \
pnpm test-smtp-connections
```

**Requirements:**
- The application must be running
- Environment variables must be set for all three connection types
- The script validates the configuration being used through detailed logging

**Expected Behavior:**
Configurations should only work with their intended connection type (e.g., plain config works with plain connectionType but fails with starttls/ssl).

**Output:**
- Console output with a summary table showing test results
- `smtp-test-results.json` file with detailed test results for each configuration and connection type combination

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
# Run the test (builds fresh version automatically) {#run-the-test-builds-fresh-version-automatically}
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


