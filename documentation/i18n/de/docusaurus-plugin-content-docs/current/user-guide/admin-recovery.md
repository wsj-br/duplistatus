---
translation_last_updated: '2026-03-01T00:45:11.368Z'
source_file_mtime: '2026-02-16T00:30:39.431Z'
source_file_hash: 091dcbb5c0bb63c5
translation_language: de
source_file_path: user-guide/admin-recovery.md
---
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

1. **Container-Ausführung bestätigen**: Prüfen Sie, dass der Container mit `docker ps` ausgeführt wird
2. **Skriptverfügbarkeit prüfen**: Bestätigen Sie, dass das Skript im Container mit `docker exec -it duplistatus ls -la /app/admin-recovery` vorhanden ist
3. **Container-Protokolle überprüfen**: Prüfen Sie auf Fehler mit `docker logs duplistatus`
4. **Benutzername bestätigen**: Stellen Sie sicher, dass der Benutzername in der Datenbank vorhanden ist
5. **Passwortformat prüfen**: Stellen Sie sicher, dass das neue Passwort alle Anforderungen erfüllt

Wenn Probleme weiterhin bestehen, lesen Sie die [Troubleshooting](troubleshooting.md)-Anleitung für weitere Hilfe.
