# Tägliche Zusammenfassung {/* #daily-summary */}

Die Tägliche Zusammenfassung ist ein optionaler Benachrichtigungsmodus, der **eine** lokalisierte Momentaufnahme aller bekannten Sicherungsaufträge zu einer genauen lokalen Uhrzeit sendet. Solange er aktiviert ist, werden Sicherungs- und Überfälligkeits-E-Mails an den Standard-E-Mail-Empfänger (Einstellungen → E-Mail → Empfänger-E-Mail) ausgesetzt. Zusätzliche E-Mail-Ziele, die in den [Backup-Benachrichtigungen](backup-notifications-settings.md) konfiguriert sind, erhalten weiterhin entsprechende Ereignisse. Per-Job-NTFY-Benachrichtigungen bleiben aktiv. Diese Einstellungen bleiben gespeichert und werden wieder aktiv, sobald die Tägliche Zusammenfassung deaktiviert wird.

Die Momentaufnahme ist der **aktuelle** Status zum Zeitpunkt des Versands (das neueste Ergebnis für jeden Job). Es handelt sich nicht um eine Historie der vorherigen Tagesläufe.

![Einstellungen für die Tägliche Zusammenfassung](../../assets/screen-settings-daily-summary.png)

## Anforderungen {/* #requirements */}

- SMTP muss konfiguriert sein. Die E-Mail wird einmal gesendet, an den **SMTP-Empfänger überschreiben**, falls einer gespeichert ist, sonst an den SMTP-Empfänger aus den [E-Mail-Einstellungen](/user-guide/settings/email-settings).
- Prüfen Sie Ihre SMTP-Konfiguration und stellen Sie sicher, dass sie funktioniert, bevor Sie sich auf die Tägliche Zusammenfassung verlassen.
- Die geplante Zustellung erfordert den cron-Dienst. Der Dispatcher feuert einmal pro Tag zur gespeicherten UTC-Sendezeit.

## Was ist enthalten {/* #what-is-included */}

Bekannte Jobs sind die **neuesten beobachteten Sicherungen** für jeden Server und Backup-Name — dieselbe Menge wie im Dashboard und Einstellungen → Backup-Überwachung.

Status-Buckets (Erfolgreich, Warnung, Fehler, Fatal, Unbekannt) sind gegenseitig ausschließend und addieren sich zur Job-Anzahl. **Überfällig** wird separat gezählt: ein überfälliger erfolgreicher Job ist weiterhin Erfolg und auch überfällig.

## Zeitplan {/* #schedule */}

Wählen Sie eine genaue `HH:mm` Zeit in Ihrer **Browser-Zeitzone**. duplistatus speichert den Zeitplan als UTC und zeigt beide Werte auf der Seite an (gleicher Muster wie **Duplicati-Versionen**). Änderungen auf dieser Seite werden automatisch gespeichert. Die Standard-Sendezeit für neue Installationen ist **01:00 UTC**.

- Das Aktivieren oder Ändern des Zeitplans beginnt bei der **nächsten zukünftigen** Gelegenheit, nie mit einer sofortigen Überraschungssendung.
- Die geplante Uhrzeit wird immer gesendet, wenn der cron-Job ausgelöst wird. **Zusammenfassung jetzt senden**, ein Wiederholungsversuch oder eine frühere Sendung am selben Tag überspringt sie nicht.

## Öffentliche Dashboard-URL {/* #public-dashboard-url */}

Die optionale **Öffentliche Dashboard-URL** auf dieser Seite speist den `{duplistatus_link}` Platzhalter in E-Mail-Vorlagen für die tägliche Zusammenfassung. Verwenden Sie eine `http://` oder `https://` URL ohne abschließenden Schrägstrich. Lassen Sie es leer, um den Link zu entfernen.

Wenn `DUPLISTATUS_PUBLIC_URL` in der Umgebung festgelegt ist, überschreibt es die gespeicherte Einstellung (siehe [Umgebungsvariablen](/installation/environment-variables)).

## SMTP-Empfänger überschreiben {/* #override-smtp-recipient */}

Optional **SMTP-Empfänger überschreiben** sendet die Tägliche Zusammenfassung an eine andere Adresse als die in den E-Mail-Einstellungen angegebene. Lassen Sie es leer, um den Standard zu behalten. Der Wert wird im `daily_summary`-Konfigurationsschlüssel (`smtpRecipient`) gespeichert und für geplante Sendevorgänge, **Zusammenfassung jetzt senden** und Wiederholungen verwendet. Die Sende-APIs akzeptieren weiterhin keinen Empfänger in der Anfrage.

## Ersatzverhalten {/* #replacement-behaviour */}

Wenn die Tägliche Zusammenfassung aktiviert ist:

- E-Mails für Hochladen und Überfällig an den Standard-E-Mail-Empfänger werden nicht gesendet
- zusätzliche E-Mail-Ziele in den Backup-Benachrichtigungen erhalten weiterhin entsprechende Ereignisse (Überfällig wird als Warnung für diesen Filter gezählt)
- per-Job-NTFY-Benachrichtigungen bleiben aktiv
- Überfälligkeits-Zeitstempel werden nicht vorgerückt, wenn nichts gesendet wurde, sodass Überfälligkeitswarnungen sofort fortgesetzt werden können, wenn der Modus deaktiviert wird
- Vorlagenvorschau, Transporttests und **Zusammenfassung jetzt senden** funktionieren weiterhin

**Zusammenfassung jetzt senden** ist eine zusätzliche Zustellung. Sie verbraucht nicht die nächste geplante Gelegenheit.

Geplante, **Zusammenfassung jetzt senden** und Wiederholungsversand werden im [Audit-Protokoll](audit-logs-viewer.md) als `daily_summary_sent` (Systemoperationen) aufgezeichnet. Das Speichern der Einstellungen wird als `daily_summary_updated` (Konfiguration) aufgezeichnet.

## Vorlagen {/* #templates */}

Bearbeiten Sie die E-Mail-Vorlage für die tägliche Zusammenfassung (Markdown) unter [Einstellungen → Vorlagen](/user-guide/settings/notification-templates). Die E-Mail-Inhalte für Erfolgreich, Warnung/Fehler, Überfällig und Tägliche Zusammenfassung verwenden alle Markdown. Die Standardvorlage enthält `{duplistatus_link}` am Ende, wenn eine öffentliche Dashboard-URL auf dieser Seite oder über `DUPLISTATUS_PUBLIC_URL` konfiguriert ist.

**Vorschau generieren** auf dieser Seite öffnet einen Dialog mit dem aktuellen Snapshot. E-Mail HTML folgt dem aktuellen hellen oder dunklen Design.
