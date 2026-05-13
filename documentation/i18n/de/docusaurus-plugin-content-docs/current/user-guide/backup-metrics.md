# Sicherungs-Metriken {#backup-metrics}

Ein Diagramm von Sicherungsmetriken im Zeitverlauf wird sowohl auf dem Dashboard (Tabellenansicht) als auch auf der Serverdetailseite angezeigt.

- **Dashboard**, das Diagramm zeigt die Gesamtanzahl der Sicherungen, die in der **duplistatus**-Datenbank aufgezeichnet wurden. Wenn Sie das Cards-Layout verwenden, können Sie einen Server auswählen, um seine konsolidierten Metriken anzuzeigen (wenn das Seitenpanel Metriken anzeigt).
- **Server Details**-Seite, das Diagramm zeigt Metriken für den ausgewählten Server (für alle seine Sicherungen) oder für eine einzelne, spezifische Sicherung.

![Backup Metrics](../assets/screen-metrics.png)

## Inline-Diagrammsteuerungen {#inline-chart-controls}

Schnellzugriffs-Steuerelemente sind direkt in den Diagramm-Panelüberschriften verfügbar, um eine einfache Konfiguration ohne Navigation zu den Anzeigeeinstellungen zu ermöglichen:

### Zeitbereichsauswahl {#time-range-selector}

Pill-Buttons erscheinen in der Diagrammkopfzeile für schnelle Zeitbereichsauswahl: **1W | 2W | 1M | 3M**

- **1W**: Letzte 7 Tage (gleitendes Fenster)
- **2W**: Letzte 14 Tage (gleitendes Fenster)
- **1M**: Letzte 30 Tage (gleitendes Fenster, Standard)
- **3M**: Letzte 90 Tage (gleitendes Fenster)

Hier vorgenommene Änderungen synchronisieren sich mit Ihren Anzeigeeinstellungen, sodass Ihre Einstellung seitenübergreifend gespeichert wird.

### Diagrammstil-Umschalter {#chart-style-toggle}

Ein Umschalter in der Diagrammkopfzeile ermöglicht das Wechseln zwischen:

- **Weiche Linien**: Datenpunkte mit weichen Kurven verbinden
- **Balkendiagramm**: Daten als diskrete Balken für jeden Zeitraum anzeigen

Beide Modi verwenden Zeitintervall-Aggregation für optimale Darstellung. Leere Perioden im Balkenmodus zeigen keine Balken. Ihre Einstellung bleibt über Seitenaktualisierungen hinweg erhalten und wird mit den Anzeigeeinstellungen synchronisiert.

## Diagrammdatenkonsolidierung {#chart-data-consolidation}

Wenn mehrere Backups am selben Tag auftreten, konsolidiert **duplistatus** die Daten vor der Anzeige im Diagramm:

- **SUM**: Verwendet für kumulative Metriken (Dauer, Anzahl der Dateien, Dateigröße, Hochgeladene Größe)
- **LAST**: Verwendet für Speichergröße (der aktuellste Wert des Tages)
- **MAX**: Verwendet für Verfügbare Versionen (die höchste Anzahl des Tages)

Diese Konsolidierung erfolgt vor der Zeitintervall-Aggregation und gewährleistet präzise aggregierte Metriken. Beispielsweise werden zwei Backups am 5.12.26 einen konsolidierten Datenpunkt im Diagramm erzeugen.

## Metrikdefinitionen {#metric-definitions}

- **Hochgeladene Größe**: Gesamte Menge an Daten, die täglich vom Duplicati-Server zur Sicherungsziel (lokaler Speicher, FTP, Cloud-Anbieter, ...) hochgeladen/übertragen wurden.
- **Dauer**: Die Gesamtdauer aller täglich empfangenen Sicherungen in HH:MM.
- **Anzahl der Dateien**: Die Summe der für alle täglichen Sicherungen empfangenen Dateianzahl-Zähler.
- **Dateigröße**: Die Summe der vom Duplicati-Server für alle täglichen Sicherungen gemeldeten Dateigrößen.
- **Speichergröße**: Die Summe des vom Duplicati-Server täglich gemeldeten genutzten Speicherplatzes am Sicherungsziel.
- **Verfügbare Versionen**: Die Summe aller verfügbaren Versionen für alle täglichen Sicherungen.

:::note
Sie können die [Anzeigeeinstellungen](settings/display-settings.md) verwenden, um den Zeitbereich für das Diagramm zu konfigurieren.
:::
