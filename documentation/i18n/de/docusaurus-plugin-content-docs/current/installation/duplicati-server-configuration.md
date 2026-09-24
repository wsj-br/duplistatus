# Duplicati-Server-Konfiguration (erforderlich) {/* #duplicati-server-configuration-required */}

Damit diese Anwendung ordnungsgemäß funktioniert, muss jeder Ihrer Duplicati-Server so konfiguriert sein, dass er für jeden Sicherungslauf HTTP-Berichte an den **duplistatus**-Server sendet.

Wenden Sie diese Konfiguration auf jeden Ihrer Duplicati-Server an:

1. **Berichterstellung für Sicherungsergebnisse konfigurieren:** Wählen Sie auf der Duplicati-Konfigurationsseite `Settings` aus und fügen Sie im Abschnitt `Default Options` die folgenden Optionen hinzu.

![Duplicati-Konfiguration](/img/duplicati-options.png)

Ersetzen Sie `my.local.server` durch den Hostnamen oder die IP-Adresse, die der Duplicati-Server verwendet, um **duplistatus** zu erreichen. Siehe [Duplicati und duplistatus auf demselben Host](#duplicati-and-duplistatus-on-the-same-host), wenn beide auf einem Rechner ausgeführt werden.

Siehe Duplicatis Dokumentation zu [HTTP-Benachrichtigungen](https://docs.duplicati.com/monitoring-and-notifications/sending-reports-via-email/sending-http-notifications) für die Optionsreferenz.

### Empfohlene Optionen (Duplicati 2.0.9.106 und später) {/* #recommended-options-duplicati-209106-and-later */}

`--send-http-json-urls` sendet bereits JSON, daher ist `--send-http-result-output-format=Json` nicht erforderlich (und wird für diese URLs ignoriert).

| Erweiterte Option           | Wert                                     |
    | ------------------------- | ---------------------------------------- |
    | `send-http-json-urls`     | `http://my.local.server:9666/api/upload` (fügen Sie `?api_key=` hinzu, wenn API-Schlüssel erforderlich sind) |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `500`                                    |

Alternativ können Sie auf `Edit as text` klicken und die folgenden Zeilen kopieren, wobei Sie `my.local.server` durch Ihre tatsächliche Serveradresse ersetzen.

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload
--send-http-log-level=Information
--send-http-max-log-lines=500
```

Wenn [API-Schlüssel](../user-guide/settings/api-keys-settings.md) erforderlich sind, hängen Sie den Upload-Bereichsschlüssel an die URL an:

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload?api_key=YOUR_UPLOAD_KEY
```

Duplicati kann keine benutzerdefinierten HTTP-Header setzen. Der Abfrageparameter ist der unterstützte Weg, um den Schlüssel zu senden. Zugriffsprotokolle von Reverse-Proxy enthalten das Geheimnis, daher beschränken Sie, wer diese Protokolle lesen kann.

`--send-http-max-log-lines=500` hält den JSON-Bericht gut unter der Standardgröße von 5 MB für Uploads. `--send-http-max-log-lines=0` (unbegrenzt) kann diese Begrenzung überschreiten und HTTP 413 zurückgeben. Erhöhen Sie das Limit in Einstellungen → API-Schlüssel, wenn Sie größere Berichte benötigen.

### Ältere Duplicati-Versionen {/* #older-duplicati-versions */}

Wenn Ihr Duplicati-Server älter als 2.0.9.106 ist, verwenden Sie die Legacy-URL-Option und stellen Sie das Ergebnisformat auf JSON ein:

| Erweiterte Option                  | Wert                                     |
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

### Protokollzeilen und verfügbare Versionen {/* #log-lines-and-available-versions */}

**Wichtige Hinweise zu Nachrichten, die von Duplicati gesendet werden:**

- Wenn Sie `--send-http-log-level=Information` weglassen, werden keine Protokollmeldungen an **duplistatus** gesendet, sondern nur Statistiken. Dadurch wird verhindert, dass die Liste der **verfügbaren Versionen** funktioniert.
- Das Standardverhalten von Duplicati ist `--send-http-max-log-lines=100`. Der empfohlene Wert ist `500`. Duplicati behält die **ersten** N Protokollzeilen. Die Zeilen, die für die Liste verfügbarer Versionen verwendet werden (`Backups to consider`), befinden sich normalerweise unter diesen ersten Hunderten von Zeilen; `100` ist oft zu wenig.
- `--send-http-max-log-lines=0` bedeutet unbegrenzt. Verwenden Sie dies nur, wenn die Versionsliste immer noch fehlt und Sie **nicht** auch Berichte an [Duplicati Monitoring](https://www.duplicati-monitoring.com/) senden. Unbegrenzte Protokolle können dazu führen, dass dieser Dienst bei großen Aufträgen HTTP 500 zurückgibt.
- Die **Anzahl** verfügbarer Versionen stammt weiterhin aus den JSON-Statistiken (`BackupListCount`), auch wenn die detaillierte Zeitstempelliste fehlt. Wenn das Listen-Symbol ausgegraut ist, erhöhen Sie das Limit (oder verwenden Sie `0`, wenn Sie nur an **duplistatus** berichten).

:::tip
Nachdem Sie den **duplistatus**-Server konfiguriert haben, sammeln Sie die Backup-Protokolle für alle Ihre Duplicati-Server mit [Backup-Protokolle sammeln](../user-guide/collect-backup-logs.md).
:::

### Berichterstattung an duplistatus und Duplicati Monitoring {/* #reporting-to-duplistatus-and-duplicati-monitoring */}

Sie können gleichzeitig Berichte vom **gleichen** Duplicati-Server an **duplistatus** und [Duplicati Monitoring](https://www.duplicati-monitoring.com/) senden. **duplistatus** muss JSON erhalten. Duplicati Monitoring erwartet formularkodierte Berichte. Zeigen Sie `--send-http-form-urls` nicht auf `/api/upload`.

Stellen Sie auf diesem Duplicati-Server die Standardeinstellungen wie folgt ein:

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload
--send-http-form-urls=https://www.duplicati-monitoring.com/log/<your-endpoint>
--send-http-log-level=Information
--send-http-max-log-lines=500
```

Ersetzen Sie `<your-endpoint>` durch die URL aus Ihrem Duplicati Monitoring-Konto.

- Bevorzugen Sie diese dedizierten Optionen. Entfernen Sie außerdem `--send-http-url`, das auf dieselben Ziele zeigt, es sei denn, Sie benötigen die Legacy-Option weiterhin.
- `--send-http-log-level` und `--send-http-max-log-lines` gelten für **jedes** HTTP-Ziel. Sie können nicht ein vollständiges Protokoll an **duplistatus** senden und einen kurzen Bericht an Duplicati Monitoring.
- Verwenden Sie `500`, nicht `0`. Wenn Duplicati Monitoring immer noch HTTP 500 bei großen Aufträgen zurückgibt, reduzieren Sie das Limit weiter (oder lassen Sie `Information` weg), wobei zu beachten ist, dass die Versions**liste** möglicherweise fehlt. Wenn die Liste fehlt, aber Monitoring in Ordnung ist, erhöhen Sie das Limit. Alternativ berichten Sie für diese Aufträge nur an **duplistatus**.

:::caution
Wenn ein HTTP-Ziel ausfällt (Ausfall oder HTTP 500), sendet Duplicati möglicherweise keine verbleibenden Berichte. Formular-URLs werden zuerst, dann JSON-URLs gesendet. Ein Ausfall oder 500 von Duplicati Monitoring kann daher den JSON-Bericht an **duplistatus** blockieren.
:::

[Backup-Protokolle sammeln](../user-guide/collect-backup-logs.md) hängt nicht von HTTP-Berichterstattung ab. Verwenden Sie es, um eine Ausführung nachträglich zu ergänzen, die nicht empfangen wurde.

### Duplicati und duplistatus auf demselben Host {/* #duplicati-and-duplistatus-on-the-same-host */}

Die Upload-URL muss **vom Duplicati-Prozess aus** erreichbar sein, nicht von Ihrem Browser aus.

- **Duplicati auf dem Host, duplistatus in Docker mit veröffentlichtem Port `9666`:** `http://127.0.0.1:9666/api/upload` (oder die LAN-IP des Hosts).
- **Beide in Docker in einem gemeinsamen Netzwerk:** `http://duplistatus:9666/api/upload` (der Name des Compose-Services oder Containers). `localhost` innerhalb des Duplicati-Containers ist dieser Container, nicht **duplistatus**.
- **HTTPS-Reverse-Proxy auf demselben Host:** Verwenden Sie die öffentliche HTTPS-URL wie in [Sicherheitskonfiguration](security-configuration.md).

Backup-Protokolle sammeln ist die umgekehrte Richtung: Vom **duplistatus**-Container aus ist `localhost:8200` nicht Duplicati auf dem Host. Verwenden Sie die Host-IP, `host.docker.internal` (Docker Desktop oder ein zusätzlicher von Ihnen konfigurierter Host) oder den Duplicati-Containernamen.

2. **Optional - Fernzugriff auf die Benutzeroberfläche zulassen:** Wenn Sie direkt über die Links im **duplistatus**-Dashboard auf die Duplicati-Web-Oberfläche zugreifen möchten, melden Sie sich bei [Duplicati's UI](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui) an, wählen Sie `Settings` aus und erlauben Sie den Remote-Zugriff, einschließlich einer Liste von Hostnamen (oder verwenden Sie `*`). Wenn Sie dies überspringen, erhält **duplistatus** weiterhin Backup-Berichte, aber die direkten Links zur Duplicati-Benutzeroberfläche funktionieren nicht.

:::info
Wenn Sie den Remote-Zugriff in Duplicati nicht aktivieren, funktionieren die Links in **Duplistatus** zum Zugriff auf die __Duplicati UI__ nicht.
:::

![Duplicati-Einstellungen](/img/duplicati-settings.png)

:::caution
Aktivieren Sie den Remote-Zugriff nur, wenn Ihr Duplicati-Server durch ein sicheres Netzwerk geschützt ist
(z. B. VPN, privates LAN oder Firewall-Regeln). Die Bereitstellung der Duplicati-Schnittstelle im öffentlichen Internet
ohne angemessene Sicherheitsmaßnahmen kann zu unbefugtem Zugriff führen.

Es wird empfohlen, Tailscale, Headscale, NetBird, ZeroTier, Nebula, Twingate, Pritunl, Cloudflare Access, Wireguard oder ähnliche Lösungen zu verwenden, um sicher auf Ihre Server außerhalb Ihres lokalen Netzwerks zuzugreifen.
:::
