# IP-Zulassungsliste {/* #ip-allowlist */}

Administratoren können einschränken, wer auf das Admin-Interface und die externen Daten-APIs zugreifen kann. Die beiden Listen sind unabhängig voneinander. Beide sind standardmäßig deaktiviert.

![IP-Zulassungsliste](../../assets/screen-settings-ip-allowlist.png)

Die Anwendung liest die TCP-Peer-Adresse aus einem internen Header, der von `scripts/peer-ip.cjs` gesetzt wird. Ein Client kann diesen Header nicht fälschen. **Erkannte IP** zeigt die TCP **Peer-IP** und die **IP-Zulassungsliste**, die für die Zugriffsentscheidungen verwendet wird (sie stimmen überein, es sei denn, es gelten vertrauenswürdige Proxy-Header).

Abgelehnte Anfragen geben HTTP 403 zurück (`IP_NOT_ALLOWED` auf API-Pfaden). Sie werden nicht im Audit-Protokoll geschrieben. Eine rate-begrenzte `console.warn`-Zeile wird an die Anwendungs-Standardausgabe ausgegeben (zum Beispiel `docker logs`) — maximal eine Protokollzeile pro Client-IP und Oberfläche (Admin, extern oder Probe) pro Minute und zehn pro Stunde — damit Scanner die Protokolle nicht überfluten können.

## Vertrauenswürdige Proxies {/* #trusted-proxies */}

Aktivieren Sie **Reverse-Proxy-Header vertrauen** nur, wenn duplistatus nicht ohne Reverse-Proxy erreichbar ist, der `X-Forwarded-For` / `X-Real-IP` **überschreibt** (nicht anhängt). Fügen Sie jede Proxy-CIDR mit **Hinzufügen** hinzu (oder fügen Sie eine komma- oder zeilenweise getrennte Liste ein). Einträge erscheinen als entfernbare Chips. Wenn der TCP-Peer nicht in dieser Liste enthalten ist, werden weitergeleitete Header ignoriert.

## Admin-Interface {/* #admin-interface */}

Wenn aktiviert, akzeptieren Seiten, Login, CSRF und Sitzungs-APIs nur die aufgelisteten CIDRs. Fügen Sie Einträge mit **Hinzufügen** hinzu; Ihre aktuelle **IP-Zulassungsliste** wird als **aktuelle IP** markiert, wenn sie in der Liste enthalten ist. **127.0.0.1** und **::1** sind standardmäßig enthalten und können nicht entfernt werden. **Aktuelle IP hinzufügen** und **Letzte Admin-Login-IPs** (aus dem Audit-Protokoll) bieten schnelle Vorschläge. Sie können diese Liste nicht aktivieren, es sei denn, Ihre aktuelle IP ist bereits enthalten (oder Sie verbinden sich von der Schleife). Ein Sperren kann mit:

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

oder durch Hinzufügen Ihrer CIDR zu `ADMIN_IP_ALLOWLIST` wiederhergestellt werden. Vollständige Wiederherstellungsschritte (Docker neu erstellen, dann Einstellungen beheben und die Überschreibung entfernen) finden Sie unter [Gesperrt durch IP-Zulassungsliste](../troubleshooting.md#locked-out-by-ip-allowlist).

## Externe APIs {/* #external-apis */}

Wenn aktiviert, akzeptieren `/api/upload`, `/api/summary` und `/api/lastbackup*` nur die aufgelisteten CIDRs.

`/api/health` und `/api/ping` sind nicht allein auf der externen Liste (der Dashboard-Ping kommt von der Admin-UI-IP). Wenn **eine** Zulassungsliste aktiviert ist, akzeptieren diese Proben Schleife (`127.0.0.1`, `::1`) und CIDRs aus der **Admin- oder externen** Liste. Nicht aufgelistete IPs erhalten HTTP 403. Wenn beide Listen deaktiviert sind, bleiben die Proben öffentlich.

Nicht-Schleifen-Probenanfragen werden auch rate-begrenzt (HTTP 429, `PROBE_RATE_LIMITED`): `/api/ping` 60/Minute und 600/Stunde; `/api/health` 30/Minute und 120/Stunde. In-Container-Docker-Checks treffen auf localhost und werden nie gedrosselt. App-Ebene-Limits stoppen keine volumetrische Verbindungsflut; legen Sie dies auf dem Reverse-Proxy an.

Diese Liste ist der Schutz, den Sie verwenden, wenn API-Schlüssel nicht erforderlich sind. Fügen Sie CIDRs wie die Admin-Liste als Chips hinzu. **127.0.0.1** und **::1** sind standardmäßig enthalten und können nicht entfernt werden. **Kürzlich hochgeladene Quell-IPs** aus dem Audit-Protokoll werden als Schnellhinzufügung angeboten.

Wenn sowohl diese Zulassungsliste als auch API-Schlüssel erforderlich sind, muss eine Anfrage **beide** erfüllen.

## Umgebungsüberschreibungen {/* #environment-overrides */}

| Variable | Zweck |
|----------|-------|
| `IP_TRUSTED_PROXIES` | Komma-getrennte vertrauenswürdige Proxy-CIDRs (impliziert auch trust-proxy) |
| `ADMIN_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `ADMIN_IP_ALLOWLIST` | Komma-getrennte CIDRs |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `EXTERNAL_API_IP_ALLOWLIST` | Komma-getrennte CIDRs |

Umgebungsvariablen überschreiben die Datenbank, sodass ein Sperren ohne die Benutzeroberfläche wiederhergestellt werden kann.
