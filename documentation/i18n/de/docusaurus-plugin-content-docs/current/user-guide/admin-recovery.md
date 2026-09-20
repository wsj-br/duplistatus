# Administratorzugang wiederherstellen {/* #admin-account-recovery */}

Stellen Sie den Administratorzugriff auf **duplistatus** wieder her, wenn Sie Ihr Passwort verloren haben oder aus Ihrem Konto ausgesperrt wurden. Diese Anleitung behandelt die Verwendung des Admin-Wiederherstellungsskripts in Docker-Umgebungen.

Wenn der Browser **Zugriff verweigert** (HTTP 403) anzeigt, bevor das Anmeldeformular erscheint, blockiert die [Admin-IP-Zulassungsliste](settings/ip-allowlist-settings.md) die Anfrage. Verwenden Sie stattdessen [Von IP-Zulassungsliste ausgesperrt](troubleshooting.md#locked-out-by-ip-allowlist) anstelle dieses Skripts.

## Verwendung des Skripts in Docker {/* #using-the-script-in-docker */}

Die Dockerfile enthält das `scripts`-Verzeichnis und einen praktischen Shell-Wrapper.

```bash
# Execute inside the running container using the wrapper
docker exec -it duplistatus /app/admin-recovery <username> <new-password>
```

**Beispiel:**

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

## Problembehandlung {/* #troubleshooting */}

Wenn Sie Probleme mit dem Wiederherstellungsskript haben:

1. **Überprüfen Sie, ob der Container läuft**: Prüfen Sie, ob der Container mit `docker ps` läuft
2. **Überprüfen Sie die Skriptverfügbarkeit**: Stellen Sie sicher, dass das Skript im Container mit `docker exec -it duplistatus ls -la /app/admin-recovery` vorhanden ist
3. **Überprüfen Sie die Container-Protokolle**: Suchen Sie nach Fehlern mit `docker logs duplistatus`
4. **Überprüfen Sie den Benutzernamen**: Stellen Sie sicher, dass der Benutzername in der Datenbank existiert
5. **Überprüfen Sie das Passwortformat**: Stellen Sie sicher, dass das neue Passwort alle Anforderungen erfüllt

Wenn Probleme weiterbestehen, lesen Sie die [Fehlerbehebung](troubleshooting.md)-Anleitung für weitere Hilfe.
