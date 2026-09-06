# Duplicati Server-Konfiguration (erforderlich) {#duplicati-server-configuration-required}

Damit diese Anwendung ordnungsgemäß funktioniert, muss jeder Ihrer Duplicati-Server so konfiguriert werden, dass er für jeden Sicherungslauf HTTP-Berichte an den **duplistatus**-Server sendet.

Wenden Sie diese Konfiguration auf jeden Ihrer Duplicati-Server an:

1. **Konfigurieren Sie die Backup-Ergebnisberichterstattung:** Wählen Sie auf der Duplicati-Konfigurationsseite `Settings` und fügen Sie im `Default Options`-Abschnitt die folgenden Optionen hinzu.

![Duplicati-Konfiguration](/img/duplicati-options.png)

Ersetzen Sie `my.local.server` durch den Hostnamen oder die IP-Adresse, die der Duplicati-Server verwendet, um **duplistatus** zu erreichen. Siehe [Duplicati und duplistatus auf demselben Host](#duplicati-and-duplistatus-on-the-same-host), wenn beide auf einem Gerät ausgeführt werden.

Siehe die Dokumentation zu [HTTP-Benachrichtigungen](https://docs.duplicati.com/monitoring-and-notifications/sending-reports-via-email/sending-http-notifications) von Duplicati für die Optionen.

### Empfohlene Optionen (Duplicati 2.0.9.106 und später) {#recommended-options-duplicati-209106-and-later}

`--send-http-json-urls` sendet bereits JSON, daher ist `--send-http-result-output-format=Json` nicht erforderlich (und wird für diese URLs ignoriert).

| Erweiterte Option           | Wert                                     |
    | ------------------------- | ---------------------------------------- |
    | `send-http-json-urls`     | `http://my.local.server:9666/api/upload` (füge `?api_key=` hinzu, wenn API-Schlüssel erforderlich sind) |
    | `send-http-log-level` | `Information` |
    | `send-http-max-log-lines`        | `500`                                    |

Alternativ können Sie auf `Edit as text` klicken und die folgenden Zeilen kopieren, indem Sie `my.local.server` durch Ihre tatsächliche Serveradresse ersetzen.

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload
--send-http-log-level=Information
--send-http-max-log-lines=500
```

Wenn [API-Schlüssel](../user-guide/settings/api-keys-settings.md) erforderlich sind, füge den Upload-Bereich-Schlüssel an die URL an:

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload?api_key=YOUR_UPLOAD_KEY
```

Duplicati kann benutzerdefinierte HTTP-Header nicht festlegen. Der Abfrageparameter ist der unterstützte Weg, den Schlüssel zu senden. Zugriffsprotokolle des Reverse-Proxys enthalten das Geheimnis, also beschränke, wer diese Protokolle lesen kann.

`--send-http-max-log-lines=500` hält den JSON-Bericht unter der Standard-Upload-Größenbegrenzung von 5 MB. `--send-http-max-log-lines=0` (unbegrenzt) kann diese Begrenzung überschreiten und HTTP 413 zurückgeben. Erhöhe das Limit in Einstellungen → API-Schlüssel, wenn du größere Berichte benötigst.

### Ältere Duplicati-Versionen {#older-duplicati-versions}

Wenn Ihr Duplicati-Server älter als 2.0.9.106 ist, verwenden Sie die Legacy-URL-Option und legen Sie das Ergebnisformat auf JSON fest:

| Erweiterte Option | Wert |
    | -------------------------------- | ---------------------------------------- |
    | `send-http-url` | `http://my.local.server:9666/api/upload` |
    | `send-http-result-output-format` | `Json` |
    | `send-http-log-level` | `Information` |
    | `send-http-max-log-lines`        | `500`                                    |

```bash
--send-http-url=http://my.local.server:9666/api/upload
--send-http-result-output-format=Json
--send-http-log-level=Information
--send-http-max-log-lines=500
```

### Protokollzeilen und verfügbare Versionen {#log-lines-and-available-versions}

**Wichtige Hinweise zu Nachrichten, die von Duplicati gesendet werden:**

- Wenn Sie `--send-http-log-level=Information` weglassen, werden keine Log-Nachrichten an **duplistatus** gesendet, sondern nur Statistiken. Dies verhindert, dass die **Liste** der verfügbaren Versionen funktioniert.
- Der Standardwert von Duplicati ist `--send-http-max-log-lines=100`. Der empfohlene Wert ist `500`. Duplicati behält die **ersten** N Log-Zeilen. Die Zeilen, die für die Liste der verfügbaren Versionen (`Backups to consider`) verwendet werden, befinden sich normalerweise in diesen ersten hundert Zeilen; `100` ist oft zu wenig.
- `--send-http-max-log-lines=0` bedeutet unbegrenzt. Verwenden Sie dies nur, wenn die Versionsliste immer noch fehlt und Sie **nicht** gleichzeitig Berichte an [Duplicati Monitoring](https://www.duplicati-monitoring.com/) senden. Unbegrenzte Logs können dazu führen, dass dieser Dienst bei großen Jobs einen HTTP 500 Fehler zurückgibt.
- Die **Anzahl** der verfügbaren Versionen stammt weiterhin aus den JSON-Statistiken (`BackupListCount`), auch wenn die detaillierte Zeitstempel-Liste fehlt. Wenn das Listen-Symbol ausgegraut ist, erhöhen Sie das Limit (oder verwenden Sie `0`, wenn Sie nur an **duplistatus** melden).

:::tip
Nach der Konfiguration des **duplistatus**-Servers sammeln Sie die Sicherungsprotokolle für alle Ihre Duplicati-Server mit [Backup-Protokolle sammeln](../user-guide/collect-backup-logs.md).
:::

### Berichterstattung an duplistatus und Duplicati Monitoring {#reporting-to-duplistatus-and-duplicati-monitoring}

Sie können Berichte vom **gleichen** Duplicati-Server an **duplistatus** und [Duplicati Monitoring](https://www.duplicati-monitoring.com/) gleichzeitig senden. **duplistatus** muss JSON empfangen. Duplicati Monitoring erwartet formencodierte Berichte. Richten Sie `--send-http-form-urls` nicht auf `/api/upload`. 

Auf diesem Duplicati-Server legen Sie die Standardoptionen fest:

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload
--send-http-form-urls=https://www.duplicati-monitoring.com/log/<your-endpoint>
--send-http-log-level=Information
--send-http-max-log-lines=500
```

Ersetzen Sie `<your-endpoint>` durch die URL aus Ihrem Duplicati Monitoring-Konto.

- Bevorzugen Sie diese speziellen Optionen. Halten Sie `--send-http-url` nicht auch auf dieselben Ziele gerichtet, es sei denn, Sie benötigen die Legacy-Option weiterhin.
- `--send-http-log-level` und `--send-http-max-log-lines` gelten für **jeden** HTTP-Ziel. Sie können kein vollständiges Protokoll an **duplistatus** und einen kurzen Bericht an Duplicati Monitoring senden.
- Verwenden Sie `500`, nicht `0`. Wenn Duplicati Monitoring bei großen Jobs weiterhin HTTP 500 zurückgibt, senken Sie die Obergrenze weiter (oder lassen Sie `Information` weg), wobei die Version **Liste** möglicherweise fehlt. Wenn die Liste fehlt, aber Monitoring in Ordnung ist, erhöhen Sie die Obergrenze. Alternativ senden Sie nur an **duplistatus** für diese Jobs.

:::caution
Wenn ein HTTP-Ziel ausfällt (Ausfall oder HTTP 500), sendet Duplicati möglicherweise die verbleibenden Berichte nicht. Formulare werden zuerst gesendet, dann JSON-URLs. Ein Ausfall oder 500 von Duplicati Monitoring kann daher den JSON-Bericht an **duplistatus** blockieren.
:::

[Backup-Protokolle sammeln](../user-guide/collect-backup-logs.md) hängt nicht von der HTTP-Berichterstattung ab. Verwenden Sie es, um einen Lauf zu ergänzen, der nicht empfangen wurde.

### Duplicati und duplistatus auf demselben Host {#duplicati-and-duplistatus-on-the-same-host}

Die Upload-URL muss **vom Duplicati-Prozess** aus erreichbar sein, nicht von Ihrem Browser.

- **Duplicati auf dem Host, duplistatus in Docker mit Port `9666` veröffentlicht:** `http://127.0.0.1:9666/api/upload` (oder die LAN-IP des Hosts).
- **Beide in Docker auf einem gemeinsamen Netzwerk:** `http://duplistatus:9666/api/upload` (der Compose-Dienst oder Containername). `localhost` innerhalb des Duplicati-Containers ist dieser Container, nicht **duplistatus**.
- **HTTPS-Reverse-Proxy auf demselben Host:** Verwenden Sie die öffentliche HTTPS-URL wie in [HTTPS-Setup](https-setup.md).

Backup-Protokolle sammeln ist die umgekehrte Richtung: vom **duplistatus**-Container aus ist `localhost:8200` nicht Duplicati auf dem Host. Verwenden Sie die Host-IP, `host.docker.internal` (Docker Desktop oder einen zusätzlichen Host, den Sie konfiguriert haben), oder den Duplicati-Containernamen.

2. **Optional - Remotezugriff auf die Benutzeroberfläche erlauben:** Wenn Sie von den **duplistatus**-Dashboard-Links direkt auf die Duplicati-Weboberfläche zugreifen möchten, melden Sie sich bei [Duplicati's UI](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui) an, wählen Sie `Settings` und erlauben Sie den Remotezugriff, einschließlich einer Liste von Hostnamen (oder verwenden Sie `*`). Wenn Sie dies überspringen, wird **duplistatus** weiterhin Backup-Berichte empfangen, aber die direkten Links zur Duplicati-Benutzeroberfläche funktionieren nicht.

:::info
Wenn Sie den Remotezugriff in Duplicati nicht aktivieren, funktionieren die Links in **Duplistatus** zum Zugriff auf die __Duplicati-Benutzeroberfläche__ nicht.
:::

![Duplicati-Einstellungen](/img/duplicati-settings.png)

:::caution
Aktivieren Sie den Remotezugriff nur, wenn Ihr Duplicati-Server durch ein sicheres Netzwerk geschützt ist
(z. B. VPN, privates LAN oder Firewallregeln). Die Bereitstellung der Duplicati-Schnittstelle im öffentlichen Internet
ohne angemessene Sicherheitsmaßnahmen könnte zu unbefugtem Zugriff führen.

Es wird empfohlen, Lösungen wie Tailscale, Headscale, NetBird, ZeroTier, Nebula, Twingate, Pritunl, Cloudflare Access, Wireguard oder ähnliche zu verwenden, um sicher von außerhalb Ihres lokalen Netzwerks auf Ihre Server zuzugreifen.
:::
