# Duplicati-Server-Konfiguration (erforderlich) {/* #duplicati-server-configuration-required */}

Damit diese Anwendung ordnungsgemäß funktioniert, muss jeder Ihrer Duplicati-Server so konfiguriert werden, dass HTTP-Berichte für jeden Sicherungslauf an den **duplistatus**-Server gesendet werden.

Wenden Sie diese Konfiguration auf jeden Ihrer Duplicati-Server an:

1. **Konfigurieren Sie die Berichterstattung über Sicherungsresultate:** Auf der Duplicati-Konfigurationsseite wählen Sie `Settings` aus und fügen Sie im Abschnitt `Default Options` die folgenden Optionen ein.

![Duplicati-Konfiguration](/img/duplicati-options.png)

Ersetzen Sie `my.local.server` durch den Hostnamen oder die IP-Adresse, die der Duplicati-Server verwendet, um **duplistatus** zu erreichen. Siehe [Duplicati und duplistatus auf demselben Host](#duplicati-and-duplistatus-on-the-same-host), wenn beide auf einem Gerät ausgeführt werden.

Siehe die Dokumentation zu [HTTP-Benachrichtigungen](https://docs.duplicati.com/monitoring-and-notifications/sending-reports-via-email/sending-http-notifications) von Duplicati für die Optionen.

### Empfohlene Optionen (Duplicati 2.0.9.106 und später) {/* #recommended-options-duplicati-209106-and-later */}

`--send-http-json-urls` sendet bereits JSON, daher ist `--send-http-result-output-format=Json` nicht erforderlich (und wird für diese URLs ignoriert).

| Erweiterte Option           | Wert                                    |
    | ------------------------- | ---------------------------------------- |
    | `send-http-json-urls`     | `http://my.local.server:9666/api/upload` (fügen Sie `?api_key=` hinzu, wenn API-Schlüssel erforderlich sind) |
    | `send-http-log-level`            | `Information`                            |
    | `send-http-max-log-lines`        | `500`                                    |

Alternativ können Sie auf `Edit as text` klicken und die folgenden Zeilen kopieren, wobei Sie `my.local.server` durch die tatsächliche Serveradresse ersetzen.

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload
--send-http-log-level=Information
--send-http-max-log-lines=500
```

Wenn [API-Schlüssel](../user-guide/settings/api-keys-settings.md) erforderlich sind, fügen Sie den Upload-Bereichsschlüssel an die URL an:

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload?api_key=YOUR_UPLOAD_KEY
```

Duplicati kann keine benutzerdefinierten HTTP-Header festlegen. Der Abfrageparameter ist der unterstützte Weg, um den Schlüssel zu senden. Reverse-Proxy-Zugriffsprotokolle enthalten das Geheimnis, daher beschränken Sie, wer diese Protokolle lesen kann.

`--send-http-max-log-lines=500` hält den JSON-Bericht unter der Standard-Hochladungsgrößenbegrenzung von 5 MB. `--send-http-max-log-lines=0` (unbegrenzt) kann diese Begrenzung überschreiten und HTTP 413 zurückgeben. Erhöhen Sie die Begrenzung unter Einstellungen → API-Schlüssel, wenn Sie größere Berichte benötigen.

### Ältere Duplicati-Versionen {/* #older-duplicati-versions */}

Wenn Ihr Duplicati-Server älter als 2.0.9.106 ist, verwenden Sie die Legacy-URL-Option und legen Sie das Ergebnisformat auf JSON fest:

| Erweiterte Option                  | Wert                                    |
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

**Wichtige Hinweise zu von Duplicati gesendeten Nachrichten:**

- Wenn Sie `--send-http-log-level=Information` weglassen, werden keine Protokollnachrichten an **duplistatus** gesendet, nur Statistiken. Dies verhindert, dass die verfügbaren Versionen **Liste** funktioniert.
- Der Standardwert von Duplicati ist `--send-http-max-log-lines=100`. Der empfohlene Wert ist `500`. Duplicati behält die **ersten** N Protokollzeilen. Die Zeilen, die für die Liste der verfügbaren Versionen verwendet werden (`Backups to consider`), befinden sich normalerweise in den ersten Hunderten von Zeilen; `100` ist oft zu wenig.
- `--send-http-max-log-lines=0` bedeutet unbegrenzt. Verwenden Sie das nur, wenn die Versionsliste weiterhin fehlt und Sie **nicht** auch Berichte an [Duplicati Monitoring](https://www.duplicati-monitoring.com/) senden. Unbegrenzte Protokolle können dazu führen, dass dieser Dienst bei großen Jobs HTTP 500 zurückgibt.
- Die **Anzahl** der verfügbaren Versionen stammt weiterhin aus den JSON-Statistiken (`BackupListCount`), selbst wenn die detaillierte Zeitstempelliste fehlt. Wenn das Listensymbol ausgegraut ist, erhöhen Sie die Obergrenze (oder verwenden Sie `0`, wenn Sie nur an **duplistatus** berichten).

:::tip
Nach der Konfiguration des **duplistatus**-Servers sammeln Sie die Sicherungsprotokolle für alle Ihre Duplicati-Server mithilfe von [Backup-Protokolle sammeln](../user-guide/collect-backup-logs.md).
:::

### Berichterstattung an duplistatus und Duplicati Monitoring {/* #reporting-to-duplistatus-and-duplicati-monitoring */}

Sie können Berichte von dem **gleichen** Duplicati-Server gleichzeitig an **duplistatus** und [Duplicati Monitoring](https://www.duplicati-monitoring.com/) senden. **duplistatus** muss JSON empfangen. Duplicati Monitoring erwartet form-kodierte Berichte. Verweisen Sie nicht `--send-http-form-urls` auf `/api/upload`.

Auf diesem Duplicati-Server legen Sie die Standardoptionen fest:

```bash
--send-http-json-urls=http://my.local.server:9666/api/upload
--send-http-form-urls=https://www.duplicati-monitoring.com/log/<your-endpoint>
--send-http-log-level=Information
--send-http-max-log-lines=500
```

Ersetzen Sie `<your-endpoint>` durch die URL aus Ihrem Duplicati Monitoring-Konto.

- Bevorzugen Sie diese dedizierten Optionen. Halten Sie `--send-http-url` nicht auch auf dieselben Ziele gerichtet, es sei denn, Sie benötigen die Legacy-Option weiterhin.
- `--send-http-log-level` und `--send-http-max-log-lines` gelten für **jedes** HTTP-Ziel. Sie können kein vollständiges Protokoll an **duplistatus** und einen kurzen Bericht an Duplicati Monitoring senden.
- Verwenden Sie `500`, nicht `0`. Wenn Duplicati Monitoring bei großen Jobs immer noch HTTP 500 zurückgibt, verringern Sie die Obergrenze weiter (oder lassen Sie `Information` aus), wobei die Versions**liste** fehlen könnte. Wenn die Liste fehlt, aber Monitoring in Ordnung ist, erhöhen Sie die Obergrenze. Alternativ senden Sie nur an **duplistatus** für diese Jobs Berichte.

:::caution
Wenn ein HTTP-Ziel scheitert (Ausfall oder HTTP 500), sendet Duplicati möglicherweise die verbleibenden Berichte nicht. Formulare werden zuerst gesendet, dann JSON-URLs. Ein Ausfall oder 500 von Duplicati Monitoring kann daher den JSON-Bericht an **duplistatus** blockieren.
:::

[Backup-Protokolle sammeln](../user-guide/collect-backup-logs.md) hängt nicht von der HTTP-Berichterstattung ab. Verwenden Sie es, um einen Lauf zu ergänzen, der nicht empfangen wurde.

### Duplicati und duplistatus auf demselben Host {/* #duplicati-and-duplistatus-on-the-same-host */}

Die Upload-URL muss **vom Duplicati-Prozess** erreichbar sein, nicht von Ihrem Browser.

- **Duplicati auf dem Host, duplistatus in Docker mit Port `9666` veröffentlicht:** `http://127.0.0.1:9666/api/upload` (oder die Host-LAN-IP).
- **Beide in Docker auf einem gemeinsamen Netzwerk:** `http://duplistatus:9666/api/upload` (der Compose-Dienst oder der Containername). `localhost` innerhalb des Duplicati-Containers ist dieser Container, nicht **duplistatus**.
- **HTTPS-Reverse-Proxy auf demselben Host:** Verwenden Sie die öffentliche HTTPS-URL wie in [Sicherheitshärtung](security-hardening.md).

Backup-Protokolle sammeln ist die umgekehrte Richtung: vom **duplistatus**-Container aus ist `localhost:8200` nicht Duplicati auf dem Host. Verwenden Sie die Host-IP, `host.docker.internal` (Docker Desktop oder einen zusätzlichen Host, den Sie konfiguriert haben), oder den Duplicati-Containernamen.

2. **Optional - Remote-UI-Zugriff erlauben:** Wenn Sie auf die Duplicati-Weboberfläche direkt von den **duplistatus**-Dashboard-Links zugreifen möchten, melden Sie sich bei [Duplicatis UI](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui) an, wählen Sie `Settings` aus und erlauben Sie den Remote-Zugriff, einschließlich einer Liste von Hostnamen (oder verwenden Sie `*`). Wenn Sie dies überspringen, empfängt **duplistatus** weiterhin Sicherungsberichte, aber die direkten Links zur Duplicati-UI funktionieren nicht.

:::info
Wenn Sie den Remote-Zugriff in Duplicati nicht aktivieren, funktionieren die Links in **Duplistatus** zur Zugriff auf die __Duplicati-UI__ nicht.
:::

![Duplicati-Einstellungen](/img/duplicati-settings.png)

:::caution
Aktivieren Sie den Remotezugriff nur, wenn Ihr Duplicati-Server durch ein sicheres Netzwerk geschützt ist
(z. B. VPN, privates LAN oder Firewall-Regeln). Die Offenlegung der Duplicati-Oberfläche im öffentlichen Internet
ohne angemessene Sicherheitsmaßnahmen könnte zu unberechtigtem Zugriff führen.

Es wird empfohlen, Tailscale, Headscale, NetBird, ZeroTier, Nebula, Twingate, Pritunl, Cloudflare Access, Wireguard oder ähnliche Lösungen zu verwenden, um Ihren Server sicher von außerhalb Ihres lokalen Netzwerks zuzugreifen.
:::
