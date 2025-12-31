

# NTFY 

NTFY is an [open-source](https://github.com/binwiederhier/ntfy) simple notification service that can send push notifications to your phone or desktop. This section allows you to set up your notification server connection and authentication.

![Ntfy settings](/img/screen-settings-ntfy.png)

| Setting               | Description                                                                                                                                   |
|:----------------------|:----------------------------------------------------------------------------------------------------------------------------------------------|
| **NTFY URL**          | The URL of your NTFY server (defaults to the public `https://ntfy.sh/`).                                                                      |
| **NTFY Topic**        | A unique identifier for your notifications. The system will automatically generate a random topic if left empty, or you can specify your own. |
| **NTFY Access Token** | An optional access token for authenticated NTFY servers. Leave this field blank if your server does not require authentication.               |

<br/>

A <IIcon2 icon="lucide:message-square" color="green"/> green icon next to `NTFY` in the sidebar means your settings are valid. If the icon is <IIcon2 icon="lucide:message-square" color="yellow"/> yellow, your settings are not valid.
When the configuration is not valid, the NTFY checkboxes in the [`Backup Notifications`](backup-notifications-settings.md) tab will also be greyed out.


## Available Actions

| Button                                                                | Description                                                                                                  |
|:----------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------|
| <IconButton label="Save Settings" />                                  | Save any changes made to the NTFY settings.                                                                  |
| <IconButton icon="lucide:send-horizontal" label="Send Test Message"/> | Send a test message to your NTFY server to check your configuration.                                         |
| <IconButton icon="lucide:qr-code" label="Configure Device"/>          | Display a QR code that allows you to quickly configure your mobile device or desktop for NTFY notifications. |
    

## Device Configuration

You should install the NTFY application on your device before configuring it ([see here](https://ntfy.sh/)). Clicking the <IconButton icon="lucide:qr-code" label="Configure Device"/> button, or right-clicking the <SvgButton svgFilename="ntfy.svg" /> icon  in the application toolbar, will display a QR code. Scanning this QR code will automatically configure your device with the correct NTFY topic for notifications. 

<br/>



<br/>

> [!CAUTION]
> If you use the public `ntfy.sh` server without an access token, anyone with your topic name can view your
> notifications. 
> 
> To provide a degree of privacy, a random 12-character topic is generated, offering over
> 3 sextillion (3,000,000,000,000,000,000,000) possible combinations, making it difficult to guess.
>
> For improved security, consider using [access token authentication](https://docs.ntfy.sh/config/#access-tokens) and [access control lists](https://docs.ntfy.sh/config/#access-control-list-acl) to protect your topics, or [self-host NTFY](https://docs.ntfy.sh/install/#docker) for total control.
>
> ⚠️ **You are responsible for securing your NTFY topics. Please use this service at your own discretion.**

<br/>
<br/>

>[!NOTE]
> All product names, trademarks, and registered trademarks are the property of their respective owners. Icons and names are used for identification purposes only and do not imply endorsement.
