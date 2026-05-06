---
translation_last_updated: '2026-05-06T23:21:56.160Z'
source_file_mtime: '2026-05-06T23:18:51.446Z'
source_file_hash: b1f073fc756bf469acd698513daa0acf449968820b163817769bb58e9e84a91a
translation_language: fr
source_file_path: documentation/docs/user-guide/settings/user-management-settings.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Utilisateurs {#users}

Gérez les comptes utilisateur, les autorisations et le contrôle d'accès pour **duplistatus**. Cette section permet aux administrateurs de créer, modifier et supprimer des comptes utilisateur.

![User Management](../../assets/screen-settings-users.png)

>[!TIP] 
>Le compte `admin` par défaut peut être supprimé. Pour ce faire, créez d'abord un nouvel utilisateur administrateur, connectez-vous avec ce compte, 
> puis supprimez le compte `admin`.
>
> Le mot de passe par défaut du compte `admin` est `Duplistatus09`. Vous serez tenu de le modifier lors de votre première connexion.

## Gestion des utilisateurs {#accessing-user-management}

Vous pouvez accéder à la section Gestion des utilisateurs de deux façons :

1. **À partir du Menu Utilisateur** : Cliquez sur <IconButton icon="lucide:user" label="username" /> dans la [Barre d'outils de l'Application](../overview.md#application-toolbar) et sélectionnez « Admin Utilisateurs ».

2. **À partir des Paramètres** : Cliquez sur <IconButton icon="lucide:settings"/> et **Utilisateurs** dans la barre latérale des paramètres

## Création d'un nouvel utilisateur {#creating-a-new-user}

1. Cliquez sur le bouton <IconButton icon="lucide:plus" label="Add User"/>
2. Saisissez les détails de l'utilisateur :
   - **Nom d'utilisateur** : doit contenir entre 3 et 50 caractères, être unique et insensible à la casse
   - **Administrateur** : cochez pour accorder les privilèges d'administrateur
   - **Exiger un changement de mot de passe** : cochez pour forcer le changement de mot de passe lors de la première connexion
   - **Mot de passe** :
     - Option 1 : cochez "Générer automatiquement un mot de passe" pour créer un mot de passe temporaire sécurisé
     - Option 2 : décochez et saisissez un mot de passe personnalisé
3. Cliquez sur <IconButton icon="lucide:user-plus" label="Create User" />.

## Modification d'un utilisateur {#editing-a-user}

1. Cliquez sur l'icône d'édition <IconButton icon="lucide:edit" /> située à côté de l'utilisateur
2. Modifiez l'un des éléments suivants :
   - **Nom d'utilisateur** : modifiez le nom d'utilisateur (doit être unique)
   - **Administrateur** : activez ou désactivez les privilèges d'administrateur
   - **Exiger un changement de mot de passe** : activez ou désactivez l'exigence de changement de mot de passe
3. Cliquez sur <IconButton icon="lucide:check" label="Save Changes" />.

## Réinitialisation du mot de passe d'un utilisateur {#resetting-a-user-password}

1. Cliquez sur l'icône <IconButton icon="lucide:key-round" /> clé à côté de l'utilisateur
2. Confirmez la réinitialisation du mot de passe
3. Un mot de passe temporaire sera généré et affiché
4. Copiez le mot de passe et fournissez-le à l'utilisateur de manière sécurisée

## Suppression d'un utilisateur {#deleting-a-user}

1. Cliquez sur l'icône <IconButton icon="lucide:trash-2" /> de suppression à côté de l'utilisateur
2. Confirmez la suppression dans la boîte de dialogue. **La suppression d'utilisateur est permanente et ne peut pas être annulée.**

## Verrouillage de compte {#account-lockout}

Les comptes sont automatiquement verrouillés après plusieurs tentatives de connexion échouées :
- **Seuil de verrouillage** : 5 tentatives échouées
- **Durée de verrouillage** : 15 minutes
- Les comptes verrouillés ne peuvent pas se connecter jusqu'à l'expiration de la période de verrouillage

## Récupération de l'accès Admin {#recovering-admin-access}

Si vous avez perdu votre mot de passe admin ou êtes verrouillé de votre compte, vous pouvez récupérer l'accès en utilisant le script de récupération admin. Consultez le guide [Admin Account Recovery](../admin-recovery.md) pour des instructions détaillées sur la récupération de l'accès administrateur dans les environnements Docker.
