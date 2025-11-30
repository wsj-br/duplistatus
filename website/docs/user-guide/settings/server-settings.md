

# Server 

You can configure an alternative name (alias) for your servers, a note to describe its function and the web addresses of your Duplicati Servers here.

![server settings](/img/screen-settings-server.png)

| Setting                         | Description                                                                                                                                                                                  |
|:--------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Server Name**                 | Server name configured in the Duplicati server. A <IIcon2 icon="lucide:key-round" color="#42A5F5"/> will appear if a password is set for the server.                                         |
| **Alias**                       | A nickname or human-readable name of your server. When hovering over an alias it will show its name; in some cases to make it clear it will display the alias and the name between brackets. |
| **Note**                        | Free text to describe the server functionality, installation place, or any other information. When configured, it will be displayed next to the name or alias of the server.                 |
| **Web Interface Address (URL)** | Configure the URL to access the Duplicati Server's UI. Both `HTTP` and `HTTPS` URLs are supported.                                                                                           |
| **Status**                      | Display the test or collect backup logs results                                                                                                                                              |
| **Actions**                     | You can test, open Duplicati interface, collect logs and set a password, see below for more details.                                                                                         |


> [!NOTE]
> If the Web Interface Address (URL) is not configured, the <SvgIcon svgFilename="duplicati_logo.svg" /> button 
> will be disabled in all pages and the server will not be shown in [`Duplicati Configuration`](../duplicati-configuration.md) <SvgButton svgFilename="duplicati_logo.svg" href="../duplicati-configuration"/>  list.

<br/>

## Available Actions for each server

| Button                                          | Description                                                                      |
|:------------------------------------------------|:---------------------------------------------------------------------------------|
| <IconButton icon="lucide:play" label="Test"/>   | Test the connection to the Duplicati server.                                     |
| <SvgButton svgFilename="duplicati_logo.svg" />  | Open the Duplicati server's web interface in a new browser tab.                  |
| <IconButton icon="lucide:download" />           | Collect backup logs from the Duplicati server.                                   |
| <IconButton icon="lucide:rectangle-ellipsis" /> | Change or set a password for the Duplicati server (auto-collected backups only). |

> [!IMPORTANT]
> For security reasons, the current password is not displayed in the user interface. 
>
> You can only set a new password or re-enter the existing one if desired.

<br/>

## Available Actions for all servers

| Button                                                     | Description                                     |
|:-----------------------------------------------------------|:------------------------------------------------|
| <IconButton label="Save Changes" />                        | Save the changes made to the server settings.   |
| <IconButton icon="lucide:fast-forward" label="Test All"/>  | Test the connection to all Duplicati servers.   |
| <IconButton icon="lucide:import" label="Collect All (#)"/> | Collect backup logs from all Duplicati servers. |

<br/>

