# Server-Details {/* #server-details */}

Durch Klicken auf einen Server im Dashboard wird eine Seite mit einer Liste der Backups für diesen Server geöffnet. Sie können alle Backups anzeigen oder ein bestimmtes Backup auswählen, falls der Server mehrere Backups konfiguriert hat.

![Server-Details](../assets/screen-server-backup-list.png)

## Server/Backup-Statistiken {/* #serverbackup-statistics */}

Dieser Abschnitt zeigt Statistiken für alle Backups auf dem Server oder ein einzelnes ausgewähltes Backup.

- **GESAMTE BACKUP-JOBS**: Gesamtzahl der auf diesem Server konfigurierten Backup-Jobs.
- **GESAMTE BACKUP-LÄUFE**: Gesamtzahl der ausgeführten Backup-Läufe (wie vom Duplicati-Server gemeldet).
- **VERFÜGBARE VERSIONEN**: Anzahl der verfügbaren Versionen (wie vom Duplicati-Server gemeldet).
- **DURCHSCHNITTLICHE DAUER**: Durchschnittliche (mittlere) Dauer der Backups, die in der **duplistatus**-Datenbank aufgezeichnet sind.
- **GRÖSSE DER LETZTEN SICHERUNG**: Größe der Quelldateien aus dem letzten empfangenen Backup-Log.
- **GESAMTER GENUTZTER SPEICHER**: Auf dem Backup-Ziel genutzter Speicher, wie im letzten Backup-Log gemeldet.
- **INSGESAMT HOCHGELADEN**: Summe aller hochgeladenen Daten, die in der **duplistatus**-Datenbank aufgezeichnet sind.

Falls dieses Backup oder eines der Backups auf dem Server (wenn **Alle Backups** ausgewählt ist) überfällig ist, erscheint eine Nachricht unter der Zusammenfassung.

![Server-Details - Überfällige geplante Backups](../assets/screen-server-overdue-message.png)

Klicken Sie auf das <IconButton icon="lucide:settings" href="settings/backup-monitoring-settings" label="Konfigurieren"/>, um zu [Einstellungen → Backup-Überwachung](settings/backup-monitoring-settings.md) zu gehen. Oder klicken Sie auf das <SvgButton SvgButton svgFilename="duplicati_logo.svg" href="duplicati-configuration" /> in der Symbolleiste, um die Weboberfläche des Duplicati-Servers zu öffnen und die Protokolle zu prüfen.

<br/>

## Backup-Verlauf {/* #backup-history */}

Diese Tabelle listet die Backup-Protokolle für den ausgewählten Server auf.

![Backup-Verlauf](../assets/screen-backup-history.png)

- **Backup-Name**: Der Name des Backups im Duplicati-Server.
- **Datum**: Der Zeitstempel des Backups und die seit dem letzten Bildschirmaktualisieren verstrichene Zeit.
- **Status**: Der Status des Backups (Erfolgreich, Warnung, Fehler, Fatal).
- **Warnungen/Fehler**: Die Anzahl der Warnungen/Fehler, die im Backup-Protokoll gemeldet wurden.
- **Verfügbare Versionen**: Die Anzahl der verfügbaren Backup-Versionen auf dem Backup-Ziel. Falls das Symbol ausgegraut ist, wurden detaillierte Informationen nicht empfangen.
- **Anzahl der Dateien, Dateigröße, Hochgeladene Größe, Dauer, Speichergröße**: Werte, wie vom Duplicati-Server gemeldet.

:::tip Tipps
• Verwenden Sie das Dropdown-Menü im Abschnitt **Backup-Verlauf**, um **Alle Backups** oder ein bestimmtes Backup für diesen Server auszuwählen.

• Sie können jede Spalte sortieren, indem Sie auf die Kopfzeile klicken. Klicken Sie erneut, um die Sortierreihenfolge umzukehren.

• Klicken Sie irgendwo auf eine Zeile, um die [Backup-Details](#backup-details) anzuzeigen.

:::

:::note
Wenn **Alle Backups** ausgewählt ist, zeigt die Liste alle Backups standardmäßig von neuesten zu ältesten geordnet.
:::

<br/>

## Backup-Details {/* #backup-details */}

Durch Klicken auf ein Statusabzeichen im Dashboard (Tabellenansicht) oder auf eine beliebige Zeile in der Backup-Verlaufstabelle werden die detaillierten Backup-Informationen angezeigt.

![Backup-Details](../assets/screen-backup-detail.png)

- **Serverdetails**: Servername, Alias und Notiz.
- **Backup-Informationen**: Der Zeitstempel der Sicherung und ihre ID.
- **Backup-Statistiken**: Eine Zusammenfassung der gemeldeten Zähler, Größen und Dauer.
- **Protokollzusammenfassung**: Die Anzahl der gemeldeten Nachrichten.
- **Verfügbare Versionen**: Eine Liste der verfügbaren Versionen (wird nur angezeigt, wenn die Informationen in den Protokollen empfangen wurden).
- **Nachrichten/Warnungen/Fehler**: Die vollständigen Ausführungsprotokolle. Der Untertitel gibt an, ob das Protokoll vom Duplicati-Server gekürzt wurde.

<br/>

:::note
Weitere Informationen zur Konfiguration des Duplicati-Servers zur Übermittlung vollständiger Ausführungsprotokolle und zum Vermeiden von Kürzungen finden Sie in den [Anweisungen zur Duplicati-Konfiguration](../installation/duplicati-server-configuration.md).
:::
