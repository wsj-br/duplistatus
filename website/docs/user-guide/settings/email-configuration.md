

# Email Configuration

**duplistatus** supports sending email notifications via SMTP as an alternative or complement to NTFY notifications. Email configuration is now managed through the web interface with encrypted storage in the database for enhanced security.

<div>

![Email Configuration](/img/screen-settings-email.png)

- **Configuration Status**: Shows whether email is properly configured and ready to use.
- **Current Configuration**: Displays SMTP settings (host, port, secure connection, username) without exposing passwords.
- **Send Test Email**: Test button to verify email configuration and delivery.

<br/>

## Web Interface Configuration

Email notifications are configured through the web interface under **Settings → Email Configuration**. The settings are stored securely in the database with encrypted credentials.

**Configuration Fields:**

- **SMTP Host**: Your email provider's SMTP server (e.g., `smtp.gmail.com`)
- **SMTP Port**: Port number (typically `587` for STARTTLS or `465` for SSL/TLS)
- **SMTP Username**: Your email address or username
- **SMTP Password**: Your email password or app-specific password
- **Recipient Email**: The email address to receive notifications
- **Secure Connection**: Toggle for SSL/TLS vs STARTTLS encryption

## Common SMTP Providers

<div>

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

</div>

</div>

<br/>

> [!TIP]
> **Security Best Practices:**
>
> - For Gmail and Yahoo, use App Passwords instead of your regular account password
> - Consider using a dedicated email account for notifications
> - Test your configuration using the "Send Test Email" button
> - Settings are encrypted and stored securely in the database

<br/>

> [!NOTE] > **Email Features:**
>
> - Emails are sent with "duplistatus" as the sender name
> - Both HTML and plain text versions are included for better compatibility
> - Email notifications use the same templates as NTFY notifications
> - Template titles become email subjects
> - Email notifications respect the same per-backup settings as NTFY
> - **All connections are encrypted** - only TLS 1.2+ connections are accepted, plain text SMTP is rejected

## Security Features (Version 0.8.x)

**Enhanced Security:**

- Email configuration now uses web interface instead of environment variables for better security
- Sensitive data (passwords, SMTP credentials) are encrypted using AES-256-GCM encryption
- Master key is automatically generated and stored securely (`.duplistatus.key`)
- Session-based authentication protects all web interface operations
- CSRF protection prevents unauthorised modifications
- Automatic session expiry (24 hours) with token refresh (30 minutes)

<br/><br/>
