# Admin Recovery Script - Docker Usage Guide

## Overview

The `admin-recovery.ts` script cannot be easily converted to bash because it:
- Uses `bcrypt` for password hashing (requires Node.js)
- Imports password validation logic from the codebase
- Requires TypeScript runtime (`tsx`)

## Using the Script in Docker

### Option 1: Using the Wrapper Script (Recommended)

The Dockerfile has been updated to include the `scripts` directory and a convenient shell wrapper. After rebuilding your container, you can use:

```bash
# Execute inside the running container using the wrapper
docker exec -it duplistatus /app/admin-recovery <username> <new-password>
```

Example:
```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

**Note:** The wrapper script (`/app/admin-recovery`) is a simple shell script that calls the TypeScript script with `tsx`. The `scripts` directory is copied to `/app/scripts` and `tsx` is available from the builder's `node_modules` (which includes devDependencies).

You can also use the script directly if preferred:
```bash
docker exec -it duplistatus tsx /app/scripts/admin-recovery.ts <username> <new-password>
```

### Option 2: Copy Script into Running Container (Quick Fix)

If you need to use it immediately without rebuilding:

```bash
# Copy the script into the container
docker cp scripts/admin-recovery.ts duplistatus:/tmp/admin-recovery.ts

# Copy the src/lib directory (needed for imports)
docker cp src/lib duplistatus:/tmp/src/lib

# Execute (you may need to install tsx first or use node with ts-node)
docker exec -it duplistatus sh -c "cd /tmp && npx tsx admin-recovery.ts <username> <new-password>"
```

### Option 3: Use Docker Exec with Direct SQLite Access (Alternative)

If you need a quick workaround without the script, you can manually update the database:

```bash
# Access the container
docker exec -it duplistatus sh

# Inside the container, you'll need to:
# 1. Generate a bcrypt hash (requires Node.js)
# 2. Update the database directly
```

However, this is not recommended as it bypasses password validation.

### Option 4: Create Standalone Script (Best for Distribution)

Create a standalone version that bundles all dependencies. This would require:
- Bundling the password validation logic
- Ensuring bcrypt is available
- Making it executable without imports

## Recommended Solution

The Dockerfile has been **updated** to include the scripts directory. The recovery tool is now always available in the container after rebuilding.

### Rebuilding the Container

After pulling the updated code:

```bash
# If using docker-compose
docker compose build
docker compose up -d

# If using docker directly
docker build -t wsjbr/duplistatus:latest .
```

### Usage

Once the container is running with the updated image, use the wrapper script:

```bash
docker exec -it duplistatus /app/admin-recovery <username> <new-password>
```

Example:
```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

