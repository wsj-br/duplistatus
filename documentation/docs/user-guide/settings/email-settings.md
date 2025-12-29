

# Email 

**duplistatus** supports sending email notifications via SMTP as an alternative or complement to NTFY notifications. Email configuration is now managed through the web interface with encrypted storage in the database for enhanced security.

![Email Configuration](/img/screen-settings-email.png)

| Setting                 | Description                                                      |
|:------------------------|:-----------------------------------------------------------------|
| **SMTP Server Host**    | Your email provider's SMTP server (e.g., `smtp.gmail.com`).      |
| **SMTP Server Port**    | Port number (typically `25` for Plain SMTP, `587` for STARTTLS, or `465` for Direct SSL/TLS). |
| **Connection Type**     | Select between Plain SMTP, STARTTLS, or Direct SSL/TLS. Defaults to Direct SSL/TLS for new configurations. |
| **SMTP Authentication** | Toggle to enable or disable SMTP authentication. When disabled, username and password fields are not required. |
| **SMTP Username**       | Your email address or username (required when authentication is enabled). |
| **SMTP Password**       | Your email password or app-specific password (required when authentication is enabled). |
| **Sender Name**         | Display name shown as the sender in email notifications (optional, defaults to "duplistatus"). |
| **From Address**        | Email address shown as the sender. Required for Plain SMTP connections or when authentication is disabled. Defaults to SMTP username when authentication is enabled. Note that some email providers will override the `From Address` with the `SMTP Server Username`. |
| **Recipient Email**     | The email address to receive notifications. Must be a valid email address format. |

<br/>

> [!IMPORTANT]
>
> To protect your security, you can only perform the following actions:
> - Set a password for the email configuration
> - Remove (delete) the password entirely
> 
> The password is stored encrypted in the database and is never displayed in the user interface.


<br/>

## Available Actions

| Button                                                           | Description                                              |
|:-----------------------------------------------------------------|:---------------------------------------------------------|
| <IconButton label="Save Settings" />                             | Save the changes made to the NTFY settings.              |
| <IconButton icon="lucide:mail" label="Send Test Email"/>         | Sends a test email message using the SMTP configuration. The test email displays SMTP server hostname, port, connection type, authentication status, username (if applicable), recipient email, from address, sender name, and test timestamp. |
| <IconButton icon="lucide:trash-2" label="Delete SMTP Settings"/> | Delete / Clear the SMTP configuration.                   |
    

<br/>

> [!NOTE]
> A <IIcon2 icon="lucide:mail" color="green"/> green icon next to `Email` in the tab bar means your settings are valid. If the icon is <IIcon2 icon="lucide:mail" color="yellow"/> yellow, your settings are not valid or not configured.
> 
> The icon shows green when all required fields are set: SMTP Server Host, SMTP Server Port, Recipient Email, and either (SMTP Username + Password when authentication is required) or (From Address when authentication is not required).
> 
> When the configuration is not fully configured, a yellow alert box is displayed informing you that no emails will be sent until the email settings are filled correctly. The Email checkboxes in the [`Backup Notifications`](backup-notifications-settings.md) tab will also be greyed out and show "(disabled)" labels.

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
- Port: `587` (STARTTLS) or `465` (Direct SSL/TLS)
- Connection Type: STARTTLS for port 587, Direct SSL/TLS for port 465
- Username: Your Gmail address
- Password: Use an App Password (not your regular password). Generate one at https://myaccount.google.com/apppasswords
- Authentication: Required

**Outlook/Hotmail:**

- Host: `smtp-mail.outlook.com`
- Port: `587`
- Connection Type: STARTTLS
- Username: Your Outlook email address
- Password: Your account password
- Authentication: Required

**Yahoo Mail:**

- Host: `smtp.mail.yahoo.com`
- Port: `587`
- Connection Type: STARTTLS
- Username: Your Yahoo email address
- Password: Use an App Password
- Authentication: Required

<br/>

> [!TIP]
> **Security Best Practices:**
>
> - For Gmail and Yahoo, use App Passwords instead of your regular account password
> - Consider using a dedicated email account for notifications
> - Test your configuration using the "Send Test Email" button
> - Settings are encrypted and stored securely in the database
> - **Use encrypted connections** - STARTTLS and Direct SSL/TLS are recommended for production use
> - Plain SMTP connections (port 25) are available for trusted local networks but are not recommended for production use over untrusted networks
> - When using Plain SMTP or when authentication is disabled, the From Address field is required to ensure proper email sender identification and RFC 5322 compliance
> - Email format validation is performed on recipient and from address fields to ensure proper email addresses are entered

<br/>

## Running Your Own SMTP Relay Server

If you prefer to run your own SMTP relay server locally, you can use a Docker container to set up a simple SMTP server. This is useful for testing or when you want to handle email delivery yourself.

### Using Docker Command

Run the following command to start an SMTP relay server:

```bash
docker run -d \
  --name smtp-relay \
  -p 25:25 \
  --restart unless-stopped \
  bytemark/smtp:latest
```

### Using Docker Compose

Alternatively, create a `docker-compose.yml` file with the following content:

```yaml
version: '3.8'

services:
  smtp-server:
    image: bytemark/smtp:latest
    container_name: smtp-relay
    ports:
      - "25:25" 
    restart: unless-stopped
```

Then run:

```bash
docker-compose up -d
```

### Configuring duplistatus to Use the Local SMTP Relay

Once your SMTP relay server is running, configure **duplistatus** with the following settings:

- **SMTP Server Host**: `localhost` (or the IP address of the Docker host)
- **SMTP Server Port**: `25`
- **Connection Type**: `Plain SMTP`
- **SMTP Authentication**: Disabled (unless your relay server requires authentication)
- **From Address**: Enter a valid email address (required for Plain SMTP)
- **Recipient Email**: Enter the email address where you want to receive notifications

> [!NOTE]
> - The SMTP relay server will accept emails and attempt to deliver them. Make sure your server has proper network access and DNS configuration to deliver emails to external recipients, or configure it to relay through another SMTP server.
> - See more information in [Bytemark Hosting SMTP Relay Server](https://github.com/BytemarkHosting/docker-smtp) repository.


