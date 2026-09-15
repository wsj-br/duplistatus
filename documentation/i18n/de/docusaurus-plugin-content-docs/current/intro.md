# Willkommen bei duplistatus {/* #welcome-to-duplistatus */}

**duplistatus** - Überwachen Sie mehrere [Duplicati's](https://github.com/duplicati/duplicati) Server von einem einzigen Dashboard

## Funktionen {/* #features */}

- **Schnelle Einrichtung**: Einfache Container-basierte Bereitstellung, mit Bildern auf Docker Hub und GitHub verfügbar.
- **Einheitliches Dashboard**: Anzeige des Backup-Status, Verlaufs, der Duplicati-Version und Details aller Server an einem Ort.
- **Backup-Überwachung**: Automatische Überprüfung und Benachrichtigung für überfällige geplante Backups.
- **Datenvisualisierung & Protokolle**: Interaktive Diagramme und automatische Protokollsammlung von Duplicati-Servern.
- **Benachrichtigungen & Warnungen**: Integrierte NTFY- und SMTP-E-Mail-Unterstützung für Backup-Benachrichtigungen, einschließlich Benachrichtigungen für überfällige Backups.
- **Benutzerverwaltung**: Anmeldung mit Admin- und Benutzerrollen, konfigurierbare Passwortrichtlinien, Kontosperre und Benutzerverwaltung.
- **Sicherheitsverbesserungen**: Optionale zusätzliche Schutzmaßnahmen, API-Schlüssel für Duplicati-Uploads und Homepage-Widgets (mit Upload-Größen- und Rate-Limits), unabhängige IP-Zulassungslisten für den Administrationsinterface und die externen APIs, Anti-Spoofing-Schutz und HTTPS-Reverse-Proxy-Anleitungen.
- **Audit-Protokollierung**: Vollständige Audit-Spur aller Systemänderungen und Benutzeraktionen mit fortschrittlicher Filterung, Exportfunktionen und konfigurierbaren Aufbewahrungszeiten.
- **Anwendungsprotokolle-Viewer**: Admin-only-Interface zum Anzeigen, Suchen und Exportieren von Anwendungsprotokollen direkt über die Weboberfläche mit Echtzeit-Überwachungsfunktionen.
- **Mehrsprachige Unterstützung**: Oberfläche und Dokumentation in Englisch, Französisch, Deutsch, Spanisch, Brasilianisch-Portugiesisch, Hindi und Chinesisch (vereinfacht) verfügbar.

## Installation {/* #installation */}

Die Anwendung kann mit Docker, Portainer Stacks oder Podman bereitgestellt werden. 
Siehe Details im [Installationshandbuch](installation/installation.md).

- Wenn Sie von einer früheren Version aktualisieren, wird Ihre Datenbank automatisch
  [migriert](migration/version_upgrade.md) zum neuen Schema während des Aktualisierungsprozesses.

- Wenn Sie Podman verwenden (entweder als eigenständiger Container oder innerhalb eines Pods) und Sie benutzerdefinierte DNS-Einstellungen benötigen 
(solche wie Tailscale MagicDNS, Unternehmensnetzwerke oder andere benutzerdefinierte DNS-Konfigurationen), können Sie DNS-Server und Suchdomänen manuell 
spezifizieren. Siehe das Installationshandbuch für weitere Details.

## Duplicati-Server-Konfiguration (erforderlich) {/* #duplicati-servers-configuration-required */}

Sobald Ihr **duplistatus**-Server läuft, müssen Sie Ihre **Duplicati**-Server konfigurieren, um Backup-Protokolle an **duplistatus** zu senden, wie im Abschnitt [Duplicati-Konfiguration](installation/duplicati-server-configuration.md) 
 des Installationshandbuchs beschrieben. Ohne diese Konfiguration erhält das Dashboard keine Backup-Daten von Ihren Duplicati-Servern.

## Benutzerhandbuch {/* #user-guide */}

Siehe das [Benutzerhandbuch](user-guide/overview.md) für detaillierte Anweisungen zur Konfiguration und Verwendung von **duplistatus**, einschließlich der ersten Einrichtung, der Funktionskonfiguration und der Fehlerbehebung.

## Screenshots {/* #screenshots */}

### Dashboard {/* #dashboard */}

![dashboard](assets/screen-main-dashboard-card-mode.png)

### Backup-Verlauf {/* #backup-history */}

![server-detail](assets/screen-server-backup-list.png)

### Backup-Details {/* #backup-details */}

![backup-detail](assets/screen-backup-detail.png)

### Überfällige Backups {/* #overdue-backups */}

![überfällige Backups](assets/screen-overdue-backup-hover-card.png)

### Überfällige Benachrichtigungen auf Ihrem Telefon {/* #overdue-notifications-on-your-phone */}

![ntfy überfällige Nachricht](/img/screen-overdue-notification.png)

## API-Referenz {/* #api-reference */}

Weitere Informationen zu verfügbaren Endpunkten, Anforderungs-/Antwortformaten und Beispielen finden Sie in der [API-Endpunkte-Dokumentation](api-reference/overview.md).

## Entwicklung {/* #development */}

Anweisungen zum Herunterladen, Ändern oder Ausführen des Codes finden Sie unter [Entwicklungsumgebung einrichten](development/setup.md).

Dieses Projekt wurde hauptsächlich mit Hilfe von KI entwickelt. Weitere Informationen finden Sie unter [So habe ich diese Anwendung mit KI-Tools erstellt](development/how-i-build-with-ai).

## Danksagungen {/* #credits */}

- Zuerst einmal vielen Dank an Kenneth Skovhede für die Erstellung von Duplicati – diesem großartigen Sicherungstool. Vielen Dank auch an alle Mitwirkenden.

💙 Wenn Sie [Duplicati](https://www.duplicati.com) nützlich finden, denken Sie bitte daran, den Entwickler zu unterstützen. Weitere Details finden Sie auf ihrer Website oder auf ihrer GitHub-Seite.

- API-Schlüssel und IP-Zulassungslisten-Idee/Implementierung von `henmohr` in Issue [#79](https://github.com/wsj-br/duplistatus/issues/79)
- Duplicati SVG-Symbol von https://dashboardicons.com/icons/duplicati
- ntfy SVG-Symbol von https://dashboardicons.com/icons/ntfy
- GitHub SVG-Symbol von https://github.com/logos

:::note
 Alle Produktnamen, Logos und Markenzeichen sind Eigentum ihrer jeweiligen Inhaber. Symbole und Namen werden ausschließlich zur Identifikation verwendet und implizieren keine Unterstützung.
:::

## Lizenz {/* #license */}

Das Projekt ist unter der [Apache Lizenz 2.0](LICENSE.md) lizenziert.

**Copyright © 2026 Waldemar Scudeller Jr.**

<small>

> **Hinweis zu UI- und Dokumentationsübersetzungen:** Alle Benutzeroberflächen- und Dokumentationssprachen außer Englisch (UK) wurden mit KI übersetzt [ai-i18n-tools](https://wsj-br.github.io/ai-i18n-tools/); die Formulierungen können ungenau oder fehlerhaft sein.

</small>
