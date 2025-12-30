

# User Management 

Manage user accounts, permissions, and access control for **duplistatus**. This section allows administrators to create, modify, and delete user accounts.

![User Management](/img/screen-settings-users.png)

## Accessing User Management

You can access the User Management section in two ways:

1. **From the User Menu**: Click the user button in the [Application Toolbar](../overview.md#application-toolbar) and select "Admin Users" (administrators only)

   **Administrator User Menu:**

   ![User Menu - Admin](/img/screen-user-menu-admin.png)

   **Regular User Menu:**

   ![User Menu - User](/img/screen-user-menu-user.png)

2. **From Settings**: Navigate to [Settings → Users](overview.md#system) in the settings sidebar

> [!IMPORTANT]
> User management is only available to administrators. Non-admin users cannot access this section.

<br/>

## User List

The user list displays all registered users with the following information:

| Column | Description |
|:------|:-----------|
| **Username** | The login username for the account |
| **Admin** | Whether the user has administrator privileges |
| **Password Change Required** | Whether the user must change their password on next login |
| **Created** | When the account was created |
| **Last Login** | The most recent login time and IP address |
| **Status** | Account status (Active, Locked) |

### Searching and Sorting

- **Search**: Use the search box to filter users by username
- **Sorting**: Click column headers to sort by username, creation date, or last login
- **Pagination**: The list supports pagination for large numbers of users

<br/>

## Creating a New User

1. Click the <IconButton icon="lucide:plus" label="Add User"/> button
2. Enter the user details:
   - **Username**: Must be 3-50 characters, unique, case-insensitive
   - **Admin**: Check to grant administrator privileges
   - **Require Password Change**: Check to force password change on first login
   - **Password**: 
     - Option 1: Check "Auto-generate password" to create a secure temporary password
     - Option 2: Uncheck and enter a custom password
3. Click `Create User`

> [!NOTE]
> If a password is auto-generated, it will be displayed once after creation. Make sure to copy it immediately, as it cannot be retrieved later. The user will need to change it on first login if "Require Password Change" is enabled.

<br/>

## Editing a User

1. Click the <IconButton icon="lucide:edit" /> edit icon next to the user
2. Modify any of the following:
   - **Username**: Change the username (must be unique)
   - **Admin**: Toggle administrator privileges
   - **Require Password Change**: Toggle password change requirement
3. Click `Save Changes`

> [!IMPORTANT]
> You cannot edit your own account's admin status or username. This prevents accidentally locking yourself out of the system.

<br/>

## Resetting a User Password

1. Click the <IconButton icon="lucide:key-round" /> key icon next to the user
2. Confirm the password reset
3. A new temporary password will be generated and displayed
4. Copy the password and provide it to the user securely

> [!IMPORTANT]
> The temporary password is only shown once. Make sure to copy it immediately. The user will be required to change it on next login.

<br/>

## Deleting a User

1. Click the <IconButton icon="lucide:trash-2" /> delete icon next to the user
2. Confirm the deletion in the dialog box

> [!WARNING]
> User deletion is permanent and cannot be undone. All user sessions will be terminated immediately. The deletion action is logged to the audit log.

> [!IMPORTANT]
> You cannot delete your own account. This prevents accidentally locking yourself out of the system.

<br/>

## Available Actions

| Button | Description |
|:------|:-----------|
| <IconButton icon="lucide:plus" label="Add User"/> | Create a new user account |
| <IconButton icon="lucide:edit" /> | Edit user details (username, admin status, password change requirement) |
| <IconButton icon="lucide:key-round" /> | Reset user password (generates temporary password) |
| <IconButton icon="lucide:trash-2" /> | Delete user account |
| <IconButton icon="lucide:search" /> | Search users by username |

<br/>

## User Account Features

### Administrator Privileges

Administrators have access to:
- User management
- Audit log retention configuration
- Database maintenance operations
- All configuration settings

Non-admin users can:
- View audit logs (read-only)
- View most settings (read-only)
- Use test notification features
- Access the dashboard and backup information

### Password Requirements

- Minimum length: 8 characters
- Must contain at least one uppercase letter
- Must contain at least one lowercase letter
- Must contain at least one number
- Must contain at least one special character

### Account Lockout

Accounts are automatically locked after multiple failed login attempts:
- **Lockout Threshold**: 5 failed attempts
- **Lockout Duration**: 15 minutes
- Locked accounts cannot log in until the lockout period expires

> [!NOTE]
> Account lockout information is displayed in the user list. Administrators can see when an account is locked and when it will be unlocked.

<br/>

## Recovering Admin Access

If you've lost your admin password or been locked out of your account, you can recover access using the admin recovery script. See the [Admin Account Recovery](../admin-recovery.md) guide for detailed instructions on recovering administrator access in Docker environments.

<br/>

