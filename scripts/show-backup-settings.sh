#!/bin/bash

# Script to show the contents of backup_settings value in the configurations table
# Usage: ./show-backup-settings.sh [database_path]

set -e

# Default database path
DB_PATH="${1:-data/backups.db}"

# Check if database file exists
if [ ! -f "$DB_PATH" ]; then
    echo "Error: Database file not found: $DB_PATH" >&2
    echo "Usage: $0 [database_path]" >&2
    echo "Default path: data/backups.db" >&2
    exit 1
fi

# Check if sqlite3 is available
if ! command -v sqlite3 &> /dev/null; then
    echo "Error: sqlite3 command not found. Please install sqlite3." >&2
    exit 1
fi

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo "Error: jq command not found. Please install jq." >&2
    exit 1
fi

# Query the backup_settings value
VALUE=$(sqlite3 "$DB_PATH" "SELECT value FROM configurations WHERE key = 'backup_settings';" 2>/dev/null)

# Check if value exists
if [ -z "$VALUE" ]; then
    echo "No backup_settings found in configurations table."
    exit 0
fi

# Check if value is empty
if [ "$VALUE" = "" ]; then
    echo "backup_settings exists but is empty."
    exit 0
fi

# Parse JSON and validate
if ! echo "$VALUE" | jq empty 2>/dev/null; then
    echo "Error: backup_settings contains invalid JSON." >&2
    exit 1
fi

# Check if JSON object is empty
ENTRY_COUNT=$(echo "$VALUE" | jq 'if type == "object" then length else 0 end')
if [ "$ENTRY_COUNT" -eq 0 ]; then
    echo "backup_settings is empty or contains no entries."
    exit 0
fi

# Extract data with jq (remove allowedWeekDays, output as TSV)
# Use simple extraction - let awk handle the formatting
echo "$VALUE" | jq -r '
  # Helper function for string fields: return "-" if missing, "" if null/empty, otherwise value
  def string_field_or_dash(field_name):
    if has(field_name) then
      if .[field_name] == null or .[field_name] == "" then "" 
      elif (.[field_name] | type) == "string" then .[field_name]
      else (.[field_name] | tostring)
      end
    else
      "-"
    end;
  
  # Helper function for boolean fields: return "-" if missing, otherwise value as string
  def bool_field_or_dash(field_name):
    if has(field_name) then
      (.[field_name] // false) | tostring
    else
      "-"
    end;
  
  to_entries | 
  map(
    .key as $key |
    (.value // {}) as $val |
    # Extract fields, handling missing/null values
    [
      $key,
      ($val | string_field_or_dash("notificationEvent")),
      ($val | string_field_or_dash("expectedInterval")),
      ($val | bool_field_or_dash("overdueBackupCheckEnabled")),
      ($val | string_field_or_dash("time")),
      ($val | string_field_or_dash("lastBackupDate")),
      ($val | bool_field_or_dash("ntfyEnabled")),
      ($val | bool_field_or_dash("emailEnabled")),
      ($val | string_field_or_dash("additionalNotificationEvent")),
      ($val | string_field_or_dash("additionalEmails")),
      ($val | string_field_or_dash("additionalNtfyTopic"))
    ] | @tsv
  ) | 
  .[]
' | awk -F'\t' '
BEGIN {
    # Column widths
    w[1] = 50   # server_id:backup_name
    w[2] = 20   # notificationEvent
    w[3] = 15   # expectedInterval
    w[4] = 8    # overdueBackupCheckEnabled
    w[5] = 25   # time
    w[6] = 25   # lastBackupDate
    w[7] = 6    # ntfyEnabled
    w[8] = 6    # emailEnabled
    w[9] = 25   # additionalNotificationEvent
    w[10] = 30  # additionalEmails
    w[11] = 25  # additionalNtfyTopic
    
    # Print header
    printf "%-*s  %-*s  %-*s  %-*s  %-*s  %-*s  %-*s  %-*s  %-*s  %-*s  %-*s\n",
        w[1], "server_id:backup_name",
        w[2], "notificationEvent",
        w[3], "expectedInterval",
        w[4], "overdue",
        w[5], "time",
        w[6], "lastBackupDate",
        w[7], "ntfy",
        w[8], "email",
        w[9], "addlEvent",
        w[10], "additionalEmails",
        w[11], "additionalNtfyTopic"
    
    # Print separator
    for (i = 1; i <= 11; i++) {
        s = ""
        for (j = 1; j <= w[i]; j++) s = s "-"
        sep = sep s
        if (i < 11) sep = sep "  "
    }
    print sep
}
{
    # Ensure we have exactly 11 fields (pad with empty strings if needed)
    for (i = 1; i <= 11; i++) {
        if (length($i) == 0) $i = ""
        # Truncate if too long
        if (length($i) > w[i]) $i = substr($i, 1, w[i])
    }
    
    # Print row
    printf "%-*s  %-*s  %-*s  %-*s  %-*s  %-*s  %-*s  %-*s  %-*s  %-*s  %-*s\n",
        w[1], $1,
        w[2], $2,
        w[3], $3,
        w[4], $4,
        w[5], $5,
        w[6], $6,
        w[7], $7,
        w[8], $8,
        w[9], $9,
        w[10], $10,
        w[11], $11
}
'