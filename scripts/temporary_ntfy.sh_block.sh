#!/bin/bash

# This script temporarily blocks outgoing network access to a NTFY server to test 
# the notifications retry mechanism.

# It requires root privileges to modify iptables rules.

# --- Configuration ---
TARGET_HOST="ntfy.sh"
BLOCK_DURATION=10 # in seconds

# --- Script Logic ---

# Resolve the IP address of the target host.
# We take the first A record found.
echo "🔍 Resolving IP address for ${TARGET_HOST}..."
IP_ADDRESS=$(dig +short "${TARGET_HOST}" A | head -n 1)

if [ -z "${IP_ADDRESS}" ]; then
  echo "❌ Error: Could not resolve IP address for ${TARGET_HOST}. Please check your DNS settings and network connection." >&2
  exit 1
fi

echo "✅ Found IP address: ${IP_ADDRESS}"
echo ""

# Function to clean up the iptables rule on exit
cleanup() {
  echo ""
  echo "🧹 Cleaning up iptables rule..."
  # The '-C' check prevents an error message if the rule was already removed.
  if sudo iptables -C OUTPUT -d "${IP_ADDRESS}" -j DROP &> /dev/null; then
    sudo iptables -D OUTPUT -d "${IP_ADDRESS}" -j DROP
    echo "🗑️ Rule for ${IP_ADDRESS} removed."
  else
    echo "ℹ️ Rule was not found. No cleanup needed."
  fi
}

# Trap the EXIT signal to ensure cleanup runs even if the script is interrupted
trap cleanup EXIT

# Add the iptables rule to block outgoing traffic to the IP
echo "🚫 Blocking all outgoing traffic to ${TARGET_HOST} (${IP_ADDRESS}) for ${BLOCK_DURATION} seconds..."
sudo iptables -A OUTPUT -d "${IP_ADDRESS}" -j DROP

echo ""

# Wait for the specified duration
# Loop from the total duration down to 1
for ((i=$BLOCK_DURATION; i>0; i--))
do
  # Print the remaining time on the same line using the '\r' carriage return
  echo -ne "⏱️ Remaining time: $i seconds... \r"
  # Pause for one second
  sleep 1
done


echo -ne "\r\033[2K"
echo ""
echo "✅ Block duration finished."

# The cleanup function will automatically be called here when the script exits.
exit 0

