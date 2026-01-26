# Récupération du compte Admin {#admin-account-recovery}

Récupérez l'accès administrateur à **duplistatus** quand vous avez perdu votre Mot de passe ou été Verrouillé de votre compte. Ce guide couvre l'utilisation du script de récupération Admin dans les environnements Docker.

## Utilisation du script dans Docker {#using-the-script-in-docker}

Le Dockerfile inclut le répertoire `scripts` et un wrapper shell pratique.

```bash
# Exécuter à l'intérieur du conteneur en cours d'exécution en utilisant le wrapper {#execute-inside-the-running-container-using-the-wrapper}
docker exec -it duplistatus /app/admin-recovery <username> <new-password>
```

**Exemple:**

```bash
docker exec -it duplistatus /app/admin-recovery Admin NewPassword123
```

## Dépannage {#troubleshooting}

Si vous rencontrez des problèmes avec le script de récupération:

1. **Vérifier que le conteneur est en cours d'exécution**: Vérifier que le conteneur est en cours d'exécution avec `docker ps`
2. **Vérifier la disponibilité du script**: Vérifier que le script existe dans le conteneur avec `docker exec -it duplistatus ls -la /app/admin-recovery`
3. **Vérifier les journaux du conteneur**: Vérifier les Erreurs avec `docker logs duplistatus`
4. **Vérifier le Nom d'utilisateur**: Assurez-vous que le Nom d'utilisateur existe dans la base de données
5. **Vérifier le format du Mot de passe**: Assurez-vous que le Nouveau mot de passe répond à Tous les exigences

Si les problèmes persistent, consultez le guide [Dépannage](troubleshooting.md) pour plus d'Aide.

