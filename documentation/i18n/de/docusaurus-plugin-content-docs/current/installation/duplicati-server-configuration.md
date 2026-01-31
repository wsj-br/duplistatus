---
translation_last_updated: '2026-01-31T00:51:23.378Z'
source_file_mtime: '2026-01-27T14:22:06.830Z'
source_file_hash: da5148730ecb385b
translation_language: de
source_file_path: installation/duplicati-server-configuration.md
---
# Duplicati-Server-Konfiguration (erforderlich) {#duplicati-server-configuration-required}

Damit diese Anwendung ordnungsgemäß funktioniert, muss jeder Ihrer Duplicati-Server so konfiguriert werden, dass er HTTP-Berichte für jede Sicherung an den **duplistatus**-Server sendet.

Wenden Sie diese Konfiguration auf jeden Ihrer Duplicati-Server an:

1. **Fernzugriff zulassen:** Melden Sie sich bei [Duplicatis Benutzeroberfläche](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui) an, wählen Sie `Settings` aus, und erlauben Sie Fernzugriff, einschließlich einer Liste von Hostnamen (oder verwenden Sie `*`).

![Duplicati settings](/img/duplicati-settings.png)

:::caution
    Aktivieren Sie den Fernzugriff nur, wenn Ihr Duplicati-Server durch ein sicheres Netzwerk geschützt ist
    (z. B. VPN, privates LAN oder Firewall-Regeln). Das Freigeben der Duplicati-Oberfläche für das öffentliche Internet
    ohne angemessene Sicherheitsmaßnahmen könnte zu unbefugtem Zugriff führen.
    :::

2. **Sicherungsergebnis-Berichterstattung konfigurieren:** Wählen Sie auf der Duplicati-Konfigurationsseite `Settings` aus und fügen Sie im Abschnitt `Default Options` die folgenden Optionen ein. Ersetzen Sie „my.local.server" durch Ihren Servernamen oder Ihre IP-Adresse, auf dem **duplistatus** ausgeführt wird.

| Erweiterte Option                | Wert                                     |
    | -------------------------------- | ---------------------------------------- |
    | `send-http-url`                  | `http://my.local.server:9666/api/upload` |
    | `send-http-result-output-format` | `Json`                                   |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `0`                                      |

Alternativ können Sie auf `Edit as text` klicken und die folgenden Zeilen kopieren, wobei Sie `my.local.server` durch Ihre tatsächliche Serveradresse ersetzen.

```bash
--send-http-url=http://my.local.server:9666/api/upload
--send-http-result-output-format=Json
--send-http-log-level=Information
--send-http-max-log-lines=0
```

![Duplicati configuration](/img/duplicati-options.png)

**Wichtig: Hinweise zu Nachrichten, die von Duplicati gesendet werden:**

- Wenn Sie `--send-http-log-level=Information` weglassen, werden keine Protokollnachrichten an **duplistatus** gesendet, nur Statistiken. Dies verhindert, dass die Funktion „Verfügbare Versionen" funktioniert.
- Die empfohlene Konfiguration ist `--send-http-max-log-lines=0` für unbegrenzte Nachrichten, da der Duplicati-Standard von 100 Nachrichten möglicherweise verhindert, dass die verfügbaren Versionen im Protokoll empfangen werden.
- Wenn Sie die Anzahl der Nachrichten begrenzen, werden die Protokollnachrichten, die erforderlich sind, um die verfügbaren Sicherungsversionen zu erhalten, möglicherweise nicht empfangen. Dies verhindert, dass diese Versionen für diesen Sicherungslauf angezeigt werden.

:::tip
Nach der Konfiguration des **duplistatus**-Servers sollten Sie die Backup-Protokolle für alle Ihre Duplicati-Server sammeln, indem Sie [Backup-Protokolle sammeln](../user-guide/collect-backup-logs.md) verwenden.
:::
