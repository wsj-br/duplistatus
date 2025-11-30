

# Email 

**duplistatus** supports sending email notifications via SMTP as an alternative or complement to NTFY notifications. Email configuration is now managed through the web interface with encrypted storage in the database for enhanced security.

![Email Configuration](/img/screen-settings-email.png)

| Setting                 | Description                                                      |
|:------------------------|:-----------------------------------------------------------------|
| **SMTP Server Host**    | Your email provider's SMTP server (e.g., `smtp.gmail.com`).      |
| **SMTP Server Port**    | Port number (typically `587` for STARTTLS or `465` for SSL/TLS). |
| **SMTP ServerUsername** | Your email address or username.                                  |
| **SMTP ServerPassword** | Your email password or app-specific password.                    |
| **Recipient Email**     | The email address to receive notifications.                      |
| **Connection Security** | Toggle for SSL/TLS vs STARTTLS encryption.                       |

<br/>

> [!IMPORTANT]
> For security reasons, the current password is not displayed in the user interface. 
>
> You can only set a new password or re-enter the existing one if desired.


<br/>

## Available Actions

| Button                                                           | Description                                              |
|:-----------------------------------------------------------------|:---------------------------------------------------------|
| <IconButton label="Save Settings" />                             | Save the changes made to the NTFY settings.              |
| <IconButton icon="lucide:mail" label="Send Test Email"/>         | Sends a test email message using the SMTP configuration. |
| <IconButton icon="lucide:trash-2" label="Delete SMTP Settings"/> | Delete / Clear the SMTP configuration.                   |
    

<br/>

> [!NOTE]
> A <IIcon2 icon="lucide:mail" color="green"/> green icon next to `Email` in the tab bar means your settings are valid. If the icon is <IIcon2 icon="lucide:mail" color="yellow"/> yellow, your settings are not valid or not configured.
> 
> When the configuration is not fully configured, the Email checkboxes in the [`Backup Notifications`](backup-notifications-settings.md) tab will also be greyed out.

> [!IMPORTANT]
>   You must use the <IconButton icon="lucide:mail" label="Send Test Email"/> button to make sure your email setup works before relying on it for notifications.
>
> Even if you see a green <IIcon2 icon="lucide:mail" color="green"/> icon and everything looks configured, emails may not be sent.
> 
> `duplistatus` only checks if your SMTP settings are filled in, not if emails can actually be delivered.

<br/>

## Common SMTP Providers

**Gmail:**

- Host: `smtp.gmail.com`
- Port: `587` (STARTTLS) or `465` (SSL/TLS)
- Username: Your Gmail address
- Password: Use an App Password (not your regular password)
- Secure: `false` for port 587, `true` for port 465

**Outlook/Hotmail:**

- Host: `smtp-mail.outlook.com`
- Port: `587`
- Username: Your Outlook email address
- Password: Your account password
- Secure: `false` (STARTTLS)

**Yahoo Mail:**

- Host: `smtp.mail.yahoo.com`
- Port: `587`
- Username: Your Yahoo email address
- Password: Use an App Password
- Secure: `false` (STARTTLS)

<br/>

> [!TIP]
> **Security Best Practices:**
>
> - For Gmail and Yahoo, use App Passwords instead of your regular account password
> - Consider using a dedicated email account for notifications
> - Test your configuration using the "Send Test Email" button
> - Settings are encrypted and stored securely in the database
> - **All connections are encrypted** - only TLS 1.2+ connections are accepted, no plain text SMTP is allowed.

