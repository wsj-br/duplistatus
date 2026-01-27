# Willkommen bei duplistatus {#welcome-to-duplistatus}

**duplistatus** - Ein weiteres [Duplicati](https://github.com/duplicati/duplicati) Dashboard

## Funktionen {#features}

- **Schnelle Einrichtung**: Einfache containerisierte Bereitstellung mit Images auf Docker Hub und GitHub.
- **Einheitliches Dashboard**: Anzeigen von Status, Verlauf und Details für Alle Server an einem Ort.
- **Überwachung überfälliger Sicherungen**: Automatische Überprüfung und Benachrichtigungen für überfällige geplante Sicherungen.
- **Datenvisualisierung & Protokolle**: Interaktive Diagramme und automatische Protokollerfassung von Duplicati-Servern.
- **Benachrichtigungen & Warnungen**: Integrierte NTFY- und SMTP-E-Mail-Unterstützung für Backup-Benachrichtigungen, einschließlich Benachrichtigungen für überfällige Sicherungen.
- **Benutzerzugriffskontrolle & Sicherheit**: Sicheres Authentifizierungssystem mit rollenbasierter Zugriffskontrolle (Admin-/Benutzerrollen), konfigurierbare Passwortrichtlinien, Kontosperrschutz und umfassende Benutzerverwaltung.
- **Audit-Protokollierung**: Vollständige Audit-Spur aller Systemänderungen und Benutzeraktionen mit erweiterten Filterungsmöglichkeiten, Exportfunktionen und konfigurierbaren Aufbewahrungszeiträumen.
- **Anwendungsprotokoll-Viewer**: Nur für Administratoren verfügbare Schnittstelle zum Anzeigen, Suchen und Exportieren von Anwendungsprotokollen direkt aus der Weboberfläche mit Echtzeitüberwachungsfunktionen.

## Installation {#installation}

Die Anwendung kann mit Docker, Portainer Stacks oder Podman bereitgestellt werden.
Weitere Details finden Sie im [Installationsleitfaden](installation/installation.md).

- Wenn Sie von einer früheren Version aktualisieren, wird Ihre Datenbank während des Aktualisierungsvorgangs automatisch [migriert](migration/version_upgrade.md) zum neuen Schema.

- Bei Verwendung von Podman (entweder als eigenständiger Container oder innerhalb eines Pod) und wenn Sie benutzerdefinierte DNS-Einstellungen benötigen (z. B. für Tailscale MagicDNS, Unternehmensnetzwerke oder andere benutzerdefinierte DNS-Konfigurationen), können Sie DNS-Server und Suchdomänen manuell angeben. Weitere Details finden Sie im Installationsleitfaden.

## Duplicati-Serverkonfiguration (erforderlich) {#duplicati-servers-configuration-required}

Sobald Ihr **duplistatus**-Server läuft, müssen Sie Ihre **Duplicati**-Server so konfigurieren, dass sie Sicherungsprotokolle an **duplistatus** senden, wie im Abschnitt [Duplicati-Konfiguration](installation/duplicati-server-configuration.md) des Installationsleitfadens beschrieben. Ohne diese Konfiguration erhält das Dashboard keine Sicherungsdaten von Ihren Duplicati-Servern.

## Benutzerhandbuch {#user-guide}

Weitere Informationen finden Sie im [Benutzerhandbuch](user-guide/overview.md) mit detaillierten Anweisungen zur Konfiguration und Verwendung von **duplistatus**, einschließlich Ersteinrichtung, Funktionskonfiguration und Fehlerbehebung.

## Screenshots {#screenshots}

### Dashboard {#dashboard}

![dashboard](/assets/screen-main-dashboard-card-mode.png)

### Sicherungsverlauf {#backup-history}

![server-detail](/assets/screen-server-backup-list.png)

### Sicherungsdetails {#backup-details}

![backup-detail](/assets/screen-backup-detail.png)

### Überfällige Sicherungen {#overdue-backups}

![overdue backups](/assets/screen-overdue-backup-hover-card.png)

### Benachrichtigungen für überfällige Sicherungen auf Ihrem Telefon {#overdue-notifications-on-your-phone}

![ntfy overdue message](/assets/screen-overdue-notification.png)

## API-Referenz {#api-reference}

Weitere Informationen zu verfügbaren Endpunkten, Request-/Response-Formaten und Beispielen finden Sie in der [API-Endpunkte-Dokumentation](api-reference/overview.md).

## Entwicklung {#development}

Anweisungen zum Herunterladen, Ändern oder Ausführen des Codes finden Sie unter [Entwicklungseinrichtung](development/setup.md).

Dieses Projekt wurde hauptsächlich mit KI-Hilfe erstellt. Weitere Informationen finden Sie unter [Wie ich diese Anwendung mit KI-Tools erstellt habe](development/how-i-build-with-ai).

## Danksagungen {#credits}

- Zunächst möchte ich Kenneth Skovhede danken, der Duplicati—dieses erstaunliche Sicherungstool—entwickelt hat. Danke auch an alle Mitwirkenden.

  💙 Wenn Sie [Duplicati](https://www.duplicati.com) nützlich finden, unterstützen Sie bitte den Entwickler. Weitere Details finden Sie auf der Website oder GitHub-Seite.

- Duplicati SVG-Symbol von https://dashboardicons.com/icons/duplicati

- Notify SVG-Symbol von https://dashboardicons.com/icons/ntfy

- GitHub SVG-Symbol von https://github.com/logos

> [!NOTE]
> Alle Produktnamen, Marken und eingetragenen Marken sind Eigentum ihrer jeweiligen Inhaber. Symbole und Namen werden nur zu Identifikationszwecken verwendet und implizieren keine Billigung.

## Lizenz {#license}

Das Projekt ist unter der [Apache-Lizenz 2.0](LICENSE.md) lizenziert.

**Urheberrecht © 2025 Waldemar Scudeller Jr.**

