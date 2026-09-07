# API-Schlüssel {/* #api-keys */}

Administratoren können bereichsspezifische API-Schlüssel für die externen HTTP-APIs erstellen, die Duplicati und Homepage verwenden. Schlüssel sind standardmäßig optional, sodass bestehende Duplicati-Aufträge weiterhin funktionieren.

![API-Schlüssel](../../assets/screen-settings-api-keys.png)

## Scopes {/* #scopes */}

| Bereich | Endpunkte |
|--------|-----------|
| Hochladen | `POST /api/upload` |
| Lesen | `GET /api/summary`, `GET /api/lastbackup/:id`, `GET /api/lastbackups/:id` |

Ein Hochladen-Schlüssel kann die Lesen-APIs nicht aufrufen, und ein Lesen-Schlüssel kann keine Berichte hochladen.

## Erstellen eines Schlüssels {/* #creating-a-key */}

1. Öffnen Sie **Einstellungen → API-Schlüssel**.
2. Klicken Sie auf **API-Schlüssel erstellen** am unteren Rand der API-Schlüssel-Karte.
3. Geben Sie einen Namen ein, wählen Sie einen Bereich aus und optional ein Ablaufdatum (`YYYY-MM-DD`).
4. Generieren Sie den Schlüssel und kopieren Sie das Geheimnis sofort. Es wird nur einmal im Dialog angezeigt.
5. Die Liste zeigt danach einen Fingerabdruck wie `Qk7v…3xTa` (erste und letzte vier Zeichen), das Ablaufdatum und den Status an. Der gleiche Fingerabdruck erscheint im Audit-Protokoll.

### Deaktivieren oder Löschen {/* #disable-or-delete */}

Verwenden Sie das Kontrollkästchen in der Spalte **Aktionen**, um einen Schlüssel zu deaktivieren, ohne ihn zu löschen. Deaktivierte Schlüssel können sich nicht authentifizieren. Aktivieren Sie den Schlüssel erneut, indem Sie das Kontrollkästchen erneut ankreuzen. Abgelaufene Schlüssel können nicht aktiviert werden; erstellen Sie stattdessen einen neuen Schlüssel. Löschen entfernt den Schlüssel dauerhaft.

### Ablauf {/* #expiry */}

Ein optionales Ablaufdatum ist der letzte Kalendertag, an dem der Schlüssel noch gültig ist. Er läuft um **23:59:59 an diesem Tag in der lokalen Zeitzone des Browsers** ab, nicht um Mitternacht am Anfang des Tages.

Die Auswahl von `2026-12-01` erstellt `2026-12-01T23:59:59` lokal, speichert diesen Zeitpunkt dann als UTC. Für einen Browser in UTC+1 ist dies `2026-12-01T22:59:59.000Z`. Der Schlüssel bleibt gültig bis zum 1. Dezember und wird ab 23:59:59 Uhr Ortszeit als abgelaufen behandelt (`expires_at <= now`). Die API-Schlüssel-Tabelle zeigt das Ablaufdatum an (oder **Nie**, wenn keines gesetzt wurde). Nach diesem Zeitpunkt ändert sich das Status-Badge zu **Abgelaufen** (grau); abgelaufene Schlüssel können sich nicht authentifizieren, auch wenn sie aktiviert geblieben sind.

## Verwendung eines Schlüssels {/* #using-a-key */}

Duplicati kann keine benutzerdefinierten Header festlegen. Fügen Sie den Schlüssel in die Berichts-URL ein:

```bash
--send-http-json-urls=https://your-host/api/upload?api_key=YOUR_KEY
```

Homepage-Widgets können denselben Abfrageparameter verwenden:

```yaml
url: http://your-host/api/summary?api_key=YOUR_READ_KEY
```

Clients, die Header senden können, können stattdessen `X-Api-Key` oder `Authorization: Bearer` verwenden. Abfragezeichenfolgen-Schlüssel erscheinen in den Zugriffsprotokollen des Reverse-Proxys.

## Schlüssel erforderlich {/* #require-keys */}

Der **API-Schlüssel für externe APIs erfordern** Schalter ist standardmäßig aus. Während er aus ist, sind Anfragen ohne Schlüssel erlaubt. Wenn ein Client dennoch einen Schlüssel sendet, wird ein gültiger Schlüssel mit passendem Bereich akzeptiert und aufgezeichnet; ein ungültiger, deaktivierter, abgelaufener oder falscher Bereichsschlüssel wird ignoriert und die Anfrage ist weiterhin erlaubt. Wenn Sie den Schalter einschalten, geben die vier externen Daten-APIs `401` ohne einen gültigen Schlüssel zurück (und lehnen ungültige Schlüssel ab). Aktivieren Sie zuerst mindestens einen Hochladeschlüssel und einen Leseschlüssel, oder Duplicati-Hochladungen und Homepage-Widgets werden gestoppt. Änderungen werden automatisch gespeichert.

## Externer API-Schutz {/* #external-api-protection */}

Die gleiche Seite kann API-Schlüssel für die öffentlichen Hochladen- und Lesen-APIs erfordern und konfiguriert eine maximale Körpergröße (Standard 5 MB) und pro-IP-Datenratenlimits für `/api/upload`. Größe und Datenratenlimits gelten auch, wenn Schlüssel optional sind, und sind die Hauptverteidigung gegen Überflutung. Schalter und Limitfelder werden automatisch gespeichert; es gibt keinen separaten Speichern-Button.

Siehe auch [IP-Zulassungsliste](ip-allowlist-settings.md). IP-Zulassungsliste und API-Schlüssel sind unabhängige Funktionen; Sie können entweder eine oder beide zusammen verwenden. Das Aktivieren beider Funktionen erhöht die Sicherheit, indem der Zugriff auf die IP-Adresse beschränkt wird und ein API-Schlüssel erforderlich ist.
