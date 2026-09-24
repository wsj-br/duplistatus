# Übersicht {/* #overview */}

Willkommen zum duplistatus-Benutzerhandbuch. Dieses umfassende Dokument enthält detaillierte Anweisungen zur Verwendung von duplistatus für die Überwachung und Verwaltung Ihrer Duplicati-Sicherungsvorgänge auf mehreren Servern.

## Was ist duplistatus? {/* #what-is-duplistatus */}

duplistatus ist ein leistungsstarkes Überwachungsdashboard, das speziell für Duplicati-Sicherungssysteme entwickelt wurde. Es bietet Folgendes:

- Zentrale Überwachung mehrerer Duplicati-Server über eine einzige Schnittstelle
- Echtzeit-Statusverfolgung aller Sicherungsvorgänge
- Automatische Erkennung überfälliger Sicherungen mit konfigurierbaren Warnungen
- Umfassende Metriken und Visualisierung der Sicherungsleistung
- Flexibles Benachrichtigungssystem über NTFY und E-Mail
- Optionale Funktionen zur [Sicherheitskonfiguration](../installation/security-configuration.md)
- Mehrsprachige Unterstützung (Englisch, Französisch, Deutsch, Spanisch, brasilianisches Portugiesisch, Hindi und vereinfachtes Chinesisch).

## Installation {/* #installation */}

Für Voraussetzungen und detaillierte Installationsanweisungen lesen Sie bitte den [Installationsleitfaden](../installation/installation.md).

## Zugriff auf das Dashboard {/* #accessing-the-dashboard */}

Nach erfolgreicher Installation greifen Sie wie folgt auf die duplistatus-Weboberfläche zu:

1. Öffnen Sie Ihren bevorzugten Webbrowser
2. Navigieren Sie zu `http://your-server-ip:9666`
   - Ersetzen Sie `your-server-ip` durch die tatsächliche IP-Adresse oder den Hostnamen Ihres duplistatus-Servers
   - Der Standardport ist `9666`
3. Sie erhalten eine Anmeldeseite angezeigt.

Verwenden Sie diese Anmeldeinformationen für die erste Verwendung (oder nach einem Upgrade von Versionen vor 0.9.x):
    - Benutzername: `admin`
    - Passwort: `Duplistatus09`

Wählen Sie die Sprache der Benutzeroberfläche in der oberen rechten Ecke <IconButton icon="lucide:languages" label="Sprache" /> oder in <IconButton icon="lucide:user" label="Benutzername" /> nach der Anmeldung aus (siehe unten).

4. Nach der Anmeldung wird das Hauptdashboard automatisch angezeigt (ohne Daten bei erster Verwendung)

## Übersicht über die Benutzeroberfläche {/* #user-interface-overview */}

duplistatus bietet ein intuitives Dashboard zur Überwachung von Duplicati-Sicherungsvorgängen in Ihrer gesamten Infrastruktur.

![Dashboard-Übersicht](../assets/screen-main-dashboard-card-mode.png)

Die Benutzeroberfläche ist in mehrere wichtige Abschnitte unterteilt, um ein klares und umfassendes Monitoring-Erlebnis zu bieten:

1. [Anwendungs-Toolbar](#application-toolbar): Schneller Zugriff auf wesentliche Funktionen und Konfigurationen
2. [Dashboard-Zusammenfassung](dashboard.md#dashboard-summary): Übersichtsstatistiken für alle überwachten Server
3. Server-Übersicht: [Kartenlayout](dashboard.md#cards-layout) oder [Tabellenlayout](dashboard.md#table-layout), das den neuesten Status aller Sicherungen zeigt, einschließlich der [Duplicati-Serverversion](dashboard.md#duplicati-server-version) aus dem letzten empfangenen Sicherungsprotokoll
4. [Details zu überfälligen Sicherungen](dashboard.md#overdue-details): Visuelle Warnungen für überfällige Sicherungen mit detaillierten Informationen beim Hovern
5. [Verfügbare Sicherungsversionen](dashboard.md#available-backup-versions): Klicken Sie auf das blaue Symbol, um verfügbare Sicherungsversionen am Zielort anzuzeigen
6. [Sicherungsmetriken](backup-metrics.md): Interaktive Diagramme, die die Sicherungsleistung im Laufe der Zeit anzeigen
7. [Serverdetails](server-details.md): Umfassende Liste der aufgezeichneten Sicherungen für bestimmte Server, einschließlich detaillierter Statistiken
8. [Sicherungsdetails](server-details.md#backup-details): Ausführliche Informationen zu einzelnen Sicherungen, einschließlich Ausführungsprotokollen, Warnungen und Fehlern

## Anwendungs-Toolbar {/* #application-toolbar */}

Die Anwendungssymbolleiste bietet bequemen Zugriff auf wichtige Funktionen und Einstellungen, die für einen effizienten Workflow organisiert sind.

![Anwendungssymbolleiste](../assets/duplistatus_toolbar.svg)

<table>
  <thead>
    <tr>
      <th style={{whiteSpace: 'nowrap'}}>Schaltfläche</th>
      <th>Beschreibung</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style={{whiteSpace: 'nowrap'}}><IconButton icon="lucide:search" /> &nbsp; Filter</td>
      <td>Server nach ID, URL oder Sicherungsauftragsname suchen und filtern.</td>
    </tr>
    <tr>
      <td style={{whiteSpace: 'nowrap'}}><IconButton icon="lucide:rotate-ccw" /> &nbsp; Bildschirm aktualisieren</td>
      <td>Alle Daten sofort manuell aktualisieren</td>
    </tr>
    <tr>
      <td style={{whiteSpace: 'nowrap'}}><IconButton label="Automatische Aktualisierung" /></td>
      <td>Automatische Aktualisierungsfunktion aktivieren oder deaktivieren. In [Anzeigeeinstellungen](settings/display-settings.md) konfigurieren. <br/> _Rechtsklick_, um die Seite Anzeigeeinstellungen zu öffnen</td>
    </tr>
    <tr>
      <td style={{whiteSpace: 'nowrap'}}><SvgButton svgFilename="ntfy.svg" /> &nbsp; NTFY öffnen</td>
      <td>Zugriff auf die ntfy.sh-Website für Ihr konfiguriertes Benachrichtigungsthema. <br/> _Rechtsklick_, um einen QR-Code anzuzeigen. Gerät konfigurieren, um Benachrichtigungen von duplistatus zu empfangen.</td>
    </tr>
    <tr>
      <td style={{whiteSpace: 'nowrap'}}><SvgButton svgFilename="duplicati_logo.svg" href="duplicati-configuration" /> &nbsp; [Duplicati-Konfiguration](duplicati-configuration.md)</td>
      <td>Weboberfläche des ausgewählten duplicati-Servers öffnen <br/> _Rechtsklick_, um die alte duplicati-Benutzeroberfläche (`/ngax`) in einem neuen Tab zu öffnen</td>
    </tr>
    <tr>
      <td style={{whiteSpace: 'nowrap'}}><IconButton icon="lucide:download" href="collect-backup-logs" /> &nbsp; [Protokolle sammeln](collect-backup-logs.md)</td>
      <td>Mit duplicati-Servern verbinden und Sicherungsprotokolle abrufen <br/> _Rechtsklick_, um Protokolle für alle konfigurierten Server zu sammeln</td>
    </tr>
    <tr>
      <td style={{whiteSpace: 'nowrap'}}><IconButton icon="lucide:siren" tone="alert" href="delivery-failures" /> &nbsp; [Zustellungsfehler](delivery-failures.md)</td>
      <td>Wird Administratoren angezeigt, während die E-Mail- oder NTFY-Zustellung fehlschlägt. Siehe [Zustellungsfehler](delivery-failures.md).</td>
    </tr>
    <tr>
      <td style={{whiteSpace: 'nowrap'}}><IconButton icon="lucide:settings" href="settings/backup-notifications-settings" /> &nbsp; [Einstellungen](settings/backup-notifications-settings.md)</td>
      <td>Benachrichtigungen, Überwachung, SMTP-Server und Benachrichtigungsvorlagen konfigurieren</td>
    </tr>
    <tr>
      <td style={{whiteSpace: 'nowrap'}}><IconButton icon="lucide:user" label="Benutzername" /></td>
      <td>Verbundenen Benutzer und Benutzertyp (`Admin`, `User`) anzeigen, für Benutzermenü klicken (inklusive Sprachauswahl). Mehr dazu in [Benutzerverwaltung](settings/user-management-settings.md)</td>
    </tr>
    <tr>
      <td style={{whiteSpace: 'nowrap'}}><IconButton icon="lucide:book-open-text" href="overview" /> &nbsp; Benutzerhandbuch</td>
      <td>Öffnet das [Benutzerhandbuch](overview.md) im Abschnitt, der für die aktuell angezeigte Seite relevant ist. Der Tooltip zeigt "Hilfe für [Seitenname]", um anzugeben, welche Dokumentation geöffnet wird.</td>
    </tr>
  </tbody>
</table>

### Benutzermenü {/* #user-menu */}

Wenn Sie auf die Benutzerschaltfläche klicken, wird ein Dropdown-Menü mit benutzerspezifischen Optionen geöffnet. Die Menüoptionen unterscheiden sich je nachdem, ob Sie als Administrator oder als regulärer Benutzer angemeldet sind. Beide Rollen können die Oberflächensprache über das Untermenü **Sprache** ändern. Die ausgewählte Sprache wird pro Benutzer in diesem Browser gespeichert (nicht als systemweite Einstellung), sodass verschiedene Konten unterschiedliche Sprachen verwenden können. Unterstützte Sprachen: Englisch, Französisch, Deutsch, Spanisch, Brasilianisches Portugiesisch, Hindi und Vereinfachtes Chinesisch.

<table>
  <tr>
    <th>Administrator</th>
    <th>Regulärer Benutzer</th>
  </tr>
  <tr>
    <td style={{verticalAlign: 'top'}}>![Benutzermenü - Admin](../assets/screen-user-menu-admin.png)</td>
    <td style={{verticalAlign: 'top'}}>![Benutzermenü - Benutzer](../assets/screen-user-menu-user.png)</td>
  </tr>
</table>

## Wesentliche Konfiguration {/* #essential-configuration */}

1. Konfigurieren Sie Ihre [Duplicati-Server](../installation/duplicati-server-configuration.md), um Sicherungsprotokollnachrichten an duplistatus zu senden (erforderlich).
2. Sammeln Sie erste Sicherungsprotokolle – verwenden Sie die Funktion [Backup-Protokolle sammeln](collect-backup-logs.md), um die Datenbank mit historischen Sicherungsdaten von all Ihren Duplicati-Servern zu füllen. Dies aktualisiert auch automatisch die Intervalle der Backup-Überwachung basierend auf der Konfiguration jedes Servers.
3. Konfigurieren Sie die Servereinstellungen – richten Sie Server-Aliase und Notizen unter [Einstellungen → Server](settings/server-settings.md) ein, um Ihr Dashboard informativer zu gestalten.
4. Konfigurieren Sie die NTFY-Einstellungen – richten Sie Benachrichtigungen über NTFY unter [Einstellungen → NTFY](settings/ntfy-settings.md) ein.
5. Konfigurieren Sie die E-Mail-Einstellungen – richten Sie E-Mail-Benachrichtigungen unter [Einstellungen → E-Mail](settings/email-settings.md) ein.
6. Konfigurieren Sie die Backup-Benachrichtigungen – richten Sie pro Sicherung oder pro Server Benachrichtigungen unter [Einstellungen → Backup-Benachrichtigungen](settings/backup-notifications-settings.md) ein.
7. Optional Zugriff beschränken – erstellen Sie [API-Schlüssel](settings/api-keys-settings.md) und/oder [IP-Allowlisten](settings/ip-allowlist-settings.md), wenn Sie `/api/upload` und das Administrationsinterface schützen möchten. Beide sind standardmäßig ausgeschaltet.

<br/>

:::info[WICHTIG]
Denken Sie daran, die Duplicati-Server so zu konfigurieren, dass sie Sicherungsprotokolle an duplistatus senden, wie im Abschnitt [Duplicati-Konfiguration](../installation/duplicati-server-configuration.md) beschrieben.
:::

<br/>

:::note
 Alle Produktnamen, Logos und Marken sind Eigentum ihrer jeweiligen Inhaber. Symbole und Namen werden nur zu Identifikationszwecken verwendet und implizieren keine Billigung.
:::

<small>

> **Hinweis zu UI- und Dokumentationsübersetzungen:** Alle Oberflächen- und Dokumentationssprachen außer Englisch (UK) wurden mit KI mithilfe von [ai-i18n-tools](https://wsj-br.github.io/ai-i18n-tools/) übersetzt; die Formulierungen können ungenau sein oder Fehler enthalten.

</small>
