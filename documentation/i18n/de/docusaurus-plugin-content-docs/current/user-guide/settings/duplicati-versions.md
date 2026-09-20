# Duplicati-Versionen {/* #duplicati-versions */}

Diese Seite zeigt die neuesten Duplicati-Veröffentlichungen an, die im **duplistatus**-Cache gespeichert sind, und ermöglicht es Administratoren, zu konfigurieren, wie oft diese Versionen von GitHub aktualisiert werden.

![Duplicati-Versionen](../../assets/screen-settings-duplicati-versions.png)

Der Cache wird vom [Dashboard](../dashboard.md#duplicati-server-version) und der [Server](server-settings.md)-Seite verwendet, um jede Serverversion farblich hervorzuheben und anzuzeigen, ob sie aktuell oder veraltet ist.

## Aktuelle Kanalversionen {/* #latest-channel-versions */}

Die Tabelle listet die zuletzt zwischengespeicherte Version für jeden Duplicati-Kanal auf:

| Kanal          | Beschreibung                                       |
|:---------------|:---------------------------------------------------|
| **Stabil**     | Neueste stabile Veröffentlichung                   |
| **Beta**       | Neueste Beta-Veröffentlichung                      |
| **Experimentell** | Neueste experimentelle Veröffentlichung         |
| **Canary**     | Neueste Canary-Veröffentlichung                    |

Die letzte erfolgreiche GitHub-Aktualisierungszeit wird oberhalb der Tabelle angezeigt. Falls ein Kanal noch nicht gefunden wurde oder der Cache noch nie aktualisiert wurde, zeigt die Seite an, dass die Version nicht verfügbar ist.

Administratoren können auf **Jetzt aktualisieren** klicken, um sofort die neuesten Veröffentlichungen abzurufen. Dies erfordert nicht, dass der Cron-Dienst läuft. Falls GitHub nicht erreichbar ist, behält **duplistatus** den vorherigen Cache bei.

## Zeitplan für Versionsprüfungen {/* #version-check-schedule */}

**Version auf dem Dashboard anzeigen** schaltet das Versionskennzeichen in der [Dashboard](../dashboard.md#duplicati-server-version)-Kartenansicht ein oder aus. Die Dashboard-Tabelle zeigt immer die Spalte **Version** an. Standardmäßig ist dies aktiviert und auch in den [Anzeigeeinstellungen](display-settings.md) verfügbar. Dies ist eine benutzerspezifische Anzeigeeinstellung.

Administratoren können wählen, wie oft **duplistatus** GitHub auf neue Duplicati-Veröffentlichungen prüft:

| Intervall            | Ausführungen                                                   |
|:---------------------|:---------------------------------------------------------------|
| **Einmal täglich**   | Einmal zur eingestellten Startzeit                             |
| **Alle 12 Stunden**  | Zur Startzeit und 12 Stunden später                            |
| **Alle 6 Stunden**   | Zur Startzeit und alle 6 Stunden danach                        |

Die Startzeit wird in Ihrer Browser-Zeitzone unter Verwendung derselben kompakten Zeitauswahl wie bei der täglichen Zusammenfassung gewählt. Wählen Sie eine beliebige `HH:mm` Zeit. **duplistatus** speichert diesen Wert in UTC und der Cron-Dienst führt die Prüfung in UTC durch.

Beispiele:

- Täglich mit Startzeit 06:00 Uhr wird um 06:00 Uhr ausgeführt.
- Täglich mit Startzeit 06:30 Uhr wird um 06:30 Uhr ausgeführt.
- Alle 12 Stunden mit Startzeit 08:15 Uhr wird um 08:15 Uhr und 20:15 Uhr ausgeführt.
- Alle 6 Stunden mit Startzeit 02:45 Uhr wird um 02:45 Uhr, 08:45 Uhr, 14:45 Uhr und 20:45 Uhr ausgeführt.

Beim Start aktualisiert **duplistatus** auch den Cache, wenn dieser älter als das ausgewählte Intervall ist (24 Stunden, 12 Stunden oder 6 Stunden), einschließlich einer neuen leeren Datenbank. Vorübergehende GitHub-Fehler wie HTTP 504 werden erneut versucht. Fehlgeschlagene Aktualisierungen behalten die letzten zwischengespeicherten Versionen bei.

Reguläre Benutzer können die zwischengespeicherten Versionen und den Zeitplan einsehen und **Version auf dem Dashboard anzeigen** ein- oder ausschalten. Nur Administratoren können das Intervall, die Startzeit oder eine manuelle Aktualisierung ändern.

:::note
Das Ändern des Zeitplans schreibt einen `duplicati_version_check_updated` Eintrag in das [Audit-Protokoll](audit-logs-viewer.md). Erfolgreiche und fehlgeschlagene GitHub-Aktualisierungen werden als `duplicati_version_refresh` mit einem Auslöser von `startup`, `cron` oder `manual` aufgezeichnet.
:::
