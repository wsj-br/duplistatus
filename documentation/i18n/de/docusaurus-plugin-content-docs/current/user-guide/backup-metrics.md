---
translation_last_updated: '2026-01-31T00:51:26.111Z'
source_file_mtime: '2026-01-27T14:22:06.834Z'
source_file_hash: 338e6488953bc930
translation_language: de
source_file_path: user-guide/backup-metrics.md
---
# Sicherungs-Metriken {#backup-metrics}

Ein Diagramm der Sicherungsmetriken im Zeitverlauf wird sowohl im Dashboard (Tabellenansicht) als auch auf der Server-Details-Seite angezeigt.

- **Dashboard**, das Diagramm zeigt die Gesamtzahl der in der **duplistatus**-Datenbank aufgezeichneten Sicherungen an. Wenn Sie das Cards-Layout verwenden, können Sie einen Server auswählen, um seine konsolidierten Metriken anzuzeigen (wenn das Seitenpanel Metriken anzeigt).
- **Server Details**-Seite, das Diagramm zeigt Metriken für den ausgewählten Server (für alle seine Sicherungen) oder für eine einzelne, spezifische Sicherung an.

![Backup Metrics](/assets/screen-metrics.png)

- **Hochgeladene Größe**: Gesamtmenge der während Sicherungen vom Duplicati-Server zum Ziel (lokaler Speicher, FTP, Cloud-Anbieter, ...) pro Tag hochgeladenen/übertragenen Daten.
- **Dauer**: Die Gesamtdauer aller pro Tag empfangenen Sicherungen in HH:MM.
- **Dateianzahl**: Die Summe der Dateianzahl-Zähler, die für alle pro Tag empfangenen Sicherungen ermittelt wurden.
- **Dateigröße**: Die Summe der vom Duplicati-Server für alle pro Tag empfangenen Sicherungen gemeldeten Dateigröße.
- **Speichergröße**: Die Summe der vom Duplicati-Server pro Tag gemeldeten, am Sicherungsziel verwendeten Speichergröße.
- **Verfügbare Versionen**: Die Summe aller verfügbaren Versionen für alle Sicherungen pro Tag.

:::note
Sie können das Steuerelement [Anzeigeeinstellungen](settings/display-settings.md) verwenden, um den Zeitbereich für das Diagramm zu konfigurieren.
:::
