# Anwendungsprotokolle {#application-logs}

Der Anwendungsprotokoll-Viewer ermöglicht es Administratoren, alle Anwendungsprotokolle an einem Ort zu überwachen, mit Filterung, Exportieren und Echtzeit-Updates direkt aus der Weboberfläche.

![Application Log Viewer](/assets/screen-settings-application-logs.png)

<br/>

## Verfügbare Aktionen {#available-actions}

| Schaltfläche                                                | Beschreibung                                                                                                                                                                                                                                                                                                                            |
| :---------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <IconButton icon="lucide:refresh-cw" label="Refresh" />     | Protokolle aus der ausgewählten Datei manuell neu laden. Zeigt einen Lade-Spinner beim Aktualisieren an und setzt die Verfolgung für die Erkennung neuer Zeilen zurück.                                                                                                                                 |
| <IconButton icon="lucide:copy" label="Copy to clipboard" /> | Kopieren Sie alle gefilterten Protokollzeilen in Ihre Zwischenablage. Respektiert den aktuellen Suchfilter. Nützlich zum schnellen Teilen oder Einfügen in andere Tools.                                                                                                                |
| <IconButton icon="lucide:download" label="Export" />        | Protokolle als Textdatei herunterladen. Exportiert aus der aktuell ausgewählten Dateiversion und wendet den aktuellen Suchfilter an (falls vorhanden). Dateinamenformat: `duplistatus-logs-YYYY-MM-DD.txt` (Datum im ISO-Format). |
| <IconButton icon="lucide:arrow-down-from-line" />           | Springen Sie schnell zum Anfang der angezeigten Protokolle. Nützlich, wenn das automatische Scrollen deaktiviert ist oder beim Navigieren durch lange Protokolldateien.                                                                                                                                 |
| <IconButton icon="lucide:arrow-down-to-line" />             | Springen Sie schnell zum Ende der angezeigten Protokolle. Nützlich, wenn das automatische Scrollen deaktiviert ist oder beim Navigieren durch lange Protokolldateien.                                                                                                                                   |

<br/>

## Steuerelemente und Filter {#controls-and-filters}

| Steuerelement              | Beschreibung                                                                                                                                                                                                                                            |
| :------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Dateiversion**           | Wählen Sie aus, welche Protokolldatei angezeigt werden soll: **Aktuell** (aktive Datei) oder rotierte Dateien (`.1`, `.2` usw., wobei höhere Nummern älter sind). |
| **Anzuzeigende Zeilen**    | Zeigen Sie die letzten **100**, **500**, **1000** (Standard), **5000** oder **10000** Zeilen aus der ausgewählten Datei an.                                                                                          |
| **Automatisches Scrollen** | Wenn aktiviert (Standard für aktuelle Datei), wird automatisch zu neuen Protokolleinträgen gescrollt und alle 2 Sekunden aktualisiert. Funktioniert nur für die `Aktuelle` Dateiversion.             |
| **Suchen**                 | Filtern Sie Protokollzeilen nach Text (Groß-/Kleinschreibung wird nicht beachtet). Filter gelten für die aktuell angezeigten Zeilen.                                                                 |

<br/>

Die Kopfzeile der Protokollanzeige zeigt die gefilterte Zeilenanzahl, Gesamtzahl der Zeilen, Dateigröße und den Zeitstempel der letzten Änderung an.

<br/>


