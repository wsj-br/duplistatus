# IP-Zulassungsliste {/* #ip-allowlist */}

Administratoren können einschränken, wer auf das Administrationsinterface und die externen Daten-APIs zugreift. Die beiden Listen sind unabhängig voneinander. Beide sind standardmäßig ausgeschaltet.

![IP-Zulassungsliste](../../assets/screen-settings-ip-allowlist.png)

Die Anwendung liest die TCP-Peer-Adresse aus einem internen Header, der von `scripts/peer-ip.cjs` gesetzt wird. Ein Client kann diesen Header nicht fälschen. **Erkannte IP** zeigt die TCP-**Peer-IP** und die **IP zur Whitelist hinzufügen**, die für Zugriffsentscheidungen verwendet wird (sie stimmen überein, es sei denn, vertrauenswürdige Proxy-Header werden angewendet).

Abgelehnte Anfragen geben HTTP 403 zurück (`IP_NOT_ALLOWED` bei API-Pfaden). Sie werden nicht ins Audit-Protokoll geschrieben. Eine ratenbegrenzte `console.warn`-Zeile wird auf den Standardausgang der Anwendung ausgegeben (zum Beispiel `docker logs`) — maximal ein Protokoll pro Client-IP und Oberfläche (Admin, extern oder Probe) pro Minute und zehn pro Stunde — damit Scanner die Protokolle nicht überfluten können.

## Vertrauenswürdige Proxies {/* #trusted-proxies */}

**Reverse-Proxy-Header vertrauen** nur dann aktivieren, wenn duplistatus nur über einen Reverse-Proxy erreichbar ist, der `X-Forwarded-For` / `X-Real-IP` **überschreibt** (nicht anhängt). Fügen Sie jede Proxy-CIDR mit **Hinzufügen** hinzu (oder fügen Sie eine durch Kommas oder Zeilenumbrüche getrennte Liste ein). Einträge erscheinen als entfernbare Chips. Wenn sich der TCP-Peer nicht in dieser Liste befindet, werden weitergeleitete Header ignoriert.

## Administrationsinterface {/* #admin-interface */}

Wenn aktiviert, akzeptieren Seiten, Login, CSRF- und Sitzungs-APIs nur aufgelistete CIDRs. Fügen Sie Einträge mit **Hinzufügen** hinzu; Ihre aktuelle **IP zur Whitelist hinzufügen** wird als **aktuelle IP** gekennzeichnet, wenn sie in der Liste steht. **127.0.0.1** und **::1** sind standardmäßig enthalten und können nicht entfernt werden. **Aktuelle IP hinzufügen** und **Letzte Admin-Login-IPs** (aus dem Audit-Protokoll) bieten schnelle Vorschläge. Sie können diese Liste nicht aktivieren, solange Ihre aktuelle IP noch nicht enthalten ist (oder Sie über Loopback verbunden sind). Ein Aussperrung kann mit folgendem Befehl behoben werden:

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

oder indem Sie Ihre CIDR zu `ADMIN_IP_ALLOWLIST` hinzufügen. Vollständige Wiederherstellungsschritte (Docker neu erstellen, dann Einstellungen korrigieren und die Überschreibung entfernen) finden Sie unter [Von IP-Zulassungsliste ausgesperrt](../troubleshooting.md#locked-out-by-ip-allowlist).

## Externe APIs {/* #external-apis */}

Wenn aktiviert, akzeptieren `/api/upload`, `/api/summary` und `/api/lastbackup*` nur aufgelistete CIDRs.

`/api/health` und `/api/ping` stehen nicht allein auf der externen Liste (der Dashboard-Ping kommt von der Admin-UI-IP). Wenn **eine** der Zulassungslisten aktiviert ist, akzeptieren diese Prüfungen Loopback (`127.0.0.1`, `::1`) und CIDRs aus der **Admin- oder externen** Liste. Nicht aufgeführte IPs erhalten HTTP 403. Wenn beide Listen ausgeschaltet sind, bleiben die Prüfungen öffentlich.

Nicht-Loopback-Prüfanforderungen sind ebenfalls ratenbegrenzt (HTTP 429, `PROBE_RATE_LIMITED`): `/api/ping` 60 pro Minute und 600 pro Stunde; `/api/health` 30 pro Minute und 120 pro Stunde. Docker-Überprüfungen innerhalb des Containers greifen auf Localhost zu und werden niemals gedrosselt. Anwendungsebene-Begrenzungen verhindern keinen massiven Verbindungsüberlauf; dies sollte im Reverse-Proxy erfolgen.

Diese Liste ist der Schutz, der verwendet werden soll, wenn API-Schlüssel nicht erforderlich sind. Fügen Sie CIDRs als Chips wie in der Admin-Liste hinzu. **127.0.0.1** und **::1** sind standardmäßig enthalten und können nicht entfernt werden. **Kürzlich hochgeladene Quell-IPs** aus dem Audit-Protokoll werden als schnelle Hinzufügungsvorschläge angeboten.

Wenn sowohl diese Zulassungsliste als auch API-Schlüssel erforderlich sind, muss eine Anfrage **beide** bestehen.

## Umgebungs-Überschreibungen {/* #environment-overrides */}

| Variable | Zweck |
|----------|---------|
| `IP_TRUSTED_PROXIES` | Durch Kommas getrennte vertrauenswürdige Proxy-CIDRs (impliziert auch trust-proxy) |
| `ADMIN_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `ADMIN_IP_ALLOWLIST` | Durch Kommas getrennte CIDRs |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `EXTERNAL_API_IP_ALLOWLIST` | Komma-getrennte CIDRs |

Umgebungswerte überschreiben die Datenbank, sodass ein Aussperrungszustand ohne Benutzeroberfläche wiederherstellbar ist.
