# Duplicati Server Configuration (anivarya) {#duplicati-server-configuration-required}

Is application ka sahi kaam karne ke liye, har ek apke Duplicati server ko HTTP reports bhejne ke liye configure kiya jana chahiye har backup run ke liye **duplistatus** server par.

Apne sabhi Duplicati servers par is configuration ko apply karein:

1. **Backup result reporting configure karein:** Duplicati configuration page par, `Settings` select karein aur `Default Options` section mein, following options shamil karein.

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

- Agar aap `--send-http-log-level=Information` chhod dete hain, to **duplistatus** par koi log messages bheje jaayenge, sirf statistics. Isse available versions feature kaam nahi karega.
- Recommended configuration hai `--send-http-max-log-lines=0` unlimited messages ke liye, kyunki Duplicati default of 100 messages available versions ko log mein prapt nahi kar sakta hai.
- Agar aap number of messages ko limit kar dete hain, to available backup versions prapt karne ke liye log messages prapt nahi honge. Isse un versions ka dikhane se rokega hai us backup run ke liye.

:::tip
**Duplistatus** server configure karne ke baad, [Collect Backup Logs](../user-guide/collect-backup-logs.md) ka use karke apne sabhi Duplicati servers ke liye backup logs ikattha karein.
:::

2. **Optional - Allow remote UI access:** Agar aap **duplistatus** dashboard links se Duplicati web interface ko directly access karna chahte hain, to [Duplicati's UI](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui) par login karein, `Settings` select karein, aur remote access allow karein, including a list of hostnames (ya `*` ka use karein). Agar aap isko skip kar dete hain, to **duplistatus** backup reports prapt karega, lekin Duplicati UI ke direct links kaam nahi karenge.

:::info
Agar aap Duplicati mein remote access enable nahi karte, to **Duplistatus** mein __Duplicati UI__ ko access karne ke liye links kaam nahi karenge. 
:::

![Duplicati settings](/img/duplicati-settings.png)

:::caution
Remote access sirf tab enable karein jab aapka Duplicati server secure network se protected ho (jaise VPN, private LAN, ya firewall rules). Duplicati interface ko proper security measures ke bina public Internet par expose karna unauthorized access ke liye lead kar sakta hai. 

Apne servers ko local network ke bahar securely access karne ke liye Tailscale, Headscale, NetBird, ZeroTier, Nebula, Twingate, Pritunl, Cloudflare Access, Wireguard ya similar solutions ka use karna recommended hai.
:::
