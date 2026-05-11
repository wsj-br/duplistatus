---
translation_last_updated: '2026-05-11T14:27:47.074Z'
source_file_mtime: '2026-05-06T23:18:51.446Z'
source_file_hash: b0db7a6f1e511ae6977971d8b2cdf4eefcdfa3aea287eea9bbbc2e84542c2144
translation_language: de
source_file_path: documentation/docs/user-guide/settings/application-logs-settings.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Anwendungsprotokolle {#application-logs}

Der Anwendungsprotokoll-Viewer ermöglicht Administratoren, alle Anwendungsprotokolle an einem Ort zu überwachen, mit Filterung, Exportieren und Echtzeit-Updates direkt über die Weboberfläche.

![Application Log Viewer](../../assets/screen-settings-application-logs.png)

<br/>

## Verfügbare Aktionen {#available-actions}

| Button                                                              | Beschreibung                                                                                         |
|:--------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:refresh-cw" label="Aktualisieren" />            | Lädt Protokolle aus der ausgewählten Datei manuell neu. Zeigt während des Aktualisierens einen Ladeindikator an und setzt die Verfolgung neuer Zeilen zurück. |
| <IconButton icon="lucide:copy" label="In Zwischenablage kopieren" />         | Kopiert alle gefilterten Protokollzeilen in die Zwischenablage. Berücksichtigt den aktuellen Suchfilter. Nützlich zum schnellen Teilen oder Einfügen in andere Tools. |
| <IconButton icon="lucide:download" label="Exportieren" />               | Lädt Protokolle als Textdatei herunter. Exportiert aus der aktuell ausgewählten Dateiversion und wendet den aktuellen Suchfilter (falls vorhanden) an. Dateinamenformat: `duplistatus-logs-YYYY-MM-DD.txt` (Datum im ISO-Format). |
| <IconButton icon="lucide:arrow-down-from-line" />                   | Springt schnell zum Anfang der angezeigten Protokolle. Nützlich, wenn das automatische Scrollen deaktiviert ist oder bei der Navigation durch lange Protokolldateien. |
| <IconButton icon="lucide:arrow-down-to-line" />                    | Springt schnell zum Ende der angezeigten Protokolle. Nützlich, wenn das automatische Scrollen deaktiviert ist oder bei der Navigation durch lange Protokolldateien. |

<br/>

## Steuerelemente und Filter {#controls-and-filters}

| Steuerelement | Beschreibung |
|:--------|:-----------|
| **Dateiversion** | Wählen Sie, welche Protokolldatei angezeigt werden soll: **Aktuell** (aktive Datei) oder rotierte Dateien (`.1`, `.2`, usw., wobei höhere Zahlen älter sind). |
| **Anzuzeigende Zeilen** | Zeigt die neuesten **100**, **500**, **1000** (Standard), **5000** oder **10000** Zeilen aus der ausgewählten Datei an. |
| **Automatisch scrollen** | Wenn aktiviert (Standard für aktuelle Datei), scrollt automatisch zu neuen Protokolleinträgen und aktualisiert alle 2 Sekunden. Funktioniert nur für die **Aktuell**-Dateiversion. |
| **Suchen** | Filtert Protokollzeilen nach Text (nicht beachtungssensitiv). Filter werden auf die aktuell angezeigten Zeilen angewendet. |

<br/>

Die Kopfzeile der Protokollanzeige zeigt die gefilterte Zeilenanzahl, die Gesamtzeilenanzahl, die Dateigröße und den Zeitstempel der letzten Änderung an.

<br/>
