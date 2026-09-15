# Admin-Konto-Wiederherstellung {/* #admin-account-recovery */}

Stellen Sie den Administrator-Zugriff auf **duplistatus** wieder her, wenn Sie Ihr Passwort verloren haben oder von Ihrem Konto gesperrt wurden. Diese Anleitung beschreibt die Verwendung des Admin-Wiederherstellungsskripts in Docker-Umgebungen.

Wenn der Browser **Zugriff verweigert** (HTTP 403) anzeigt, bevor das Anmeldeformular erscheint, blockiert die [Admin-IP-Zulassungsliste](settings/ip-allowlist-settings.md) die Anfrage. Verwenden Sie stattdessen [Gesperrt durch IP-Zulassungsliste](troubleshooting.md#locked-out-by-ip-allowlist) anstatt dieses Skript.

## Verwendung des Skripts in Docker {/* #using-the-script-in-docker */}

Die Dockerfile enthält das `scripts`-Verzeichnis und ein bequemes Shell-Wrapper-Skript.

```bash
# Execute inside the running container using the wrapper
docker exec -it duplistatus /app/admin-recovery <username> <new-password>
```

**Beispiel:**

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

## Fehlerbehebung {/* #troubleshooting */}

Wenn Sie Probleme mit dem Wiederherstellungsskript haben:

1. **Prüfen Sie, ob der Container läuft**: Prüfen Sie, ob der Container läuft, mit `docker ps`
2. **Prüfen Sie die Skriptverfügbarkeit**: Stellen Sie sicher, dass das Skript im Container vorhanden ist, mit `docker exec -it duplistatus ls -la /app/admin-recovery`
3. **Überprüfen Sie die Container-Logs**: Suchen Sie nach Fehlern mit `docker logs duplistatus`
4. **Prüfen Sie den Benutzernamen**: Stellen Sie sicher, dass der Benutzername in der Datenbank existiert
5. **Prüfen Sie das Passwortformat**: Stellen Sie sicher, dass das neue Passwort alle Anforderungen erfüllt

Wenn die Probleme weiterhin bestehen, sehen Sie sich die [Fehlerbehebung](troubleshooting.md)-Anleitung für weitere Hilfe an.
