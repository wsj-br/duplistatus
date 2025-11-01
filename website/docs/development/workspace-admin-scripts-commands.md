

# Workspace Admin Scripts & Commands

## Clean Database

```bash
./scripts/clean-db.sh
```
Cleans the database by removing all data while preserving the database schema and structure.

>[!CAUTION]
> Use with caution as this will delete all existing data.

## Clean build artefacts and dependencies

```bash
scripts/clean-workspace.sh
```
Removes all build artefacts, node_modules directory, and other generated files to ensure a clean state. This is useful when you need to perform a fresh installation or resolve dependency issues. The command will delete:
- `node_modules/` directory
- `.next/` build directory
- `dist/` directory
- All Docker build cache and perform a Docker system prune
- pnpm store cache
- Unused Docker system resources (images, networks, volumes)
- Any other build cache files

## Clean Docker Compose and Docker environment

```bash
scripts/clean-docker.sh
```
Perform a complete Docker cleanup, which is useful for:
- Freeing up disk space
- Removing old/unused Docker artefacts
- Cleaning up after development or testing sessions
- Maintaining a clean Docker environment

## Generate the logo/favicon and banner from SVG images

```bash
scripts/convert_svg_logo.sh
```

> The SVG files are located in the `docs/img` folder. This script requires ImageMagick to be installed on your system.

## Update the packages to the latest version

```bash
ncu --upgrade
pnpm update
```

## Check for unused packages

```bash
pnpm depcheck
```

## Update version information

```bash
./scripts/update-version.sh
```

This script automatically updates the `.env` file with the current version from `package.json`. It:
- Extracts the version from `package.json`
- Creates or updates the `.env` file with the `VERSION` variable
- Only updates if the version has changed
- Provides feedback on the operation

## Viewing the configurations in the database

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

## SQL Scripts for Debugging and Maintenance

The project includes SQL scripts for database maintenance:

### Delete Backup Settings

```bash
sqlite3 data/backups.db < scripts/delete-backup-settings.sql
```
This script removes all backup settings from the configurations table. Use with caution as this will reset all backup notification configurations.

### Delete Last Backup

```bash
sqlite3 data/backups.db < scripts/delete-last-backup.sql
```
This script removes the most recent backup record for each server. By default, it deletes the last backup for ALL servers. The script includes commented examples for targeting specific servers by name. Useful for testing and debugging purposes.

**Note**: The script has been updated to work with the current database schema (uses `servers` table and `server_id` column).

>[!CAUTION]
> These SQL scripts directly modify the database. Always backup your database before running these scripts.
