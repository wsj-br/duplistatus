# API-Schlüssel {/* #api-keys */}

Administratoren können bereichsspezifische API-Schlüssel für die externen HTTP-APIs erstellen, die duplicati und Homepage verwenden. Schlüssel sind standardmäßig optional, damit bestehende duplicati-Jobs weiterhin funktionieren.

![API-Schlüssel](../../assets/screen-settings-api-keys.png)

## Bereiche {/* #scopes */}

| Bereich | Endpunkte |
|-------|-----------|
| Upload | `POST /api/upload` |
| Lesen | `GET /api/summary`, `GET /api/lastbackup/:id`, `GET /api/lastbackups/:id` |

Ein Hochladenschlüssel kann nicht die Lese-APIs aufrufen, und ein Leseschlüssel kann keine Berichte hochladen.

## Einen Schlüssel erstellen {/* #creating-a-key */}

1. Öffnen Sie **Einstellungen → API-Schlüssel**.
2. Klicken Sie unten auf der API-Schlüssel-Karte auf **API-Schlüssel erstellen**.
3. Geben Sie einen Namen ein, wählen Sie einen Bereich aus und legen Sie optional ein Ablaufdatum fest (`YYYY-MM-DD`).
4. Generieren Sie den Schlüssel und kopieren Sie das Geheimnis sofort. Es wird nur einmal im Dialog angezeigt.
5. Die anschließende Liste zeigt einen Fingerabdruck wie `Qk7v…3xTa` (erste und letzte vier Zeichen), das Ablaufdatum und den Status. Derselbe Fingerabdruck erscheint im Audit-Protokoll.

### Deaktivieren oder Löschen {/* #disable-or-delete */}

Verwenden Sie das Kontrollkästchen in der Spalte **Aktionen**, um einen Schlüssel zu deaktivieren, ohne ihn zu löschen. Deaktivierte Schlüssel können sich nicht authentifizieren. Aktivieren Sie das Kontrollkästchen erneut, um den Schlüssel wieder zu aktivieren. Abgelaufene Schlüssel können nicht aktiviert werden; erstellen Sie stattdessen einen neuen Schlüssel. Löschen entfernt den Schlüssel dauerhaft.

### Ablauf {/* #expiry */}

Ein optionales Ablaufdatum ist der letzte Kalendertag, an dem der Schlüssel gültig bleibt. Er läuft um **23:59:59 an diesem Tag in der lokalen Zeitzone des Browsers** ab, nicht um Mitternacht am Beginn des Tages.

Die Auswahl von `2026-12-01` erstellt `2026-12-01T23:59:59` lokal und speichert diesen Zeitpunkt als UTC. Für einen Browser in UTC+1 ist dies `2026-12-01T22:59:59.000Z`. Der Schlüssel bleibt bis zum 1. Dezember gültig und wird ab 23:59:59 Ortszeit als abgelaufen behandelt (`expires_at <= now`). Die Tabelle der API-Schlüssel zeigt das Ablaufdatum an (oder **Nie**, wenn keines festgelegt wurde). Nach diesem Zeitpunkt ändert sich das Status-Badge zu **Abgelaufen** (grau); abgelaufene Schlüssel können sich nicht authentifizieren, selbst wenn sie aktiviert blieben.

## Verwendung eines Schlüssels {/* #using-a-key */}

duplicati kann keine benutzerdefinierten Header setzen. Fügen Sie den Schlüssel in die Berichts-URL ein:

```bash
--send-http-json-urls=https://your-host/api/upload?api_key=YOUR_KEY
```

Homepage-Widgets können denselben Abfrageparameter verwenden:

```yaml
url: http://your-host/api/summary?api_key=YOUR_READ_KEY
```

Clients, die Header senden können, dürfen stattdessen `X-Api-Key` oder `Authorization: Bearer` verwenden. Abfragezeichenketten-Schlüssel erscheinen in Reverse-Proxy-Zugriffsprotokollen.

## Schlüssel erforderlich {/* #require-keys */}

Der Schalter **API-Schlüssel für externe APIs erfordern** ist standardmäßig ausgeschaltet. Solange er ausgeschaltet ist, sind Anfragen ohne Schlüssel erlaubt. Wenn ein Client trotzdem einen Schlüssel sendet, wird ein gültiger schlüssel mit passendem Bereich akzeptiert und protokolliert; ein ungültiger, deaktivierter, abgelaufener oder falscher Bereichsschlüssel wird ignoriert und die Anfrage ist dennoch erlaubt. Wenn Sie den Schalter einschalten, geben die vier externen Daten-APIs `401` ohne gültigen Schlüssel zurück (und weisen ungültige Schlüssel zurück). Aktivieren Sie mindestens einen Hochladenschlüssel und einen Leseschlüssel, sonst werden duplicati-Uploads und Homepage-Widgets nicht funktionieren. Änderungen werden automatisch gespeichert.

## Externer API-Schutz {/* #external-api-protection */}

Die gleiche Seite kann API-Schlüssel für die öffentlichen Upload- und Read-APIs erfordern und konfiguriert eine maximale Body-Größe (Standard 5 MB) sowie pro IP-Adresse gültige Ratenbegrenzungen für `/api/upload`. Größen- und Ratenbegrenzungen gelten auch dann, wenn Schlüssel optional sind, und stellen die Hauptverteidigung gegen Überflutung dar. Schalter und Grenzwertfelder werden automatisch gespeichert; es gibt keinen separaten Speichern-Knopf.

Siehe auch [IP-Zulassungsliste](ip-allowlist-settings.md). Die IP-Zulassungsliste und API-Schlüssel sind unabhängige Funktionen; Sie können entweder eine oder beide zusammen verwenden. Die Aktivierung beider erhöht die Sicherheit, indem der Zugriff auf der Grundlage der IP-Adresse eingeschränkt wird und ein API-Schlüssel erforderlich ist.
