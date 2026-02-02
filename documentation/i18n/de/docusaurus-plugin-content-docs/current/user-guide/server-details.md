---
translation_last_updated: '2026-01-31T00:51:26.197Z'
source_file_mtime: '2026-01-27T14:22:06.834Z'
source_file_hash: 9f3164f160479a94
translation_language: de
source_file_path: user-guide/server-details.md
---
# Server-Details {#server-details}

Wenn Sie auf einen Server im Dashboard klicken, wird eine Seite mit einer Liste von Sicherungen für diesen Server geöffnet. Sie können alle Sicherungen anzeigen oder eine bestimmte auswählen, wenn der Server mehrere Sicherungen konfiguriert hat.

![Server Details](../assets/screen-server-backup-list.png)

## Server/Sicherungsstatistiken {#serverbackup-statistics}

Dieser Abschnitt zeigt Statistiken für alle Sicherungen auf dem Server oder eine einzelne ausgewählte Sicherung.

- **BACKUP-JOBS GESAMT**: Gesamtzahl der auf diesem Server konfigurierten Backup-Jobs.
- **GESAMTE BACKUP-LÄUFE**: Gesamtzahl der ausgeführten Backup-Läufe (wie vom Duplicati-Server gemeldet).
- **VERFÜGBARE VERSIONEN**: Anzahl der verfügbaren Versionen (wie vom Duplicati-Server gemeldet).
- **DURCHSCHNITTLICHE DAUER**: Durchschnittliche (mittlere) Dauer von Sicherungen, die in der **duplistatus**-Datenbank aufgezeichnet sind.
- **GRÖSSE DER LETZTEN SICHERUNG**: Größe der Quelldateien aus dem zuletzt empfangenen Sicherungsprotokoll.
- **GESAMTER SPEICHERPLATZ VERWENDET**: Speicherplatz am Sicherungsziel, wie im letzten Sicherungsprotokoll gemeldet.
- **GESAMT HOCHGELADEN**: Summe aller hochgeladenen Daten, die in der **duplistatus**-Datenbank aufgezeichnet sind.

Wenn diese Sicherung oder eine der Sicherungen auf dem Server (wenn `All Backups` ausgewählt ist) überfällig ist, wird eine Meldung unter der Zusammenfassung angezeigt.

![Server Details - Overdue Scheduled Backups](../assets/screen-server-overdue-message.png)

Klicken Sie auf die <IconButton icon="lucide:settings" href="settings/overdue-settings" label="Konfigurieren"/>, um zu [`Einstellungen → Überfällige Überwachung`](settings/overdue-settings.md) zu gelangen. Oder klicken Sie auf die <SvgButton SvgButton svgFilename="duplicati_logo.svg" href="duplicati-configuration" /> in der Symbolleiste, um die Weboberfläche des duplistatus-Servers zu öffnen und die Protokolle zu prüfen.

<br/>

## Sicherungsverlauf {#backup-history}

Diese Tabelle listet die Sicherungsprotokolle für den ausgewählten Server auf.

![Backup History](../assets/screen-backup-history.png)

- **Sicherungsname**: Der Name der Sicherung auf dem Duplicati-Server.
- **Datum**: Der Zeitstempel der Sicherung und die verstrichene Zeit seit der letzten Bildschirmaktualisierung.
- **Status**: Der Status der Sicherung (Erfolg, Warnung, Fehler, Kritisch).
- **Warnungen/Fehler**: Die Anzahl der Warnungen/Fehler, die im Sicherungsprotokoll gemeldet werden.
- **Verfügbare Versionen**: Die Anzahl der verfügbaren Sicherungsversionen am Sicherungsziel. Wenn das Symbol ausgegraut ist, wurden detaillierte Informationen nicht empfangen.
- **Dateianzahl, Dateigröße, Hochgeladene Größe, Dauer, Speichergröße**: Werte wie vom Duplicati-Server gemeldet.

:::tip Tipps
• Verwenden Sie das Dropdown-Menü im Abschnitt **Sicherungsverlauf**, um `Alle Sicherungen` oder eine bestimmte Sicherung für diesen Server auszuwählen.

• Sie können jede Spalte sortieren, indem Sie auf ihre Kopfzeile klicken. Klicken Sie erneut, um die Sortierreihenfolge umzukehren.
 
• Klicken Sie auf eine beliebige Stelle in einer Zeile, um die [Sicherungsdetails](#backup-details) anzuzeigen.

::: 

:::note
Wenn `Alle Sicherungen` ausgewählt ist, wird die Liste standardmäßig von der neuesten zur ältesten Sicherung sortiert angezeigt.
:::

<br/>

## Sicherungsdetails {#backup-details}

Durch Klicken auf ein Status-Badge im Dashboard (Tabellenansicht) oder auf eine beliebige Zeile in der Sicherungsverlauf-Tabelle werden die detaillierten Sicherungsinformationen angezeigt.

![Backup Details](../assets/screen-backup-detail.png)

- **Serverdetails**: Servername, Alias und Hinweis.
- **Sicherungsinformationen**: Der Zeitstempel der Sicherung und ihre ID.
- **Sicherungsstatistiken**: Eine Zusammenfassung der gemeldeten Zähler, Größen und Dauer.
- **Protokollzusammenfassung**: Die Anzahl der gemeldeten Nachrichten.
- **Verfügbare Versionen**: Eine Liste von verfügbaren Versionen (wird nur angezeigt, wenn die Informationen in den Protokollen empfangen wurden).
- **Nachrichten/Warnungen/Fehler**: Die vollständigen Ausführungsprotokolle. Der Untertitel zeigt an, ob das Protokoll vom duplistatus-Server gekürzt wurde.

<br/>

:::note
Refer to the [Duplicati-Konfiguration instructions](../installation/duplicati-server-configuration.md) to learn how to configure Duplicati server to send complete execution logs and avoid truncation.
:::
