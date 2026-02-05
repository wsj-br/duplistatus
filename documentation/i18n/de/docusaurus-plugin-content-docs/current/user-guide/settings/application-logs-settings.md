---
translation_last_updated: '2026-02-05T19:08:39.611Z'
source_file_mtime: '2026-02-02T19:14:50.094Z'
source_file_hash: 351747b781a00331
translation_language: de
source_file_path: user-guide/settings/application-logs-settings.md
---
# Anwendungsprotokolle {#application-logs}

Der Anwendungsprotokoll-Viewer ermöglicht Administratoren, alle Anwendungsprotokolle an einem Ort zu überwachen, mit Filterung, Exportieren und Echtzeit-Updates direkt über die Weboberfläche.

![Application Log Viewer](../../assets/screen-settings-application-logs.png)

<br/>

## Verfügbare Aktionen {#available-actions}

| Button                                                              | Beschreibung                                                                                         |
|:--------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:refresh-cw" label="Refresh" />            | Protokolle aus der ausgewählten Datei manuell neu laden. Zeigt einen Lade-Spinner während der Aktualisierung an und setzt die Verfolgung für die Erkennung neuer Zeilen zurück. |
| <IconButton icon="lucide:copy" label="Copy to clipboard" />         | Alle gefilterten Protokollzeilen in die Zwischenablage kopieren. Berücksichtigt den aktuellen Suchfilter. Nützlich zum schnellen Teilen oder Einfügen in andere Tools. |
| <IconButton icon="lucide:download" label="Export" />               | Protokolle als Textdatei herunterladen. Exportiert aus der aktuell ausgewählten Dateiversion und wendet den aktuellen Suchfilter an (falls vorhanden). Dateinamenformat: `duplistatus-logs-YYYY-MM-DD.txt` (Datum im ISO-Format). |
| <IconButton icon="lucide:arrow-down-from-line" />                   | Schnell zum Anfang der angezeigten Protokolle springen. Nützlich, wenn das automatische Scrollen deaktiviert ist oder beim Navigieren durch lange Protokolldateien. |
| <IconButton icon="lucide:arrow-down-to-line" />                    | Schnell zum Ende der angezeigten Protokolle springen. Nützlich, wenn das automatische Scrollen deaktiviert ist oder beim Navigieren durch lange Protokolldateien. |

<br/>

## Steuerelemente und Filter {#controls-and-filters}

| Steuerelement | Beschreibung |
|:--------|:-----------|
| **Dateiversion** | Auswählen, welche Protokolldatei angezeigt werden soll: **Aktuell** (aktive Datei) oder rotierte Dateien (`.1`, `.2` usw., wobei höhere Nummern älter sind). |
| **Anzuzeigende Zeilen** | Zeige die letzten **100**, **500**, **1000** (Standard), **5000** oder **10000** Zeilen aus der ausgewählten Datei an. |
| **Automatisches Scrollen** | Wenn aktiviert (Standard für aktuelle Datei), wird automatisch zu neuen Protokolleinträgen gescrollt und alle 2 Sekunden aktualisiert. Funktioniert nur für die `Aktuell`-Dateiversion. |
| **Suchen** | Protokollzeilen nach Text filtern (Groß-/Kleinschreibung wird nicht beachtet). Filter gelten für die aktuell angezeigten Zeilen. |

<br/>

Die Kopfzeile der Protokollanzeige zeigt die gefilterte Zeilenanzahl, die Gesamtzeilenanzahl, die Dateigröße und den Zeitstempel der letzten Änderung an.

<br/>
