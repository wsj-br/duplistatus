# Audit-Logs {#audit-logs}

Das Audit-Log bietet eine umfassende Aufzeichnung aller Systemänderungen und Benutzeraktionen in **duplistatus**. Dies hilft beim Nachverfolgen von Konfigurationsänderungen, Benutzeraktivitäten und Systemvorgängen für Sicherheits- und Fehlerbehebungszwecke.

![Audit-Log](/assets/screen-settings-audit.png)

## Audit-Log-Viewer {#audit-log-viewer}

Der Audit-Log-Viewer zeigt eine chronologische Liste aller protokollierten Ereignisse mit den folgenden Informationen an:

- **Zeitstempel**: Wann das Ereignis aufgetreten ist
- **Benutzer**: Der Benutzername, der die Aktion ausgeführt hat (oder "System" für automatisierte Aktionen)
- **Aktion**: Die spezifische Aktion, die ausgeführt wurde
- **Kategorie**: Die Kategorie der Aktion (Authentifizierung, Benutzerverwaltung, Konfiguration, Sicherungsvorgänge, Serververwaltung, Systemvorgänge)
- **Status**: Ob die Aktion erfolgreich war oder fehlgeschlagen ist
- **Ziel**: Das betroffene Objekt (falls zutreffend)
- **Details**: Zusätzliche Informationen zur Aktion

### Anzeigen von Protokolldetails {#viewing-log-details}

Klicken Sie auf das Symbol <IconButton icon="lucide:eye" /> Auge neben einem beliebigen Protokolleintrag, um detaillierte Informationen anzuzeigen, einschließlich:

- Vollständiger Zeitstempel
- Benutzerinformationen
- Vollständige Aktionsdetails (z. B.: geänderte Felder, Statistiken usw.)
- IP-Adresse und User-Agent
- Fehlermeldungen (falls die Aktion fehlgeschlagen ist)

### Exportieren von Audit-Logs {#exporting-audit-logs}

Sie können gefilterte Audit-Logs in zwei Formaten exportieren:

| Schaltfläche                                      | Beschreibung                                                         |
| :------------------------------------------------ | :------------------------------------------------------------------- |
| <IconButton icon="lucide:download" label="CSV"/>  | Protokolle als CSV-Datei für Tabellenkalkulationsanalyse exportieren |
| <IconButton icon="lucide:download" label="JSON"/> | Protokolle als JSON-Datei für programmgesteuerte Analyse exportieren |

:::note
Exporte enthalten nur die Protokolle, die derzeit basierend auf Ihren aktiven Filtern sichtbar sind. Um alle Protokolle zu exportieren, löschen Sie zuerst alle Filter.
:::
