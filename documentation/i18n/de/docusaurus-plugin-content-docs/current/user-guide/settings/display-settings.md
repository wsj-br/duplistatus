# Anzeige {/* #display */}

Konfigurieren Sie die Benutzeroberfläche und Anzeigeeinstellungen.

![Anzeigeeinstellungen](../../assets/screen-settings-display.png)

<br/>

| Einstellung               | Beschreibung                                         | Standardwert       |
|:--------------------------|:----------------------------------------------------|:-------------------|
| **Tabellengröße**         | Anzahl der Zeilen pro Seite auf der Server-Detailseite. | 5 Zeilen           |
| **Version auf dem Dashboard anzeigen** | Zeigen oder verstecken Sie die Duplicati-Version auf den Dashboard-Karten. Die Dashboard-Tabelle zeigt immer die Spalte Version an. Auch verfügbar unter [Duplicati-Versionen](duplicati-versions.md). | An |
| **Design**                | Wählen Sie zwischen hell, dunkel oder Anpassung an das Erscheinungsbild Ihres Betriebssystems (bevorzugt hell/dunkel). | OS folgen, wenn nicht gesetzt |
| **Diagramm-Zeitbereich**  | Zeitintervall, das in den Diagrammen angezeigt wird. Verfügbare Optionen: **1W** (letzte 7 Tage), **2W** (letzte 14 Tage), **1M** (letzte 30 Tage), **3M** (letzte 90 Tage). Sie können den Zeitbereich auch direkt aus den Diagrammüberschriften umschalten. | 1 Monat            |
| **Diagrammstil**          | Wählen Sie zwischen weichen Linien- oder Balkendiagramm-Darstellungen. Beide Modi verwenden Zeit-Bucket-Aggregation für eine optimale Anzeige. Sie können den Stil auch direkt aus den Diagrammüberschriften umschalten. | Weiche Linien       |
| **Gebietsschema-Format** | Wählen Sie ein Formatierungsgebietsschema unabhängig von Ihrer UI-Sprache (416 Gebietsschemas unterstützt). Dies beeinflusst, wie Daten, Zeiten und Zahlen angezeigt werden. Relative Zeitangaben (z. B. "in 2 Stunden") folgen dem Formatierungsgebietsschema, es sei denn, **Behalte die relative Zeit in der UI-Sprache** ist aktiviert. Eine Live-Vorschau enthält Datum, Zeit, Zahl und ein Beispiel für eine relative Zeitangabe. Beispiel: UI-Sprache = Deutsch, Formatierungsgebietsschema = Englisch (UK) → Deutsche UI mit UK-Datumsformaten. | Basierend auf UI-Sprache |
| **Behalte die relative Zeit in der UI-Sprache** | Wenn aktiviert, folgen Phrasen wie "in 2 Stunden" **Benutzer → Sprache** anstelle des Formatierungsgebietsschemas. Daten, Zeiten und Zahlen verwenden weiterhin das Formatierungsgebietsschema. Standardmäßig deaktiviert. | Aus |
| **Automatische Aktualisierungsintervall** | Wie oft die Seiten automatisch aktualisiert werden. | 1 Minute           |
| **Kartensortierreihenfolge** | Wie die Karten auf dem Dashboard sortiert werden. | Servername (a-z)  |
| **Wochenbeginn**          | Konfigurieren Sie, wann die Woche beginnt. | Basierend auf Gebietsschema |

<br/>

:::tip
**Schnellzugriff**: Sie können auf diese Seite schnell zugreifen, indem Sie mit der rechten Maustaste auf die Schaltfläche für die automatische Aktualisierung in der Anwendungsleiste klicken.
:::
