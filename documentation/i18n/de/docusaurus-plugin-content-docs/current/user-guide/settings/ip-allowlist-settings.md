# IP-Zulassungsliste {#ip-allowlist}

Administratoren können beschränken, wer auf die Administrationsinterface und die externen Daten-APIs zugreifen kann. Die beiden Listen sind unabhängig voneinander. Beide sind standardmäßig deaktiviert.

![IP-Zulassungsliste](../../assets/screen-settings-ip-allowlist.png)

Die Anwendung liest die TCP-Peer-Adresse aus einem internen Header, der von `scripts/peer-ip.cjs` gesetzt wird. Ein Client kann diesen Header nicht fälschen. **Erkannte IP** zeigt die TCP- **Peer-IP** und die **IP zur Whitelist**, die für Zugriffsentscheidungen verwendet wird (sie stimmen überein, es sei denn, vertrauenswürdige Proxy-Header gelten).

## Vertrauenswürdige Proxies {#trusted-proxies}

Aktivieren Sie **Reverse-Proxy-Header vertrauen** nur, wenn duplistatus nicht ohne Reverse-Proxy erreichbar ist, der `X-Forwarded-For` / `X-Real-IP` **überschreibt** (nicht anhängt). Fügen Sie jede Proxy-CIDR mit **Hinzufügen** hinzu (oder fügen Sie eine kommagetrennte oder zeilenumbruchgetrennte Liste ein). Einträge erscheinen als entfernbare Chips. Wenn der TCP-Peer nicht in der Liste ist, werden weitergeleitete Header ignoriert.

## Administrationsinterface {#admin-interface}

Wenn aktiviert, akzeptieren Seiten, Anmeldung, CSRF und Sitzungs-APIs nur die aufgelisteten CIDRs. Fügen Sie Einträge mit **Hinzufügen** hinzu; Ihre aktuelle **IP zur Whitelist** wird als **aktuelle IP** markiert, wenn sie in der Liste ist. **Aktuelle IP hinzufügen** und **Letzte Admin-Login-IPs** (aus dem Audit-Protokoll) bieten schnelle Vorschläge. Sie können diese Liste nicht aktivieren, es sei denn, Ihre aktuelle IP ist bereits enthalten (oder Sie verbinden sich von Loopback). Ein Sperren kann mit folgendem wiederhergestellt werden:

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

oder durch Hinzufügen Ihrer CIDR zu `ADMIN_IP_ALLOWLIST`. Die vollständigen Wiederherstellungsschritte (Docker neu erstellen, dann Einstellungen korrigieren und die Überschreibung entfernen) finden Sie in [Durch IP-Zulassungsliste gesperrt](../troubleshooting.md#locked-out-by-ip-allowlist).

## Externe APIs {#external-apis}

Wenn aktiviert, akzeptieren `/api/upload`, `/api/summary` und `/api/lastbackup*` nur die aufgelisteten CIDRs. `/api/health` und `/api/ping` bleiben geöffnet, damit Docker-Health-Checks und der Connectivity-Probe weiter funktionieren.

Diese Liste ist der Schutz, den Sie verwenden, wenn API-Schlüssel nicht erforderlich sind. Fügen Sie CIDRs wie die Admin-Liste als Chips hinzu. **Kürzlich hochgeladene Quell-IPs** aus dem Audit-Protokoll werden als Vorschläge zum schnellen Hinzufügen angeboten.

Wenn sowohl diese Zulassungsliste als auch API-Schlüssel erforderlich sind, muss eine Anfrage **beide** erfüllen.

## Umgebungsüberschreibungen {#environment-overrides}

| Variable | Zweck |
|----------|-------|
| `IP_TRUSTED_PROXIES` | Komma-getrennte vertrauenswürdige Proxy-CIDRs (impliziert auch trust-proxy) |
| `ADMIN_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `ADMIN_IP_ALLOWLIST` | Komma-getrennte CIDRs |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `EXTERNAL_API_IP_ALLOWLIST` | Komma-getrennte CIDRs |

Umgebungswerte überschreiben die Datenbank, sodass ein Sperren ohne die Benutzeroberfläche wiederhergestellt werden kann.
