

# Test Scripts

The project includes several test scripts to help with development and testing:

## Generate Test Data

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
> This script delete all the previous data in the database and replace it with the test data.
> Backup your database before running this script.

## Show the overdue notifications contents (to debug notification system)

```bash
pnpm show-overdue-notifications
```

## Run overdue-check at a specific date/time (to debug notification system)

```bash
pnpm run-overdue-check "YYYY-MM-DD HH:MM:SS"
``` 

## Test cron service port connectivity

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

## Test password utilities

```bash
tsx scripts/test-password.ts
```

This script tests the password utility functions used by the authentication system. It verifies:
- Password validation (length, complexity requirements)
- Password hashing (bcrypt with salt)
- Password verification
- Secure password generation

Useful for debugging password-related authentication issues.

## Temporarily block NTFY server (for testing)

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
