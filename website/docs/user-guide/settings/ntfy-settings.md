

# NTFY Settings

NTFY is a simple notification service that can send push notifications to your phone or desktop. This section allows you to set up your notification server connection and authentication.

![Ntfy settings](/img/screen-settings-ntfy.png)

- **NTFY URL**: The URL of your NTFY server (defaults to the public `https://ntfy.sh/`).
- **NTFY Topic**: A unique identifier for your notifications. The system will automatically generate a random topic if left empty, or you can specify your own.
- **NTFY Access Token**: An optional access token for authenticated NTFY servers. Leave this field blank if your server does not require authentication.

## Device Configuration (Version 0.8.x)

**QR Code Generation**: Configure your mobile device or desktop to receive notifications automatically.

- **Configure Device Button**: Generates a QR code containing your NTFY topic configuration
- **Direct Configuration**: Right-click the "Open NTFY" button in the application toolbar for instant QR code access
- **App Installation**: Scan the QR code with your device camera or install the NTFY app from your preferred app store

The QR code contains the complete configuration needed to subscribe to your notification topic, including authentication tokens if configured.

<br/>

> [!CAUTION]
> If you use the public `ntfy.sh` server without an access token, anyone with your topic name can view your
> notifications. To provide a degree of privacy, a random 12-character topic is generated, offering over
> 3 sextillion (3,000,000,000,000,000,000,000) possible combinations, making it difficult to guess.
>
> For improved security, consider using [access token authentication](https://docs.ntfy.sh/config/#access-tokens) and [access control lists](https://docs.ntfy.sh/config/#access-control-list-acl) to protect your topics, or [self-host NTFY](https://docs.ntfy.sh/install/#docker) for total control.
>
> ⚠️ **You are responsible for securing your NTFY topics. Please use this service at your own discretion.**

<br/>

## About NTFY

NTFY is an [open-source](https://github.com/binwiederhier/ntfy) notification service that **duplistatus** uses to send push notifications about backup events to your phone or desktop.

**Options:**

- Use the free public server at [ntfy.sh](https://ntfy.sh)
- [Self-host](https://docs.ntfy.sh/install/#docker) for complete privacy
- Subscribe to a paid plan for additional features

💙 If you find ntfy.sh useful, please consider [supporting the developer](https://github.com/sponsors/binwiederhier).

<br/>


<br/><br/>
