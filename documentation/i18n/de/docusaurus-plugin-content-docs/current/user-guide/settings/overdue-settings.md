---
translation_last_updated: '2026-01-31T00:51:26.319Z'
source_file_mtime: '2026-01-27T14:22:06.838Z'
source_file_hash: bc396f3559d5e9a0
translation_language: de
source_file_path: user-guide/settings/overdue-settings.md
---
# Überfällige Benachrichtigungen {#overdue-notifications}

![Backup alerts](/assets/screen-settings-overdue.png)

## Konfigurieren Sie die Einstellungen für Sicherung überfällig pro Sicherung {#configure-per-backup-overdue-settings}

-  **Servername**: Der Name des Servers zur Überwachung überfälliger Sicherungen. 
   - Klicken Sie auf <SvgIcon svgFilename="duplicati_logo.svg" height="18"/>, um die Weboberfläche des Duplicati-Servers zu öffnen
   - Klicken Sie auf <IIcon2 icon="lucide:download" height="18"/>, um Backup-Protokolle von diesem Server zu sammeln.
- **Sicherungsname**: Der Name der Sicherung zur Überwachung überfälliger Sicherungen.
- **Nächster Lauf**: Die nächste geplante Sicherungszeit wird in Grün angezeigt, wenn sie in der Zukunft geplant ist, oder in Rot, wenn sie überfällig ist. Wenn Sie den Mauszeiger über den Wert „Nächster Lauf" bewegen, wird eine QuickInfo angezeigt, die den letzten Sicherungs-Zeitstempel aus der Datenbank mit vollständigem Datum/Uhrzeit und relativer Zeit anzeigt.
- **Überwachung überfälliger Sicherungen**: Aktivieren oder deaktivieren Sie die Überwachung überfälliger Sicherungen für diese Sicherung.
- **Erwartetes Sicherungsintervall**: Das erwartete Sicherungsintervall.
- **Einheit**: Die Einheit des erwarteten Intervalls.
- **Erlaubte Tage**: Die erlaubten Wochentage für die Sicherung.

Wenn die Symbole neben der Servername ausgegraut sind, ist der Server nicht in den [`Einstellungen → Server-Einstellungen`](server-settings.md) konfiguriert.

:::note
Wann Sie Backup-Protokolle sammeln von einem Duplicati-Server, aktualisiert **duplistatus** automatisch die Überwachung überfälliger Sicherungen Intervalle und Konfigurationen.
:::

:::tip
Um optimale Ergebnisse zu erzielen, sammeln Sie Backup-Protokolle, nachdem Sie die Konfiguration der Sicherungsauftragsintervalle auf Ihrem Duplicati-Server geändert haben. Dies stellt sicher, dass **duplistatus** mit Ihrer aktuellen Konfiguration synchronisiert bleibt.
:::

## Globale Konfigurationen {#global-configurations}

Diese Einstellungen gelten für alle Sicherungen:

| Einstellung                      | Beschreibung                                                                                                                                                                                                                                                                                           |
|:--------------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Überfälligkeitstoleranz**      | Die Kulanzfrist (zusätzlich gewährte Zeit), die zur erwarteten Sicherungszeit hinzugefügt wird, bevor die Sicherung als überfällig markiert wird. Der Standard ist `1 Stunde`.                                                                                                                        |
| **Überwachungsintervall**        | Wie oft das System nach überfälligen Sicherungen prüft. Der Standard ist `5 Minuten`.                                                                                                                                                                                                                |
| **Benachrichtigungshäufigkeit**  | Wie oft überfällige Benachrichtigungen gesendet werden: <br/> `Einmalig`: Senden Sie **nur eine** Benachrichtigung, wenn die Sicherung überfällig wird. <br/> `Täglich`: Senden Sie **tägliche** Benachrichtigungen während der Überfälligkeit (Standard). <br/> `Wöchentlich`: Senden Sie **wöchentliche** Benachrichtigungen während der Überfälligkeit. <br/> `Monatlich`: Senden Sie **monatliche** Benachrichtigungen während der Überfälligkeit. |

## Verfügbare Aktionen {#available-actions}

| Schaltfläche                                                        | Beschreibung                                                                                         |
|:--------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
| <IconButton label="Einstellungen für Überwachung überfälliger Sicherungen speichern" />             | Speichert die Einstellungen, löscht Timer für alle deaktivierten Sicherungen und führt eine Prüfung überfälliger Sicherungen durch.              |
| <IconButton icon="lucide:import" label="Alle sammeln (#)"/>          | Sammelt Backup-Protokolle von allen konfigurierten Servern, in Klammern die Anzahl der Server zum Sammeln. |
| <IconButton icon="lucide:download" label="CSV herunterladen"/>            | Lädt eine CSV-Datei herunter, die alle Einstellungen für die Überwachung überfälliger Sicherungen und den „Zeitstempel der letzten Sicherung (DB)" aus der Datenbank enthält. |
| <IconButton icon="lucide:refresh-cw" label="Jetzt prüfen"/>            | Führt die Prüfung überfälliger Sicherungen sofort aus. Dies ist nach Konfigurationsänderungen hilfreich. Es löst auch eine Neuberechnung des „Nächsten Laufs" aus. |
| <IconButton icon="lucide:timer-reset" label="Benachrichtigungen zurücksetzen"/> | Setzt die zuletzt gesendete Benachrichtigung für überfällige Sicherungen für alle Sicherungen zurück.                                          |
