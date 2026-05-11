---
translation_last_updated: '2026-05-11T14:27:42.330Z'
source_file_mtime: '2026-05-10T19:00:19.989Z'
source_file_hash: c3785bbdf46a519aee1f05ff2845a158534f37927bd8ac3eade9f28f6acdb51b
translation_language: de
source_file_path: documentation/docs/installation/duplicati-server-configuration.md
translation_models:
  - anthropic/claude-3.5-haiku
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Duplicati Server-Konfiguration (erforderlich) {#duplicati-server-configuration-required}

Damit diese Anwendung ordnungsgemäß funktioniert, muss jeder Ihrer Duplicati-Server so konfiguriert werden, dass er für jeden Sicherungslauf HTTP-Berichte an den **duplistatus**-Server sendet.

Wenden Sie diese Konfiguration auf jeden Ihrer Duplicati-Server an:

1. **Konfigurieren Sie die Backup-Ergebnisberichterstattung:** Wählen Sie auf der Duplicati-Konfigurationsseite `Settings` und fügen Sie im `Default Options`-Abschnitt die folgenden Optionen hinzu.

![Duplicati configuration](/img/duplicati-options.png)

Ersetzen Sie 'my.local.server' durch Ihren Servernamen oder Ihre IP-Adresse, auf dem **duplistatus** läuft.

| Erweiterte Option | Wert |
    | -------------------------------- | ---------------------------------------- |
    | `send-http-url` | `http://my.local.server:9666/api/upload` |
    | `send-http-result-output-format` | `Json` |
    | `send-http-log-level` | `Information` |
    | `send-http-max-log-lines` | `0` |

Alternativ können Sie auf `Edit as text` klicken und die folgenden Zeilen kopieren, wobei Sie `my.local.server` durch Ihre tatsächliche Serveradresse ersetzen.

```bash
--send-http-url=http://my.local.server:9666/api/upload
--send-http-result-output-format=Json
--send-http-log-level=Information
--send-http-max-log-lines=0
```

**Wichtige Hinweise zu Nachrichten, die von Duplicati gesendet werden:**

- Wenn Sie `--send-http-log-level=Information` weglassen, werden keine Nachrichten an **duplistatus** gesendet, nur Statistiken. Dies verhindert, dass die Funktion „Verfügbare Versionen" funktioniert.
- Die empfohlene Konfiguration ist `--send-http-max-log-lines=0` für unbegrenzte Nachrichten, da der Duplicati-Standard von 100 Nachrichten möglicherweise verhindert, dass die verfügbaren Versionen im Protokoll empfangen werden.
- Wenn Sie die Anzahl der Nachrichten begrenzen, werden die erforderlichen Protokollnachrichten zum Abrufen der verfügbaren Sicherungsversionen möglicherweise nicht empfangen. Dies verhindert, dass diese Versionen für diesen Sicherungslauf angezeigt werden.

:::tip
Nach der Konfiguration des **duplistatus**-Servers sammeln Sie die Sicherungsprotokolle für alle Ihre Duplicati-Server mit [Backup-Protokolle sammeln](../user-guide/collect-backup-logs.md).
:::

2. **Optional - Remotezugriff auf die Benutzeroberfläche erlauben:** Wenn Sie von den **duplistatus**-Dashboard-Links direkt auf die Duplicati-Weboberfläche zugreifen möchten, melden Sie sich bei [Duplicati's UI](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui) an, wählen Sie `Settings` und erlauben Sie den Remotezugriff, einschließlich einer Liste von Hostnamen (oder verwenden Sie `*`). Wenn Sie dies überspringen, wird **duplistatus** weiterhin Backup-Berichte empfangen, aber die direkten Links zur Duplicati-Benutzeroberfläche funktionieren nicht.

:::info
Wenn Sie den Remotezugriff in Duplicati nicht aktivieren, funktionieren die Links in **Duplistatus** zum Zugriff auf die __Duplicati-Benutzeroberfläche__ nicht.
:::

![Duplicati settings](/img/duplicati-settings.png)

:::caution
Aktivieren Sie den Remotezugriff nur, wenn Ihr Duplicati-Server durch ein sicheres Netzwerk geschützt ist
(z. B. VPN, privates LAN oder Firewallregeln). Die Bereitstellung der Duplicati-Schnittstelle im öffentlichen Internet
ohne angemessene Sicherheitsmaßnahmen könnte zu unbefugtem Zugriff führen.

Es wird empfohlen, Lösungen wie Tailscale, Headscale, NetBird, ZeroTier, Nebula, Twingate, Pritunl, Cloudflare Access, Wireguard oder ähnliche zu verwenden, um sicher von außerhalb Ihres lokalen Netzwerks auf Ihre Server zuzugreifen.
:::
