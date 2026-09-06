# Tägliche Zusammenfassung {#daily-summary}

Die Tägliche Zusammenfassung ist ein optionaler Benachrichtigungsmodus, der **eine** lokalisierte Momentaufnahme aller bekannten Sicherungsaufträge zu einer festen lokalen Uhrzeit sendet. Solange er aktiviert ist, werden individuelle Sicherungs- und überfällige **E-Mail**-Nachrichten angehalten, einschließlich zusätzlicher pro-Auftrag-E-Mail-Ziele. Pro-Auftrag-NTFY-Benachrichtigungen bleiben aktiv. Diese Einstellungen bleiben gespeichert und werden wieder aktiv, sobald die Tägliche Zusammenfassung deaktiviert wird.

Die Momentaufnahme ist der **aktuelle** Status zum Zeitpunkt des Versands (das neueste Ergebnis für jeden Job). Es handelt sich nicht um eine Historie der vorherigen Tagesläufe.

![Einstellungen für die Tägliche Zusammenfassung](../../assets/screen-settings-left-panel-admin.png)

## Anforderungen {#requirements}

- SMTP muss konfiguriert werden. E-Mail wird immer einmal an den SMTP-Empfänger gesendet.
- Geplante Zustellung erfordert den Cron-Dienst. Der Dispatcher überprüft jede Minute in UTC, wenn er läuft.

## Was ist enthalten {#what-is-included}

Bekannte Jobs sind die Vereinigung von:

- dem neuesten beobachteten Backup für jeden Server und Backup-Name
- expliziten pro-Job-Einstellungen, deren Server noch existiert

Ein konfigurierter Job, der noch keinen Bericht gesendet hat, wird als **Kein Bericht empfangen** gekennzeichnet. Statusgruppen (Erfolgreich, Warnung, Fehler, Fatal, Unbekannt, Kein Bericht empfangen) sind gegenseitig ausgeschlossen und addieren sich zur Jobanzahl. **Überfällig** wird separat gezählt: ein überfälliger erfolgreicher Job ist immer noch Erfolgreich und auch überfällig.

## Zeitplan {#schedule}

Wählen Sie eine genaue `HH:mm` Zeit in Ihrer **Browser-Zeitzone**. duplistatus speichert den Zeitplan als UTC und zeigt beide Werte auf der Seite an (das gleiche Muster wie **Duplicati-Versionen**). Änderungen auf dieser Seite werden automatisch gespeichert.

- Das Aktivieren oder Ändern des Zeitplans beginnt bei der **nächsten zukünftigen** Gelegenheit, nie mit einer sofortigen Überraschungssendung.
- Das spätere Neustarten am selben lokalen Tag fängt trotzdem nach der konfigurierten Zeit ein.
- Vollständig verpasste frühere Tage werden nicht wiederholt.
- Verpasste Zeiten im Frühjahr laufen zur ersten gültigen Minute nach der Lücke. Wiederholte Stunden im Herbst werden einmal gesendet.

## Öffentliche Dashboard-URL {#public-dashboard-url}

Die optionale **Öffentliche Dashboard-URL** auf dieser Seite speist den `{duplistatus_link}` Platzhalter in E-Mail-Vorlagen für die tägliche Zusammenfassung. Verwenden Sie eine `http://` oder `https://` URL ohne abschließenden Schrägstrich. Lassen Sie es leer, um den Link zu entfernen.

Wenn `DUPLISTATUS_PUBLIC_URL` in der Umgebung festgelegt ist, überschreibt es die gespeicherte Einstellung (siehe [Umgebungsvariablen](/installation/environment-variables)).

## Ersetzungsverhalten {#replacement-behaviour}

Wenn die Tägliche Zusammenfassung aktiviert ist:

- Hochladen und überfällige E-Mails werden nicht gesendet
- Pro-Auftrag-NTFY-Benachrichtigungen bleiben aktiv
- Überfällige Zeitstempel werden nicht vorangetrieben, sodass überfällige Warnungen sofort fortgesetzt werden können, wenn der Modus deaktiviert wird
- Vorlagenvorschau, Transporttests und **Zusammenfassung jetzt senden** funktionieren weiterhin

**Zusammenfassung jetzt senden** ist eine zusätzliche Zustellung. Sie verbraucht nicht die nächste geplante Gelegenheit.

## Vorlagen {#templates}

Bearbeiten Sie die E-Mail-Vorlage für die tägliche Zusammenfassung (Markdown) unter [Einstellungen → Vorlagen](/user-guide/settings/notification-templates). Die E-Mail-Inhalte für Erfolgreich, Warnung/Fehler, Überfällig und Tägliche Zusammenfassung verwenden alle Markdown. Die Standardvorlage enthält `{duplistatus_link}` am Ende, wenn eine öffentliche Dashboard-URL auf dieser Seite oder über `DUPLISTATUS_PUBLIC_URL` konfiguriert ist.

**Vorschau generieren** auf dieser Seite öffnet einen Dialog mit dem aktuellen Snapshot. E-Mail HTML folgt dem aktuellen hellen oder dunklen Design.
