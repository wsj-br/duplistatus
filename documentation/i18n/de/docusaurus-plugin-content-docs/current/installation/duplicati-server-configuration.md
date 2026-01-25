# Duplicati-Serverkonfiguration (Erforderlich)

Damit diese Anwendung ordnungsgemäß funktioniert, muss jeder Ihrer Duplicati-Server so konfiguriert werden, dass er HTTP-Berichte für jeden Backup-Lauf an den **duplistatus**-Server sendet.

Wenden Sie diese Konfiguration auf jeden Ihrer Duplicati-Server an:

1. **Remotezugriff zulassen:** Melden Sie sich bei der [Duplicati-Benutzeroberfläche](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui) an, wählen Sie `Einstellungen` und erlauben Sie den Remotezugriff, einschließlich einer Liste von Hostnamen (oder verwenden Sie `*`).

![Duplicati-Einstellungen](/img/duplicati-settings.png)

    ```
    :::caution
    Aktivieren Sie den Remotezugriff nur, wenn Ihr Duplicati-Server durch ein sicheres Netzwerk
    geschützt ist (z. B. VPN, privates LAN oder Firewall-Regeln). Die Offenlegung der Duplicati-Schnittstelle
    im öffentlichen Internet ohne angemessene Sicherheitsmaßnahmen könnte zu unbefugtem Zugriff führen.
    :::
    ```

2. **Backup-Ergebnisberichterstattung konfigurieren:** Wählen Sie auf der Duplicati-Konfigurationsseite `Einstellungen` und fügen Sie im Abschnitt `Standardoptionen` die folgenden Optionen hinzu. Ersetzen Sie 'my.local.server' durch Ihren Servernamen oder die IP-Adresse, auf der **duplistatus** ausgeführt wird.

    ```
    | Erweiterte Option                | Wert                                     |
    | -------------------------------- | ---------------------------------------- |
    | `send-http-url`                  | `http://my.local.server:9666/api/upload` |
    | `send-http-result-output-format` | `Json`                                   |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `0`                                      |
    ```

Alternativ können Sie auf `Als Text bearbeiten` klicken und die folgenden Zeilen kopieren, wobei Sie `my.local.server` durch Ihre tatsächliche Serveradresse ersetzen.

```bash
--send-http-url=http://my.local.server:9666/api/upload
--send-http-result-output-format=Json
--send-http-log-level=Information
--send-http-max-log-lines=0
```

![Duplicati-Konfiguration](/img/duplicati-options.png)

**Wichtige Hinweise zu von Duplicati gesendeten Nachrichten:**

- Wenn Sie `--send-http-log-level=Information` weglassen, werden keine Protokollnachrichten an **duplistatus** gesendet, sondern nur Statistiken. Dies verhindert, dass die Funktion für verfügbare Versionen funktioniert.
- Die empfohlene Konfiguration ist `--send-http-max-log-lines=0` für unbegrenzte Nachrichten, da die Duplicati-Standardeinstellung von 100 Nachrichten verhindern kann, dass die verfügbaren Versionen im Protokoll empfangen werden.
- Wenn Sie die Anzahl der Nachrichten begrenzen, werden die Protokollnachrichten, die zum Abrufen der verfügbaren Backup-Versionen erforderlich sind, möglicherweise nicht empfangen. Dies verhindert, dass diese Versionen für diesen Backup-Lauf angezeigt werden.

:::tip
Sammeln Sie nach der Konfiguration des **duplistatus**-Servers die Backup-Protokolle für alle Ihre Duplicati-Server mit [Backup-Protokolle sammeln](../user-guide/collect-backup-logs.md).
:::

