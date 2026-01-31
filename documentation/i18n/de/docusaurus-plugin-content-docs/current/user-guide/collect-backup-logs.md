---
translation_last_updated: '2026-01-31T00:51:26.127Z'
source_file_mtime: '2026-01-27T14:22:06.834Z'
source_file_hash: 7c51c9b4d087ca84
translation_language: de
source_file_path: user-guide/collect-backup-logs.md
---
# Backup-Protokolle sammeln {#collect-backup-logs}

**duplistatus** kann Sicherungsprotokolle direkt von Duplicati-Server abrufen, um die Datenbank zu füllen oder fehlende Protokolldaten wiederherzustellen. Die Anwendung überspringt automatisch alle doppelten Protokolle, die bereits in der Datenbank vorhanden sind.

## Schritte zum Sammeln von Backup-Protokollen {#steps-to-collect-backup-logs}

### Manuelle Erfassung {#manual-collection}

1.  Klicken Sie auf das Symbol <IconButton icon="lucide:download" /> `Collect Backup Logs` in der [Anwendungssymbolleiste](overview#application-toolbar).

![Collect Backup Logs Popup](/assets/screen-collect-button-popup.png)

2.  Server auswählen

Wenn Sie Server-Adressen in `Settings → Server Settings` konfiguriert haben, wählen Sie eine aus der Dropdown-Liste aus, um eine sofortige Erfassung durchzuführen. Wenn Sie keine Server konfiguriert haben, können Sie die Duplicati-Server-Details manuell eingeben.

3.  Geben Sie die Details des Duplicati-Servers ein:
    - **Hostname**: Der Hostname oder die IP-Adresse des Duplicati-Servers. Sie können mehrere Hostnamen durch Kommas getrennt eingeben, beispielsweise `192.168.1.23,someserver.local,192.168.1.89`
    - **Port**: Die Portnummer, die vom Duplicati-Server verwendet wird (Standard: `8200`).
    - **Passwort**: Geben Sie das Authentifizierungspasswort ein, falls erforderlich.
    - **Gesammelte JSON-Daten herunterladen**: Aktivieren Sie diese Option, um die von duplistatus gesammelten Daten herunterzuladen.
4.  Klicken Sie auf `Collect Backups`.

***Hinweise:***
- Wenn Sie mehrere Hostnamen eingeben, wird die Erfassung mit demselben Port und Passwort für alle Server durchgeführt.
- **duplistatus** erkennt automatisch das beste Verbindungsprotokoll (HTTPS oder HTTP). Es versucht zunächst HTTPS (mit ordnungsgemäßer SSL-Validierung), dann HTTPS mit selbstsigniertem Zertifikat und schließlich HTTP als Fallback.

:::tip
<IconButton icon="lucide:download" /> Schaltflächen sind in `Einstellungen → Überfällige Überwachung` und `Einstellungen → Server-Einstellungen` für die Erfassung einzelner Server verfügbar.
:::

<br/>

### Massenerfassung {#bulk-collection}

_Rechtsklick_ auf die <IconButton icon="lucide:download" /> `Sammeln Sicherungs-Protokolle`-Schaltfläche in der Anwendungssymbolleiste, um Daten von allen konfigurierten Servern zu sammeln.

![Collect All Right-Click Menu](/assets/screen-collect-button-right-click-popup.png)

:::tip
Sie können auch die <IconButton icon="lucide:import" label="Alle sammeln"/> Schaltfläche auf den Seiten `Einstellungen → Überfällige Überwachung` und `Einstellungen → Server-Einstellungen` verwenden, um von allen konfigurierten Servern zu sammeln.
:::

## Wie der Erfassungsprozess funktioniert {#how-the-collection-process-works}

- **duplistatus** erkennt automatisch das beste Verbindungsprotokoll und verbindet sich mit dem angegebenen Duplicati-Server.
- Es ruft den Sicherungsverlauf, Protokollinformationen und Sicherungseinstellungen ab (für die Überwachung überfälliger Sicherungen).
- Alle bereits in der **duplistatus**-Datenbank vorhandenen Protokolle werden übersprungen.
- Neue Daten werden verarbeitet und in der lokalen Datenbank gespeichert.
- Die verwendete URL (mit dem erkannten Protokoll) wird in der lokalen Datenbank gespeichert oder aktualisiert.
- Wenn die Download-Option ausgewählt ist, werden die gesammelten JSON-Daten heruntergeladen. Der Dateiname hat folgendes Format: `[serverName]_collected_[Timestamp].json`. Der Zeitstempel verwendet das ISO-8601-Datumsformat (YYYY-MM-DDTHH:MM:SS).
- Das Dashboard wird aktualisiert, um die neuen Informationen widerzuspiegeln.

## Behebung von Erfassungsproblemen {#troubleshooting-collection-issues}

Die Erfassung von Sicherungsprotokollen erfordert, dass der Duplicati-Server von der **duplistatus**-Installation aus erreichbar ist. Falls Sie auf Probleme stoßen, bestätigen Sie bitte Folgendes:

- Bestätigen Sie, dass der Hostname (oder die IP-Adresse) und die Portnummer korrekt sind. Sie können dies testen, indem Sie die Duplicati-Server-Benutzeroberfläche in Ihrem Browser aufrufen (z. B. `http://hostname:port`).
- Prüfen Sie, dass **duplistatus** eine Verbindung zum Duplicati-Server herstellen kann. Ein häufiges Problem ist die DNS-Namensauflösung (das System kann den Server anhand seines Hostnamens nicht finden). Weitere Informationen finden Sie im [Abschnitt zur Fehlerbehebung](troubleshooting.md#collect-backup-logs-not-working).
- Stellen Sie sicher, dass das von Ihnen angegebene Passwort korrekt ist.
