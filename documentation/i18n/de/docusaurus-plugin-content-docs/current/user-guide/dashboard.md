# Dashboard {/* #dashboard */}

## Dashboard-Zusammenfassung {/* #dashboard-summary */}

Dieser Abschnitt zeigt aggregierte Statistiken für alle Sicherungen.

![Dashboard-Zusammenfassung - Übersicht](../assets/screen-dashboard-summary.png)
![Dashboard-Zusammenfassung - Tabelle](../assets/screen-dashboard-summary-table.png)

- **Gesamtserver**: Die Anzahl der überwachten Server.                                                                                                             
- **Gesamte Backup-Jobs**: Die Gesamtzahl der konfigurierten Backup-Jobs (Typen) für alle Server.                                                                                
- **Gesamte Backup-Läufe**: Die Gesamtzahl der Backup-Protokolle von Läufen, die für alle Server empfangen oder gesammelt wurden.                                                                   
- **Gesamte Backup-Größe**: Die kombinierte Größe aller Quelldaten basierend auf den neuesten empfangenen Backup-Protokollen.                                                                    
- **Gesamter genutzter Speicher**: Der gesamte Speicherplatz, der von Sicherungen am Sicherungsziel verwendet wird (z. B. Cloud-Speicher, FTP-Server, lokales Laufwerk), basierend auf den neuesten Backup-Protokollen.                
- **Gesamte hochgeladene Größe**: Die Gesamtmenge an Daten, die vom Duplicati-Server zum Ziel hochgeladen wurden (z. B. lokaler Speicher, FTP, Cloud-Anbieter).                                       
- **Überfällige Backups** (Tabelle): Die Anzahl der überfälligen Backups. Siehe [Backup-Benachrichtigungseinstellungen](settings/backup-notifications-settings.md)                          
- **Layout-Umschaltung**: Wechselt zwischen der Kartenansicht (Standard) und der Tabellenansicht.

:::tip Doppelte Server sichtbar?
Wenn derselbe Server mehr als einmal im Dashboard erscheint, verwenden Sie [Einstellungen → Datenbankverwaltung → Doppelte Server zusammenführen](settings/database-maintenance.md#merge-duplicate-servers), um sie zusammenzuführen. Duplikate können entstehen, wenn Sie Duplicati neu installieren oder aktualisieren, da sich die `machine_id` des Servers ändern kann und **duplistatus** ihn dann als neuen Server behandelt.
:::

## Serverfilterung {/* #server-filtering */}

Sie können die auf dem Dashboard angezeigten Server und Sicherungen mithilfe des Suchfelds in der Anwendungssymbolleiste filtern. Klicken Sie auf das Filtersymbol <IconButton icon="lucide:search" />, um das Suchfeld anzuzeigen.

**Filtertreffer:**
- Server-ID
- Server-URL
- Namen der Backup-Jobs

**Bereich:**
- Filtert sowohl Karten- als auch Tabellenansichten im Dashboard
- Sitzungszustand wird über den Dashboard-Server-Filteranbieter aufrechterhalten
- Wird gelöscht, wenn Sie das Dashboard aktualisieren oder verlassen

So können Sie schnell bestimmte Server oder Sicherungen unter vielen überwachten Systemen finden.

## Kartenlayout {/* #cards-layout */}

Das Kartenlayout zeigt den Status des zuletzt empfangenen Sicherungsprotokolls für jede Sicherung an.

![Kartenlayout](../assets/duplistatus_dash-cards.svg)

- **Servername**: Name des Duplicati-Servers (oder des Alias)
  - Beim Überfahren des **Servernamens** werden Servername und Notiz angezeigt
- **Gesamtstatus**: Der Status des Servers. Überfällige Sicherungen werden als **Warnung**-Status angezeigt
- **Version**: Die Duplicati-Version aus dem neuesten Sicherungsprotokoll, links neben dem Statusindikator angezeigt. Siehe [Duplicati-Serverversion](#duplicati-server-version).
- **Zusammenfassungsinformationen**: Die zusammengefasste Anzahl von Dateien, Größe und Speicherplatznutzung für alle Sicherungen dieses Servers. Zeigt auch die vergangene Zeit des zuletzt empfangenen Backups an (überfahren Sie, um den Zeitstempel anzuzeigen)
- **Sicherungenliste**: Eine Tabelle mit allen für diesen Server konfigurierten Sicherungen mit 3 Spalten:
  - **Backup-Name**: Name der Sicherung im Duplicati-Server
  - **Statusverlauf**: Status der letzten 10 empfangenen Sicherungen.
  - **Zuletzt empfangene Sicherung**: Die vergangene Zeit seit der aktuellen Uhrzeit des zuletzt empfangenen Protokolls. Es wird ein Warnsymbol angezeigt, wenn die Sicherung überfällig ist.
    - Die Zeit wird in abgekürzter Form angezeigt: `m` für Minuten, `h` für Stunden, `d` für Tage, `w` für Wochen, `mo` für Monate, `y` für Jahre.

Die Sortierreihenfolge der Karten und andere Konfigurationen können in den [Anzeigeeinstellungen](settings/display-settings.md) festgelegt werden.

Die Panelansicht bietet zwei Informationsanzeigen, auf die über die Schaltfläche oben rechts im Seitenpanel zugegriffen werden kann:

- Status: Zeigt Statistiken der Backup-Jobs nach Status mit einer Liste überfälliger Sicherungen und Backup-Jobs mit Warnungen/Fehler-Status an.

![Statusbereich](../assets/screen-overview-side-status.png)

- Metriken: Zeigt Diagramme mit Dauer, Dateigröße und Speichergröße im zeitlichen Verlauf für den aggregierten oder ausgewählten Server an.

![Diagrammbereich](../assets/screen-overview-side-charts.png)

### Sicherungsdetails {/* #backup-details */}

Wenn Sie mit der Maus über eine Sicherung in der Liste fahren, werden Details des zuletzt empfangenen Sicherungsprotokolls sowie Informationen zu überfälligen Sicherungen angezeigt.

![Details zu überfälligen Sicherungen](../assets/screen-backup-tooltip.png)

- **Servername : Sicherung**: Der Name oder Alias des Duplicati-Servers und der Sicherung; zeigt auch den Servernamen und die Notiz an.
  - Alias und Notiz können unter [Einstellungen → Servereinstellungen](settings/server-settings.md) konfiguriert werden.
- **Benachrichtigung**: Ein Symbol, das die [konfigurierte Benachrichtigungseinstellung](#notifications-icons) für neue Sicherungsprotokolle anzeigt.
- **Datum**: Der Zeitstempel der Sicherung und die seit der letzten Bildschirmaktualisierung vergangene Zeit.
- **Status**: Der Status der zuletzt empfangenen Sicherung (Erfolgreich, Warnung, Fehler, Fatal).
- **Dauer, Anzahl der Dateien, Dateigröße, Speichergröße, Hochgeladene Größe**: Werte wie vom Duplicati-Server gemeldet.
- **Verfügbare Versionen**: Die Anzahl der auf dem Sicherungsziel zum Zeitpunkt der Sicherung gespeicherten Sicherungsversionen.

Wenn diese Sicherung überfällig ist, zeigt die Tooltip-Information zusätzlich an:

- **Erwartete Sicherung**: Die Zeit, zu der die Sicherung erwartet wurde, einschließlich der konfigurierten Karenzzeit (zusätzliche Zeit, bevor sie als überfällig markiert wird).

Sie können auch auf die Schaltflächen unten klicken, um [Einstellungen → Sicherungsbenachrichtigungen](settings/backup-notifications-settings.md) zu öffnen, um die Überwachungseinstellungen zu konfigurieren, oder die Web-Oberfläche des Duplicati-Servers zu öffnen.

## Tabellenlayout {/* #table-layout */}

Das Tabellenlayout listet die zuletzt empfangenen Sicherungsprotokolle für alle Server und Sicherungen auf.

![Dashboard-Tabellenmodus](../assets/screen-main-dashboard-table-mode.png)

- **Servername**: Der Name des Duplicati-Servers (oder Alias)
  - Unter dem Namen befindet sich die Servernotiz
- **Sicherungsname**: Der Name der Sicherung im Duplicati-Server.
- **Version**: Die Duplicati-Version aus dem neuesten Sicherungsprotokoll für diesen Sicherungsauftrag. Siehe [Duplicati-Serverversion](#duplicati-server-version).
- **Verfügbare Versionen**: Die Anzahl der auf dem Sicherungsziel gespeicherten Sicherungsversionen. Wenn das Symbol ausgegraut ist, wurden keine detaillierten Informationen im Protokoll empfangen. Weitere Informationen finden Sie in den [Duplicati-Konfigurationsanweisungen](../installation/duplicati-server-configuration.md).
- **Sicherungsanzahl**: Die Anzahl der vom Duplicati-Server gemeldeten Sicherungen.
- **Datum der letzten Sicherung**: Der Zeitstempel des zuletzt empfangenen Sicherungsprotokolls und die seit der letzten Bildschirmaktualisierung vergangene Zeit.
- **Status der letzten Sicherung**: Der Status der zuletzt empfangenen Sicherung (Erfolgreich, Warnung, Fehler, Fatal).
- **Dauer**: Die Dauer der Sicherung im Format HH:MM:SS.
- **Warnungen/Fehler**: Die Anzahl der im Sicherungsprotokoll gemeldeten Warnungen und Fehler, angezeigt als `warnings/errors` (zum Beispiel `0/0`).
- **Einstellungen**:
  - **Benachrichtigung**: Ein Symbol, das die konfigurierte Benachrichtigungseinstellung für neue Sicherungsprotokolle anzeigt.
  - **Duplicati-Konfiguration**: Eine Schaltfläche zum Öffnen der Web-Oberfläche des Duplicati-Servers

Sie können die [Anzeigeeinstellungen](settings/display-settings.md) verwenden, um die Tabellengröße und andere Konfigurationen festzulegen.

### Benachrichtigungssymbole {/* #notifications-icons */}

| Symbol                                                                                                                           | Benachrichtigungsoption | Beschreibung                                                                                       |
|----------------------------------------------------------------------------------------------------------------------------------|-------------------------|---------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:message-square-off" style={{border: 'none', padding: 0, color: '#9ca3af', background: 'transparent'}} />  | Aus                     | Es werden keine Benachrichtigungen gesendet, wenn ein neues Sicherungsprotokoll empfangen wird   |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#60a5fa', background: 'transparent'}} /> | Alle                    | Es werden Benachrichtigungen für jedes neue Sicherungsprotokoll gesendet, unabhängig vom Status. |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#fbbf24', background: 'transparent'}} /> | Warnungen           | Benachrichtigungen werden nur für Sicherungsprotokolle mit dem Status Warnung, Unbekannt, Fehler oder Fatal gesendet. |
| <IconButton icon="lucide:message-square-more" style={{border: 'none', padding: 0, color: '#f87171', background: 'transparent'}} /> | Fehler              | Benachrichtigungen werden nur für Sicherungsprotokolle mit dem Status Fehler oder Fatal gesendet.                    |

:::note
Diese Benachrichtigungseinstellung gilt nur, wenn **duplistatus** ein neues Sicherungsprotokoll von einem Duplicati-Server erhält. Überfällige Benachrichtigungen werden separat konfiguriert und unabhängig von dieser Einstellung gesendet.
:::

### Details zu überfälligen Sicherungen {/* #overdue-details */}

Wenn Sie mit der Maus auf das Symbol für überfällige Warnungen zeigen, werden Details zur überfälligen Sicherung angezeigt.

![Details zu überfälligen Sicherungen](../assets/screen-overdue-backup-hover-card.png)

- **Geprüft**: Wann die letzte Prüfung auf Überfälligkeiten durchgeführt wurde. Die Häufigkeit kann in den [Einstellungen für Sicherungsbenachrichtigungen](settings/backup-notifications-settings.md) konfiguriert werden.
- **Letzte Sicherung**: Wann das letzte Sicherungsprotokoll empfangen wurde.
- **Erwartete Sicherung**: Die Zeit, zu der die Sicherung erwartet wurde, einschließlich der konfigurierten Toleranzzeit (zusätzliche Zeit, bevor als überfällig markiert wird).
- **Letzte Benachrichtigung**: Wann die letzte überfällige Benachrichtigung gesendet wurde.

## Duplicati-Serverversion {/* #duplicati-server-version */}

Das Dashboard zeigt die in dem jeweils neuesten Sicherungsprotokoll gemeldete Duplicati-Version für jeden Server (Kartenansicht) oder jede Sicherungsaufgabe (Tabellenansicht) an.

- **Wo es erscheint**: Links vom Statusindikator auf Karten und in der **Version**-Spalte in der Tabelle (nach **Überfällig / Nächste Ausführung**). Das Kartenabzeichen kann in den [Anzeigeeinstellungen](settings/display-settings.md) oder unter [Duplicati-Versionen](settings/duplicati-versions.md) ausgeblendet werden. Die Tabellenspalte bleibt immer sichtbar.
- **Farbe**: Grauer Text bedeutet, dass die Version mit der neuesten Veröffentlichung für diesen Kanal übereinstimmt (oder der Vergleich nicht verfügbar ist). Gelb für Warnungen bedeutet, dass die Version älter ist als die neueste Veröffentlichung für diesen Kanal.
- **Tooltip**: Fahren Sie mit der Maus über die Versionsnummer oder klicken Sie darauf, um den Updatekanal (`stable`, `beta`, `experimental` oder `canary`), die Serverversion und die neueste verfügbare Version für diesen Kanal anzuzeigen.

**duplistatus** vergleicht die Version aus dem Sicherungsprotokoll mit den neuesten Duplicati-Veröffentlichungen, die auf GitHub veröffentlicht wurden. Administratoren können die zwischengespeicherten Kanalversionen anzeigen und das Prüfintervall sowie die Startzeit in [Einstellungen → Duplicati-Versionen](settings/duplicati-versions.md) konfigurieren. Der Cache wird auch beim Start aktualisiert, wenn er älter als das ausgewählte Intervall ist. Erfolgreiche und fehlgeschlagene GitHub-Aktualisierungen werden im [Audit-Protokoll](settings/audit-logs-viewer.md) als `duplicati_version_refresh` (gestartet durch `startup`, `cron` oder `manual`) aufgezeichnet.

:::important
**duplistatus** fragt den Duplicati-Server nicht nach der aktuell laufenden Version ab. Es verwendet die Version, die im letzten empfangenen oder [gesammelten](collect-backup-logs.md) Sicherungsprotokoll gespeichert ist. Nachdem Sie Duplicati aktualisiert haben, zeigt das Dashboard weiterhin die vorherige Version an, bis ein neues Sicherungsprotokoll eintrifft.
:::

### Verfügbare Sicherungsversionen {/* #available-backup-versions */}

Wenn Sie auf das blaue Uhrsymbol klicken, wird eine Liste der zum Zeitpunkt der Sicherung verfügbaren Versionen angezeigt, wie sie vom Duplicati-Server gemeldet wurden.

![Verfügbare Versionen](../assets/screen-available-backups-modal.png)

- **Sicherheitsdetails**: Zeigt den Servernamen und Alias, den Serverhinweis, den Sicherungsnamen und wann die Sicherung ausgeführt wurde.
- **Versionsdetails**: Zeigt die Versionsnummer, das Erstellungsdatum und das Alter.

:::note
Wenn das Symbol ausgegraut ist, bedeutet dies, dass keine detaillierten Informationen in den Nachrichtenprotokollen empfangen wurden.
Weitere Einzelheiten finden Sie in den [Duplicati-Konfigurationsanweisungen](../installation/duplicati-server-configuration.md).
:::
