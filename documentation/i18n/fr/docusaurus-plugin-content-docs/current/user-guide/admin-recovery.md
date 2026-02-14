---
translation_last_updated: '2026-02-14T04:57:38.526Z'
source_file_mtime: '2026-02-01T03:16:19.470Z'
source_file_hash: 091dcbb5c0bb63c5
translation_language: fr
source_file_path: user-guide/admin-recovery.md
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

1. **Vérifier que le conteneur est en cours d'exécution** : Vérifiez que le conteneur s'exécute avec `docker ps`
2. **Vérifier la disponibilité du script** : Vérifiez que le script existe dans le conteneur avec `docker exec -it duplistatus ls -la /app/admin-recovery`
3. **Examiner les journaux du conteneur** : Vérifiez les erreurs avec `docker logs duplistatus`
4. **Vérifier le nom d'utilisateur** : Assurez-vous que le nom d'utilisateur existe dans la base de données
5. **Vérifier le format du mot de passe** : Assurez-vous que le nouveau mot de passe répond à tous les critères

Si les problèmes persistent, consultez le guide [Troubleshooting](troubleshooting.md) pour plus d'aide.
