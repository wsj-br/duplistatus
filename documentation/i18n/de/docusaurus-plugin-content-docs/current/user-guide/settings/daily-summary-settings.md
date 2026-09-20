# Tägliche Zusammenfassung {/* #daily-summary */}

Die tägliche Zusammenfassung ist ein optionaler Benachrichtigungsmodus, der **einen** lokalisierten Schnappschuss aller bekannten Sicherungsaufträge zu einer exakten lokalen Uhrzeit sendet. Während dieser aktiviert ist, werden Sicherungs- und überfällige E-Mails an den Standard-Empfänger (Einstellungen → E-Mail → Empfänger-E-Mail) pausiert. Zusätzliche E-Mail-Ziele, die in [Backup-Benachrichtigungen](backup-notifications-settings.md) konfiguriert sind, erhalten weiterhin passende Ereignisse. Pro-Job NTFY-Benachrichtigungen werden fortgesetzt. Diese Einstellungen bleiben gespeichert und werden wieder aktiv, sobald die tägliche Zusammenfassung deaktiviert wird.

Der Schnappschuss ist der **aktuelle** Status zum Sendezeitpunkt (das neueste Ergebnis für jeden Job). Es handelt sich nicht um eine Historie der Läufe des vorhergehenden Tages.

![Einstellungen zur täglichen Zusammenfassung](../../assets/screen-settings-daily-summary.png)

## Voraussetzungen {/* #requirements */}

- SMTP muss konfiguriert sein. Die E-Mail wird einmalig gesendet, an den **SMTP-Empfänger überschreiben**, falls einer gespeichert ist, andernfalls an den SMTP-Empfänger aus [E-Mail-Einstellungen](/user-guide/settings/email-settings).
- Überprüfen Sie Ihre SMTP-Konfiguration und stellen Sie sicher, dass sie funktioniert, bevor Sie sich auf die tägliche Zusammenfassung verlassen.
- Der geplante Versand erfordert den Cron-Dienst. Der Dispatcher wird einmal täglich zur gespeicherten UTC-Sendezeit ausgeführt.

## Was ist enthalten {/* #what-is-included */}

Bekannte Jobs sind die **zuletzt beobachtete Sicherung** für jeden Server und jeden Sicherungsnamen — dieselbe Menge wie im Dashboard und unter Einstellungen → Backup-Überwachung.

Statuskategorien (Erfolgreich, Warnung, Fehler, Fatal, Unbekannt) schließen sich gegenseitig aus und summieren sich zur Auftragsanzahl. **Überfällig** wird separat gezählt: Ein erfolgreicher, aber überfälliger Auftrag zählt immer noch als Erfolgreich und zusätzlich als überfällig.

## Zeitplan {/* #schedule */}

Wählen Sie eine genaue `HH:mm` Uhrzeit in Ihrer **Browser-Zeitzone**. duplistatus speichert den Zeitplan als UTC und zeigt beide Werte auf der Seite an (gleiches Muster wie bei **Duplicati-Versionen**). Änderungen auf dieser Seite werden automatisch gespeichert. Die Standard-Sendezeit für neue Installationen ist **01:00 UTC**.

- Das Aktivieren oder Ändern des Zeitplans beginnt mit dem **nächsten zukünftigen** Vorkommen, niemals mit einem unmittelbaren unerwarteten Senden.
- Die geplante Uhrzeit wird immer dann gesendet, wenn der Cron-Job ausgelöst wird. **Zusammenfassung jetzt senden**, ein Wiederholungsversuch oder ein früherer Versand am gleichen Tag lässt es nicht aus.

## Öffentliche Dashboard-URL {/* #public-dashboard-url */}

Optionale **öffentliche Dashboard-URL** auf dieser Seite füttert den `{duplistatus_link}` Platzhalter in täglichen Zusammenfassungs-E-Mails. Verwenden Sie eine `http://` oder `https://` URL ohne abschließenden Schrägstrich. Lassen Sie das Feld leer, um den Link wegzulassen.

Wenn `DUPLISTATUS_PUBLIC_URL` in der Umgebung gesetzt ist, überschreibt dies die gespeicherte Einstellung (siehe [Umgebungsvariablen](/installation/environment-variables)).

## SMTP-Empfänger überschreiben {/* #override-smtp-recipient */}

Optionaler **SMTP-Empfänger überschreiben** sendet die tägliche Zusammenfassung an eine andere Adresse als den Empfänger in den E-Mail-Einstellungen. Lassen Sie das Feld leer, um den Standard weiterzuverwenden. Der Wert wird im `daily_summary` Konfigurationsschlüssel (`smtpRecipient`) gespeichert und wird für geplante Sendungen, **Zusammenfassung jetzt senden** und Wiederholungen verwendet. Die Send-APIs akzeptieren weiterhin keinen Empfänger in der Anfrage.

## Ersetzungsverhalten {/* #replacement-behaviour */}

Wenn die tägliche Zusammenfassung aktiv ist:

- Hochlade- und überfällige E-Mails an den Standard-Empfänger werden nicht gesendet
- Zusätzliche E-Mail-Ziele in Backup-Benachrichtigungen erhalten weiterhin passende Ereignisse (überfällig zählt für diesen Filter als Warnung)
- Pro-Job NTFY-Benachrichtigungen werden fortgesetzt
- Überfällige Zeitstempel werden nicht aktualisiert, wenn nichts gesendet wurde, sodass überfällige Warnungen sofort nach Abschalten des Modus wieder eintreten können
- Vorlagen-Vorschau, Transporttests und **Zusammenfassung jetzt senden** funktionieren weiterhin

**Zusammenfassung jetzt senden** ist eine zusätzliche Zustellung. Sie verbraucht nicht den nächsten geplanten Vorgang.

Geplante Zustellungen, **Zusammenfassung jetzt senden** und Wiederholungsversuche werden im [Audit-Protokoll](audit-logs-viewer.md) als `daily_summary_sent` (Systemvorgänge) aufgezeichnet. Das Speichern von Einstellungen ist `daily_summary_updated` (Konfiguration).

## Vorlagen {/* #templates */}

Bearbeiten Sie die E-Mail-Vorlage für die tägliche Zusammenfassung (Markdown) unter [Einstellungen → Vorlagen](/user-guide/settings/notification-templates). Der Standard-Betreff enthält `{summary_date}` sowie Anzahlen für Erfolg, Warnung, Überfällig, Fehler und Fatal, sodass die Betreffzeile im Posteingang die Momentaufnahme zusammenfasst. „Überfällig“ kann sich mit den Statusanzahlen überschneiden. E-Mail-Inhalte für Erfolg, Warnung/Fehler, Überfällig und Tägliche Zusammenfassung verwenden alle Markdown. Die Standardvorlage enthält am Ende `{duplistatus_link}`, wenn eine öffentliche Dashboard-URL auf dieser Seite oder über `DUPLISTATUS_PUBLIC_URL` konfiguriert ist.

**Vorschau generieren** auf dieser Seite öffnet denselben Vorschaudialog wie [Einstellungen → Vorlagen](/user-guide/settings/notification-templates): E-Mail-Betreff sowie E-Mail-HTML und Klartext. Das E-Mail-HTML folgt dem aktuellen hellen oder dunklen Design.
