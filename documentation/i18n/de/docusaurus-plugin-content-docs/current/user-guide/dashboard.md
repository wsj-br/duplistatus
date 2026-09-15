# Dashboard {/* #dashboard */}

## Dashboard-Übersicht {/* #dashboard-summary */}

Dieser Abschnitt zeigt aggregierte Statistiken für alle Backups an.

![Dashboard-Zusammenfassung - Übersicht](../assets/screen-dashboard-summary.png)
![Dashboard-Zusammenfassung - Tabelle](../assets/screen-dashboard-summary-table.png)

- **Gesamtserver**: Die Anzahl der überwachten Server.
- **Gesamte Backup-Jobs**: Die Gesamtzahl der konfigurierten Backup-Jobs (Typen) für alle Server.
- **Gesamte Backup-Läufe**: Die Gesamtzahl der Backup-Protokolle von Läufen, die für alle Server empfangen oder gesammelt wurden.
- **Gesamte Backup-Größe**: Die kombinierte Größe aller Quelldaten, basierend auf den neuesten empfangenen Backup-Protokollen.
- **Gesamter genutzter Speicher**: Der gesamte Speicherplatz, der von Backups auf dem Backup-Ziel (z. B. Cloud-Speicher, FTP-Server, lokaler Laufwerk) verwendet wird, basierend auf den neuesten empfangenen Backup-Protokollen.
- **Gesamte hochgeladene Größe**: Die Gesamtmenge der Daten, die vom Duplicati-Server zum Ziel (z. B. lokaler Speicher, FTP, Cloud-Anbieter) hochgeladen wurden.
- **Überfällige Backups** (Tabelle): Die Anzahl der überfälligen Backups. Siehe [Backup-Benachrichtigungseinstellungen](settings/backup-notifications-settings.md)
- **Layout-Umschalter**: Wechselt zwischen dem Karten-Layout (Standard) und dem Tabellen-Layout.

:::tip Sie sehen doppelte Server?
Wenn der gleiche Server mehrmals auf dem Dashboard angezeigt wird, verwenden Sie [Einstellungen → Datenbankverwaltung → Doppelte Server zusammenführen](settings/database-maintenance.md#merge-duplicate-servers), um sie zu konsolidieren. Duplikate können auftreten, wenn Sie Duplicati neu installieren oder aktualisieren, da die `machine_id` des Servers sich ändern kann und **duplistatus** ihn dann als neuen Server behandelt.
:::

## Server-Filterung {/* #server-filtering */}

Sie können die auf dem Dashboard angezeigten Server und Backups mit dem Suchfeld in der Anwendungsleiste filtern. Klicken Sie auf das Filter-Symbol <IconButton icon="lucide:search" />, um das Suchfeld anzuzeigen.

**Filter-Ergebnisse:**
- Server-ID
- Server-URL
- Backup-Job-Namen

**Bereich:**
- Filtert sowohl die Karten- als auch die Tabellenansicht auf dem Dashboard
- Sitzungsstatus wird über den Dashboard-Server-Filter-Anbieter beibehalten
- Wird gelöscht, wenn Sie das Dashboard aktualisieren oder verlassen

Dies erleichtert das schnelle Auffinden bestimmter Server oder Backups unter vielen überwachten Systemen.

## Karten-Layout {/* #cards-layout */}

Das Karten-Layout zeigt den Status des neuesten empfangenen Backup-Protokolls für jedes Backup an.

![Karten-Layout](../assets/duplistatus_dash-cards.svg)

- **Servername**: Name des Duplicati-Servers (oder des Alias)
  - Bei der Überlagerung des **Server-Namens** wird der Servername und die Notiz angezeigt
- **Gesamtstatus**: Der Status des Servers. Überfällige Backups werden als **Warnung** angezeigt
- **Version**: Die Duplicati-Version aus dem neuesten Backup-Protokoll, angezeigt links neben dem Statusindikator. Siehe [Duplicati-Server-Version](#duplicati-server-version).
- **Zusammenfassungsinformationen**: Die konsolidierte Anzahl der Dateien, Größe und genutzter Speicher für alle Backups dieses Servers. Zeigt auch die verstrichene Zeit des neuesten empfangenen Backups an (überlagern Sie, um den Zeitstempel anzuzeigen)
- **Backups-Liste**: Eine Tabelle mit allen für diesen Server konfigurierten Backups, mit 3 Spalten:
  - **Backup-Name**: Name des Backups im Duplicati-Server
  - **Statusverlauf**: Status der letzten 10 empfangenen Backups.
  - **Letztes empfangenes Backup**: Die verstrichene Zeit seit der aktuellen Uhrzeit des letzten empfangenen Protokolls. Es wird ein Warnungssymbol angezeigt, wenn das Backup überfällig ist.
    - Die Zeit wird im abgekürzten Format angezeigt: `m` für Minuten, `h` für Stunden, `d` für Tage, `w` für Wochen, `mo` für Monate, `y` für Jahre.

Die Sortierreihenfolge der Karten und andere Konfigurationen können in den [Anzeigeeinstellungen](settings/display-settings.md) festgelegt werden.

Die Panel-Ansicht bietet zwei Informationsanzeigen, die über die Schaltfläche oben rechts auf dem Seitenpanel zugänglich sind:

- Status: Zeigt Statistiken der Sicherungsjobs nach Status an, mit einer Liste überfälliger Sicherungen und Sicherungsjobs mit Warnungen/Fehlern.

![Statuspanel](../assets/screen-overview-side-status.png)

- Metriken: Zeigt Diagramme mit Dauer, Dateigröße und Speichergröße über die Zeit für den aggregierten oder ausgewählten Server an.

![Diagrammpanel](../assets/screen-overview-side-charts.png)

### Backup-Details {/* #backup-details */}

Wenn Sie über eine Sicherung in der Liste fahren, werden die Details des letzten empfangenen Sicherungsprotokolls und alle überfälligen Informationen angezeigt.

![Details zu überfälligen Sicherungen](../assets/screen-backup-tooltip.png)

- **Servername : Sicherung**: Der Name oder Alias des Duplicati-Servers und der Sicherung wird ebenfalls den Servernamen und die Notiz anzeigen.
  - Der Alias und die Notiz können unter [Einstellungen → Servereinstellungen](settings/server-settings.md) konfiguriert werden.
- **Benachrichtigung**: Ein Symbol, das die [konfigurierte Benachrichtigung](#notifications-icons) für neue Sicherungsprotokolle anzeigt.
- **Datum**: Der Zeitstempel der Sicherung und die verstrichene Zeit seit der letzten Bildschirmaktualisierung.
- **Status**: Der Status der letzten empfangenen Sicherung (Erfolgreich, Warnung, Fehler, Fatal).
- **Dauer, Anzahl der Dateien, Dateigröße, Speichergröße, Hochgeladene Größe**: Werte, wie sie vom Duplicati-Server gemeldet werden.
- **Verfügbare Versionen**: Die Anzahl der Sicherungsversionen, die zum Zeitpunkt der Sicherung am Sicherungsziel gespeichert sind.

Wenn diese Sicherung überfällig ist, zeigt das Tooltip auch an:

- **Erwartete Sicherung**: Die Zeit, zu der die Sicherung erwartet wurde, einschließlich der konfigurierten Karenzzeit (zusätzliche Zeit, die vor der Markierung als überfällig erlaubt ist).

Sie können auch die Schaltflächen unten klicken, um [Einstellungen → Sicherungsbenachrichtigungen](settings/backup-notifications-settings.md) zu öffnen, um die Überwachungseinstellungen zu konfigurieren oder die Weboberfläche des Duplicati-Servers zu öffnen.

## Tabellenlayout {/* #table-layout */}

Das Tabellenlayout listet die zuletzt empfangenen Sicherungsprotokolle für alle Server und Sicherungen auf.

![Dashboard-Tabellenmodus](../assets/screen-main-dashboard-table-mode.png)

- **Servername**: Der Name des Duplicati-Servers (oder Alias)
  - Unter dem Namen befindet sich die Servernotiz
- **Sicherungsname**: Der Name der Sicherung im Duplicati-Server.
- **Version**: Die Duplicati-Version aus dem letzten Sicherungsprotokoll für diesen Sicherungsjob. Siehe [Duplicati-Serverversion](#duplicati-server-version).
- **Verfügbare Versionen**: Die Anzahl der Sicherungsversionen, die am Sicherungsziel gespeichert sind. Wenn das Symbol ausgegraut ist, wurden im Protokoll keine detaillierten Informationen empfangen. Siehe die [Anweisungen zur Duplicati-Konfiguration](../installation/duplicati-server-configuration.md) für Details.
- **Backup-Anzahl**: Die Anzahl der von Duplicati gemeldeten Sicherungen.
- **Datum des letzten Backups**: Der Zeitstempel des letzten empfangenen Sicherungsprotokolls und die verstrichene Zeit seit der letzten Bildschirmaktualisierung.
- **Status der letzten Sicherung**: Der Status der letzten empfangenen Sicherung (Erfolgreich, Warnung, Fehler, Fatal).
- **Dauer**: Die Dauer der Sicherung in HH:MM:SS.
- **Warnungen/Fehler**: Die Anzahl der im Sicherungsprotokoll gemeldeten Warnungen und Fehler, angezeigt als `warnings/errors` (zum Beispiel `0/0`).
- **Einstellungen**:
  - **Benachrichtigung**: Ein Symbol, das die konfigurierte Benachrichtigungseinstellung für neue Sicherungsprotokolle anzeigt.
  - **Duplicati-Konfiguration**: Eine Schaltfläche, um die Weboberfläche des Duplicati-Servers zu öffnen.

Sie können die [Anzeigeeinstellungen](settings/display-settings.md) verwenden, um die Tabellengröße und andere Konfigurationen zu konfigurieren.

### Benachrichtigungssymbole {/* #notifications-icons */}

| Symbol                                                                                                                               | Benachrichtigungsoption | Beschreibung                                                                                         |
|------------------------------------------------------------------------------------------------------------------------------------|---------------------|-----------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:message-square-off" style={{border: 'none', padding: 0, color: '#9ca3af', background: 'transparent'}} />  | Aus                 | Es werden keine Benachrichtigungen gesendet, wenn ein neues Backup-Protokoll empfangen wird                                     |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#60a5fa', background: 'transparent'}} /> | Alle                 | Benachrichtigungen werden für jedes neue Backup-Protokoll gesendet, unabhängig von dessen Status.                      |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#fbbf24', background: 'transparent'}} /> | Warnungen            | Benachrichtigungen werden nur für Backup-Protokolle mit dem Status Warnung, Unbekannt, Fehler oder Fatal gesendet. |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#f87171', background: 'transparent'}} /> | Fehler              | Benachrichtigungen werden nur für Backup-Protokolle mit dem Status Fehler oder Fatal gesendet.                    |

:::note
Diese Benachrichtigungseinstellung gilt nur, wenn **duplistatus** ein neues Backup-Protokoll von einem Duplicati-Server empfängt. Überfällige Benachrichtigungen werden separat konfiguriert und werden unabhängig von dieser Einstellung gesendet.
:::

### Details zu überfälligen Sicherungen {/* #overdue-details */}

Wenn Sie mit der Maus über das Symbol für die überfällige Warnung fahren, werden Details zur überfälligen Sicherung angezeigt.

![Details zu überfälligen Sicherungen](../assets/screen-overdue-backup-hover-card.png)

- **Geprüft**: Wann die letzte Überprüfung auf Überfälligkeit durchgeführt wurde. Die Häufigkeit können Sie in den [Backup-Benachrichtigungseinstellungen](settings/backup-notifications-settings.md) konfigurieren.
- **Letzte Sicherung**: Wann das letzte Backup-Protokoll empfangen wurde.
- **Erwartete Sicherung**: Die Zeit, zu der die Sicherung erwartet wurde, einschließlich der konfigurierten Nachfrist (zusätzliche Zeit, die erlaubt wird, bevor als überfällig markiert wird).
- **Letzte Benachrichtigung**: Wann die letzte überfällige Benachrichtigung gesendet wurde.

## Duplicati-Server-Version {/* #duplicati-server-version */}

Das Dashboard zeigt die Duplicati-Version an, die im neuesten Backup-Protokoll für jeden Server (Kartenansicht) oder Backup-Auftrag (Tabellenansicht) angegeben ist.

- **Wo es angezeigt wird**: Links neben dem Statusindikator auf den Karten und in der **Version** -Spalte in der Tabelle (nach **Überfällig / Nächste Ausführung**). Sie können das Kartensymbol in den [Anzeigeeinstellungen](settings/display-settings.md) oder [Duplicati-Versionen](settings/duplicati-versions.md) ausblenden. Die Tabellenspalte bleibt immer sichtbar.
- **Farbe**: Grauer Text bedeutet, dass die Version der neuesten Version für diesen Kanal entspricht (oder die Vergleichs ist nicht verfügbar). Warnung Gelb bedeutet, dass die Version älter ist als die neueste Version für diesen Kanal.
- **Tooltip**: Bewegen Sie den Mauszeiger über oder klicken Sie auf die Versionsnummer, um den Update-Kanal (`stable`, `beta`, `experimental` oder `canary`), die Server-Version und die neueste verfügbare Version für diesen Kanal anzuzeigen.

**duplistatus** vergleicht die Version aus dem Backup-Protokoll mit den neuesten Duplicati-Veröffentlichungen auf GitHub. Administratoren können die zwischengespeicherten Kanalversionen anzeigen und das Intervall für die Überprüfung sowie die Startzeit in [Einstellungen → Duplicati-Versionen](settings/duplicati-versions.md) konfigurieren. Der Cache wird auch beim Start aktualisiert, wenn er älter ist als das ausgewählte Intervall. Erfolgs- und Fehlermeldungen bei GitHub-Aktualisierungen werden im [Audit-Protokoll](settings/audit-logs-viewer.md) als `duplicati_version_refresh` (gestartet durch `startup`, `cron` oder `manual`) aufgezeichnet.

:::important
**duplistatus** fragt den Duplicati-Server nicht nach der aktuell ausgeführten Version ab. Es verwendet die Version, die im letzten empfangenen oder [gesammelten](collect-backup-logs.md) Backup-Protokoll gespeichert ist. Nach einem Upgrade von Duplicati zeigt das Dashboard weiterhin die vorherige Version an, bis ein neues Backup-Protokoll eintrifft.
:::

### Verfügbare Sicherungsversionen {/* #available-backup-versions */}

Wenn Sie auf das blaue Uhrensymbol klicken, wird eine Liste der verfügbaren Sicherungsversionen zum Zeitpunkt der Sicherung angezeigt, wie vom Duplicati-Server gemeldet.

![Verfügbare Versionen](../assets/screen-available-backups-modal.png)

- **Backup-Details**: Zeigt den Servername und Alias, die Server-Notiz, den Backup-Namen und wann die Sicherung ausgeführt wurde.
- **Versionsdetails**: Zeigt die Versionsnummer, das Erstellungsdatum und das Alter an.

:::note
Wenn das Symbol ausgegraut ist, bedeutet dies, dass keine detaillierten Informationen in den Nachrichtenprotokollen empfangen wurden.
Siehe die [Duplicati-Konfigurationsanweisungen](../installation/duplicati-server-configuration.md) für Details.
:::
