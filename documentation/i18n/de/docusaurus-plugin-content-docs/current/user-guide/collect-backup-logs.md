# Backup-Protokolle sammeln {/* #collect-backup-logs */}

**duplistatus** kann Backup-Protokolle direkt von Duplicati-Servern abrufen, um die Datenbank zu füllen oder fehlende Protokolldaten wiederherzustellen. Die Anwendung überspringt automatisch alle doppelten Protokolle, die bereits in der Datenbank vorhanden sind.

## Schritte zum Sammeln von Backup-Protokollen {/* #steps-to-collect-backup-logs */}

### Manuelle Sammlung {/* #manual-collection */}

1.  Klicken Sie auf das <IconButton icon="lucide:download" /> **Backup-Protokolle sammeln**-Symbol in der [Anwendungssymbolleiste](overview.md#application-toolbar).

![Popup für Backup-Protokolle sammeln](../assets/screen-collect-button-popup.png)

2.  Server auswählen

Wenn Sie Serveradressen in [Einstellungen → Servereinstellungen](settings/server-settings.md) konfiguriert haben, wählen Sie einen aus der Dropdown-Liste für eine Sofortsammlung. Wenn Sie keine Server konfiguriert haben, können Sie die Duplicati-Serverdetails manuell eingeben.

3.  Geben Sie die Duplicati-Serverdetails ein:
    - **Hostname**: Der Hostname oder die IP-Adresse des Duplicati-Servers. Sie können mehrere Hostnamen durch Kommas getrennt eingeben, zum Beispiel `192.168.1.23,someserver.local,192.168.1.89`
    - **Port**: Die vom Duplicati-Server verwendete Portnummer (Standard: `8200`).
    - **Passwort**: Geben Sie das Authentifizierungspasswort ein, falls erforderlich.
    - **Gesammelte JSON-Daten herunterladen**: Aktivieren Sie diese Option, um die von duplistatus gesammelten Daten herunterzuladen.
4.  Klicken Sie auf **Backups sammeln**.

***Hinweise:***
- Wenn Sie mehrere Hostnamen eingeben, wird die Sammlung unter Verwendung desselben Ports und Passworts für alle Server durchgeführt.
- **duplistatus** erkennt automatisch das beste Verbindungsprotokoll (HTTPS oder HTTP). Es versucht zuerst HTTPS (mit ordnungsgemäßer SSL-Validierung), dann HTTPS mit selbstsignierten Zertifikaten und schließlich HTTP als Fallback.

:::tip
<IconButton icon="lucide:download" /> Schaltflächen sind in [Einstellungen → Backup-Überwachung](settings/backup-monitoring-settings.md) und [Einstellungen → Servereinstellungen](settings/server-settings.md) für die Einzelserver-Sammlung verfügbar.
:::

<br/>

### Massensammlung {/* #bulk-collection */}

_Rechtsklick_ auf die <IconButton icon="lucide:download" /> **Backup-Protokolle sammeln**-Schaltfläche in der Anwendungssymbolleiste, um von allen konfigurierten Servern zu sammeln.

![Sammlung aller Rechtsklick-Menüs](../assets/screen-collect-button-right-click-popup.png)

:::tip
Sie können auch die <IconButton icon="lucide:import" label="Alle sammeln"/>-Schaltfläche auf den Seiten [Einstellungen → Backup-Überwachung](settings/backup-monitoring-settings.md) und [Einstellungen → Servereinstellungen](settings/server-settings.md) verwenden, um von allen konfigurierten Servern zu sammeln.
:::

## So funktioniert der Sammelprozess {/* #how-the-collection-process-works */}

- **duplistatus** erkennt automatisch das beste Verbindungsprotokoll und verbindet sich mit dem angegebenen Duplicati-Server.
- Es ruft Sicherungsverlauf, Protokollinformationen und Sicherungseinstellungen (für die Backup-Überwachung) ab.
- Alle Protokolle, die bereits in der **duplistatus**-Datenbank vorhanden sind, werden übersprungen.
- Neue Daten werden verarbeitet und in der lokalen Datenbank gespeichert, einschließlich der in jedem Backup-Protokoll gemeldeten Duplicati-Version. Die [Dashboard-Version](dashboard.md#duplicati-server-version) wird aus dem neuesten gespeicherten Protokoll genommen — **duplistatus** liest nicht die Version, die aktuell auf dem Server läuft. Nach einem Duplicati-Upgrade sammeln Sie oder warten Sie auf ein neues Backup, damit das Dashboard die neue Version anzeigen kann.
- Die verwendete URL (mit dem erkannten Protokoll) wird in der lokalen Datenbank gespeichert oder aktualisiert.
- Wenn die Download-Option ausgewählt ist, werden die gesammelten JSON-Daten heruntergeladen, sobald Daten vom Duplicati-Server empfangen werden — auch wenn die Protokolle bei der Validierung fehlschlagen oder nicht in die Datenbank importiert werden können. Der Dateiname hat dieses Format: `[serverName]_collected_[Timestamp].json`. Der Zeitstempel verwendet das ISO 8601-Datumsformat (JJJJ-MM-TTTHH:MM:SS).
- Das Dashboard wird aktualisiert, um die neuen Informationen widerzuspiegeln.

:::note Doppelte Server nach der Sammlung gesehen?
Wenn derselbe Server nach dem Sammeln von Backup-Protokollen (oder nach einer Duplicati-Neuinstallation/-Aktualisierung) mehrfach erscheint, wird dies normalerweise durch eine geänderte `machine_id` oder durch einen Duplicati-API-Bug verursacht, der die `identity`-ID und die `machine_id` vermischt. Die Lösung besteht darin, die IDs auf dem Duplicati-Server auszurichten (bearbeiten Sie `identity.txt`/`machineid.txt` oder setzen Sie **Duplicati → Einstellungen → Erweiterte Optionen → Maschinen-ID**), starten Sie Duplicati neu und führen Sie dann die Einträge in **duplistatus** über [Einstellungen → Datenbankverwaltung → Doppelte Server zusammenführen](settings/database-maintenance.md#merge-duplicate-servers) zusammen. Siehe [Doppelte Server im Dashboard](troubleshooting.md#duplicate-servers-on-the-dashboard) für vollständige Schritte.
:::

## Problembehandlung bei Sammlungsproblemen {/* #troubleshooting-collection-issues */}

Die Sicherung der Protokollsammlung erfordert, dass der Duplicati-Server von der **duplistatus**-Installation aus zugänglich ist. Wenn Sie auf Probleme stoßen, überprüfen Sie bitte Folgendes:

- Stellen Sie sicher, dass der Hostname (oder die IP-Adresse) und die Portnummer korrekt sind. Sie können dies testen, indem Sie auf die Duplicati-Server-Benutzeroberfläche in Ihrem Browser zugreifen (z. B. `http://hostname:port`).
- Prüfen Sie, ob **duplistatus** eine Verbindung zum Duplicati-Server herstellen kann. Ein häufiges Problem ist die DNS-Namensauflösung (das System kann den Server nicht über seinen Hostnamen finden). Weitere Informationen finden Sie im [Abschnitt zur Fehlerbehebung](troubleshooting.md#collect-backup-logs-not-working).
- Stellen Sie sicher, dass das von Ihnen angegebene Passwort korrekt ist.
- Bei Duplicati 2.4+ liest die Sammlung die Maschinen-ID aus den Duplicati-Servereinstellungen, wenn die Standardeinstellung für die Option „systeminfo“ leer ist.
