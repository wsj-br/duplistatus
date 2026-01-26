# Überfällige Benachrichtigungen {#overdue-notifications}

![Sicherungswarnungen](/img/screen-settings-overdue.png)

## Konfigurieren Sie die Einstellungen für überfällige Sicherungen pro Sicherung {#configure-per-backup-overdue-settings}

- **Servername**: Der Name des Servers, der auf überfällige Sicherungen überwacht werden soll.
  - Klicken Sie auf <SvgIcon svgFilename="duplicati_logo.svg" height="18"/>, um die Weboberfläche des Duplicati-Servers zu öffnen
  - Klicken Sie auf <IIcon2 icon="lucide:download" height="18"/>, um Sicherungsprotokolle von diesem Server zu sammeln.
- **Sicherungsname**: Der Name der Sicherung, die auf überfällige Sicherungen überwacht werden soll.
- **Nächster Lauf**: Die nächste geplante Sicherungszeit wird in Grün angezeigt, wenn sie in der Zukunft geplant ist, oder in Rot, wenn sie überfällig ist. Wenn Sie den Mauszeiger über den Wert "Nächster Lauf" bewegen, wird ein Tooltip angezeigt, der den letzten Sicherungs-Zeitstempel aus der Datenbank mit vollständigem Datum/Uhrzeit und relativer Zeit anzeigt.
- **Überwachung überfälliger Sicherungen**: Aktivieren oder deaktivieren Sie die Überwachung überfälliger Sicherungen für diese Sicherung.
- **Erwartetes Sicherungsintervall**: Das erwartete Sicherungsintervall.
- **Einheit**: Die Einheit des erwarteten Intervalls.
- **Erlaubte Tage**: Die erlaubten Wochentage für die Sicherung.

Wenn die Symbole neben dem Servernamen ausgegraut sind, ist der Server nicht in den [`Einstellungen → Servereinstellungen`](server-settings.md) konfiguriert.

:::note
Wenn Sie Sicherungsprotokolle von einem Duplicati-Server sammeln, aktualisiert **duplistatus** automatisch die Überwachungsintervalle und Konfigurationen für überfällige Sicherungen.
:::

:::tip
Sammeln Sie Sicherungsprotokolle, nachdem Sie die Konfiguration der Sicherungsauftragsintervalle auf Ihrem Duplicati-Server geändert haben, um optimale Ergebnisse zu erzielen. Dies stellt sicher, dass **duplistatus** mit Ihrer aktuellen Konfiguration synchronisiert bleibt.
:::

## Globale Konfigurationen {#global-configurations}

Diese Einstellungen gelten für alle Sicherungen:

| Einstellung                                           | Beschreibung                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| :---------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Toleranz für überfällige Sicherungen**              | Die Kulanzfrist (zusätzlich gewährte Zeit), die zur erwarteten Sicherungszeit hinzugefügt wird, bevor die Sicherung als überfällig markiert wird. Der Standard ist `1 Stunde`.                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Überwachungsintervall für überfällige Sicherungen** | Wie oft das System auf überfällige Sicherungen prüft. Der Standard ist `5 Minuten`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **Benachrichtigungshäufigkeit**                       | Wie oft Benachrichtigungen über überfällige Sicherungen gesendet werden: <br/> `Einmalig`: Senden Sie **nur eine** Benachrichtigung, wenn die Sicherung überfällig wird. <br/> `Jeden Tag`: Senden Sie **täglich** Benachrichtigungen, während die Sicherung überfällig ist (Standard). <br/> `Jede Woche`: Senden Sie **wöchentlich** Benachrichtigungen, während die Sicherung überfällig ist. <br/> `Jeden Monat`: Senden Sie **monatlich** Benachrichtigungen, während die Sicherung überfällig ist. |

## Verfügbare Aktionen {#available-actions}

| Schaltfläche                                                                            | Beschreibung                                                                                                                                                                                                               |
| :-------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <IconButton label="Einstellungen für Überwachung überfälliger Sicherungen speichern" /> | Speichert die Einstellungen, löscht Timer für alle deaktivierten Sicherungen und führt eine Überprüfung auf überfällige Sicherungen durch.                                                                 |
| <IconButton icon="lucide:import" label="Alle sammeln (#)"/>                             | Sammeln Sie Sicherungsprotokolle von allen konfigurierten Servern, in Klammern die Anzahl der Server, von denen gesammelt werden soll.                                                                     |
| <IconButton icon="lucide:download" label="CSV herunterladen"/>                          | Lädt eine CSV-Datei herunter, die alle Einstellungen für die Überwachung überfälliger Sicherungen und den "Letzten Sicherungs-Zeitstempel (DB)" aus der Datenbank enthält.              |
| <IconButton icon="lucide:refresh-cw" label="Jetzt prüfen"/>                             | Führt die Überprüfung auf überfällige Sicherungen sofort durch. Dies ist nützlich nach Konfigurationsänderungen. Es löst auch eine Neuberechnung des "Nächsten Laufs" aus. |
| <IconButton icon="lucide:timer-reset" label="Benachrichtigungen zurücksetzen"/>         | Setzt die zuletzt gesendete Benachrichtigung über überfällige Sicherungen für alle Sicherungen zurück.                                                                                                     |


