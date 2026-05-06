---
translation_last_updated: '2026-05-06T23:21:41.487Z'
source_file_mtime: '2026-05-06T23:18:51.430Z'
source_file_hash: 715719058387c53e24d6ec27814f20fb52349ff40f5e59310d6965344bb8f16a
translation_language: fr
source_file_path: documentation/docs/user-guide/admin-recovery.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Récupération du compte Admin {#admin-account-recovery}

Récupérer l'accès administrateur à **duplistatus** quand vous avez perdu votre mot de passe ou avez été verrouillé de votre compte. Ce guide couvre l'utilisation du script de récupération admin dans les environnements Docker.

## Utilisation du script dans Docker {#using-the-script-in-docker}

Le Dockerfile inclut le répertoire `scripts` et un wrapper shell pratique.

```bash
# Execute inside the running container using the wrapper
docker exec -it duplistatus /app/admin-recovery <username> <new-password>
```

**Exemple :**

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

## Dépannage {#troubleshooting}

Si vous rencontrez des problèmes avec le script de récupération :

1. **Vérifier que le conteneur est en cours d'exécution** : Vérifiez que le conteneur est en cours d'exécution avec `docker ps`
2. **Vérifier la disponibilité du script** : Vérifiez que le script existe dans le conteneur avec `docker exec -it duplistatus ls -la /app/admin-recovery`
3. **Examiner les journaux du conteneur** : Recherchez les erreurs avec `docker logs duplistatus`
4. **Vérifier le nom d'utilisateur** : Assurez-vous que le nom d'utilisateur existe dans la base de données
5. **Vérifier le format du mot de passe** : Assurez-vous que le nouveau mot de passe respecte toutes les exigences

Si les problèmes persistent, consultez le guide [Troubleshooting](troubleshooting.md) pour plus d'aide.
