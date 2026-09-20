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

1. Cliquez sur l'icône de modification <IconButton icon="lucide:edit" /> à côté de l'utilisateur
2. Modifiez l'une des informations suivantes :
   - **Nom d'utilisateur** : Modifier le nom d'utilisateur (doit être unique)
   - **Admin** : Activer/désactiver les privilèges d'administrateur
   - **Exiger le changement de mot de passe** : Activer/désactiver l'exigence de changement de mot de passe
3. Cliquez sur <IconButton icon="lucide:check" label="Enregistrer les modifications" />.

## Réinitialisation du mot de passe d'un utilisateur {/* #resetting-a-user-password */}

1. Cliquez sur l'icône de clé <IconButton icon="lucide:key-round" /> à côté de l'utilisateur
2. Confirmez la réinitialisation du mot de passe
3. Un nouveau mot de passe temporaire sera généré et affiché
4. Copiez le mot de passe et transmettez-le à l'utilisateur de manière sécurisée

## Suppression d'un utilisateur {/* #deleting-a-user */}

1. Cliquez sur l'icône de suppression <IconButton icon="lucide:trash-2" /> à côté de l'utilisateur
2. Confirmez la suppression dans la boîte de dialogue. **La suppression d'un utilisateur est permanente et ne peut pas être annulée.**

## Verrouillage de compte {/* #account-lockout */}

Les comptes sont automatiquement verrouillés après plusieurs tentatives de connexion échouées :
- **Seuil de verrouillage** : 5 tentatives échouées
- **Durée de verrouillage** : 15 minutes
- Les comptes verrouillés ne peuvent pas se connecter avant l'expiration de la période de verrouillage

## Récupération de l'accès administrateur {/* #recovering-admin-access */}

Si vous avez perdu votre mot de passe administrateur ou si vous avez été bloqué hors de votre compte, vous pouvez récupérer l'accès à l'aide du script de récupération administrateur. Consultez le guide [Récupération de compte administrateur](../admin-recovery.md) pour obtenir des instructions détaillées sur la récupération de l'accès administrateur dans les environnements Docker.

Si le navigateur affiche **Accès refusé** (HTTP 403) avant le formulaire de connexion, récupérez avec [Verrouillé par la liste d'adresses IP autorisées](../troubleshooting.md#locked-out-by-ip-allowlist) à la place.
