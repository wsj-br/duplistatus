

# Admin Account Recovery {#admin-account-recovery}

Recover administrator access to **duplistatus** when you've lost your password or been locked out of your account. This guide covers using the admin recovery script in Docker environments.

If the browser shows **Access denied** (HTTP 403) before the login form, the [admin IP allowlist](settings/ip-allowlist-settings.md) is blocking the request. Use [Locked Out by IP Allowlist](troubleshooting.md#locked-out-by-ip-allowlist) instead of this script.



## Using the Script in Docker {#using-the-script-in-docker}

The Dockerfile includes the `scripts` directory and a convenient shell wrapper.

```bash
# Execute inside the running container using the wrapper
docker exec -it duplistatus /app/admin-recovery <username> <new-password>
```



**Example:**
```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```



## Troubleshooting {#troubleshooting}

If you encounter issues with the recovery script:

1. **Verify Container is Running**: Check that the container is running with `docker ps`
2. **Check Script Availability**: Verify the script exists in the container with `docker exec -it duplistatus ls -la /app/admin-recovery`
3. **Review Container Logs**: Check for errors with `docker logs duplistatus`
4. **Verify Username**: Ensure the username exists in the database
5. **Check Password Format**: Ensure the new password meets all requirements

If problems persist, see the [Troubleshooting](troubleshooting.md) guide for more help.

