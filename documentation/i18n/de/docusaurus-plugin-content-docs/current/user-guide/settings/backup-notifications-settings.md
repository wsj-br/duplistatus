---
translation_last_updated: '2026-02-16T00:13:34.825Z'
source_file_mtime: '2026-02-14T22:21:33.554Z'
source_file_hash: 175a9e765f355f43
translation_language: de
source_file_path: user-guide/settings/backup-notifications-settings.md
---
# Backup-Benachrichtigungen {#backup-notifications}

Verwenden Sie diese Einstellungen, um Benachrichtigungen zu senden, wenn ein [neues Sicherungsprotokoll empfangen wird](../../installation/duplicati-server-configuration.md).

![Backup alerts](../../assets/screen-settings-notifications.png)

Die Tabelle der Backup-Benachrichtigungen ist nach Server organisiert. Das Anzeigeformat hängt davon ab, wie viele Sicherungen ein Server hat:
- **Mehrere Sicherungen**: Zeigt eine Server-Kopfzeile mit einzelnen Sicherungszeilen darunter an. Klicken Sie auf die Server-Kopfzeile, um die Sicherungsliste zu erweitern oder zu reduzieren.
- **Einzelne Sicherung**: Zeigt eine **zusammengeführte Zeile** mit blauem linkem Rand an:
  -  **Servername : Sicherungsname**, wenn kein Server-Alias konfiguriert ist, oder
  - **Server-Alias (Servername) : Sicherungsname**, wenn dieser konfiguriert ist.

Diese Seite verfügt über eine Automatisches-Speichern-Funktion. Alle Änderungen, die Sie vornehmen, werden automatisch gespeichert.

<br/>

## Filtern und Suchen {#filter-and-search}

Verwenden Sie das Feld **Nach Servername filtern** oben auf der Seite, um schnell bestimmte Sicherungen nach Servername oder Alias zu finden. Die Tabelle wird automatisch gefiltert, um nur übereinstimmende Einträge einzublenden.

<br/>

## Benachrichtigungseinstellungen pro Sicherung konfigurieren {#configure-per-backup-notification-settings}

| Einstellung                       | Beschreibung                                               | Standardwert |
| :---------------------------- | :-------------------------------------------------------- | :------------ |
| **Benachrichtigungsereignisse**       | Konfigurieren Sie, wann Benachrichtigungen für neue Sicherungsprotokolle gesendet werden sollen. | **Warnungen**    |
| **NTFY**                      | Aktivieren oder deaktivieren Sie NTFY-Benachrichtigungen für diese Sicherung.     | **Aktiviert**     |
| **E-Mail**                     | Aktivieren oder deaktivieren Sie E-Mail-Benachrichtigungen für diese Sicherung.    | **Aktiviert**    |

**Benachrichtigungsereignisse Optionen:**

- **alle**: Benachrichtigungen für alle Sicherungsereignisse senden.
- **Warnungen**: Benachrichtigungen nur für Warnungen und Fehler senden (Standard).
- **Fehler**: Benachrichtigungen nur für Fehler senden.
- **aus**: Benachrichtigungen für neue Sicherungsprotokolle für diese Sicherung deaktivieren.

<br/>

## Zusätzliche Ziele {#additional-destinations}

Zusätzliche Benachrichtigungsziele ermöglichen es Ihnen, Benachrichtigungen an bestimmte E-Mail-Adressen oder NTFY-Themen über die globalen Einstellungen hinaus zu senden. Das System verwendet ein hierarchisches Vererbungsmodell, bei dem Sicherungen Standard-Einstellungen von ihrem Server erben oder diese mit sicherungsspezifischen Werten überschreiben können.

Zusätzliche Zielkonfiguration wird durch kontextabhängige Symbole neben Server- und Sicherungsnamen angezeigt:

- **Server-Symbol** <IconButton icon="lucide:settings-2" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} />: Wird neben Servernamen angezeigt, wenn Standard-Zusätzliche Ziele auf Serverebene konfiguriert sind.

- **Backup-Symbol** <IconButton icon="lucide:external-link" style={{border: 'none', padding: 0, color: '#60a5fa', background: 'transparent'}} /> (blau): Wird neben Sicherungsnamen angezeigt, wenn benutzerdefinierte Zusätzliche Ziele konfiguriert sind (Server-Standardeinstellungen werden außer Kraft gesetzt).

- **Backup-Symbol** <IconButton icon="lucide:external-link" style={{border: 'none', padding: 0, color: '#64748b', background: 'transparent'}} /> (grau): Wird neben Sicherungsnamen angezeigt, wenn die Sicherung zusätzliche Ziele von Server-Standardeinstellungen erbt.

Wenn kein Symbol angezeigt wird, hat der Server oder die Sicherung keine zusätzlichen Ziele konfiguriert.

![Server-level additional destinations](../../assets/screen-settings-notifications-server.png)

### Standardwerte auf Serverebene {#server-level-defaults}

Sie können Standard-Zusätzliche Ziele auf der Serverebene konfigurieren, die alle Sicherungen auf diesem Server automatisch erben.

1. Navigieren Sie zu [Einstellungen → Backup-Benachrichtigungen](backup-notifications-settings.md).
2. Die Tabelle ist nach Server gruppiert, mit separaten Server-Kopfzeilen, die den Servernamen, den Alias und die Anzahl der Sicherungen anzeigen.
   - **Hinweis**: Bei Servern mit nur einer Sicherung wird stattdessen eine zusammengeführte Zeile angezeigt. Server-Standardeinstellungen können nicht direkt aus zusammengeführten Zeilen konfiguriert werden. Wenn Sie Server-Standardeinstellungen für einen Server mit einer Sicherung konfigurieren müssen, können Sie dies tun, indem Sie vorübergehend eine weitere Sicherung zu diesem Server hinzufügen, oder die zusätzlichen Ziele der Sicherung erben automatisch von vorhandenen Server-Standardeinstellungen.
3. Klicken Sie auf eine beliebige Stelle in einer Server-Zeile, um den Abschnitt **Standard-Zusätzliche Ziele für diesen Server** zu erweitern.
4. Konfigurieren Sie die folgenden Standardeinstellungen:
   - **Benachrichtigungsereignis**: Wählen Sie, welche Ereignisse Benachrichtigungen an die zusätzlichen Ziele auslösen (**alle**, **Warnungen**, **Fehler** oder **aus**).
   - **Zusätzliche E-Mails**: Geben Sie eine oder mehrere E-Mail-Adressen (durch Kommas getrennt) ein, die Benachrichtigungen für alle Sicherungen auf diesem Server erhalten. Klicken Sie auf die Schaltfläche <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} />, um eine Test-E-Mail an die Adressen im Feld zu senden.
   - **Zusätzliches NTFY-Thema**: Geben Sie einen benutzerdefinierten NTFY-Themennamen ein, unter dem Benachrichtigungen für alle Sicherungen auf diesem Server veröffentlicht werden. Klicken Sie auf die Schaltfläche <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} />, um eine Test-Benachrichtigung an das Thema zu senden, oder klicken Sie auf die Schaltfläche <IconButton icon="lucide:qr-code" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} />, um einen QR-Code für das Thema anzuzeigen und Ihr Gerät so zu konfigurieren, dass es Benachrichtigungen erhält.

**Server-Standardverwaltung:**

- **Sync to All**: Löscht alle Sicherungsüberschreibungen, sodass alle Sicherungen von den Serverstandardwerten erben.
- **Clear All**: Löscht alle zusätzlichen Ziele sowohl aus den Serverstandardwerten als auch aus allen Sicherungen, während die Vererbungsstruktur beibehalten wird.

### Konfiguration pro Sicherung {#per-backup-configuration}

Einzelne Sicherungen erben automatisch die Serverstandards, aber Sie können diese für bestimmte Sicherungsaufträge außer Kraft setzen.

1. Klicken Sie auf eine beliebige Stelle in einer Sicherungszeile, um den Abschnitt **Zusätzliche Ziele** zu erweitern.
2. Konfigurieren Sie die folgenden Einstellungen:
   - **Benachrichtigungsereignis**: Wählen Sie, welche Ereignisse Benachrichtigungen an die zusätzlichen Ziele auslösen (**alle**, **Warnungen**, **Fehler** oder **aus**).
   - **Zusätzliche E-Mails**: Geben Sie eine oder mehrere E-Mail-Adressen (durch Kommas getrennt) ein, die zusätzlich zum globalen Empfänger Benachrichtigungen erhalten. Klicken Sie auf die Schaltfläche <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} />, um eine Test-E-Mail an die Adressen im Feld zu senden.
   - **Zusätzliches NTFY-Thema**: Geben Sie einen benutzerdefinierten NTFY-Themennamen ein, unter dem Benachrichtigungen zusätzlich zum Standard-Thema veröffentlicht werden. Klicken Sie auf die Schaltfläche <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} />, um eine Test-Benachrichtigung an das Thema zu senden, oder klicken Sie auf die Schaltfläche <IconButton icon="lucide:qr-code" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} />, um einen QR-Code für das Thema anzuzeigen und Ihr Gerät so zu konfigurieren, dass es Benachrichtigungen erhält.

**Vererbungsindikatoren:**

- **Link icon** <IconButton icon="lucide:link" style={{border: 'none', padding: 0, color: '#3b82f6', background: 'transparent'}} /> in blue: Indicates the value is inherited from server defaults. Clicking the field will create an override for editing.
- **Broken link icon** <IconButton icon="lucide:link-2-off" style={{border: 'none', padding: 0, color: '#3b82f6', background: 'transparent'}} /> in blue: Indicates the value has been overridden. Click the icon to revert to inheritance.

- **Link-Symbol** <IconButton icon="lucide:link" style={{border: 'none', padding: 0, color: '#3b82f6', background: 'transparent'}} /> in Blau: Zeigt an, dass der Wert von den Server-Standardeinstellungen geerbt wird. Durch Klicken auf das Feld wird eine Außerkraftsetzung zum Bearbeiten erstellt.
- **Unterbrochenes Link-Symbol** <IconButton icon="lucide:link-2-off" style={{border: 'none', padding: 0, color: '#3b82f6', background: 'transparent'}} /> in Blau: Zeigt an, dass der Wert außer Kraft gesetzt wurde. Klicken Sie auf das Symbol, um zur Vererbung zurückzukehren.

**Verhalten zusätzlicher Ziele:**

- Benachrichtigungen werden an die globalen Einstellungen und die zusätzlichen Ziele gesendet, wenn diese konfiguriert sind.
- Die Benachrichtigungsereignis-Einstellung für zusätzliche Ziele ist unabhängig von der Hauptbenachrichtigungsereignis-Einstellung.
- Wenn zusätzliche Ziele auf **aus** eingestellt sind, werden keine Benachrichtigungen an diese Ziele gesendet, aber die Hauptbenachrichtigungen funktionieren weiterhin gemäß den primären Einstellungen.
- Wenn eine Sicherung von Server-Standardeinstellungen erbt, werden alle Änderungen an den Server-Standardeinstellungen automatisch auf diese Sicherung angewendet (sofern sie nicht überschrieben wurde).

<br/>

## Massenbearbeitung {#bulk-edit}

Sie können zusätzliche Zieleinstellungen für mehrere Sicherungen gleichzeitig mithilfe der Massenbearbeitungsfunktion bearbeiten. Dies ist besonders nützlich, wenn Sie dieselben zusätzlichen Ziele auf viele Sicherungsaufträge anwenden müssen.

![Bulk edit dialog](../../assets/screen-settings-notifications-bulk.png)

1. Navigieren Sie zu [Einstellungen → Backup-Benachrichtigungen](backup-notifications-settings.md).
2. Verwenden Sie die Kontrollkästchen in der ersten Spalte, um die Sicherungen oder Server auszuwählen, die Sie bearbeiten möchten.
   - Verwenden Sie das Kontrollkästchen in der Kopfzeile, um alle sichtbaren Sicherungen auszuwählen oder abzuwählen.
   - Sie können den Filter verwenden, um die Liste vor der Auswahl einzugrenzen.
3. Sobald Sicherungen ausgewählt sind, wird eine Massenaktionsleiste angezeigt, die die Anzahl der ausgewählten Sicherungen anzeigt.
4. Klicken Sie auf **Massenbearbeitung**, um das Bearbeitungsdialogfeld zu öffnen.
5. Konfigurieren Sie die Einstellungen für zusätzliche Ziele:
   - **Benachrichtigungsereignis**: Legen Sie das Benachrichtigungsereignis für alle ausgewählten Sicherungen fest.
   - **Zusätzliche E-Mails**: Geben Sie E-Mail-Adressen (durch Kommas getrennt) ein, um sie auf alle ausgewählten Sicherungen anzuwenden.
   - **Zusätzliches NTFY-Thema**: Geben Sie einen NTFY-Themennamen ein, um ihn auf alle ausgewählten Sicherungen anzuwenden.
   - Test-Schaltflächen sind im Massenbearbeitungsdialogfeld verfügbar, um E-Mail-Adressen und NTFY-Themen vor der Anwendung auf mehrere Sicherungen zu überprüfen.
6. Klicken Sie auf **Speichern**, um die Einstellungen auf alle ausgewählten Sicherungen anzuwenden.

**Massenlöschung:**

Um alle zusätzlichen Zieleinstellungen aus ausgewählten Sicherungen zu entfernen:

1. Auswählen Sie die Sicherungen, die Sie löschen möchten.
2. Klicken Sie auf **Massenlöschung** in der Massenaktion-Leiste.
3. Bestätigen Sie die Aktion im Dialogfeld.

Dies entfernt alle zusätzlichen E-Mail-Adressen, NTFY-Themen und Benachrichtigungsereignisse für die ausgewählten Sicherungen. Nach dem Löschen erben die Sicherungen wieder von den Server-Standardeinstellungen (falls konfiguriert).

<br/>
