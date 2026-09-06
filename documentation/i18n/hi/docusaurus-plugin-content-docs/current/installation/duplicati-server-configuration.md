# Duplicati Server Configuration (anivarya) {#duplicati-server-configuration-required}

Is application ka sahi kaam karne ke liye, har ek apke Duplicati server ko HTTP reports bhejne ke liye configure kiya jana chahiye har backup run ke liye **duplistatus** server par.

Apne sabhi Duplicati servers par is configuration ko apply karein:

1. **Backup result reporting configure karein:** Duplicati configuration page par, `Settings` select karein aur `Default Options` section mein, following options shamil karein.

![Duplicati configuration](/img/duplicati-options.png)

Replace `my.local.server` with the hostname or IP address that the Duplicati server uses to reach **duplistatus**. See [Duplicati and duplistatus on the same host](#duplicati-and-duplistatus-on-the-same-host) if both run on one machine.

See Duplicati's [HTTP notifications](https://docs.duplicati.com/monitoring-and-notifications/sending-reports-via-email/sending-http-notifications) documentation for the option reference.

### Recommended options (Duplicati 2.0.9.106 and later) {#recommended-options-duplicati-209106-and-later}

`--send-http-json-urls` already sends JSON, so `--send-http-result-output-format=Json` is not required (and is ignored for these URLs).

| उन्नत विकल्प           | मान                                    |
    | ------------------------- | ---------------------------------------- |
    | `send-http-json-urls`     | `http://my.local.server:9666/api/upload` (API कुंजियाँ आवश्यक होने पर `?api_key=` जोड़ें) |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `500`                                    |

Alternatively, you can click on `Edit as text` and copy the lines below, replacing `my.local.server` with your actual server address.

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload
--send-http-log-level=Information
--send-http-max-log-lines=500
```

जब [API कुंजियाँ](../user-guide/settings/api-keys-settings.md) आवश्यक होती हैं, तो URL में अपलोड-स्कोप कुंजी जोड़ें:

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload?api_key=YOUR_UPLOAD_KEY
```

डुप्लिकेटी कस्टम HTTP हेडर सेट नहीं कर सकती। क्वेरी पैरामीटर कुंजी भेजने का समर्थित तरीका है। रिवर्स-प्रॉक्सी एक्सेस लॉग में सीक्रेट होगा, इसलिए उन लॉग्स को पढ़ने वाले लोगों को सीमित करें।

`--send-http-max-log-lines=500` JSON रिपोर्ट को डिफ़ॉल्ट 5 एमबी अपलोड साइज़ कैप के नीचे रखता है। `--send-http-max-log-lines=0` (असीमित) उस कैप को पार कर सकता है और HTTP 413 लौट सकता है। अगर आपको बड़े रिपोर्ट की आवश्यकता है, तो सेटिंग्स → API कुंजियाँ में लिमिट बढ़ाएं।

### Older Duplicati versions {#older-duplicati-versions}

If your Duplicati server is older than 2.0.9.106, use the legacy URL option and set the result format to JSON:

| Advanced option                  | Value                                    |
    | -------------------------------- | ---------------------------------------- |
    | `send-http-url`                  | `http://my.local.server:9666/api/upload` |
    | `send-http-result-output-format` | `Json`                                   |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `500`                                    |

```bash
--send-http-url=http://my.local.server:9666/api/upload
--send-http-result-output-format=Json
--send-http-log-level=Information
--send-http-max-log-lines=500
```

### Log lines and available versions {#log-lines-and-available-versions}

**Important notes on messages sent by Duplicati:**

- If you omit `--send-http-log-level=Information`, no log messages will be sent to **duplistatus**, only statistics. This will prevent the available versions **list** from working.
- Duplicati's default is `--send-http-max-log-lines=100`. The recommended value is `500`. Duplicati keeps the **first** N log lines. The lines used for the available versions list (`Backups to consider`) are usually in those first hundreds of lines; `100` is often too few.
- `--send-http-max-log-lines=0` means unlimited. Use that only if the version list is still missing and you are **not** also sending reports to [Duplicati Monitoring](https://www.duplicati-monitoring.com/). Unlimited logs can make that service return HTTP 500 on large jobs.
- The **count** of available versions still comes from the JSON statistics (`BackupListCount`) even when the detailed timestamp list is missing. If the list icon is greyed out, raise the cap (or use `0` when reporting only to **duplistatus**).

:::tip
**Duplistatus** server configure karne ke baad, [Collect Backup Logs](../user-guide/collect-backup-logs.md) ka use karke apne sabhi Duplicati servers ke liye backup logs ikattha karein.
:::

### Reporting to duplistatus and Duplicati Monitoring {#reporting-to-duplistatus-and-duplicati-monitoring}

You can send reports from the **same** Duplicati server to **duplistatus** and [Duplicati Monitoring](https://www.duplicati-monitoring.com/) at the same time. **duplistatus** must receive JSON. Duplicati Monitoring expects form-encoded reports. Do not point `--send-http-form-urls` at `/api/upload`.

On that Duplicati server, set Default Options to:

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload
--send-http-form-urls=https://www.duplicati-monitoring.com/log/<your-endpoint>
--send-http-log-level=Information
--send-http-max-log-lines=500
```

Replace `<your-endpoint>` with the URL from your Duplicati Monitoring account.

- Prefer these dedicated options. Do not also keep `--send-http-url` pointing at the same destinations unless you still need the legacy option.
- `--send-http-log-level` and `--send-http-max-log-lines` apply to **every** HTTP target. You cannot send a full log to **duplistatus** and a short report to Duplicati Monitoring.
- Use `500`, not `0`. If Duplicati Monitoring still returns HTTP 500 on large jobs, lower the cap further (or omit `Information`) knowing the version **list** may be missing. If the list is missing but Monitoring is fine, raise the cap. Alternatively, report only to **duplistatus** for those jobs.

:::caution
If one HTTP target fails (outage or HTTP 500), Duplicati may not send the remaining reports. Form URLs are sent first, then JSON URLs. An outage or 500 from Duplicati Monitoring can therefore block the JSON report to **duplistatus**.
:::

[Backup Logs Ikattha Karein](../user-guide/collect-backup-logs.md) does not depend on HTTP reporting. Use it to backfill a run that was not received.

### Duplicati and duplistatus on the same host {#duplicati-and-duplistatus-on-the-same-host}

अपलोड URL **Duplicati प्रक्रिया से** पहुंचने योग्य होना चाहिए, आपके ब्राउज़र से नहीं।

- **होस्ट पर Duplicati, Docker में duplistatus पोर्ट `9666` प्रकाशित:** `http://127.0.0.1:9666/api/upload` (या होस्ट LAN आईपी)।
- **साझा नेटवर्क पर दोनों Docker में:** `http://duplistatus:9666/api/upload` (Compose सेवा या कंटेनर नाम)। `localhost` Duplicati कंटेनर के अंदर वह कंटेनर है, नहीं **duplistatus**।
- **समान होस्ट पर HTTPS रिवर्स प्रॉक्सी:** [HTTPS Setup](https-setup.md) में सार्वजनिक HTTPS URL का उपयोग करें।

Backup Logs Ikattha Karein विपरीत दिशा में है: **duplistatus** कंटेनर से, `localhost:8200` होस्ट पर Duplicati नहीं है। होस्ट आईपी, `host.docker.internal` (Docker Desktop, या एक अतिरिक्त होस्ट जिसे आप कॉन्फ़िगर किया हैं), या Duplicati कंटेनर नाम का उपयोग करें।

2. **Optional - Allow remote UI access:** Agar aap **duplistatus** dashboard links se Duplicati web interface ko directly access karna chahte hain, to [Duplicati's UI](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui) par login karein, `Settings` select karein, aur remote access allow karein, including a list of hostnames (ya `*` ka use karein). Agar aap isko skip kar dete hain, to **duplistatus** backup reports prapt karega, lekin Duplicati UI ke direct links kaam nahi karenge.

:::info
Agar aap Duplicati mein remote access enable nahi karte, to **Duplistatus** mein __Duplicati UI__ ko access karne ke liye links kaam nahi karenge. 
:::

![Duplicati settings](/img/duplicati-settings.png)

:::caution
Remote access sirf tab enable karein jab aapka Duplicati server secure network se protected ho (jaise VPN, private LAN, ya firewall rules). Duplicati interface ko proper security measures ke bina public Internet par expose karna unauthorized access ke liye lead kar sakta hai. 

Apne servers ko local network ke bahar securely access karne ke liye Tailscale, Headscale, NetBird, ZeroTier, Nebula, Twingate, Pritunl, Cloudflare Access, Wireguard ya similar solutions ka use karna recommended hai.
:::
