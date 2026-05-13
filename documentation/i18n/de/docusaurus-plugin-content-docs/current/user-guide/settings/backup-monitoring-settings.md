# Sicherungsüberwachung {#backup-monitoring}

![Backup alerts](../../assets/screen-settings-monitoring.png)

## Server-Filterung {#server-filtering}

Die Serverliste auf dieser Seite kann mithilfe des Filterfeldes gefiltert werden.

**Filterergebnisse:**
- Server-ID
- Server-URL
- Namen von Backup-Jobs

Dies erleichtert das schnelle Auffinden bestimmter Server oder Backups in den Überwachungseinstellungen bei der Verwaltung vieler Systeme.

## Konfigurieren Sie die Überwachungseinstellungen pro Sicherung {#configure-per-backup-monitoring-settings}

-  **Servername**: Der Name des Servers, der auf überfällige Sicherungen überwacht werden soll. 
   - Klicken Sie auf <SvgIcon svgFilename="duplicati_logo.svg" height="18"/>, um die Web-Oberfläche des Duplicati-Servers zu öffnen.
   - Klicken Sie auf <IIcon2 icon="lucide:download" height="18"/>, um Sicherungs-Logs von diesem Server zu sammeln.
- **Sicherungsname**: Der Name der Sicherung, die auf überfällige Sicherungen überwacht werden soll.
- **Nächster Lauf**: Die nächste geplante Sicherungszeit, angezeigt in grün, wenn sie in der Zukunft liegt, oder in rot, wenn sie überfällig ist. Wenn Sie mit der Maus über den Wert "Nächster Lauf" fahren, wird ein Tooltip angezeigt, der den Zeitstempel der letzten Sicherung aus der Datenbank enthält, formatiert mit vollem Datum/Uhrzeit und relativer Zeitangabe.
- **Backup-Überwachung**: Aktivieren oder deaktivieren Sie die Backup-Überwachung für diese Sicherung.
- **Erwartetes Backup-Intervall**: Das erwartete Intervall zwischen Sicherungen.
- **Einheit**: Die Zeiteinheit des erwarteten Intervalls.
- **Erlaubte Tage**: Die erlaubten Wochentage für die Sicherung.

Wenn die Symbole neben dem Servernamen ausgegraut sind, ist der Server nicht in den [Einstellungen → Servereinstellungen](/user-guide/settings/server-settings) konfiguriert.

:::note
Wenn Sie Backup-Protokolle von einem Duplicati-Server sammeln, aktualisiert **duplistatus** automatisch die Sicherungsüberwachungsintervalle und Konfigurationen.
:::

:::tip
Um optimale Ergebnisse zu erzielen, sammeln Sie Backup-Protokolle, nachdem Sie die Konfiguration der Sicherungsauftragsintervalle auf Ihrem Duplicati-Server geändert haben. Dies stellt sicher, dass **duplistatus** mit Ihrer aktuellen Konfiguration synchronisiert bleibt.
:::

## Globale Konfigurationen {#global-configurations}

Diese Einstellungen gelten für alle Sicherungen:

| Einstellung                         | Beschreibung                                                                                                                                                                                                                                                                                                                             |
|:--------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Backup-Toleranz**            | Die Toleranzzeit (zusätzliche Zeit), die zum erwarteten Sicherungszeitpunkt hinzugefügt wird, bevor die Sicherung als überfällig markiert wird. Der Standardwert ist **1 Stunde**.                                                                                                                                                                                                             |
| **Intervall der Backup-Überwachung** | Wie oft das System auf überfällige Sicherungen prüft. Der Standardwert ist **5 Minuten**.                                                                                                                                                                                                                                                            |
| **Benachrichtigungshäufigkeit**      | Wie oft überfällige Benachrichtigungen gesendet werden sollen: <br/> **Einmalig`: Send **just one** notification when the backup becomes overdue. <br/> `Täglich`: Send **daily** notifications while overdue (default). <br/> `Wöchentlich`: Send **weekly** notifications while overdue. <br/> `Monatlich**: Sendet **monatliche** Benachrichtigungen, solange die Sicherung überfällig ist. |

## Verfügbare Aktionen {#available-actions}

| Schaltfläche                                                              | Beschreibung                                                                                                                           |
|:--------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------|
| <IconButton label="Backup-Überwachungseinstellungen speichern" />              | Speichert die Einstellungen, löscht Timer für deaktivierte Sicherungen und führt eine Überprüfung auf überfällige Sicherungen durch.                                                |
| <IconButton icon="lucide:import" label="Alle sammeln (#)"/>          | Sammelt Sicherungs-Logs von allen konfigurierten Servern; in Klammern die Anzahl der Server, von denen gesammelt wird.                                   |
| <IconButton icon="lucide:download" label="CSV herunterladen"/>           | Lädt eine CSV-Datei herunter, die alle Einstellungen zur Backup-Überwachung sowie den Zeitstempel der letzten Sicherung (aus der Datenbank) enthält.               |
| <IconButton icon="lucide:refresh-cw" label="Jetzt überprüfen"/>            | Führt die Überprüfung auf überfällige Sicherungen sofort durch. Dies ist nützlich, nachdem Konfigurationen geändert wurden. Es löst auch eine Neuberechnung von "Nächster Lauf" aus. |
| <IconButton icon="lucide:timer-reset" label="Benachrichtigungen zurücksetzen"/> | Setzt die letzte gesendete Benachrichtigung über überfällige Sicherungen für alle Sicherungen zurück.                                                                            |
