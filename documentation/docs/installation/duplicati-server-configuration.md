

# Duplicati Server Configuration (Required) {#duplicati-server-configuration-required}

In order for this application to work properly, each of your Duplicati servers needs to be configured to send HTTP reports for each backup run to the **duplistatus** server.

Apply this configuration to each of your Duplicati servers: 

1. **Configure backup result reporting:** On the Duplicati configuration page, select `Settings` and, in the `Default Options` section, include the following options.


![Duplicati configuration](/img/duplicati-options.png)


 Replace 'my.local.server' with your server name or IP address where **duplistatus** is running.

    | Advanced option                  | Value                                    |
    | -------------------------------- | ---------------------------------------- |
    | `send-http-url`                  | `http://my.local.server:9666/api/upload` |
    | `send-http-result-output-format` | `Json`                                   |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `0`                                      |

Alternativelly, you can click on `Edit as text` and copy the lines below, replacing `my.local.server` with your actual server address.


```bash
--send-http-url=http://my.local.server:9666/api/upload
--send-http-result-output-format=Json
--send-http-log-level=Information
--send-http-max-log-lines=0
```

**Important notes on messages sent by Duplicati:**

- If you omit `--send-http-log-level=Information`, no log messages will be sent to **duplistatus**, only statistics. This will prevent the available versions feature from working.
- The recommended configuration is `--send-http-max-log-lines=0` for unlimited messages, since the Duplicati default of 100 messages may prevent the available versions from being received in the log.
- If you limit the number of messages, the log messages required to obtain the available backup versions may not be received. This will prevent those versions from being displayed for that backup run.

:::tip
After configuring the **duplistatus** server, collect the backup logs for all your Duplicati servers using [Collect Backup Logs](../user-guide/collect-backup-logs.md).
:::


2. **Optional - Allow remote UI access:** If you want to access the Duplicati web interface directly from the **duplistatus** dashboard links, log in to [Duplicati's UI](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui), select `Settings`, and allow remote access, including a list of hostnames (or use `*`). If you skip this, **duplistatus** will still receive backup reports, but the direct links to the Duplicati UI will not work.


:::info
If you don't enable remote access in Duplicati, the links in **Duplistatus** to access the __Duplicati UI__ will not work. 
:::


![Duplicati settings](/img/duplicati-settings.png)


:::caution
Only enable remote access if your Duplicati server is protected by a secure network
(e.g., VPN, private LAN, or firewall rules). Exposing the Duplicati interface to the public Internet
without proper security measures could lead to unauthorised access. 

Recommended to use Tailscale, Headscale, NetBird, ZeroTier, Nebula, Twingate, Pritunl, Cloudflare Access, Wireguard or similar solutions to securely access your servers from outside your local network.
:::
