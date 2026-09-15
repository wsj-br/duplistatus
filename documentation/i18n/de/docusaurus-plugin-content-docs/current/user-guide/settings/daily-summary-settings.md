# Tägliche Zusammenfassung {/* #daily-summary */}

Tägliche Zusammenfassung ist ein optionaler Benachrichtigungsmodus, der **eine** lokalisierte Momentaufnahme aller bekannten Backup-Jobs zu einer exakten lokalen Uhrzeit sendet. Solange er aktiviert ist, werden Backup- und überfällige E-Mails an den Standard-E-Mail-Empfänger (Einstellungen → E-Mail → Empfänger-E-Mail) ausgesetzt. Zusätzliche E-Mail-Ziele, die in [Backup-Benachrichtigungen](backup-notifications-settings.md) konfiguriert sind, erhalten weiterhin entsprechende Ereignisse. Per-Job NTFY-Benachrichtigungen bleiben aktiv. Diese Einstellungen bleiben gespeichert und werden wieder aktiv, sobald die Tägliche Zusammenfassung deaktiviert wird.

Die Momentaufnahme ist der **aktuelle** Status zum Sendezeitpunkt (das neueste Ergebnis für jeden Job). Es handelt sich nicht um eine Historie der vorherigen Tagesläufe.

![Einstellungen für die Tägliche Zusammenfassung](../../assets/screen-settings-daily-summary.png)

## Anforderungen {/* #requirements */}

- SMTP muss konfiguriert sein. Die E-Mail wird einmal gesendet, an den **SMTP-Empfänger überschreiben**, falls einer gespeichert ist, sonst an den SMTP-Empfänger aus den [E-Mail-Einstellungen](/user-guide/settings/email-settings).
- Überprüfen Sie Ihre SMTP-Konfiguration und stellen Sie sicher, dass sie funktioniert, bevor Sie sich auf die Tägliche Zusammenfassung verlassen.
- Die geplante Lieferung erfordert den cron-Dienst. Der Dispatcher feuert einmal pro Tag zur gespeicherten UTC-Sendezeit.

## Was ist enthalten {/* #what-is-included */}

Bekannte Jobs sind die **neuesten beobachteten Backups** für jeden Server und Backup-Name — dieselbe Menge wie das Dashboard und Einstellungen → Backup-Überwachung.

Status-Buckets (Erfolgreich, Warnung, Fehler, Fatal, Unbekannt) sind gegenseitig ausschließend und addieren sich zur Job-Anzahl. **Überfällig** wird separat gezählt: ein überfälliger erfolgreicher Job ist immer noch Erfolgreich und auch überfällig.

## Zeitplan {/* #schedule */}

Wählen Sie eine exakte `HH:mm` Uhrzeit in Ihrer **Browser-Zeitzone**. duplistatus speichert den Zeitplan als UTC und zeigt beide Werte auf der Seite an (selbes Muster wie **Duplicati-Versionen**). Änderungen auf dieser Seite werden automatisch gespeichert. Die Standard-Sendezeit für neue Installationen ist **01:00 UTC**.

- Das Aktivieren oder Ändern des Zeitplans beginnt bei der **nächsten zukünftigen** Gelegenheit, nie mit einer sofortigen Überraschungssendung.
- Die geplante Uhrzeit sendet immer, wenn der cron-Job ausgelöst wird. **Zusammenfassung jetzt senden**, ein Wiederholungsversuch oder eine frühere Sendung am selben Tag überspringt sie nicht.

## Öffentliche Dashboard-URL {/* #public-dashboard-url */}

Optionale **Öffentliche Dashboard-URL** auf dieser Seite füttert den `{duplistatus_link}` Platzhalter in E-Mails der Täglichen Zusammenfassung. Verwenden Sie eine `http://` oder `https://` URL ohne abschließenden Schrägstrich. Lassen Sie es leer, um den Link auszublenden.

Wenn `DUPLISTATUS_PUBLIC_URL` in der Umgebung gesetzt ist, überschreibt es die gespeicherte Einstellung (siehe [Umgebungsvariablen](/installation/environment-variables)).

## SMTP-Empfänger überschreiben {/* #override-smtp-recipient */}

Optional **SMTP-Empfänger überschreiben** sendet die Tägliche Zusammenfassung an eine andere Adresse als der Empfänger in den E-Mail-Einstellungen. Lassen Sie es leer, um den Standard zu verwenden. Der Wert wird im `daily_summary` Konfigurationsschlüssel (`smtpRecipient`) gespeichert und für geplante Sendevorgänge, **Zusammenfassung jetzt senden** und Wiederholungsversuche verwendet. Die Sende-APIs akzeptieren immer noch keinen Empfänger in der Anfrage.

## Ersetzungsverhalten {/* #replacement-behaviour */}

Wenn die Tägliche Zusammenfassung aktiviert ist:

- Upload- und überfällige E-Mails an den Standard-E-Mail-Empfänger werden nicht gesendet
- zusätzliche E-Mail-Ziele in Backup-Benachrichtigungen erhalten weiterhin entsprechende Ereignisse (überfällig zählt als Warnung für diesen Filter)
- per-Job NTFY-Benachrichtigungen bleiben aktiv
- überfällige Zeitstempel werden nicht vorgerückt, wenn nichts gesendet wurde, sodass überfällige Warnungen sofort fortgesetzt werden können, wenn der Modus deaktiviert wird
- Vorschau der Vorlage, Transporttests und **Zusammenfassung jetzt senden** funktionieren weiterhin

**Zusammenfassung jetzt senden** ist eine zusätzliche Lieferung. Sie verbraucht nicht die nächste geplante Ausführung.

Geplante, **Zusammenfassung jetzt senden** und Wiederholungslieferungen werden im [Audit-Protokoll](audit-logs-viewer.md) als `daily_summary_sent` (Systemoperationen) aufgezeichnet. Das Speichern der Einstellungen wird als `daily_summary_updated` (Konfiguration) aufgezeichnet.

## Vorlagen {/* #templates */}

Bearbeiten Sie die E-Mail-Vorlage für die tägliche Zusammenfassung (Markdown) unter [Einstellungen → Vorlagen](/user-guide/settings/notification-templates). Der Standardbetreff enthält `{summary_date}` plus die Anzahl der erfolgreichen, warnhaltigen, überfälligen, fehlerhaften und fatalen Einträge, sodass die Zeile im Posteingang die Zusammenfassung des Snapshots zusammenfasst. Überfällig kann sich mit den Statuszahlen überschneiden. E-Mail-Körper für Erfolg, Warnung/Fehler, Überfällig und Tägliche Zusammenfassung verwenden alle Markdown. Die Standardvorlage enthält `{duplistatus_link}` am Ende, wenn eine öffentliche Dashboard-URL auf dieser Seite oder über `DUPLISTATUS_PUBLIC_URL` konfiguriert ist.

**Vorschau generieren** auf dieser Seite öffnet denselben Vorschau-Dialog wie [Einstellungen → Vorlagen](/user-guide/settings/notification-templates): E-Mail-Betreff plus E-Mail HTML und Klartext. E-Mail HTML folgt dem aktuellen hellen oder dunklen Design.
