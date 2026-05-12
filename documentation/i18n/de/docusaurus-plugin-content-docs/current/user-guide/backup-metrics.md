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
