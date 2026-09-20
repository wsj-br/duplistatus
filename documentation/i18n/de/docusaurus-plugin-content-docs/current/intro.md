# Willkommen bei duplistatus {/* #welcome-to-duplistatus */}

**duplistatus** - Überwachen Sie mehrere [Duplicati-](https://github.com/duplicati/duplicati)Server über ein einziges Dashboard

## Funktionen {/* #features */}

- **Schnelle Einrichtung**: Einfache containerbasierte Bereitstellung mit verfügbaren Images auf Docker Hub und GitHub.
- **Einheitliches Dashboard**: Anzeige des Sicherungsstatus, Verlaufs, der Duplicati-Version und Details aller Server an einem Ort.
- **Backup-Überwachung**: Automatische Prüfung und Benachrichtigung bei überfälligen geplanten Backups.
- **Datenvisualisierung & Protokolle**: Interaktive Diagramme und automatische Protokollerfassung von Duplicati-Servern.
- **Benachrichtigungen & Warnungen**: Integrierte NTFY- und SMTP-E-Mail-Unterstützung für Backup-Benachrichtigungen, einschließlich Benachrichtigungen über überfällige Backups.
- **Benutzerverwaltung**: Anmeldung mit Administrator- und Benutzerrollen, konfigurierbare Passwortrichtlinien, Kontosperrung und Benutzerverwaltung.
- **Sicherheitsverbesserung**: Optionaler zusätzlicher Schutz, API-Schlüssel für Duplicati-Uploads und Homepage-Widgets (mit Upload-Größen- und Ratenbeschränkungen), separate IP-Zulassungslisten für das Administrationsinterface und die externen APIs, Spoofing-Schutz und Anleitung für HTTPS-Reverse-Proxy.
- **Audit-Protokollierung**: Vollständige Audit-Trail aller Systemänderungen und Benutzeraktionen mit erweiterter Filterung, Exportfunktionen und konfigurierbaren Aufbewahrungszeiträumen.
- **Anwendungsprotokolle-Viewer**: Nur für Administratoren zugängliches Interface zur Ansicht, Suche und zum Export von Anwendungsprotokollen direkt über die Weboberfläche mit Echtzeitüberwachungsfunktionen.
- **Mehrsprachigkeit**: Oberfläche und Dokumentation verfügbar in Englisch, Französisch, Deutsch, Spanisch, Brasilianisches Portugiesisch, Hindi und Vereinfachtes Chinesisch.

## Installation {/* #installation */}

Die Anwendung kann mit Docker, Portainer Stacks oder Podman bereitgestellt werden. 
Siehe Details im [Installationshandbuch](installation/installation.md).

- Wenn Sie von einer früheren Version aktualisieren, wird Ihre Datenbank während des Aktualisierungsvorgangs automatisch 
  [migriert](migration/version_upgrade.md) auf das neue Schema.

- Bei Verwendung von Podman (entweder als eigenständiger Container oder innerhalb eines Pods) und wenn Sie benutzerdefinierte DNS-Einstellungen benötigen 
(wie z.B. für Tailscale MagicDNS, Firmennetzwerke oder andere benutzerdefinierte DNS-Konfigurationen), können Sie manuell 
DNS-Server und Suchdomänen angeben. Weitere Details finden Sie im Installationshandbuch.

## Duplicati-Server-Konfiguration (erforderlich) {/* #duplicati-servers-configuration-required */}

Sobald Ihr **duplistatus**-Server läuft, müssen Sie Ihre **Duplicati**-Server konfigurieren, um 
Sicherungsprotokolle an **duplistatus** zu senden, wie im Abschnitt [Duplicati-Konfiguration](installation/duplicati-server-configuration.md) 
im Installationshandbuch beschrieben. Ohne diese Konfiguration erhält das Dashboard keine Sicherungsdaten von Ihren Duplicati-Servern.

## Benutzerhandbuch {/* #user-guide */}

Siehe [Benutzerhandbuch](user-guide/overview.md) für detaillierte Anweisungen zur Konfiguration und Verwendung von **duplistatus**, einschließlich Ersteinrichtung, Funktionskonfiguration und Problembehandlung.

## Bildschirmfotos {/* #screenshots */}

### Dashboard {/* #dashboard */}

![Dashboard](assets/screen-main-dashboard-card-mode.png)

### Sicherungsverlauf {/* #backup-history */}

![Server-Details](assets/screen-server-backup-list.png)

### Sicherungsdetails {/* #backup-details */}

![backup-detail](assets/screen-backup-detail.png)

### Überfällige Backups {/* #overdue-backups */}

![überfällige backups](assets/screen-overdue-backup-hover-card.png)

### Überfällige Benachrichtigungen auf Ihrem Telefon {/* #overdue-notifications-on-your-phone */}

![ntfy überfällige Nachricht](/img/screen-overdue-notification.png)

## API-Referenz {/* #api-reference */}

Weitere Informationen zu verfügbaren Endpunkten, Anfrage-/Antwortformaten und Beispielen finden Sie in der [API-Endpunkte-Dokumentation](api-reference/overview.md).

## Entwicklung {/* #development */}

Anweisungen zum Herunterladen, Ändern oder Ausführen des Codes finden Sie unter [Entwicklereinrichtung](development/setup.md).

Dieses Projekt wurde hauptsächlich mit KI-Hilfe erstellt. Um zu erfahren, wie dies geschieht, siehe [Wie ich diese Anwendung mit KI-Tools erstelle](development/how-i-build-with-ai).

## Danksagungen {/* #credits */}

- Zunächst vielen Dank an Kenneth Skovhede für die Erstellung von Duplicati – diesem erstaunlichen Backup-Tool. Vielen Dank auch an alle Mitwirkenden.

💙 Wenn Sie [Duplicati](https://www.duplicati.com) als nützlich empfinden, erwägen Sie bitte, den Entwickler zu unterstützen. Weitere Details sind auf deren Website oder GitHub-Seite verfügbar.

- API-Schlüssel und IP-Zulassungslisten Idee/Implementierung durch `henmohr` in Issue [#79](https://github.com/wsj-br/duplistatus/issues/79)
- Duplicati SVG-Icon von https://dashboardicons.com/icons/duplicati
- ntfy SVG-Icon von https://dashboardicons.com/icons/ntfy
- GitHub SVG-Icon von https://github.com/logos

:::note
 Alle Produktnamen, Logos und Marken sind Eigentum ihrer jeweiligen Inhaber. Symbole und Namen werden nur zu Identifikationszwecken verwendet und implizieren keine Billigung.
:::

## Lizenz {/* #license */}

Das Projekt ist unter der [Apache-Lizenz 2.0](LICENSE.md) lizenziert.

**Copyright © 2026 Waldemar Scudeller Jr.**

<small>

> **Hinweis zu UI- und Dokumentationsübersetzungen:** Alle Oberflächen- und Dokumentationssprachen außer Englisch (UK) wurden mit KI mithilfe von [ai-i18n-tools](https://wsj-br.github.io/ai-i18n-tools/) übersetzt; die Formulierungen können ungenau sein oder Fehler enthalten.

</small>
