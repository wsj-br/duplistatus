

# NTFY Settings

NTFY is a simple notification service that can send push notifications to your phone or desktop. This section allows you to set up your notification server connection and authentication.

![Ntfy settings](/img/screen-settings-ntfy.png)

| Setting               | Description                                                                                                                                   |
|:----------------------|:----------------------------------------------------------------------------------------------------------------------------------------------|
| **NTFY URL**          | The URL of your NTFY server (defaults to the public `https://ntfy.sh/`).                                                                      |
| **NTFY Topic**        | A unique identifier for your notifications. The system will automatically generate a random topic if left empty, or you can specify your own. |
| **NTFY Access Token** | An optional access token for authenticated NTFY servers. Leave this field blank if your server does not require authentication.               |

<br/>

## Available Actions

| Button                                                                  | Description                                                                     |
|:------------------------------------------------------------------------|:--------------------------------------------------------------------------------|
| `Save Settings`                                                         | Save the changes made to the NTFY settings.                                     |
| <IconButton icon="lucide:send-horizontal" label="Send Test Message"/> | Sends a test message to your NTFY server.                                       |
| <IconButton icon="lucide:qr-code" label="Configure Device"/>          | Configures your mobile device or desktop to receive notifications automatically |
    

<br/>

> [!NOTE]
> A <IIcon2 icon="lucide:message-square" color="green"/> green icon next to `NTFY` in the tab bar means your settings are valid. If the icon is <IIcon2 icon="lucide:message-square" color="yellow"/> yellow, your settings are not valid.
> 
> When the configuration is not valid, the NTFY checkboxes in the [`Backup Notifications`](backup-notifications-settings.md) tab will also be greyed out.

<br/>

> [!CAUTION]
> If you use the public `ntfy.sh` server without an access token, anyone with your topic name can view your
> notifications. To provide a degree of privacy, a random 12-character topic is generated, offering over
> 3 sextillion (3,000,000,000,000,000,000,000) possible combinations, making it difficult to guess.
>
> For improved security, consider using [access token authentication](https://docs.ntfy.sh/config/#access-tokens) and [access control lists](https://docs.ntfy.sh/config/#access-control-list-acl) to protect your topics, or [self-host NTFY](https://docs.ntfy.sh/install/#docker) for total control.
>
> ⚠️ **You are responsible for securing your NTFY topics. Please use this service at your own discretion.**

## About NTFY

NTFY is an [open-source](https://github.com/binwiederhier/ntfy) notification service that **duplistatus** uses to send push notifications about backup events to your phone or desktop.

**Options:**

- Use the free public server at [ntfy.sh](https://ntfy.sh)
- [Self-host](https://docs.ntfy.sh/install/#docker) for complete privacy
- Subscribe to a paid plan for additional features

💙 If you find ntfy.sh useful, please consider [supporting the developer](https://github.com/sponsors/binwiederhier).

