# Backup-Überwachung {/* #backup-monitoring */}

![Backup-Warnungen](../../assets/screen-settings-monitoring.png)

## Serverfilterung {/* #server-filtering */}

Die Serverliste auf dieser Seite kann mithilfe des Filterfelds gefiltert werden.

Wenn die **Tägliche Zusammenfassung** aktiviert ist, wird die Erkennung überfälliger Backups fortgesetzt, aber E-Mails an den Standard-Empfänger werden unterdrückt. Zusätzliche E-Mail-Ziele werden weiterhin bei passenden Ereignissen benachrichtigt (Überfällig zählt als Warnung). Siehe [Tägliche Zusammenfassung](daily-summary-settings.md).

**Filtertreffer:**
- Server-ID
- Server-URL
- Namen der Backup-Jobs

Dadurch können Sie bei der Verwaltung vieler Systeme schnell bestimmte Server oder Backups in den Überwachungseinstellungen finden.

## Pro-Backup-Überwachungseinstellungen konfigurieren {/* #configure-per-backup-monitoring-settings */}

-  **Servername**: Der Name des Servers, dessen Backups auf Überfälligkeit überwacht werden sollen. 
   - Klicken Sie auf <SvgIcon svgFilename="duplicati_logo.svg" height="18"/>, um die Web-Oberfläche des Duplicati-Servers zu öffnen
   - Klicken Sie auf <IIcon2 icon="lucide:download" height="18"/>, um Backup-Protokolle von diesem Server zu sammeln.
- **Backup-Name**: Der Name des Backups, dessen Überfälligkeit überwacht werden soll.
- **Nächste Ausführung**: Die nächste geplante Backup-Zeit wird grün angezeigt, wenn sie in der Zukunft liegt, oder rot, wenn sie überfällig ist. Beim Hovern über den Wert „Nächste Ausführung“ wird ein Tooltip mit dem Zeitstempel der letzten Sicherung aus der Datenbank angezeigt, formatiert mit vollständigem Datum/Uhrzeit und relativer Zeit.
- **Backup-Überwachung**: Aktivieren oder deaktivieren Sie die Backup-Überwachung für dieses Backup.
- **Erwartetes Backup-Intervall**: Das erwartete Backup-Intervall.
- **Einheit**: Die Einheit des erwarteten Intervalls.
- **Erlaubte Tage**: Die erlaubten Wochentage für das Backup.

Wenn die Symbole neben dem Servernamen ausgegraut sind, ist der Server nicht in den [Einstellungen → Servereinstellungen](/user-guide/settings/server-settings) konfiguriert.

:::note
Wenn Sie Backup-Protokolle von einem Duplicati-Server sammeln, aktualisiert **duplistatus** automatisch die Intervalle und Konfigurationen der Backup-Überwachung.
:::

:::tip
Für optimale Ergebnisse sollten Sie Backup-Protokolle sammeln, nachdem Sie die Intervallkonfiguration der Backup-Aufträge auf Ihrem Duplicati-Server geändert haben. Dadurch wird sichergestellt, dass **duplistatus** mit Ihrer aktuellen Konfiguration synchron bleibt.
:::

## Globale Konfigurationen {/* #global-configurations */}

Diese Einstellungen gelten für alle Backups:

| Einstellung                     | Beschreibung                                                                                                                                                                                                                                                                                                                            |
|:--------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Backup-Toleranz**             | Die Schonfrist (zusätzliche Zeit) wird zur erwarteten Backup-Zeit hinzugefügt, bevor es als überfällig markiert wird. Der Standardwert ist **1 Stunde**.                                                                                                                                                                               |
| **Backup-Überwachungsintervall** | Wie oft das System auf überfällige Backups prüft. Der Standardwert ist **5 Minuten**.                                                                                                                                                                                                                                                     |
| **Benachrichtigungshäufigkeit**      | Wie oft Benachrichtigungen bei Überfälligkeit gesendet werden: <br/> **Einmalig`: Send **just one** notification when the backup becomes overdue. <br/> `Täglich`: Send **daily** notifications while overdue (default). <br/> `Wöchentlich`: Send **weekly** notifications while overdue. <br/> `Monatlich**: Sendet **monatliche** Benachrichtigungen, solange der Status überfällig ist. <br/> Ein fehlgeschlagener Kanal wird protokolliert, und das Häufigkeitsfenster gilt weiterhin, wenn ein anderer Kanal zugestellt wurde. Warnungen werden bei jeder Überwachungsprüfung nur wiederholt, wenn jeder aktivierte Kanal fehlschlägt. |

## Verfügbare Aktionen {/* #available-actions */}

| Button                                                              | Beschreibung                                                                                                                           |
|:--------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------|
| <IconButton label="Backup-Überwachungseinstellungen speichern" />              | Speichert die Einstellungen, löscht Timer für alle deaktivierten Sicherungen und führt eine Überprüfungen auf überfällige Sicherungen durch.                                                |
| <IconButton icon="lucide:import" label="Alle sammeln (#)"/>          | Sammelt Backup-Protokolle von allen konfigurierten Servern, in Klammern die Anzahl der Server, von denen gesammelt werden soll.                                   |
| <IconButton icon="lucide:download" label="CSV herunterladen"/>           | Lädt eine CSV-Datei herunter, die alle Backup-Überwachungseinstellungen und den „Zeitstempel der letzten Sicherung (DB)“ aus der Datenbank enthält.               |
| <IconButton icon="lucide:refresh-cw" label="Jetzt prüfen"/>            | Führt die Überprüfung auf überfällige Sicherungen sofort durch. Dies ist nützlich, nachdem Konfigurationen geändert wurden. Es löst auch eine Neuberechnung der „Nächsten Ausführung“ aus. |
| <IconButton icon="lucide:timer-reset" label="Benachrichtigungen zurücksetzen"/> | Setzt die zuletzt gesendete Überfällig-Benachrichtigung für alle Sicherungen zurück.                                                                            |
