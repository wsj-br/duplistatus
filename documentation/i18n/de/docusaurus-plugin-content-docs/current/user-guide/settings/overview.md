---
translation_last_updated: '2026-03-01T00:45:12.240Z'
source_file_mtime: '2026-02-16T00:30:39.432Z'
source_file_hash: a99398581e24b09c
translation_language: de
source_file_path: user-guide/settings/overview.md
---
# Übersicht {#overview}

Die Seite „Einstellungen" bietet eine einheitliche Schnittstelle zum Konfigurieren aller Aspekte von **duplistatus**. Sie können darauf zugreifen, indem Sie auf die Schaltfläche <IconButton icon="lucide:settings" /> **Einstellungen** in der [Anwendungssymbolleiste](../overview#application-toolbar) klicken. Hinweis: Normale Benutzer sehen ein vereinfachtes Menü mit weniger Optionen im Vergleich zu Administratoren.

## Administrator-Ansicht {#administrator-view}

Administratoren sehen alle verfügbaren Einstellungen.

<table>
  <tr>
    <td>
      ![Einstellungen-Seitenleiste - Admin-Ansicht](../../assets/screen-settings-left-panel-admin.png)
    </td>
    <td>
      <ul>
        <li>
          <strong>Benachrichtigungen</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Sicherungsbenachrichtigungen</a>: Konfigurieren Sie Benachrichtigungseinstellungen pro Sicherung</li>
            <li><a href="backup-monitoring-settings.md">Sicherungsüberwachung</a>: Konfigurieren Sie die Erkennung und Benachrichtigungen für überfällige Sicherungen</li>
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
            <li><a href="display-settings.md">Anzeigeeinstellungen</a>: Konfigurieren Sie Anzeigeeinstellungen</li>
            <li><a href="database-maintenance.md">Datenbankwartung</a>: Führen Sie Datenbankbereinigung durch (nur Admin)</li>
            <li><a href="user-management-settings.md">Benutzer</a>: Verwalten Sie Benutzerkonten (nur Admin)</li>
            <li><a href="audit-logs-viewer.md">Audit-Protokoll</a>: Zeigen Sie System-Audit-Protokolle an</li>
            <li><a href="audit-logs-retention.md">Audit-Log-Aufbewahrung</a>: Konfigurieren Sie die Audit-Log-Aufbewahrung (nur Admin)</li>
            <li><a href="application-logs-settings.md">Anwendungsprotokolle</a>: Zeigen Sie Anwendungsprotokolle an und exportieren Sie diese (nur Admin)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## Nicht-Administrator-Ansicht {#non-administrator-view}

Normale Benutzer sehen einen begrenzten Satz von Einstellungen.

<table>
  <tr>
    <td>
      ![Einstellungsseitenleiste – Ansicht für Nicht-Administratoren](../../assets/screen-settings-left-panel-non-admin.png)
    </td>
    <td>
      <ul>
        <li>
          <strong>Benachrichtigungen</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Backup-Benachrichtigungen</a>: Zeigen Sie Benachrichtigungseinstellungen pro Sicherung an (schreibgeschützt)</li>
            <li><a href="backup-monitoring-settings.md">Backup-Überwachung</a>: Zeigen Sie Einstellungen für überfällige Sicherungen an (schreibgeschützt)</li>
            <li><a href="notification-templates.md">Vorlagen</a>: Zeigen Sie Benachrichtigungsvorlagen an (schreibgeschützt)</li>
          </ul>
        </li><br/>
        <li>
          <strong>Integrationen</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a>: Zeigen Sie NTFY-Einstellungen an (schreibgeschützt)</li>
            <li><a href="email-settings.md">E-Mail</a>: Zeigen Sie E-Mail-Einstellungen an (schreibgeschützt)</li>
          </ul>
        </li><br/>
        <li>
          <strong id="system">System</strong>
          <ul>
            <li><a href="server-settings.md">Server</a>: Zeigen Sie Serverkonfigurationen an (schreibgeschützt)</li>
            <li><a href="display-settings.md">Anzeige</a>: Konfigurieren Sie Anzeigeeinstellungen</li>
            <li><a href="audit-logs-viewer.md">Audit-Log</a>: Zeigen Sie System-Audit-Protokolle an (schreibgeschützt)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## Statussymbole {#status-icons}

In der Seitenleiste werden Statussymbole neben den **NTFY**- und **E-Mail**-Integrationseinstellungen angezeigt:
- <IIcon2 icon="lucide:message-square" color="green"/> <IIcon2 icon="lucide:mail" color="green"/> **Grünes Symbol**: Ihre Einstellungen sind gültig und korrekt konfiguriert
- <IIcon2 icon="lucide:message-square" color="yellow"/> <IIcon2 icon="lucide:mail" color="yellow"/> **Gelbes Symbol**: Ihre Einstellungen sind nicht gültig oder nicht konfiguriert

Wenn die Konfiguration ungültig ist, werden die entsprechenden Kontrollkästchen auf der Registerkarte [Backup-Benachrichtigungen](backup-notifications-settings.md) ausgegraut und deaktiviert. Weitere Details finden Sie auf den Seiten [NTFY-Einstellungen](ntfy-settings.md) und [E-Mail-Einstellungen](email-settings.md).

<br/>

:::important
Ein grünes Symbol bedeutet nicht zwangsläufig, dass Benachrichtigungen korrekt funktionieren. Verwenden Sie immer die verfügbaren Testfunktionen, um zu bestätigen, dass Ihre Benachrichtigungen funktionieren, bevor Sie sich darauf verlassen.
:::

<br/>
