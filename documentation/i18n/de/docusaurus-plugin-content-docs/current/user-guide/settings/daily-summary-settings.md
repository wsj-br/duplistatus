# Tägliche Zusammenfassung {#daily-summary}

Die Tägliche Zusammenfassung ist ein optionaler Benachrichtigungsmodus, der **eine** lokalisierte Momentaufnahme aller bekannten Sicherungsjobs zu einer genauen lokalen Uhrzeit sendet. Solange er aktiviert ist, werden individuelle Sicherungs- und Überfälligkeits-E-Mails und NTFY-Nachrichten ausgesetzt, einschließlich zusätzlicher pro-Job-Ziele. Diese Einstellungen bleiben gespeichert und werden wieder aktiv, sobald die Tägliche Zusammenfassung deaktiviert wird.

Die Momentaufnahme ist der **aktuelle** Status zum Zeitpunkt des Versands (das neueste Ergebnis für jeden Job). Es handelt sich nicht um eine Historie der vorherigen Tagesläufe.

![Einstellungen für die Tägliche Zusammenfassung](../../assets/screen-settings-left-panel-admin.png)

## Anforderungen {#requirements}

- SMTP muss konfiguriert sein. E-Mails werden immer einmal an den SMTP-Empfänger gesendet.
- Der cron-Dienst muss laufen. Der Dispatcher überprüft jede Minute in UTC.
- Optionale NTFY-Zustellung erfordert ebenfalls gültige gespeicherte NTFY-Einstellungen.

## Was ist enthalten {#what-is-included}

Bekannte Jobs sind die Vereinigung von:

- dem neuesten beobachteten Backup für jeden Server und Backup-Name
- expliziten pro-Job-Einstellungen, deren Server noch existiert

Ein konfigurierter Job, der noch keinen Bericht gesendet hat, wird als **Kein Bericht empfangen** gekennzeichnet. Statusgruppen (Erfolgreich, Warnung, Fehler, Fatal, Unbekannt, Kein Bericht empfangen) sind gegenseitig ausgeschlossen und addieren sich zur Jobanzahl. **Überfällig** wird separat gezählt: ein überfälliger erfolgreicher Job ist immer noch Erfolgreich und auch überfällig.

## Zeitplan {#schedule}

Wählen Sie eine genaue `HH:mm` Uhrzeit und speichern Sie die IANA-Zeitzone des Browsers. Die gespeicherte Zeitzone bleibt sichtbar und wird nicht ersetzt, wenn ein anderer Browser die Einstellungen öffnet.

- Das Aktivieren oder Ändern des Zeitplans beginnt bei der **nächsten zukünftigen** Gelegenheit, nie mit einer sofortigen Überraschungssendung.
- Das spätere Neustarten am selben lokalen Tag fängt trotzdem nach der konfigurierten Zeit ein.
- Vollständig verpasste frühere Tage werden nicht wiederholt.
- Verpasste Zeiten im Frühjahr laufen zur ersten gültigen Minute nach der Lücke. Wiederholte Stunden im Herbst werden einmal gesendet.

## Ersetzungsverhalten {#replacement-behaviour}

Wenn die Tägliche Zusammenfassung aktiviert ist:

- werden Uploads und Überfälligkeits-E-Mails/NTFY nicht gesendet
- Überfälligkeitszeitstempel werden nicht vorgerückt, sodass Überfälligkeitswarnungen sofort wieder aufgenommen werden können, wenn der Modus deaktiviert wird
- Vorlagenvorschau, Transporttests und **Zusammenfassung jetzt senden** funktionieren weiterhin

**Zusammenfassung jetzt senden** ist eine zusätzliche Zustellung. Sie verbraucht nicht die nächste geplante Gelegenheit.

## Vorlagen {#templates}

Bearbeiten Sie die Tägliche Zusammenfassung E-Mail (Markdown) und die kompakten NTFY-Vorlagen unter [Einstellungen → Vorlagen](/user-guide/settings/notification-templates). E-Mail-Körper für Erfolgreich, Warnung/Fehler, Überfällig und Tägliche Zusammenfassung verwenden alle Markdown.

**Vorschau generieren** auf dieser Seite öffnet einen Dialog mit dem aktuellen Snapshot. E-Mail HTML folgt dem aktuellen hellen oder dunklen Design.
