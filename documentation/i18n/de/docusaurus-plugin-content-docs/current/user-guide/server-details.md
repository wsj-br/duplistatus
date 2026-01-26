# Server Details {#server-details}

Wenn Sie auf einen Server im Dashboard klicken, wird eine Seite mit einer Liste von Sicherungen für diesen Server geöffnet. Sie können alle Sicherungen anzeigen oder eine bestimmte auswählen, wenn der Server mehrere Sicherungen konfiguriert hat.

![Server Details](/img/screen-server-backup-list.png)

## Server / Sicherung Statistiken {#serverbackup-statistics}

Dieser Abschnitt zeigt Statistiken für entweder alle Sicherungen auf dem Server oder eine einzelne ausgewählte Sicherung.

- **BACKUP-JOBS GESAMT**: Gesamtzahl der auf diesem Server konfigurierten Backup-Jobs.
- **GESAMTE BACKUP-LÄUFE**: Gesamtzahl der ausgeführten Backup-Läufe (wie vom Duplicati-Server gemeldet).
- **VERFÜGBARE VERSIONEN**: Anzahl der verfügbaren Versionen (wie vom Duplicati-Server gemeldet).
- **DURCHSCHNITTLICHE DAUER**: Durchschnittliche (mittlere) Dauer von Sicherungen, die in der **duplistatus**-Datenbank aufgezeichnet sind.
- **GRÖSSE DER LETZTEN SICHERUNG**: Größe der Quelldateien aus dem zuletzt empfangenen Sicherungsprotokoll.
- **GESAMTER SPEICHERPLATZ VERWENDET**: Speicherplatz, der am Sicherungsziel verwendet wird, wie im letzten Sicherungsprotokoll gemeldet.
- **GESAMT HOCHGELADEN**: Summe aller hochgeladenen Daten, die in der **duplistatus**-Datenbank aufgezeichnet sind.

Wenn diese Sicherung oder eine der Sicherungen auf dem Server (wenn `Alle Sicherungen` ausgewählt ist) überfällig ist, wird eine Nachricht unter der Zusammenfassung angezeigt.

![Server Details - Überfällige geplante Sicherungen](/img/screen-server-overdue-message.png)

Klicken Sie auf die <IconButton icon="lucide:settings" href="settings/overdue-settings" label="Konfigurieren"/> um zu [`Einstellungen → Überwachung überfälliger Sicherungen`](settings/overdue-settings.md) zu gehen. Oder klicken Sie auf die <SvgButton SvgButton svgFilename="duplicati_logo.svg" href="duplicati-configuration" /> in der Symbolleiste, um die Weboberfläche des Duplicati-Servers zu öffnen und die Protokolle zu prüfen.

<br/>

## Sicherungsverlauf {#backup-history}

Diese Tabelle listet die Sicherungsprotokolle für den ausgewählten Server auf.

![Sicherungsverlauf](/img/screen-backup-history.png)

- **Sicherungsname**: Der Name der Sicherung im Duplicati-Server.
- **Datum**: Der Zeitstempel der Sicherung und die verstrichene Zeit seit der letzten Bildschirmaktualisierung.
- **Status**: Der Status der Sicherung (Erfolg, Warnung, Fehler, Kritisch).
- **Warnungen/Fehler**: Die Anzahl der im Sicherungsprotokoll gemeldeten Warnungen/Fehler.
- **Verfügbare Versionen**: Die Anzahl der verfügbaren Sicherungsversionen am Sicherungsziel. Wenn das Symbol ausgegraut ist, wurden detaillierte Informationen nicht empfangen.
- **Dateianzahl, Dateigröße, Hochgeladene Größe, Dauer, Speichergröße**: Werte wie vom Duplicati-Server gemeldet.

:::tip Tipps
• Verwenden Sie das Dropdown-Menü im Abschnitt **Sicherungsverlauf**, um `Alle Sicherungen` oder eine bestimmte Sicherung für diesen Server auszuwählen.

• Sie können jede Spalte sortieren, indem Sie auf ihre Kopfzeile klicken. Klicken Sie erneut, um die Sortierreihenfolge umzukehren.

• Klicken Sie auf eine beliebige Stelle in einer Zeile, um die [Sicherungsdetails](#backup-details) anzuzeigen.

:::

:::note
Wenn `Alle Sicherungen` ausgewählt ist, zeigt die Liste alle Sicherungen standardmäßig von neuesten zu ältesten sortiert an.
:::

<br/>

## Sicherungsdetails {#backup-details}

Wenn Sie auf ein Statusabzeichen im Dashboard (Tabellenansicht) oder eine beliebige Zeile in der Sicherungsverlaufstabelle klicken, werden die detaillierten Sicherungsinformationen angezeigt.

![Sicherungsdetails](/img/screen-backup-detail.png)

- **Serverdetails**: Servername, Alias und Notiz.
- **Sicherungsinformationen**: Der Zeitstempel der Sicherung und ihre ID.
- **Sicherungsstatistiken**: Eine Zusammenfassung der gemeldeten Zähler, Größen und Dauer.
- **Protokollzusammenfassung**: Die Anzahl der gemeldeten Nachrichten.
- **Verfügbare Versionen**: Eine Liste der verfügbaren Versionen (wird nur angezeigt, wenn die Informationen in den Protokollen empfangen wurden).
- **Nachrichten/Warnungen/Fehler**: Die vollständigen Ausführungsprotokolle. Der Untertitel zeigt an, ob das Protokoll vom Duplicati-Server gekürzt wurde.

<br/>

:::note
Weitere Informationen zum Konfigurieren des Duplicati-Servers zum Senden vollständiger Ausführungsprotokolle und zum Vermeiden von Kürzungen finden Sie in den [Duplicati-Konfigurationsanweisungen](../installation/duplicati-server-configuration.md).
:::
