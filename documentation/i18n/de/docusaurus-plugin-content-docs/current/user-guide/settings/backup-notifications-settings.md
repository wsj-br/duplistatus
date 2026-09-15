# Backup-Benachrichtigungen {/* #backup-notifications */}

Verwenden Sie diese Einstellungen, um Benachrichtigungen zu senden, wenn ein [neues Backup-Protokoll empfangen wird](../../installation/duplicati-server-configuration.md).

![Backup-Benachrichtigungen](../../assets/screen-settings-notifications.png)

Die Backup-Benachrichtigungstabelle ist nach Servern organisiert. Das Anzeigeformat hängt davon ab, wie viele Backups ein Server hat:
- **Mehrere Backups**: Zeigt eine Server-Headerzeile mit einzelnen Backup-Zeilen darunter an. Klicken Sie auf die Server-Headerzeile, um die Backup-Liste zu erweitern oder zusammenzuklappen.
- **Einzelnes Backup**: Zeigt eine **zusammengeführte Zeile** mit einem blauen linken Rand an, die:
  - **Servername : Backup-Name** anzeigt, wenn kein Server-Alias konfiguriert ist, oder
  - **Server-Alias (Servername) : Backup-Name** anzeigt, wenn er konfiguriert ist.

Diese Seite verfügt über eine Auto-Save-Funktion. Alle von Ihnen vorgenommenen Änderungen werden automatisch gespeichert.

Wenn **Tägliche Zusammenfassung** aktiviert ist, werden E-Mails an den Standard-E-Mail-Empfänger unterdrückt. Zusätzliche E-Mail-Ziele auf dieser Seite erhalten weiterhin entsprechende Ereignisse. Die Einstellungen auf dieser Seite werden beibehalten und werden wieder aktiv, wenn die Tägliche Zusammenfassung deaktiviert wird. Siehe [Tägliche Zusammenfassung](daily-summary-settings.md).

<br/>

## Filter {/* #filter */}

Verwenden Sie das Feld **Nach Servernamen filtern** oben auf der Seite, um bestimmte Backups schnell nach Servernamen oder Alias zu finden. Die Tabelle wird automatisch gefiltert, um nur die entsprechenden Einträge anzuzeigen.

<br/>

## Konfigurieren Sie die pro-Backup-Benachrichtigungseinstellungen {/* #configure-per-backup-notification-settings */}

| Einstellung                    | Beschreibung                                               | Standardwert |
| :---------------------------- | :-------------------------------------------------------- | :------------ |
| **Benachrichtigungsereignisse** | Konfigurieren Sie, wann Benachrichtigungen für neue Backup-Protokolle gesendet werden. | **Warnungen**    |
| **NTFY**                      | Aktivieren oder deaktivieren Sie NTFY-Benachrichtigungen für dieses Backup.     | **Aktiviert**     |
| **E-Mail**                     | Aktivieren oder deaktivieren Sie E-Mail-Benachrichtigungen für dieses Backup.    | **Aktiviert**    |

**Optionen für Benachrichtigungsereignisse:**

- **alle**: Senden Sie Benachrichtigungen für alle Backup-Ereignisse.
- **warnungen**: Senden Sie Benachrichtigungen nur für Warnungen und Fehler (Standard).
- **fehler**: Senden Sie Benachrichtigungen nur für Fehler.
- **aus**: Deaktivieren Sie Benachrichtigungen für neue Backup-Protokolle für dieses Backup.

<br/>

## Zusätzliche Ziele {/* #additional-destinations */}

Zusätzliche Benachrichtigungsziele ermöglichen es Ihnen, Benachrichtigungen an bestimmte E-Mail-Adressen oder NTFY-Themen zu senden, die sich über die globalen Einstellungen hinaus erstrecken. Das System verwendet ein hierarchisches Erbe-Modell, bei dem Backups Standardwerte von ihrem Server erben können oder diese mit backup-spezifischen Werten überschreiben.

Die zusätzliche Zielkonfiguration wird durch Kontextsymbole neben den Servernamen und Backup-Namen angezeigt:

- **Server-Symbol** <IconButton icon="lucide:settings-2" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} />: Wird neben Servernamen angezeigt, wenn Standard-Zusatzziele auf Serverebene konfiguriert sind.

- **Backup-Symbol** <IconButton icon="lucide:external-link" style={{border: 'none', padding: 0, color: '#60a5fa', background: 'transparent'}} /> (blau): Wird neben Backup-Namen angezeigt, wenn benutzerdefinierte zusätzliche Ziele konfiguriert sind (Überschreiben der Server-Standardeinstellungen).

- **Backup-Symbol** <IconButton icon="lucide:external-link" style={{border: 'none', padding: 0, color: '#64748b', background: 'transparent'}} /> (grau): Wird neben Backup-Namen angezeigt, wenn das Backup zusätzliche Ziele von den Server-Standardeinstellungen erbt.

Wenn kein Symbol angezeigt wird, ist der Server oder die Sicherung nicht mit zusätzlichen Zielen konfiguriert.

![Server-Ebene zusätzliche Ziele](../../assets/screen-settings-notifications-server.png)

### Server-Ebene Standardeinstellungen {/* #server-level-defaults */}

Sie können Standard-zusätzliche Ziele auf Serverebene konfigurieren, die alle Sicherungen auf diesem Server automatisch erben.

1. Navigieren Sie zu [Einstellungen → Backup-Benachrichtigungen](backup-notifications-settings.md).
2. Die Tabelle ist nach Server gruppiert, mit separaten Server-Headerzeilen, die den Servernamen, Alias und die Backup-Anzahl anzeigen.
   - **Notiz**: Bei Servern mit nur einer Sicherung wird stattdessen eine zusammengeführte Zeile angezeigt. Server-Standardeinstellungen können nicht direkt aus zusammengeführten Zeilen konfiguriert werden. Wenn Sie Server-Standardwerte für einen Server mit nur einer Sicherung konfigurieren müssen, können Sie dies tun, indem Sie vorübergehend eine weitere Sicherung zu diesem Server hinzufügen, oder die zusätzlichen Ziele der Sicherung werden automatisch von vorhandenen Server-Standardwerten geerbt.
3. Klicken Sie irgendwo in einer Serverzeile, um den Abschnitt **Standard-zusätzliche Ziele für diesen Server** zu erweitern.
4. Konfigurieren Sie die folgenden Standardeinstellungen:
   - **Benachrichtigungsereignis**: Wählen Sie aus, welche Ereignisse Benachrichtigungen an die zusätzlichen Ziele auslösen (**alle**, **Warnungen**, **Fehler** oder **aus**).
   - **Zusätzliche E-Mails**: Geben Sie eine oder mehrere E-Mail-Adressen (kommagetrennt) ein, die Benachrichtigungen für alle Sicherungen auf diesem Server erhalten. Klicken Sie auf die <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> Symbol-Schaltfläche, um eine Test-E-Mail an die Adressen im Feld zu senden.
   - **Zusätzliches NTFY-Thema**: Geben Sie einen benutzerdefinierten NTFY-Themennamen ein, an das Benachrichtigungen für alle Sicherungen auf diesem Server veröffentlicht werden. Klicken Sie auf die <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> Symbol-Schaltfläche, um eine Testbenachrichtigung an das Thema zu senden, oder klicken Sie auf die <IconButton icon="lucide:qr-code" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> Symbol-Schaltfläche, um einen QR-Code für das Thema anzuzeigen, um Ihr Gerät für den Empfang von Benachrichtigungen zu konfigurieren.

**Server-Standardverwaltung:**

- **Zu allen synchronisieren**: Löscht alle Backup-Überschreibungen und lässt alle Backups von den Server-Standardwerten erben.
- **Alle löschen**: Löscht alle zusätzlichen Ziele sowohl von den Server-Standardwerten als auch von allen Backups, während die Vererbungsstruktur erhalten bleibt.

### Per-Backup-Konfiguration {/* #per-backup-configuration */}

Einzelne Backups erben automatisch die Server-Standardwerte, aber Sie können sie für bestimmte Backup-Jobs überschreiben.

1. Klicken Sie irgendwo in einer Backup-Zeile, um den Abschnitt **Zusätzliche Ziele** zu erweitern.
2. Konfigurieren Sie die folgenden Einstellungen:
   - **Benachrichtigungsereignis**: Wählen Sie aus, welche Ereignisse Benachrichtigungen an die zusätzlichen Ziele auslösen (**alle**, **Warnungen**, **Fehler** oder **aus**).
   - **Zusätzliche E-Mails**: Geben Sie eine oder mehrere E-Mail-Adressen (kommagetrennt) ein, die Benachrichtigungen zusätzlich zum globalen Empfänger erhalten. Klicken Sie auf die <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> Symbol-Schaltfläche, um eine Test-E-Mail an die Adressen im Feld zu senden.
   - **Zusätzliches NTFY-Thema**: Geben Sie einen benutzerdefinierten NTFY-Themennamen ein, an das Benachrichtigungen zusätzlich zum Standardthema veröffentlicht werden. Klicken Sie auf die <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> Symbol-Schaltfläche, um eine Testbenachrichtigung an das Thema zu senden, oder klicken Sie auf die <IconButton icon="lucide:qr-code" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> Symbol-Schaltfläche, um einen QR-Code für das Thema anzuzeigen, um Ihr Gerät für den Empfang von Benachrichtigungen zu konfigurieren.

**Vererbungsindikatoren:**

- **Link-Symbol** <IconButton icon="lucide:link" style={{border: 'none', padding: 0, color: '#3b82f6', background: 'transparent'}} /> in Blau: Zeigt an, dass der Wert von den Server-Standardwerten geerbt wird. Klicken Sie auf das Feld, um eine Überschreibung zum Bearbeiten zu erstellen.
- **Gebrochenes Link-Symbol** <IconButton icon="lucide:link-2-off" style={{border: 'none', padding: 0, color: '#3b82f6', background: 'transparent'}} /> in Blau: Zeigt an, dass der Wert überschrieben wurde. Klicken Sie auf das Symbol, um zur Vererbung zurückzukehren.

**Verhalten der zusätzlichen Ziele:**

- Benachrichtigungen werden sowohl an die globalen Einstellungen als auch an die zusätzlichen Ziele gesendet, wenn diese konfiguriert sind.
- Die Einstellung für das Benachrichtigungsereignis für zusätzliche Ziele ist unabhängig von der Haupt-Benachrichtigungsereigniseinstellung.
- Wenn zusätzliche Ziele auf **aus** gesetzt sind, werden keine Benachrichtigungen an diese Ziele gesendet, aber die Hauptbenachrichtigungen funktionieren weiterhin gemäß den primären Einstellungen.
- **Überfällig**-Warnungen zählen als **Warnung** für den zusätzlichen Benachrichtigungsereignis-Filter: Sie werden gesendet, wenn das Ereignis **alle** oder **Warnungen** ist, und nicht, wenn es **Fehler** oder **aus** ist. Der gleiche Filter gilt für zusätzliche NTFY-Themen.
- Wenn eine Sicherung von den Server-Standardeinstellungen erbt, werden alle Änderungen an den Server-Standardeinstellungen automatisch auf diese Sicherung angewendet (sofern sie nicht überschrieben wurde).
- Während [Tägliche Zusammenfassung](daily-summary-settings.md) aktiviert ist, erhalten zusätzliche E-Mail-Ziele weiterhin übereinstimmende Ereignisse; nur der Standard-E-Mail-Empfänger wird unterdrückt.

<br/>

## Sammelbearbeitung {/* #bulk-edit */}

Sie können die Einstellungen für zusätzliche Ziele für mehrere Sicherungen gleichzeitig mit der Sammelbearbeitungsfunktion bearbeiten. Dies ist besonders nützlich, wenn Sie dieselben zusätzlichen Ziele für viele Sicherungsjobs anwenden möchten.

![Sammelbearbeitungsdialog](../../assets/screen-settings-notifications-bulk.png)

1. Navigieren Sie zu [Einstellungen → Backup-Benachrichtigungen](backup-notifications-settings.md).
2. Verwenden Sie die Kontrollkästchen in der ersten Spalte, um die Sicherungen oder Server auszuwählen, die Sie bearbeiten möchten.
   - Verwenden Sie das Kontrollkästchen in der Kopfzeile, um alle sichtbaren Sicherungen auszuwählen oder abzuwählen.
   - Sie können den Filter verwenden, um die Liste vor der Auswahl einzuschränken.
3. Sobald Sicherungen ausgewählt sind, erscheint eine Sammelaktionsleiste, die die Anzahl der ausgewählten Sicherungen anzeigt.
4. Klicken Sie auf **Sammelbearbeitung**, um den Bearbeitungsdialog zu öffnen.
5. Konfigurieren Sie die Einstellungen für zusätzliche Ziele:
   - **Benachrichtigungsereignis**: Legen Sie das Benachrichtigungsereignis für alle ausgewählten Sicherungen fest.
   - **Zusätzliche E-Mails**: Geben Sie E-Mail-Adressen (kommagetrennt) ein, die auf alle ausgewählten Sicherungen angewendet werden sollen.
   - **Zusätzliches NTFY-Thema**: Geben Sie einen NTFY-Themennamen ein, der auf alle ausgewählten Sicherungen angewendet werden soll.
   - Testschaltflächen sind im Sammelbearbeitungsdialog verfügbar, um E-Mail-Adressen und NTFY-Themen vor dem Anwenden auf mehrere Sicherungen zu überprüfen.
6. Klicken Sie auf **Speichern**, um die Einstellungen auf alle ausgewählten Sicherungen anzuwenden.

**Sammel-Löschen:**

Um alle Einstellungen für zusätzliche Ziele aus ausgewählten Sicherungen zu entfernen:

1. Wählen Sie die Sicherungen aus, die Sie löschen möchten.
2. Klicken Sie auf **Sammel-Löschen** in der Sammelaktionsleiste.
3. Bestätigen Sie die Aktion im Dialogfeld.

Dadurch werden alle zusätzlichen E-Mail-Adressen, NTFY-Themen und Benachrichtigungsereignisse für die ausgewählten Sicherungen entfernt. Nach dem Löschen kehren die Sicherungen dazu zurück, von den Server-Standardeinstellungen zu erben (sofern welche konfiguriert sind).

<br/>
