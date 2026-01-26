# Sicherungs-Benachrichtigungen {#backup-notifications}

Verwenden Sie diese Einstellungen, um Benachrichtigungen zu senden, wenn ein [neues Sicherungsprotokoll empfangen wird](../../installation/duplicati-server-configuration.md).

![Sicherungswarnungen](/img/screen-settings-notifications.png)

Die Tabelle der Sicherungs-Benachrichtigungen ist nach Server organisiert. Das Anzeigeformat hängt davon ab, wie viele Sicherungen ein Server hat:

- **Mehrere Sicherungen**: Zeigt eine Server-Kopfzeile mit einzelnen Sicherungszeilen darunter an. Klicken Sie auf die Server-Kopfzeile, um die Sicherungsliste zu erweitern oder zu reduzieren.
- **Einzelne Sicherung**: Zeigt eine **zusammengeführte Zeile** mit blauem linkem Rand an, die Folgendes anzeigt:
  - **Servername : Sicherungsname**, wenn kein Server-Alias konfiguriert ist, oder
  - **Server-Alias (Servername) : Sicherungsname**, wenn dieser konfiguriert ist.

Diese Seite verfügt über eine automatische Speicherfunktion. Alle Änderungen, die Sie vornehmen, werden automatisch gespeichert.

<br/>

## Filtern und Suchen {#filter-and-search}

Verwenden Sie das Feld **Nach Servername filtern** oben auf der Seite, um schnell bestimmte Sicherungen nach Servername oder Alias zu finden. Die Tabelle wird automatisch gefiltert, um nur übereinstimmende Einträge anzuzeigen.

<br/>

## Konfigurieren Sie Benachrichtigungseinstellungen pro Sicherung {#configure-per-backup-notification-settings}

| Einstellung                     | Beschreibung                                                                                                     | Standardwert |
| :------------------------------ | :--------------------------------------------------------------------------------------------------------------- | :----------- |
| **Benachrichtigungsereignisse** | Konfigurieren Sie, wann Benachrichtigungen für neue Sicherungsprotokolle gesendet werden sollen. | `Warnungen`  |
| **NTFY**                        | Aktivieren oder deaktivieren Sie NTFY-Benachrichtigungen für diese Sicherung.                    | `Aktiviert`  |
| **E-Mail**                      | Aktivieren oder deaktivieren Sie E-Mail-Benachrichtigungen für diese Sicherung.                  | `Aktiviert`  |

**Optionen für Benachrichtigungsereignisse:**

- `all`: Senden Sie Benachrichtigungen für alle Sicherungsereignisse.
- `warnings`: Senden Sie Benachrichtigungen nur für Warnungen und Fehler (Standard).
- `errors`: Senden Sie Benachrichtigungen nur für Fehler.
- `off`: Deaktivieren Sie Benachrichtigungen für neue Sicherungsprotokolle für diese Sicherung.

<br/>

## Zusätzliche Ziele {#additional-destinations}

Mit zusätzlichen Benachrichtigungszielen können Sie Benachrichtigungen an bestimmte E-Mail-Adressen oder NTFY-Themen über die globalen Einstellungen hinaus senden. Das System verwendet ein hierarchisches Vererbungsmodell, bei dem Sicherungen Standardeinstellungen von ihrem Server erben oder diese mit sicherungsspezifischen Werten überschreiben können.

Die Konfiguration zusätzlicher Ziele wird durch kontextabhängige Symbole neben Server- und Sicherungsnamen angezeigt:

- **Server-Symbol** <IconButton icon="lucide:settings-2" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} />: Wird neben Servernamen angezeigt, wenn Standardzusatzziele auf Serverebene konfiguriert sind.

- **Sicherungssymbol** <IconButton icon="lucide:external-link" style={{border: 'none', padding: 0, color: '#60a5fa', background: 'transparent'}} /> (blau): Wird neben Sicherungsnamen angezeigt, wenn benutzerdefinierte zusätzliche Ziele konfiguriert sind (Server-Standardwerte werden überschrieben).

- **Sicherungssymbol** <IconButton icon="lucide:external-link" style={{border: 'none', padding: 0, color: '#64748b', background: 'transparent'}} /> (grau): Wird neben Sicherungsnamen angezeigt, wenn die Sicherung zusätzliche Ziele von Server-Standardwerten erbt.

Wenn kein Symbol angezeigt wird, hat der Server oder die Sicherung keine zusätzlichen Ziele konfiguriert.

![Zusätzliche Ziele auf Serverebene](/img/screen-settings-notifications-server.png)

### Server-Standardwerte {#server-level-defaults}

Sie können Standardzusatzziele auf Serverebene konfigurieren, die alle Sicherungen auf diesem Server automatisch erben.

1. Navigieren Sie zu `Einstellungen → Sicherungs-Benachrichtigungen`.
2. Die Tabelle ist nach Server gruppiert, mit unterschiedlichen Server-Kopfzeilen, die den Servernamen, den Alias und die Sicherungsanzahl anzeigen.
   - **Hinweis**: Bei Servern mit nur einer Sicherung wird stattdessen eine zusammengeführte Zeile angezeigt. Server-Standardwerte können nicht direkt aus zusammengeführten Zeilen konfiguriert werden. Wenn Sie Server-Standardwerte für einen Server mit einer einzelnen Sicherung konfigurieren müssen, können Sie dies tun, indem Sie vorübergehend eine weitere Sicherung zu diesem Server hinzufügen, oder die zusätzlichen Ziele der Sicherung erben automatisch von vorhandenen Server-Standardwerten.
3. Klicken Sie auf eine beliebige Stelle in einer Server-Zeile, um den Abschnitt **Standardzusatzziele für diesen Server** zu erweitern.
4. Konfigurieren Sie die folgenden Standardeinstellungen:
   - **Benachrichtigungsereignis**: Wählen Sie, welche Ereignisse Benachrichtigungen an die zusätzlichen Ziele auslösen (`all`, `warnings`, `errors` oder `off`).
   - **Zusätzliche E-Mails**: Geben Sie eine oder mehrere E-Mail-Adressen (durch Kommas getrennt) ein, die Benachrichtigungen für alle Sicherungen auf diesem Server erhalten. Klicken Sie auf das Symbol <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} />, um eine Test-E-Mail an die Adressen im Feld zu senden.
   - **Zusätzliches NTFY-Thema**: Geben Sie einen benutzerdefinierten NTFY-Themennamen ein, in dem Benachrichtigungen für alle Sicherungen auf diesem Server veröffentlicht werden. Klicken Sie auf das Symbol <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} />, um eine Test-Benachrichtigung zum Thema zu senden, oder klicken Sie auf das Symbol <IconButton icon="lucide:qr-code" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} />, um einen QR-Code für das Thema anzuzeigen und Ihr Gerät zur Benachrichtigungsempfang zu konfigurieren.

**Server-Standardverwaltung:**

- **Mit allen synchronisieren**: Löscht alle Sicherungsüberschreibungen, sodass alle Sicherungen von den Server-Standardwerten erben.
- **Alle löschen**: Löscht alle zusätzlichen Ziele von Server-Standardwerten und allen Sicherungen, während die Vererbungsstruktur beibehalten wird.

### Konfiguration pro Sicherung {#per-backup-configuration}

Einzelne Sicherungen erben automatisch die Server-Standardwerte, können aber für bestimmte Sicherungsaufträge überschrieben werden.

1. Klicken Sie auf eine beliebige Stelle in einer Sicherungszeile, um den Abschnitt **Zusätzliche Ziele** zu erweitern.
2. Konfigurieren Sie die folgenden Einstellungen:
   - **Benachrichtigungsereignis**: Wählen Sie, welche Ereignisse Benachrichtigungen an die zusätzlichen Ziele auslösen (`all`, `warnings`, `errors` oder `off`).
   - **Zusätzliche E-Mails**: Geben Sie eine oder mehrere E-Mail-Adressen (durch Kommas getrennt) ein, die zusätzlich zum globalen Empfänger Benachrichtigungen erhalten. Klicken Sie auf das Symbol <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} />, um eine Test-E-Mail an die Adressen im Feld zu senden.
   - **Zusätzliches NTFY-Thema**: Geben Sie einen benutzerdefinierten NTFY-Themennamen ein, in dem Benachrichtigungen zusätzlich zum Standardthema veröffentlicht werden. Klicken Sie auf das Symbol <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} />, um eine Test-Benachrichtigung zum Thema zu senden, oder klicken Sie auf das Symbol <IconButton icon="lucide:qr-code" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} />, um einen QR-Code für das Thema anzuzeigen und Ihr Gerät zur Benachrichtigungsempfang zu konfigurieren.

**Vererbungsindikatoren:**

- **Link-Symbol** <IconButton icon="lucide:link" style={{border: 'none', padding: 0, color: '#3b82f6', background: 'transparent'}} /> in Blau: Zeigt an, dass der Wert von Server-Standardwerten geerbt wird. Wenn Sie auf das Feld klicken, wird eine Überschreibung zum Bearbeiten erstellt.
- **Unterbrochenes Link-Symbol** <IconButton icon="lucide:link-2-off" style={{border: 'none', padding: 0, color: '#3b82f6', background: 'transparent'}} /> in Blau: Zeigt an, dass der Wert überschrieben wurde. Klicken Sie auf das Symbol, um zur Vererbung zurückzukehren.

**Verhalten zusätzlicher Ziele:**

- Benachrichtigungen werden an die globalen Einstellungen und die zusätzlichen Ziele gesendet, wenn diese konfiguriert sind.
- Die Benachrichtigungsereigniseinstellung für zusätzliche Ziele ist unabhängig von der Hauptbenachrichtigungsereigniseinstellung.
- Wenn zusätzliche Ziele auf `off` gesetzt sind, werden keine Benachrichtigungen an diese Ziele gesendet, aber die Hauptbenachrichtigungen funktionieren weiterhin gemäß den primären Einstellungen.
- Wenn eine Sicherung von Server-Standardwerten erbt, werden alle Änderungen an den Server-Standardwerten automatisch auf diese Sicherung angewendet (es sei denn, sie wurde überschrieben).

<br/>

## Massenbearbeitung {#bulk-edit}

Sie können Einstellungen für zusätzliche Ziele für mehrere Sicherungen gleichzeitig mit der Massenbearbeitungsfunktion bearbeiten. Dies ist besonders nützlich, wenn Sie die gleichen zusätzlichen Ziele auf viele Sicherungsaufträge anwenden müssen.

![Massenbearbeitungsdialog](/img/screen-settings-notifications-bulk.png)

1. Navigieren Sie zu `Einstellungen → Sicherungs-Benachrichtigungen`.
2. Verwenden Sie die Kontrollkästchen in der ersten Spalte, um die Sicherungen oder Server auszuwählen, die Sie bearbeiten möchten.
   - Verwenden Sie das Kontrollkästchen in der Kopfzeile, um alle sichtbaren Sicherungen auszuwählen oder abzuwählen.
   - Sie können den Filter verwenden, um die Liste vor der Auswahl einzugrenzen.
3. Nachdem Sicherungen ausgewählt wurden, wird eine Massenaktionsleiste angezeigt, die die Anzahl der ausgewählten Sicherungen anzeigt.
4. Klicken Sie auf `Massenbearbeitung`, um das Bearbeitungsdialogfeld zu öffnen.
5. Konfigurieren Sie die Einstellungen für zusätzliche Ziele:
   - **Benachrichtigungsereignis**: Legen Sie das Benachrichtigungsereignis für alle ausgewählten Sicherungen fest.
   - **Zusätzliche E-Mails**: Geben Sie E-Mail-Adressen (durch Kommas getrennt) ein, um sie auf alle ausgewählten Sicherungen anzuwenden.
   - **Zusätzliches NTFY-Thema**: Geben Sie einen NTFY-Themennamen ein, um ihn auf alle ausgewählten Sicherungen anzuwenden.
   - Test-Schaltflächen sind im Massenbearbeitungsdialog verfügbar, um E-Mail-Adressen und NTFY-Themen zu überprüfen, bevor sie auf mehrere Sicherungen angewendet werden.
6. Klicken Sie auf `Speichern`, um die Einstellungen auf alle ausgewählten Sicherungen anzuwenden.

**Massenlöschung:**

So entfernen Sie alle Einstellungen für zusätzliche Ziele aus ausgewählten Sicherungen:

1. Wählen Sie die Sicherungen aus, die Sie löschen möchten.
2. Klicken Sie auf `Massenlöschung` in der Massenaktionsleiste.
3. Bestätigen Sie die Aktion im Dialogfeld.

Dies entfernt alle zusätzlichen E-Mail-Adressen, NTFY-Themen und Benachrichtigungsereignisse für die ausgewählten Sicherungen. Nach dem Löschen werden Sicherungen zu Server-Standardwerten zurückkehren (falls vorhanden).

<br/>

