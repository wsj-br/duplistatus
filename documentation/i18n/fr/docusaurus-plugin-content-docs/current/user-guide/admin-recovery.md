# Récupération du compte Admin {/* #admin-account-recovery */}

Récupérez l'accès administrateur à **duplistatus** lorsque vous avez perdu votre mot de passe ou que vous avez été verrouillé hors de votre compte. Ce guide couvre l'utilisation du script de récupération admin dans les environnements Docker.

Si le navigateur affiche **Accès refusé** (HTTP 403) avant le formulaire de connexion, la [liste d'adresses IP autorisées admin](settings/ip-allowlist-settings.md) bloque la requête. Utilisez [Verrouillé par la liste d'adresses IP autorisées](troubleshooting.md#locked-out-by-ip-allowlist) au lieu de ce script.

## Utilisation du script dans Docker {/* #using-the-script-in-docker */}

Le Dockerfile inclut le répertoire `scripts` et un wrapper shell pratique.

```bash
# Execute inside the running container using the wrapper
docker exec -it duplistatus /app/admin-recovery <username> <new-password>
```

**Exemple :**

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

## Dépannage {/* #troubleshooting */}

Si vous rencontrez des problèmes avec le script de récupération :

1. **Vérifier que le conteneur est en cours d'exécution** : Vérifiez que le conteneur est en cours d'exécution avec `docker ps`
2. **Vérifier la disponibilité du script** : Vérifiez que le script existe dans le conteneur avec `docker exec -it duplistatus ls -la /app/admin-recovery`
3. **Vérifier les journaux du conteneur** : Vérifiez les erreurs avec `docker logs duplistatus`
4. **Vérifier le nom d'utilisateur** : Assurez-vous que le nom d'utilisateur existe dans la base de données
5. **Vérifier le format du mot de passe** : Assurez-vous que le nouveau mot de passe répond à toutes les exigences

Si les problèmes persistent, consultez le guide [Dépannage](troubleshooting.md) pour obtenir plus d'aide.
