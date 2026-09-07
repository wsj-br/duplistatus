# Übersicht {/* #overview */}

Willkommen zum Benutzerhandbuch von duplistatus. Dieses umfassende Dokument bietet detaillierte Anweisungen zur Verwendung von duplistatus zur Überwachung und Verwaltung Ihrer Duplicati-Sicherungsoperationen über mehrere Server.

## Was ist duplistatus? {/* #what-is-duplistatus */}

duplistatus ist ein leistungsstarkes Überwachungs-Dashboard, das speziell für Duplicati-Sicherungssysteme entwickelt wurde. Es bietet:

- Zentralisierte Überwachung mehrerer Duplicati-Server von einer einzigen Schnittstelle
- Echtzeit-Statusverfolgung aller Sicherungsoperationen
- Automatisierte Erkennung überfälliger Sicherungen mit konfigurierbaren Warnungen
- Umfassende Metriken und Visualisierung der Sicherungsleistung
- Flexibles Benachrichtigungssystem über NTFY und E-Mail
- Optionale [Sicherheitshärtung](../installation/security-hardening.md) Funktionen
- Mehrsprachige Unterstützung (Englisch, Französisch, Deutsch, Spanisch, Brasilianisches Portugiesisch, Hindi und vereinfachtes Chinesisch).

## Installation {/* #installation */}

Für Voraussetzungen und detaillierte Installationsanweisungen lesen Sie bitte das [Installationshandbuch](../installation/installation.md).

## Zugriff auf das Dashboard {/* #accessing-the-dashboard */}

Nach erfolgreicher Installation greifen Sie auf die duplistatus-Webschnittstelle zu, indem Sie die folgenden Schritte ausführen:

1. Öffnen Sie Ihren bevorzugten Webbrowser
2. Navigieren Sie zu `http://your-server-ip:9666`
   - Ersetzen Sie `your-server-ip` durch die tatsächliche IP-Adresse oder den Hostnamen Ihres duplistatus-Servers
   - Der Standardport ist `9666`
3. Ihnen wird eine Anmeldeseite angezeigt.

Verwenden Sie diese Anmeldeinformationen für die erste Nutzung (oder nach einem Upgrade von Versionen vor 0.9.x):
    - Benutzername: `admin`
    - Passwort: `Duplistatus09`

Wählen Sie die Benutzeroberflächensprache in der oberen rechten Ecke <IconButton icon="lucide:languages" label="Sprache" /> oder in <IconButton icon="lucide:user" label="Benutzername" /> nach der Anmeldung (siehe unten).

4. Nach der Anmeldung wird das Hauptdashboard automatisch angezeigt (ohne Daten bei der ersten Nutzung)

## Benutzeroberflächenübersicht {/* #user-interface-overview */}

duplistatus bietet ein intuitives Dashboard zur Überwachung von Duplicati-Sicherungsoperationen in Ihrer gesamten Infrastruktur.

![Dashboard-Übersicht](../assets/screen-main-dashboard-card-mode.png)

Die Benutzeroberfläche ist in mehrere wichtige Abschnitte organisiert, um ein klares und umfassendes Überwachungserlebnis zu bieten:

1. [Anwendungstoolleiste](#application-toolbar): Schneller Zugriff auf wesentliche Funktionen und Konfigurationen
2. [Dashboard-Zusammenfassung](dashboard.md#dashboard-summary): Übersicht über Statistiken für alle überwachten Server
3. Serverübersicht: [Kartenlayout](dashboard.md#cards-layout) oder [Tabellenlayout](dashboard.md#table-layout), das den neuesten Status aller Sicherungen anzeigt, einschließlich der [Duplicati-Serverversion](dashboard.md#duplicati-server-version) aus dem letzten empfangenen Sicherungsprotokoll
4. [Details zu überfälligen Sicherungen](dashboard.md#overdue-details): Visuelle Warnungen für überfällige Sicherungen mit detaillierten Informationen beim Überfahren
5. [Verfügbare Sicherungsversionen](dashboard.md#available-backup-versions): Klicken Sie auf das blaue Symbol, um die am Ziel verfügbaren Sicherungsversionen anzuzeigen
6. [Sicherung Metriken](backup-metrics.md): Interaktive Diagramme, die die Sicherungsleistung im Laufe der Zeit anzeigen
7. [Serverdetails](server-details.md): Umfassende Liste der aufgezeichneten Sicherungen für spezifische Server, einschließlich detaillierter Statistiken
8. [Sicherungsdetails](server-details.md#backup-details): Detaillierte Informationen zu einzelnen Sicherungen, einschließlich Ausführungsprotokollen, Warnungen und Fehlern

## Anwendungswerkzeugleiste {/* #application-toolbar */}

Die Anwendungstoolleiste bietet bequemen Zugriff auf wichtige Funktionen und Einstellungen, die für einen effizienten Arbeitsablauf organisiert sind.

![Anwendungstoolleiste](../assets/duplistatus_toolbar.svg)

| Schaltfläche                                                                                                                                           | Beschreibung                                                                                                                                                                                |
|--------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:search" /> &nbsp; Filter                                                                                            | Suchen und filtern Sie Server nach ID, URL oder Sicherungsjobnamen.                                                      |
| <IconButton icon="lucide:rotate-ccw" /> &nbsp; Bildschirm aktualisieren                                                                                    | Führen Sie eine sofortige manuelle Aktualisierung des Bildschirms aller Daten durch                                                                                                                                     |
| <IconButton label="Auto-refresh" />                                                                                                              | Aktivieren oder deaktivieren Sie die automatische Aktualisierungsfunktion. Konfigurieren Sie in [Anzeigeeinstellungen](settings/display-settings.md) <br/> _Rechtsklick_, um die Seite der Anzeigeeinstellungen zu öffnen                         |
| <SvgButton svgFilename="ntfy.svg" /> &nbsp; NTFY öffnen                                                                                            | Greifen Sie auf die ntfy.sh-Website für Ihr konfiguriertes Benachrichtigungsthema zu. <br/> _Rechtsklick_, um einen QR-Code anzuzeigen, um Ihr Gerät zu konfigurieren, um Benachrichtigungen von duplistatus zu erhalten.               |
| <SvgButton svgFilename="duplicati_logo.svg" href="duplicati-configuration" /> &nbsp; [Duplicati-Konfiguration](duplicati-configuration.md)       | Öffnen Sie die Weboberfläche des ausgewählten Duplicati-Servers <br/> _Rechtsklick_, um die Duplicati Legacy-Benutzeroberfläche (`/ngax`) in einem neuen Tab zu öffnen                                                              |
| <IconButton icon="lucide:download" href="collect-backup-logs" /> &nbsp; [Protokolle sammeln](collect-backup-logs.md)                                   | Verbinden Sie sich mit Duplicati-Servern und rufen Sie Sicherungsprotokolle ab <br/> _Rechtsklick_, um Protokolle für alle konfigurierten Server zu sammeln                                                                       |
| <IconButton icon="lucide:settings" href="settings/backup-notifications-settings" /> &nbsp; [Einstellungen](settings/backup-notifications-settings.md) | Benachrichtigungen, Überwachung, SMTP-Server und Benachrichtigungsvorlagen konfigurieren                                                                                                               |
| <IconButton icon="lucide:user" label="username" />                                                                                               | Zeigen Sie den verbundenen Benutzer, den Benutzertyp (`Admin`, `User`) an, klicken Sie für das Benutzermenü (einschließlich Sprachenauswahl). Weitere Informationen finden Sie in [Benutzerverwaltung](settings/user-management-settings.md)               |
| <IconButton icon="lucide:book-open-text" href="overview" /> &nbsp; Benutzerhandbuch                                                                    | Öffnen Sie das [Benutzerhandbuch](overview.md) zum Abschnitt, der für die Seite relevant ist, die Sie gerade anzeigen. Der Tooltip zeigt "Hilfe für [Seitenname]" an, um anzuzeigen, welche Dokumentation geöffnet wird. |

### Benutzermenü {/* #user-menu */}

Durch Klicken auf die Benutzer-Schaltfläche wird ein Dropdown-Menü mit benutzerspezifischen Optionen geöffnet. Die Menüoptionen unterscheiden sich je nachdem, ob Sie sich als Administrator oder als normaler Benutzer anmelden. Beide Rollen können die Schnittstellensprache über das **Sprache** Untermenü ändern. Die ausgewählte Sprache wird pro Benutzer in diesem Browser gespeichert (nicht als Systemweite Einstellung), sodass verschiedene Konten unterschiedliche Sprachen aufbewahren können. Unterstützte Sprachen: Englisch, Französisch, Deutsch, Spanisch, Brasilianisches Portugiesisch, Hindi und Chinesisch.

<table>
  <tr>
    <th>Administrator</th>
    <th>Normaler Benutzer</th>
  </tr>
  <tr>
    <td style={{verticalAlign: 'top'}}>![Benutzermenü - Admin](../assets/screen-user-menu-admin.png)</td>
    <td style={{verticalAlign: 'top'}}>![Benutzermenü - Benutzer](../assets/screen-user-menu-user.png)</td>
  </tr>
</table>

## Wesentliche Konfiguration {/* #essential-configuration */}

1. Konfigurieren Sie Ihre [Duplicati-Server](../installation/duplicati-server-configuration.md), um Backup-Protokollnachrichten an duplistatus zu senden (erforderlich).
2. Sammeln Sie die anfänglichen Backup-Protokolle – verwenden Sie die Funktion [Backup-Protokolle sammeln](collect-backup-logs.md), um die Datenbank mit historischen Backup-Daten von all Ihren Duplicati-Servern zu füllen. Dies aktualisiert auch automatisch die Intervalle der Backup-Überwachung basierend auf der Konfiguration jedes Servers.
3. Konfigurieren Sie die Servereinstellungen – richten Sie Serveraliasnamen und Notizen in [Einstellungen → Server](settings/server-settings.md) ein, um Ihr Dashboard informativer zu gestalten.
4. Konfigurieren Sie die NTFY-Einstellungen – richten Sie Benachrichtigungen über NTFY in [Einstellungen → NTFY](settings/ntfy-settings.md) ein.
5. Konfigurieren Sie die E-Mail-Einstellungen – richten Sie E-Mail-Benachrichtigungen in [Einstellungen → E-Mail](settings/email-settings.md) ein.
6. Konfigurieren Sie die Backup-Benachrichtigungen – richten Sie Benachrichtigungen pro Backup oder pro Server in [Einstellungen → Backup-Benachrichtigungen](settings/backup-notifications-settings.md) ein.
7. Optional den Zugriff einschränken – erstellen Sie [API-Schlüssel](settings/api-keys-settings.md) und/oder [IP-Whitelist](settings/ip-allowlist-settings.md), wenn Sie `/api/upload` und das Administrationsinterface schützen möchten. Beide sind standardmäßig deaktiviert.

<br/>

:::info[WICHTIG]
Denken Sie daran, die Duplicati-Server so zu konfigurieren, dass sie Backup-Protokolle an duplistatus senden, wie im Abschnitt [Duplicati-Konfiguration](../installation/duplicati-server-configuration.md) beschrieben.
:::

<br/>

:::note
Alle Produktnamen, Logos und Marken sind Eigentum ihrer jeweiligen Inhaber. Icons und Namen werden nur zu Identifikationszwecken verwendet und implizieren keine Unterstützung.
:::

<small>

> **Notiz zur Benutzeroberfläche und Dokumentationstranslation:** Alle Benutzeroberflächen- und Dokumentationssprachen außer Englisch (UK) wurden mit AI unter Verwendung von [ai-i18n-tools](https://wsj-br.github.io/ai-i18n-tools/) übersetzt; die Formulierungen können ungenau oder Fehler enthalten.

</small>
