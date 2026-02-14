---
translation_last_updated: '2026-02-14T04:57:43.541Z'
source_file_mtime: '2026-02-06T20:21:18.353Z'
source_file_hash: 6810bf2e7dc0121a
translation_language: de
source_file_path: user-guide/settings/overview.md
---
# Übersicht {#overview}

Die Einstellungsseite bietet eine einheitliche Schnittstelle zur Konfiguration aller Aspekte von **duplistatus**. Sie können darauf zugreifen, indem Sie auf die Schaltfläche <IconButton icon="lucide:settings" /> `Einstellungen` in der [Anwendungssymbolleiste](../overview#application-toolbar) klicken. Beachten Sie, dass normale Benutzer ein vereinfachtes Menü mit weniger Optionen im Vergleich zu Administratoren sehen.

## Administrator-Ansicht {#administrator-view}

Administratoren sehen alle verfügbaren Einstellungen.

<table>
  <tr>
    <td>
      ![Einstellungsseitenleiste - Administrator-Ansicht](../../assets/screen-settings-left-panel-admin.png)
    </td>
    <td>
      <ul>
        <li>
          <strong>Benachrichtigungen</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Sicherungsbenachrichtigungen</a>: Benachrichtigungseinstellungen pro Sicherung konfigurieren</li>
            <li><a href="overdue-settings.md">Überfällige Überwachung</a>: Erkennung und Warnungen für überfällige Sicherungen konfigurieren</li>
            <li><a href="notification-templates.md">Vorlagen</a>: Benachrichtigungsnachrichtenvorlagen anpassen</li>
          </ul>
        </li><br/>
        <li>
          <strong>Integrationen</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a>: Push-Benachrichtigungsdienst NTFY konfigurieren</li>
            <li><a href="email-settings.md">E-Mail</a>: SMTP-E-Mail-Benachrichtigungen konfigurieren</li>
          </ul>
        </li><br/>
        <li>
          <strong id="system">System</strong>
          <ul>
            <li><a href="server-settings.md">Server</a>: Duplicati-Serverkonfigurationen verwalten</li>
            <li><a href="display-settings.md">Anzeige</a>: Anzeigeeinstellungen konfigurieren</li>
            <li><a href="database-maintenance.md">Datenbankwartung</a>: Datenbankbereinigung durchführen (nur Admin)</li>
            <li><a href="user-management-settings.md">Benutzer</a>: Benutzerkonten verwalten (nur Admin)</li>
            <li><a href="audit-logs-viewer.md">Audit-Log</a>: Systemaudit-Protokolle anzeigen</li>
            <li><a href="audit-logs-retention.md">Audit-Log-Aufbewahrung</a>: Audit-Log-Aufbewahrung konfigurieren (nur Admin)</li>
            <li><a href="application-logs-settings.md">Anwendungsprotokolle</a>: Anwendungsprotokolle anzeigen und exportieren (nur Admin)</li>
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
      ![Einstellungsseitenleiste - Nicht-Admin-Ansicht](../../assets/screen-settings-left-panel-non-admin.png)
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
            <li><a href="audit-logs-viewer.md">Audit-Log</a>: Systemaudit-Protokolle anzeigen (schreibgeschützt)</li>
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

Wenn die Konfiguration ungültig ist, werden die entsprechenden Kontrollkästchen auf der Registerkarte [`Sicherungsbenachrichtigungen`](backup-notifications-settings.md) ausgegraut und deaktiviert. Weitere Details finden Sie auf den Seiten [NTFY-Einstellungen](ntfy-settings.md) und [E-Mail-Einstellungen](email-settings.md).

<br/>

:::important
Ein grünes Symbol bedeutet nicht zwangsläufig, dass Benachrichtigungen korrekt funktionieren. Verwenden Sie immer die verfügbaren Testfunktionen, um zu bestätigen, dass Ihre Benachrichtigungen funktionieren, bevor Sie sich darauf verlassen.
:::

<br/>
