# Audit-Protokolle {/* #audit-logs */}

Das Audit-Protokoll bietet eine umfassende Aufzeichnung aller Systemänderungen und Benutzeraktionen in **duplistatus**. Dies hilft bei der Nachverfolgung von Konfigurationsänderungen, Benutzeraktivitäten und Systemvorgängen zu Sicherheits- und Fehlerbehebungszwecken.

![Audit-Protokoll](../../assets/screen-settings-audit.png)

## Prüfprotokoll-Viewer {/* #audit-log-viewer */}

Der Prüfprotokoll-Viewer zeigt eine chronologische Liste aller protokollierten Ereignisse mit folgenden Informationen an:

- **Zeitstempel**: Wann das Ereignis stattgefunden hat
- **Benutzer**: Der Benutzername der die Aktion durchgeführt hat (oder "System" für automatisierte Aktionen)
- **Aktion**: Die spezifische Aktion, die ausgeführt wurde
- **Kategorie**: Die Kategorie der Aktion (Authentifizierung, Benutzerverwaltung, Konfiguration, Sicherungsvorgänge, Serververwaltung, Systemvorgänge)
- **Status**: Ob die Aktion erfolgreich war oder fehlgeschlagen ist
- **Ziel**: Das Objekt, das betroffen war (falls zutreffend)
- **Details**: Zusätzliche Informationen über die Aktion

### Anzeigen von Protokolldetails {/* #viewing-log-details */}

Klicken Sie auf das <IconButton icon="lucide:eye" /> Augensymbol neben einem beliebigen Protokolleintrag, um detaillierte Informationen anzuzeigen, einschließlich:
- Vollständiger Zeitstempel
- Benutzerinformationen
- Vollständige Aktionsdetails (zum Beispiel: geänderte Felder, Statistiken usw.)
- IP-Adresse und Benutzer-Agent
- Fehlermeldungen (falls die Aktion fehlgeschlagen ist)

### Audit-Protokolle exportieren {/* #exporting-audit-logs */}

Sie können gefilterte Audit-Protokolle in zwei Formaten exportieren:

| Schaltfläche | Beschreibung |
|:------|:-----------|
| <IconButton icon="lucide:download" label="CSV"/> | Protokolle als CSV-Datei für die Tabellenkalkulationsanalyse exportieren |
| <IconButton icon="lucide:download" label="JSON"/> | Protokolle als JSON-Datei für die programmatische Analyse exportieren |

:::note
Exporte enthalten nur die Protokolle, die aktuell basierend auf Ihren aktiven Filtern sichtbar sind. Um alle Protokolle zu exportieren, entfernen Sie zuerst alle Filter.
:::
