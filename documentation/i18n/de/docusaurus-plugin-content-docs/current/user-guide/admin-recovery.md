# Admin-Kontowiederherstellung {#admin-account-recovery}

Stellen Sie den Administrator-Zugriff auf **duplistatus** wieder her, wenn Sie Ihr Passwort vergessen haben oder aus Ihrem Konto gesperrt wurden. Diese Anleitung behandelt die Verwendung des Admin-Wiederherstellungsskripts in Docker-Umgebungen.

## Verwendung des Skripts in Docker {#using-the-script-in-docker}

Die Dockerfile enthält das Verzeichnis `scripts` und einen praktischen Shell-Wrapper.

```bash
# Execute inside the running container using the wrapper
docker exec -it duplistatus /app/admin-recovery <username> <new-password>
```

**Beispiel:**

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

## Fehlerbehebung {#troubleshooting}

Wenn Sie auf Probleme mit dem Wiederherstellungsskript stoßen:

1. **Containerstatus überprüfen**: Stellen Sie sicher, dass der Container mit `docker ps` läuft
2. **Verfügbarkeit des Skripts prüfen**: Überprüfen Sie, ob das Skript im Container mit `docker exec -it duplistatus ls -la /app/admin-recovery` vorhanden ist
3. **Container-Logs überprüfen**: Suchen Sie nach Fehlern mit `docker logs duplistatus`
4. **Benutzernamen verifizieren**: Stellen Sie sicher, dass der Benutzername in der Datenbank existiert
5. **Passwortformat überprüfen**: Stellen Sie sicher, dass das neue Passwort alle Anforderungen erfüllt

Wenn Probleme weiterhin bestehen, lesen Sie die [Troubleshooting](troubleshooting.md)-Anleitung für weitere Hilfe.
