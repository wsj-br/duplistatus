# Utilisateurs {/* #users */}

Gérer les comptes d'utilisateurs, les autorisations et le contrôle d'accès pour **duplistatus**. Cette section permet aux administrateurs de créer, modifier et supprimer des comptes d'utilisateurs.

![Gestion des utilisateurs](../../assets/screen-settings-users.png)

>[!TIP] 
>Le compte par défaut `admin` peut être supprimé. Pour ce faire, créez d'abord un nouvel utilisateur administrateur, connectez-vous avec ce compte,
> puis supprimez le compte `admin`.
>
> Le mot de passe par défaut pour le compte `admin` est `Duplistatus09`. Vous devrez le modifier lors de votre première connexion.

## Accéder à la gestion des utilisateurs {/* #accessing-user-management */}

Vous pouvez accéder à la section Gestion des utilisateurs de deux manières :

1. **À partir du menu utilisateur** : Cliquez sur <IconButton icon="lucide:user" label="nom d'utilisateur" /> dans la [barre d'outils de l'application](../overview.md#application-toolbar) et sélectionnez "Utilisateurs Admin".

2. **À partir des paramètres** : Cliquez sur <IconButton icon="lucide:settings"/> et **Utilisateurs** dans la barre latérale des paramètres

## Créer un nouvel utilisateur {/* #creating-a-new-user */}

1. Cliquez sur le bouton <IconButton icon="lucide:plus" label="Ajouter un utilisateur"/>
2. Saisissez les détails de l'utilisateur :
   - **Nom d'utilisateur** : Doit comporter entre 3 et 50 caractères, être unique, insensible à la casse
   - **Admin** : Cochez pour accorder les privilèges d'administrateur
   - **Exiger le changement de mot de passe** : Cochez pour obliger le changement de mot de passe lors de la première connexion
   - **Mot de passe** : 
     - Option 1 : Cochez "Générer automatiquement le mot de passe" pour créer un mot de passe temporaire sécurisé
     - Option 2 : Décochez et saisissez un mot de passe personnalisé
3. Cliquez sur <IconButton icon="lucide:user-plus" label="Créer un utilisateur" />.

## Modification d'un utilisateur {/* #editing-a-user */}

1. Cliquez sur l'icône d'édition <IconButton icon="lucide:edit" /> à côté de l'utilisateur
2. Modifiez l'un des éléments suivants :
   - **Nom d'utilisateur** : Modifiez le nom d'utilisateur (doit être unique)
   - **Admin** : Basculez les privilèges d'administrateur. Activer cette option donne accès à tous les serveurs et efface une liste de serveurs personnalisée. La désactiver réinitialise l'accès à tous les serveurs
   - **Exiger le changement de mot de passe** : Basculez l'obligation de changement de mot de passe
3. Cliquez sur <IconButton icon="lucide:check" label="Enregistrer les modifications" />.

## Réinitialisation du mot de passe d'un utilisateur {/* #resetting-a-user-password */}

1. Cliquez sur l'icône de clé <IconButton icon="lucide:key-round" /> à côté de l'utilisateur
2. Un mot de passe suggéré est déjà renseigné et visible. Le modifier masque le mot de passe ; utilisez l'icône d'affichage pour l'afficher à nouveau, puis le copier
3. **Exiger le changement de mot de passe à la prochaine connexion** est coché par défaut. Décochez cette option si l'utilisateur doit conserver ce mot de passe
4. Cliquez sur **Réinitialiser le mot de passe**. Le mot de passe n'est plus affiché

## Suppression d'un utilisateur {/* #deleting-a-user */}

1. Cliquez sur l'icône de suppression <IconButton icon="lucide:trash-2" /> à côté de l'utilisateur
2. Confirmez la suppression dans la boîte de dialogue. **La suppression d'un utilisateur est permanente et ne peut pas être annulée.**

## Visibilité des serveurs {/* #server-visibility */}

Les administrateurs voient toujours tous les serveurs. Dans la liste des utilisateurs, **Tous les serveurs** est un commutateur. Laissez-le activé pour chaque serveur actuel et futur. Désactivez-le pour développer une ligne et choisir des serveurs. La case à cocher de l'en-tête sélectionne ou efface les lignes visibles. Enregistrer affiche chaque serveur sélectionné sous forme d'alias (nom), avec une icône d'édition pour modifier la liste. Un nouveau serveur reste masqué jusqu'à ce qu'il soit coché. N'en cocher aucun signifie que l'utilisateur ne voit aucun serveur. Le tableau de bord, les détails du serveur, l'historique des sauvegardes, les graphiques et les listes de paramètres n'incluent alors que ces serveurs. Un lien direct ou une requête API pour un autre serveur est traité comme introuvable. Les clés API externes ne sont pas limitées par cette autorisation.

## Verrouillage de compte {/* #account-lockout */}

Les comptes sont automatiquement verrouillés après plusieurs tentatives de connexion échouées :
- **Seuil de verrouillage** : 5 tentatives échouées
- **Durée de verrouillage** : 15 minutes
- Les comptes verrouillés ne peuvent pas se connecter avant l'expiration de la période de verrouillage

## Récupération de l'accès administrateur {/* #recovering-admin-access */}

Si vous avez perdu votre mot de passe administrateur ou si vous avez été bloqué hors de votre compte, vous pouvez récupérer l'accès à l'aide du script de récupération administrateur. Consultez le guide [Récupération de compte administrateur](../admin-recovery.md) pour obtenir des instructions détaillées sur la récupération de l'accès administrateur dans les environnements Docker.

Si le navigateur affiche **Accès refusé** (HTTP 403) avant le formulaire de connexion, récupérez avec [Verrouillé par la liste d'adresses IP autorisées](../troubleshooting.md#locked-out-by-ip-allowlist) à la place.
