---
translation_last_updated: '2026-02-06T22:33:34.511Z'
source_file_mtime: '2026-02-06T20:21:18.353Z'
source_file_hash: 6810bf2e7dc0121a
translation_language: de
source_file_path: user-guide/settings/overview.md
---
# Übersicht {#overview}

Die Seite „Einstellungen" bietet eine einheitliche Schnittstelle zur Konfiguration aller Aspekte von **duplistatus**. Sie können darauf zugreifen, indem Sie die Schaltfläche <IconButton icon="lucide:settings" /> `Einstellungen` in der [Anwendungssymbolleiste](../overview#application-toolbar) anklicken. Beachten Sie, dass normale Benutzer ein vereinfachtes Menü mit weniger Optionen sehen als Administratoren.

## Administratoranzeigen {#administrator-view}

Administratoren sehen alle verfügbaren Einstellungen.

<table>
  <tr>
    <td>
      ![Einstellungen Seitenleiste - Admin-Ansicht](../../assets/screen-settings-left-panel-admin.png)
    </td>
    <td>
      <ul>
        <li>
          <strong>Benachrichtigungen</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Sicherungsbenachrichtigungen</a>: Konfigurieren Sie Benachrichtigungseinstellungen pro Sicherung</li>
            <li><a href="overdue-settings.md">Überfällige Überwachung</a>: Konfigurieren Sie die Erkennung und Benachrichtigungen für überfällige Sicherungen</li>
            <li><a href="notification-templates.md">Vorlagen</a>: Passen Sie Benachrichtigungsmeldungsvorlagen an</li>
          </ul>
        </li><br/>
        <li>
          <strong>Integrationen</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a>: Konfigurieren Sie den NTFY-Push-Benachrichtigungsdienst</li>
            <li><a href="email-settings.md">E-Mail</a>: Konfigurieren Sie SMTP-E-Mail-Benachrichtigungen</li>
          </ul>
        </li><br/>
        <li>
          <strong id="system">System</strong>
          <ul>
            <li><a href="server-settings.md">Server</a>: Verwalten Sie Duplicati-Serverkonfigurationen</li>
            <li><a href="display-settings.md">Anzeige</a>: Konfigurieren Sie Anzeigeeinstellungen</li>
            <li><a href="database-maintenance.md">Datenbankwartung</a>: Führen Sie Datenbankbereinigung durch (nur Admin)</li>
            <li><a href="user-management-settings.md">Benutzer</a>: Verwalten Sie Benutzerkonten (nur Admin)</li>
            <li><a href="audit-logs-viewer.md">Audit-Protokoll</a>: Anzeigen von Systemaudit-Protokollen</li>
            <li><a href="audit-logs-retention.md">Audit-Log-Aufbewahrung</a>: Konfigurieren Sie die Aufbewahrung von Audit-Protokollen (nur Admin)</li>
            <li><a href="application-logs-settings.md">Anwendungsprotokolle</a>: Anzeigen und Exportieren von Anwendungsprotokollen (nur Admin)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## Anzeigen für Nicht-Administratoren {#non-administrator-view}

Reguläre Benutzer sehen einen begrenzten Satz von Einstellungen.

<table>
  <tr>
    <td>
      ![Einstellungen Seitenleiste - Nicht-Admin-Ansicht](../../assets/screen-settings-left-panel-non-admin.png)
    </td>
    <td>
      <ul>
        <li>
          <strong>Benachrichtigungen</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Sicherungsbenachrichtigungen</a>: Benachrichtigungseinstellungen pro Sicherung anzeigen (schreibgeschützt)</li>
            <li><a href="overdue-settings.md">Überfällige Überwachung</a>: Einstellungen für überfällige Sicherungen anzeigen (schreibgeschützt)</li>
            <li><a href="notification-templates.md">Vorlagen</a>: Benachrichtigungsvorlagen anzeigen (schreibgeschützt)</li>
          </ul>
        </li><br/>
        <li>
          <strong>Integrationen</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a>: NTFY-Einstellungen anzeigen (schreibgeschützt)</li>
            <li><a href="email-settings.md">E-Mail</a>: E-Mail-Einstellungen anzeigen (schreibgeschützt)</li>
          </ul>
        </li><br/>
        <li>
          <strong id="system">System</strong>
          <ul>
            <li><a href="server-settings.md">Server</a>: Serverkonfigurationen anzeigen (schreibgeschützt)</li>
            <li><a href="display-settings.md">Anzeige</a>: Anzeigeeinstellungen konfigurieren</li>
            <li><a href="audit-logs-viewer.md">Audit-Protokoll</a>: Systemaudit-Protokolle anzeigen (schreibgeschützt)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## Status-Symbole {#status-icons}

Die Seitenleiste zeigt Statussymbole neben den **NTFY**- und **E-Mail**-Integrationseinstellungen an:
- <IIcon2 icon="lucide:message-square" color="green"/> <IIcon2 icon="lucide:mail" color="green"/> **Grünes Symbol**: Ihre Einstellungen sind gültig und korrekt konfiguriert
- <IIcon2 icon="lucide:message-square" color="yellow"/> <IIcon2 icon="lucide:mail" color="yellow"/> **Gelbes Symbol**: Ihre Einstellungen sind ungültig oder nicht konfiguriert

Wenn die Konfiguration ungültig ist, werden die entsprechenden Kontrollkästchen auf der Registerkarte [`Backup Benachrichtigungen`](backup-notifications-settings.md) ausgegraut und deaktiviert. Weitere Details finden Sie auf den Seiten [NTFY Einstellungen](ntfy-settings.md) und [E-Mail-Einstellungen](email-settings.md).

<br/>

:::important
Ein grünes Symbol bedeutet nicht zwingend, dass Benachrichtigungen ordnungsgemäß funktionieren. Verwenden Sie immer die verfügbaren Testfunktionen, um zu bestätigen, dass Ihre Benachrichtigungen funktionieren, bevor Sie sich auf diese verlassen.
:::

<br/>
