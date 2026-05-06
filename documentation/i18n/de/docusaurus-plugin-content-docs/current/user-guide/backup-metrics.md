---
translation_last_updated: '2026-05-06T23:22:00.938Z'
source_file_mtime: '2026-05-06T23:18:51.430Z'
source_file_hash: c4dde05981ada21800990adcdda2efbb6881d3b1d7ae4921922c4c12ca813552
translation_language: de
source_file_path: documentation/docs/user-guide/backup-metrics.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Sicherungs-Metriken {#backup-metrics}

Ein Diagramm von Sicherungsmetriken im Zeitverlauf wird sowohl auf dem Dashboard (Tabellenansicht) als auch auf der Serverdetailseite angezeigt.

- **Dashboard**, das Diagramm zeigt die Gesamtanzahl der Sicherungen, die in der **duplistatus**-Datenbank aufgezeichnet wurden. Wenn Sie das Cards-Layout verwenden, können Sie einen Server auswählen, um seine konsolidierten Metriken anzuzeigen (wenn das Seitenpanel Metriken anzeigt).
- **Server Details**-Seite, das Diagramm zeigt Metriken für den ausgewählten Server (für alle seine Sicherungen) oder für eine einzelne, spezifische Sicherung.

![Backup Metrics](../assets/screen-metrics.png)

- **Hochgeladene Größe**: Gesamte Menge an Daten, die täglich vom Duplicati-Server zur Sicherungsziel (lokaler Speicher, FTP, Cloud-Anbieter, ...) hochgeladen/übertragen wurden.
- **Dauer**: Die Gesamtdauer aller täglich empfangenen Sicherungen in HH:MM.
- **Anzahl der Dateien**: Die Summe der für alle täglichen Sicherungen empfangenen Dateianzahl-Zähler.
- **Dateigröße**: Die Summe der vom Duplicati-Server für alle täglichen Sicherungen gemeldeten Dateigrößen.
- **Speichergröße**: Die Summe des vom Duplicati-Server täglich gemeldeten genutzten Speicherplatzes am Sicherungsziel.
- **Verfügbare Versionen**: Die Summe aller verfügbaren Versionen für alle täglichen Sicherungen.

:::note
Sie können die [Anzeigeeinstellungen](settings/display-settings.md) verwenden, um den Zeitbereich für das Diagramm zu konfigurieren.
:::
