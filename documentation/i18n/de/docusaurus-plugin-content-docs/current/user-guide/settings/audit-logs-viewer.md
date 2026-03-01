---
translation_last_updated: '2026-03-01T00:45:11.830Z'
source_file_mtime: '2026-02-16T00:30:39.432Z'
source_file_hash: 2d1dbdbd08ce54ad
translation_language: de
source_file_path: user-guide/settings/audit-logs-viewer.md
---
# Audit-Protokolle {#audit-logs}

Das Audit-Log bietet eine umfassende Aufzeichnung aller Systemänderungen und Benutzeraktionen in **duplistatus**. Dies hilft beim Nachverfolgen von Konfigurationsänderungen, Benutzeraktivitäten und Systemoperationen für Sicherheits- und Fehlerbehebungszwecke.

![Audit Log](../../assets/screen-settings-audit.png)

## Audit-Log-Viewer {#audit-log-viewer}

Der Audit-Log-Viewer zeigt eine chronologische Liste aller protokollierten Ereignisse mit den folgenden Informationen an:

- **Zeitstempel**: Wann das Ereignis aufgetreten ist
- **Benutzer**: Der Benutzername, der die Aktion ausgeführt hat (oder „System" für automatisierte Aktionen)
- **Aktion**: Die spezifische Aktion, die ausgeführt wurde
- **Kategorie**: Die Kategorie der Aktion (Authentifizierung, Benutzerverwaltung, Konfiguration, Sicherungsvorgänge, Serververwaltung, Systemvorgänge)
- **Status**: Ob die Aktion erfolgreich war oder fehlgeschlagen ist
- **Ziel**: Das betroffene Objekt (falls zutreffend)
- **Details**: Zusätzliche Informationen zur Aktion

### Anzeigen von Protokolldetails {#viewing-log-details}

Klicken Sie auf das <IconButton icon="lucide:eye" /> Augensymbol neben einem beliebigen Protokolleintrag, um detaillierte Informationen anzuzeigen, einschließlich:
- Vollständiger Zeitstempel
- Benutzerinformationen
- Vollständige Aktionsdetails (beispielsweise: geänderte Felder, Statistiken usw.)
- IP-Adresse und User-Agent
- Fehlermeldungen (falls die Aktion fehlgeschlagen ist)

### Exportieren von Audit-Protokollen {#exporting-audit-logs}

Sie können gefilterte Audit-Protokolle in zwei Formaten exportieren:

| Button | Beschreibung |
|:------|:-----------|
| <IconButton icon="lucide:download" label="CSV"/> | Protokolle als CSV-Datei für die Tabellenkalkulationsanalyse exportieren |
| <IconButton icon="lucide:download" label="JSON"/> | Protokolle als JSON-Datei für die programmgesteuerte Analyse exportieren |

:::note
Exporte enthalten nur die Protokolle, die basierend auf Ihren aktiven Filtern derzeit sichtbar sind. Um alle Protokolle zu exportieren, löschen Sie zunächst alle Filter.
:::
