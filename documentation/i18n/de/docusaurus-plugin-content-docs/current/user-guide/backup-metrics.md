# Sicherungsmetriken {/* #backup-metrics */}

Ein Diagramm mit Sicherungsmetriken über die Zeit wird sowohl auf dem Dashboard (Tabellenansicht) als auch auf der Server-Detailseite angezeigt.

- **Dashboard**: Das Diagramm zeigt die Gesamtzahl der in der **duplistatus**-Datenbank aufgezeichneten Sicherungen an. Wenn Sie das Kartenlayout verwenden, können Sie einen Server auswählen, um seine konsolidierten Metriken anzuzeigen (wenn das Seitenpanel die Metriken anzeigt).
- **Server-Detailsseite**: Das Diagramm zeigt Metriken für den ausgewählten Server (für alle seine Sicherungen) oder für eine einzelne, spezifische Sicherung an.

![Sicherungsmetriken](../assets/screen-metrics.png)

## Inline-Diagrammsteuerungen {/* #inline-chart-controls */}

Schnellzugriffssteuerungen sind direkt in den Diagrammkopfzeilen verfügbar, um eine einfache Konfiguration ohne Navigation zu den Anzeigeeinstellungen zu ermöglichen:

### Zeitbereichsauswahl {/* #time-range-selector */}

Pillen-Buttons erscheinen in der Diagrammkopfzeile für eine schnelle Zeitbereichsauswahl: **1W | 2W | 1M | 3M**

- **1W**: Letzte 7 Tage (rollierendes Fenster)
- **2W**: Letzte 14 Tage (rollierendes Fenster)
- **1M**: Letzte 30 Tage (rollierendes Fenster, Standard)
- **3M**: Letzte 90 Tage (rollierendes Fenster)

Änderungen hier werden mit Ihren Anzeigeeinstellungen synchronisiert, sodass Ihre Einstellung über Seitenaktualisierungen hinweg gespeichert bleibt.

### Diagrammstiltoggle {/* #chart-style-toggle */}

Ein Umschaltbutton in der Diagrammkopfzeile ermöglicht Ihnen den Wechsel zwischen:

- **Weiche Linien**: Datenpunkte werden mit glatten Kurven verbunden
- **Balkendiagramm**: Daten werden als diskrete Balken für jeden Zeitbereich angezeigt

Beide Modi verwenden Zeit-Bucket-Aggregation für eine optimale Anzeige. Leere Perioden im Balkenmodus werden ohne Balken dargestellt. Ihre Einstellung bleibt über Seitenaktualisierungen hinweg erhalten und wird mit den Anzeigeeinstellungen synchronisiert.

## Konsolidierung der Diagrammdaten {/* #chart-data-consolidation */}

Wenn mehrere Sicherungen am selben Tag stattfinden, konsolidiert **duplistatus** die Daten, bevor sie auf den Diagrammen angezeigt werden:

- **SUM**: Wird für kumulative Metriken verwendet (Dauer, Anzahl der Dateien, Dateigröße, Hochgeladene Größe)
- **LAST**: Wird für die Speichergröße verwendet (der neueste Wert des Tages)
- **MAX**: Wird für die verfügbaren Versionen verwendet (die höchste Anzahl des Tages)

Diese Konsolidierung erfolgt, bevor die Zeit-Bucketing-Anwendung erfolgt, um genaue aggregierte Metriken sicherzustellen. Beispielsweise werden zwei Sicherungen am 5/12/26 zu einem konsolidierten Datenpunkt auf dem Diagramm.

## Metrikdefinitionen {/* #metric-definitions */}

- **Hochgeladene Größe**: Gesamtmenge der hochgeladenen/übertragenen Daten während der Sicherungen vom Duplicati-Server zum Ziel (lokale Speicherung, FTP, Cloud-Anbieter, ...) pro Tag.
- **Dauer**: Die Gesamtlaufzeit aller empfangenen Sicherungen pro Tag in HH:MM.
- **Anzahl der Dateien**: Die Summe des Dateizählerstands für alle empfangenen Sicherungen pro Tag.
- **Dateigröße**: Die Summe der von Duplicati-Server gemeldeten Dateigröße für alle empfangenen Sicherungen pro Tag.
- **Speichergröße**: Die Summe der verwendeten Speichergröße auf dem Sicherungsziel, die vom Duplicati-Server pro Tag gemeldet wird.
- **Verfügbare Versionen**: Die Summe aller verfügbaren Versionen für alle Sicherungen pro Tag.

:::note
Sie können die [Anzeigeeinstellungen](settings/display-settings.md) verwenden, um den Zeitbereich für das Diagramm zu konfigurieren.
:::
