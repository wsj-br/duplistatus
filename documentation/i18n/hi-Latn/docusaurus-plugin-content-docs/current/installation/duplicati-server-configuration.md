# Duplicati Server Configuration (Anivarya) {#duplicati-server-configuration-required}

Is application ko theek se kaam karne ke liye, aapke har Duplicati server ko **duplistatus** server ko har backup run ke liye HTTP reports bhejane ke liye configure karna hoga.

Apne har Duplicati server par yeh configuration apply karein:

1. **Backup result reporting configure karein:** Duplicati configuration page par, `Settings` select karein aur, `Default Options` section mein, nimnalikhit options shamil karein.

![Duplicati configuration](/img/duplicati-options.png)

Apne server ka naam ya IP pata jahan **duplistatus** chal raha hai, uske liye 'my.local.server' ko replace karein.

| Advanced option                  | Value                                    |
    | -------------------------------- | ---------------------------------------- |
    | `send-http-url`                  | `http://my.local.server:9666/api/upload` |
    | `send-http-result-output-format` | `Json`                                   |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `0`                                      |

Vaikalpik roop se, aap `Edit as text` par click kar sakte hain aur neeche di gayi lines ko copy kar sakte hain, `my.local.server` ko apne actual server address se replace karke.

```bash
--send-http-url=http://my.local.server:9666/api/upload
--send-http-result-output-format=Json
--send-http-log-level=Information
--send-http-max-log-lines=0
```

**Duplicati dwara bheje gaye sandeshon par mahatvapurna tippaniyan:**

- Agar aap `--send-http-log-level=Information` ko omit karte hain, to **duplistatus** ko koi log sandesh nahi bheja jayega, kewal aankde. Yeh available versions feature ko kaam karne se rokega.
- Anushansit configuration `--send-http-max-log-lines=0` hai aparimit sandeshon ke liye, kyunki Duplicati ka default 100 sandesh available versions ko log mein prapt karne se rok sakta hai.
- Agar aap sandeshon ki sankhya ko seemit karte hain, to available backup versions prapt karne ke liye avashyak log sandesh prapt nahi ho sakte hain. Yeh un versions ko us backup run ke liye display hone se rokega.

:::tip
**duplistatus** server ko configure karne ke baad, [Backup Logs Ikattha Karein](../user-guide/collect-backup-logs.md) ka upyog karke apne sabhi Duplicati servers ke backup logs ikattha karein.
:::

2. **Vaikalpik - Remote UI access allow karein:** Agar aap **duplistatus** dashboard links se seedhe Duplicati web interface access karna chahte hain, to [Duplicati's UI](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui) mein pravesh karein, `Settings` select karein, aur remote access allow karein, jisme hostnames ki list shamil ho (ya `*` ka upyog karein). Agar aap ise skip karte hain, to **duplistatus** backup reports prapt karta rahega, lekin Duplicati UI ke seedhe links kaam nahi karenge.

:::info
Agar aap Duplicati mein remote access enable nahi karte hain, to **Duplistatus** mein __Duplicati UI__ access karne ke links kaam nahi karenge.
:::

![Duplicati settings](/img/duplicati-settings.png)

:::caution
Kewal tabhi remote access enable karein jab aapka Duplicati server ek surakshit network dwara surakshit ho
(jaise, VPN, private LAN, ya firewall rules). Bina uchit suraksha upaayon ke Duplicati interface ko public Internet par expose karne se anadhikrit access ho sakta hai.

Apne servers ko apne local network ke bahar se surakshit roop se access karne ke liye Tailscale, Headscale, NetBird, ZeroTier, Nebula, Twingate, Pritunl, Cloudflare Access, Wireguard ya aise hi solutions ka upyog karne ki anushansa ki jati hai.
:::
