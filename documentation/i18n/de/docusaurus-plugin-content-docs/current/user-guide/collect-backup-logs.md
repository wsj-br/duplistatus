# Backup-Protokolle sammeln {/* #collect-backup-logs */}

**duplistatus** kann Backup-Protokolle direkt von Duplicati-Servern abrufen, um die Datenbank zu füllen oder fehlende Protokolldaten wiederherzustellen. Die Anwendung überspringt automatisch alle doppelten Protokolle, die bereits in der Datenbank vorhanden sind.

## Schritte zum Sammeln von Backup-Protokollen {/* #steps-to-collect-backup-logs */}

### Manuelles Sammeln {/* #manual-collection */}

1.  Klicken Sie auf das <IconButton icon="lucide:download" /> **Backup-Protokolle sammeln** Symbol in der [Anwendungssymbolleiste](overview.md#application-toolbar).

![Backup-Protokolle sammeln Popup](../assets/screen-collect-button-popup.png)

2.  Server auswählen

Wenn Sie Serveradressen in [Einstellungen → Server-Einstellungen](settings/server-settings.md) konfiguriert haben, wählen Sie einen aus der Dropdown-Liste für eine sofortige Sammlung aus. Wenn Sie keine Server konfiguriert haben, können Sie die Duplicati-Serverdetails manuell eingeben.

3.  Geben Sie die Duplicati-Serverdetails ein:
    - **Hostname**: Der Hostname oder die IP-Adresse des Duplicati-Servers. Sie können mehrere Hostnamen durch Kommas trennen, zum Beispiel `192.168.1.23,someserver.local,192.168.1.89`
    - **Port**: Die Portnummer, die vom Duplicati-Server verwendet wird (Standard: `8200`).
    - **Passwort**: Geben Sie das Authentifizierungspasswort ein, falls erforderlich.
    - **Gesammelte JSON-Daten herunterladen**: Aktivieren Sie diese Option, um die von duplistatus gesammelten Daten herunterzuladen.
4.  Klicken Sie auf **Backups sammeln**.

***Hinweise:***
- Wenn Sie mehrere Hostnamen eingeben, wird die Sammlung mit demselben Port und Passwort für alle Server durchgeführt.
- **duplistatus** erkennt automatisch das beste Verbindungsprotokoll (HTTPS oder HTTP). Es versucht zuerst HTTPS (mit korrekter SSL-Validierung), dann HTTPS mit selbstsignierten Zertifikaten und schließlich HTTP als Fallback.

:::tip
<IconButton icon="lucide:download" /> Schaltflächen sind in [Einstellungen → Backup-Überwachung](settings/backup-monitoring-settings.md) und [Einstellungen → Server-Einstellungen](settings/server-settings.md) für die Einzel-Server-Sammlung verfügbar.
:::

<br/>

### Massen-Sammlung {/* #bulk-collection */}

_Klicken Sie mit der rechten Maustaste_ auf die <IconButton icon="lucide:download" /> **Backup-Protokolle sammeln** Schaltfläche in der Anwendungsleiste, um von allen konfigurierten Servern zu sammeln.

![Alle sammeln Rechtsklick-Menü](../assets/screen-collect-button-right-click-popup.png)

:::tip
Sie können auch die <IconButton icon="lucide:import" label="Alle sammeln"/>-Schaltfläche auf den Seiten [Einstellungen → Backup-Überwachung](settings/backup-monitoring-settings.md) und [Einstellungen → Server-Einstellungen](settings/server-settings.md) verwenden, um von allen konfigurierten Servern zu sammeln.
:::

## Wie der Sammlungsprozess funktioniert {/* #how-the-collection-process-works */}

- **duplistatus** erkennt automatisch das beste Verbindungsprotokoll und verbindet sich mit dem angegebenen Duplicati-Server.
- Es ruft den Sicherungsverlauf, Protokollinformationen und Sicherungseinstellungen (für die Backup-Überwachung) ab.
- Alle bereits in der **duplistatus** Datenbank vorhandenen Protokolle werden übersprungen.
- Neue Daten werden verarbeitet und in der lokalen Datenbank gespeichert, einschließlich der in jedem Backup-Protokoll gemeldeten Duplicati-Version. Die [Dashboard-Version](dashboard.md#duplicati-server-version) wird aus dem neuesten gespeicherten Protokoll entnommen — **duplistatus** liest nicht die Version, die derzeit auf dem Server läuft. Nach einem Duplicati-Upgrade sammeln oder warten Sie auf ein neues Backup, damit das Dashboard die neue Version anzeigen kann.
- Die verwendete URL (mit dem erkannten Protokoll) wird in der lokalen Datenbank gespeichert oder aktualisiert.
- Wenn die Download-Option ausgewählt ist, wird die JSON-Daten heruntergeladen, die immer dann gesammelt werden, wenn Daten vom Duplicati-Server empfangen werden — selbst wenn die Protokolle die Validierung nicht bestehen oder nicht in die Datenbank importiert werden können. Der Dateiname wird in diesem Format sein: `[serverName]_collected_[Timestamp].json`. Der Zeitstempel verwendet das ISO 8601-Datumsformat (JJJJ-MM-TTTHH:MM:SS).
- Das Dashboard wird aktualisiert, um die neuen Informationen wiederzugeben.

:::note Doppelte Server nach der Sammlung sehen?
Wenn derselbe Server nach dem Sammeln von Backup-Protokollen (oder nach einem Duplicati-Neuinstallation/Upgrade) mehrmals erscheint, ist dies normalerweise verursacht durch eine geänderte `machine_id` oder durch einen Duplicati-API-Fehler, der die `identity` ID und die `machine_id` mischt. Die Lösung besteht darin, die IDs auf dem Duplicati-Server auszurichten (bearbeiten Sie `identity.txt`/`machineid.txt` oder setzen Sie **Duplicati → Einstellungen → Erweiterte Optionen → Machine-id**), starten Sie Duplicati neu und führen Sie die Einträge in **duplistatus** über [Einstellungen → Datenbankverwaltung → Doppelte Server zusammenführen](settings/database-maintenance.md#merge-duplicate-servers) zusammen. Siehe [Doppelte Server im Dashboard](troubleshooting.md#duplicate-servers-on-the-dashboard) für die vollständigen Schritte.
:::

## Fehlerbehebung bei Sammlungsproblemen {/* #troubleshooting-collection-issues */}

Die Sammlung von Sicherungsprotokollen erfordert, dass der Duplicati-Server von der **duplistatus**-Installation aus zugänglich ist. Bei Problemen überprüfen Sie bitte Folgendes:

- Stellen Sie sicher, dass der Hostname (oder die IP-Adresse) und die Portnummer korrekt sind. Sie können dies testen, indem Sie die Duplicati-Server-Benutzeroberfläche in Ihrem Browser aufrufen (z. B. `http://hostname:port`).
- Überprüfen Sie, ob **duplistatus** eine Verbindung zum Duplicati-Server herstellen kann. Ein häufiges Problem ist die DNS-Namensauflösung (das System kann den Server nicht über seinen Hostnamen finden). Weitere Informationen finden Sie im Abschnitt [Problembehandlung](troubleshooting.md#collect-backup-logs-not-working).
- Stellen Sie sicher, dass das von Ihnen eingegebene Passwort korrekt ist.
- Ab Duplicati 2.4+ liest die Sammlung die machine-id aus den Duplicati-Server-Einstellungen, wenn die systeminfo-Option standardmäßig leer ist.
