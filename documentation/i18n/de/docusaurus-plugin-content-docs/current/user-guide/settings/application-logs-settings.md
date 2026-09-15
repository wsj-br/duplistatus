# Anwendungsprotokolle {/* #application-logs */}

Der Anwendungsprotokolle-Viewer ermöglicht Administratoren das Überwachen aller Anwendungsprotokolle an einem Ort, mit Filterung, Export und Echtzeitaktualisierungen direkt über die Webschnittstelle.

![Anwendungsprotokolle-Viewer](../../assets/screen-settings-application-logs.png)

<br/>

## Verfügbare Aktionen {/* #available-actions */}

| Schaltfläche                                                              | Beschreibung                                                                                         |
|:--------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:refresh-cw" label="Aktualisieren" />            | Lädt Protokolle manuell aus der ausgewählten Datei neu. Zeigt einen Lade-Spinner während des Aktualisierens an und setzt die Verfolgung für die Erkennung neuer Zeilen zurück. |
| <IconButton icon="lucide:copy" label="In die Zwischenablage kopieren" />         | Kopiert alle gefilterten Protokollzeilen in die Zwischenablage. Berücksichtigt den aktuellen Suchfilter. Nützlich für schnelles Teilen oder Einfügen in andere Tools. |
| <IconButton icon="lucide:download" label="Exportieren" />               | Lädt Protokolle als Textdatei herunter. Exportiert aus der aktuell ausgewählten Dateiversion und wendet den aktuellen Suchfilter an (falls vorhanden). Dateinamenformat: `duplistatus-logs-YYYY-MM-DD.txt` (Datum im ISO-Format). |
| <IconButton icon="lucide:arrow-down-from-line" />                   | Springt schnell zum Anfang der angezeigten Protokolle. Nützlich, wenn die automatische Scrollfunktion deaktiviert ist oder bei der Navigation durch lange Protokolldateien. |
| <IconButton icon="lucide:arrow-down-to-line" />                    | Springt schnell zum Ende der angezeigten Protokolle. Nützlich, wenn die automatische Scrollfunktion deaktiviert ist oder bei der Navigation durch lange Protokolldateien. |

<br/>

## Steuerelemente und Filter {/* #controls-and-filters */}

| Steuerung | Beschreibung |
|:--------|:-----------|
| **Dateiversion** | Wählen Sie aus, welche Protokolldatei angezeigt werden soll: **Aktuell** (aktive Datei) oder rotierte Dateien (`.1`, `.2`, etc., wobei höhere Zahlen älter sind). |
| **Anzuzeigende Zeilen** | Zeigt die neuesten **100**, **500**, **1000** (Standard), **5000** oder **10000** Zeilen aus der ausgewählten Datei an. |
| **Automatisch scrollen** | Wenn aktiviert (Standard für die aktuelle Datei), scrollt automatisch zu neuen Protokolleinträgen und aktualisiert alle 2 Sekunden. Funktioniert nur für die **Aktuelle** Dateiversion. |
| **Suchen** | Filtert Protokollzeilen nach Text (Groß-/Kleinschreibung unbeachtet). Filter werden auf die aktuell angezeigten Zeilen angewendet. |

<br/>

Die Kopfzeile der Protokollanzeige zeigt die Anzahl der gefilterten Zeilen, die Gesamtzahl der Zeilen, die Dateigröße und den letzten geänderten Zeitstempel an.

<br/>
