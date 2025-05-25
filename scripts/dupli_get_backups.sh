#!/bin/bash

# --- Configuration ---
# Check if hostname parameter is provided
if [ $# -eq 0 ] || [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    echo "Usage: $0 <hostname>"
    echo "Example: $0 wsj-ser5"
    exit 1
fi

HOSTNAME="$1"
BASE_URL="http://${HOSTNAME}:8200"
LOGIN_ENDPOINT="/api/v1/auth/login"
API_SYSTEMINFO_ENDPOINT="/api/v1/systeminfo"
API_BACKUPS_ENDPOINT="/api/v1/backups"
API_LOG_BASE_ENDPOINT="/api/v1/backup"

PASSWORD="duplicati77" # IMPORTANT: Be cautious storing passwords directly in scripts.
                       # Consider environment variables or a secure vault for production use.
REMEMBER_ME="true" # Boolean as a string for JSON payload

COOKIE_FILE="my_session_cookies.txt"
AUTH_TOKEN="" # This will store the extracted token

# main script execution starts here

# clean up old json files
rm -f systeminfo.json backups.json backup_*message.json

# --- Step 1: Perform Login and Extract Token from Response ---
echo "Attempting to log in and get authentication token..."

# Construct JSON payload
LOGIN_PAYLOAD="{\"Password\": \"$PASSWORD\", \"RememberMe\": $REMEMBER_ME}"

# Perform POST request, save cookies, and capture the response
LOGIN_RESPONSE=$(curl -s -X POST \
                      -c "$COOKIE_FILE" \
                      -H "Content-Type: application/json" \
                      -d "$LOGIN_PAYLOAD" \
                      "${BASE_URL}${LOGIN_ENDPOINT}" \
                      -L) # Follow redirects

echo "Login response received: $LOGIN_RESPONSE"

# Check if login was successful and attempt to extract the token
# Assuming the login response contains the token directly, e.g., {"Token": "your_jwt_token"}
# If the token is nested, adjust the jq path accordingly (e.g., .data.Token)
AUTH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.AccessToken')

if [ -z "$AUTH_TOKEN" ] || [ "$AUTH_TOKEN" == "null" ]; then
    echo "Login failed or token not found in response!"
    echo "Full login response for debugging: $LOGIN_RESPONSE"
    rm -f "$COOKIE_FILE" # Clean up potentially empty or invalid cookie file
    exit 1
fi

echo "Login successful! Authentication Token received: $AUTH_TOKEN"

# --- Step 2: Call the /api/v1/systeminfo API using the extracted token ---
echo ""
echo "Calling API endpoint: ${BASE_URL}${API_SYSTEMINFO_ENDPOINT}"

API_RESPONSE=$(curl -s -X GET \
     -b "$COOKIE_FILE" \
     -H "Authorization: Bearer $AUTH_TOKEN" \
     -H "Accept: application/json" \
     "${BASE_URL}${API_SYSTEMINFO_ENDPOINT}")

# Print the API response
echo "API Response:"
echo "$API_RESPONSE" | jq -M > systeminfo.json

# --- Step 4: Get list of backups ---
echo ""
echo "Fetching list of backups..."

BACKUPS_RESPONSE=$(curl -s -X GET \
     -b "$COOKIE_FILE" \
     -H "Authorization: Bearer $AUTH_TOKEN" \
     -H "Accept: application/json" \
     "${BASE_URL}${API_BACKUPS_ENDPOINT}")

# Save backups response for debugging
echo "$BACKUPS_RESPONSE" | jq -M > backups.json

# Extract backup IDs using jq
BACKUP_IDS=$(echo "$BACKUPS_RESPONSE" | jq -r '.[].Backup.ID' 2>/dev/null)

if [ -z "$BACKUP_IDS" ]; then
    echo "No backups found or error fetching backups!"
    rm -f "$COOKIE_FILE"
    exit 1
fi

echo "Found backups with IDs: $BACKUP_IDS"

# --- Step 5: Get logs for each backup ---
for BACKUP_ID in $BACKUP_IDS; do
    echo ""
    echo "Fetching logs for backup ID: $BACKUP_ID"
    
    LOG_ENDPOINT="${API_LOG_BASE_ENDPOINT}/${BACKUP_ID}/log?pagesize=999"
    
    LOG_RESPONSE=$(curl -s -X GET \
         -b "$COOKIE_FILE" \
         -H "Authorization: Bearer $AUTH_TOKEN" \
         -H "Accept: application/json" \
         "${BASE_URL}${LOG_ENDPOINT}")
    
    # Save each backup's log to a separate file
    LOG_FILE="backup_${BACKUP_ID}_log.json"
    echo "$LOG_RESPONSE" > "$LOG_FILE"
    echo "Saved logs to $LOG_FILE"
    
    # First get all IDs, then process each message individually
    echo "$LOG_RESPONSE" | jq -r '.[] | select(.Message) | .ID' | while read -r ID; do
        if [ -n "$ID" ]; then
            # Extract just this specific message by ID and create the output structure
            MESSAGE=$(echo "$LOG_RESPONSE" | jq -r --arg id "$ID" '.[] | select(.ID == ($id | tonumber)) | .Message')
            if [ -n "$MESSAGE" ]; then
                MESSAGE_FILE="backup_${BACKUP_ID}_ID${ID}_message.json"
                # Get machine info from systeminfo.json
                MACHINE_ID=$(jq -r '.Options[] | select(.Name == "machine-id") | .DefaultValue // empty' systeminfo.json)
                MACHINE_NAME=$(jq -r '.MachineName' systeminfo.json)
                # Get backup info from the current backup entry
                BACKUP_NAME=$(jq -r --arg id "$BACKUP_ID" '.[] | select(.Backup.ID == $id ) | .Backup.Name' backups.json)
                # Get OperationName from the current message
                OPERATION_NAME=$(echo "$MESSAGE" | jq -r '.MainOperation // ""')
                # Create the new JSON structure
                jq -n --argjson data "$MESSAGE" --arg opName "$OPERATION_NAME" \
                    --arg machineName "$MACHINE_NAME" --arg machineId "$MACHINE_ID" \
                    --arg backupName "$BACKUP_NAME" --arg backupId "$BACKUP_ID" '
                {
                    "Data": $data,
                    "Extra": {
                        "OperationName": $opName,
                        "machine-name": $machineName,
                        "machine-id": $machineId,
                        "backup-name": $backupName,
                        "backup-id": $backupId
                    }
                }' > "$MESSAGE_FILE"
                echo "Saved message ID $ID to $MESSAGE_FILE"

                # Upload the message file to the server
                echo "    " $(curl -s http://pi-piro:9666/api/upload -H "Content-Type: application/json" -d @"$MESSAGE_FILE" | jq -c)
            fi
        fi
    done
done

# --- Clean up ---
echo -e "\nCleaning up cookie file: $COOKIE_FILE"
rm -f "$COOKIE_FILE"

echo -e "\nScript finished successfully."
