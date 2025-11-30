

# Admin Account Recovery

Recover administrator access to **duplistatus** when you've lost your password or been locked out of your account. This guide covers using the admin recovery script in Docker environments.

<br/>

## Using the Script in Docker

The Dockerfile includes the `scripts` directory and a convenient shell wrapper.

```bash
# Execute inside the running container using the wrapper
docker exec -it duplistatus /app/admin-recovery <username> <new-password>
```

<br/>

**Example:**
```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

<br/>

## Password Requirements

When setting a new password, ensure it meets the following requirements:

- Minimum length: 8 characters
- Must contain at least one uppercase letter
- Must contain at least one lowercase letter
- Must contain at least one number
- Must contain at least one special character

> [!TIP]
> After recovering your admin account, consider changing your password through the [User Management Settings](settings/user-management-settings.md) interface. You can also enable password change requirements for other users to improve security.

<br/>

## Troubleshooting

If you encounter issues with the recovery script:

1. **Verify Container is Running**: Check that the container is running with `docker ps`
2. **Check Script Availability**: Verify the script exists in the container with `docker exec -it duplistatus ls -la /app/admin-recovery`
3. **Review Container Logs**: Check for errors with `docker logs duplistatus`
4. **Verify Username**: Ensure the username exists in the database
5. **Check Password Format**: Ensure the new password meets all requirements

If problems persist, see the [Troubleshooting](troubleshooting.md) guide for more help.

<br/>

> [!IMPORTANT]
> Keep your admin credentials secure. Store recovery passwords securely and change them after recovery. All password changes are logged to the audit log for security tracking.

