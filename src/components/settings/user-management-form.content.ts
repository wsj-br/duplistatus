import { t, type Dictionary } from 'intlayer';

export default {
  key: 'user-management-form',
  content: {
    title: t({ 
      en: 'User Management', 
      de: 'Benutzerverwaltung', 
      fr: 'Gestion des utilisateurs', 
      es: 'Gestión de usuarios', 
      'pt-BR': 'Gerenciamento de usuários' 
    }),
    description: t({ 
      en: 'Manage application users and permissions', 
      de: 'Anwendungsbenutzer und Berechtigungen verwalten', 
      fr: 'Gérer les utilisateurs et les permissions de l\'application', 
      es: 'Administrar usuarios y permisos de la aplicación', 
      'pt-BR': 'Gerenciar usuários e permissões do aplicativo' 
    }),
    addUser: t({ 
      en: 'Add User', 
      de: 'Benutzer hinzufügen', 
      fr: 'Ajouter un utilisateur', 
      es: 'Agregar usuario', 
      'pt-BR': 'Adicionar usuário' 
    }),
    editUser: t({ 
      en: 'Edit User', 
      de: 'Benutzer bearbeiten', 
      fr: 'Modifier l\'utilisateur', 
      es: 'Editar usuario', 
      'pt-BR': 'Editar usuário' 
    }),
    deleteUser: t({ 
      en: 'Delete User', 
      de: 'Benutzer löschen', 
      fr: 'Supprimer l\'utilisateur', 
      es: 'Eliminar usuario', 
      'pt-BR': 'Excluir usuário' 
    }),
    // Card description
    cardDescription: t({ 
      en: 'Manage user accounts, roles, and permissions. Create, edit, or delete users and reset passwords.', 
      de: 'Benutzerkonten, Rollen und Berechtigungen verwalten. Benutzer erstellen, bearbeiten oder löschen und Passwörter zurücksetzen.', 
      fr: 'Gérer les comptes utilisateurs, les rôles et les permissions. Créer, modifier ou supprimer des utilisateurs et réinitialiser les mots de passe.', 
      es: 'Administrar cuentas de usuario, roles y permisos. Crear, editar o eliminar usuarios y restablecer contraseñas.', 
      'pt-BR': 'Gerenciar contas de usuário, funções e permissões. Criar, editar ou excluir usuários e redefinir senhas.' 
    }),
    // Search
    searchUsers: t({ 
      en: 'Search users...', 
      de: 'Benutzer suchen...', 
      fr: 'Rechercher des utilisateurs...', 
      es: 'Buscar usuarios...', 
      'pt-BR': 'Buscar usuários...' 
    }),
    // Loading and empty states
    loadingUsers: t({ 
      en: 'Loading users...', 
      de: 'Benutzer werden geladen...', 
      fr: 'Chargement des utilisateurs...', 
      es: 'Cargando usuarios...', 
      'pt-BR': 'Carregando usuários...' 
    }),
    noUsersFoundMatchingSearch: t({ 
      en: 'No users found matching your search', 
      de: 'Keine Benutzer gefunden, die Ihrer Suche entsprechen', 
      fr: 'Aucun utilisateur trouvé correspondant à votre recherche', 
      es: 'No se encontraron usuarios que coincidan con su búsqueda', 
      'pt-BR': 'Nenhum usuário encontrado correspondente à sua pesquisa' 
    }),
    noUsersFound: t({ 
      en: 'No users found', 
      de: 'Keine Benutzer gefunden', 
      fr: 'Aucun utilisateur trouvé', 
      es: 'No se encontraron usuarios', 
      'pt-BR': 'Nenhum usuário encontrado' 
    }),
    // Table headers
    username: t({ 
      en: 'Username', 
      de: 'Benutzername', 
      fr: 'Nom d\'utilisateur', 
      es: 'Nombre de usuario', 
      'pt-BR': 'Nome de usuário' 
    }),
    role: t({ 
      en: 'Role', 
      de: 'Rolle', 
      fr: 'Rôle', 
      es: 'Rol', 
      'pt-BR': 'Função' 
    }),
    lastLogin: t({ 
      en: 'Last Login', 
      de: 'Letzte Anmeldung', 
      fr: 'Dernière connexion', 
      es: 'Último inicio de sesión', 
      'pt-BR': 'Último login' 
    }),
    lastUpdate: t({ 
      en: 'Last Update', 
      de: 'Letzte Aktualisierung', 
      fr: 'Dernière mise à jour', 
      es: 'Última actualización', 
      'pt-BR': 'Última atualização' 
    }),
    created: t({ 
      en: 'Created', 
      de: 'Erstellt', 
      fr: 'Créé', 
      es: 'Creado', 
      'pt-BR': 'Criado' 
    }),
    status: t({ 
      en: 'Status', 
      de: 'Status', 
      fr: 'Statut', 
      es: 'Estado', 
      'pt-BR': 'Status' 
    }),
    actions: t({ 
      en: 'Actions', 
      de: 'Aktionen', 
      fr: 'Actions', 
      es: 'Acciones', 
      'pt-BR': 'Ações' 
    }),
    // Role badges
    admin: t({ 
      en: 'Admin', 
      de: 'Administrator', 
      fr: 'Administrateur', 
      es: 'Administrador', 
      'pt-BR': 'Administrador' 
    }),
    user: t({ 
      en: 'User', 
      de: 'Benutzer', 
      fr: 'Utilisateur', 
      es: 'Usuario', 
      'pt-BR': 'Usuário' 
    }),
    // Status labels
    never: t({ 
      en: 'Never', 
      de: 'Nie', 
      fr: 'Jamais', 
      es: 'Nunca', 
      'pt-BR': 'Nunca' 
    }),
    locked: t({ 
      en: 'Locked', 
      de: 'Gesperrt', 
      fr: 'Verrouillé', 
      es: 'Bloqueado', 
      'pt-BR': 'Bloqueado' 
    }),
    mustChangePassword: t({ 
      en: 'Must Change Password', 
      de: 'Passwort muss geändert werden', 
      fr: 'Doit changer le mot de passe', 
      es: 'Debe cambiar la contraseña', 
      'pt-BR': 'Deve alterar a senha' 
    }),
    // Action titles
    editUserTitle: t({ 
      en: 'Edit user', 
      de: 'Benutzer bearbeiten', 
      fr: 'Modifier l\'utilisateur', 
      es: 'Editar usuario', 
      'pt-BR': 'Editar usuário' 
    }),
    resetPasswordTitle: t({ 
      en: 'Reset password', 
      de: 'Passwort zurücksetzen', 
      fr: 'Réinitialiser le mot de passe', 
      es: 'Restablecer contraseña', 
      'pt-BR': 'Redefinir senha' 
    }),
    cannotDeleteLastAdmin: t({ 
      en: 'Cannot delete the last admin account', 
      de: 'Das letzte Administratorkonto kann nicht gelöscht werden', 
      fr: 'Impossible de supprimer le dernier compte administrateur', 
      es: 'No se puede eliminar la última cuenta de administrador', 
      'pt-BR': 'Não é possível excluir a última conta de administrador' 
    }),
    deleteAdminUserWarning: t({ 
      en: 'Delete admin user (warning: this is an admin account)', 
      de: 'Administratorbenutzer löschen (Warnung: Dies ist ein Administratorkonto)', 
      fr: 'Supprimer l\'utilisateur administrateur (avertissement: ceci est un compte administrateur)', 
      es: 'Eliminar usuario administrador (advertencia: esta es una cuenta de administrador)', 
      'pt-BR': 'Excluir usuário administrador (aviso: esta é uma conta de administrador)' 
    }),
    deleteUserTitle: t({ 
      en: 'Delete user', 
      de: 'Benutzer löschen', 
      fr: 'Supprimer l\'utilisateur', 
      es: 'Eliminar usuario', 
      'pt-BR': 'Excluir usuário' 
    }),
    // Dialog titles
    createNewUser: t({ 
      en: 'Create New User', 
      de: 'Neuen Benutzer erstellen', 
      fr: 'Créer un nouvel utilisateur', 
      es: 'Crear nuevo usuario', 
      'pt-BR': 'Criar novo usuário' 
    }),
    editUserDialog: t({ 
      en: 'Edit User', 
      de: 'Benutzer bearbeiten', 
      fr: 'Modifier l\'utilisateur', 
      es: 'Editar usuario', 
      'pt-BR': 'Editar usuário' 
    }),
    deleteUserDialog: t({ 
      en: 'Delete User', 
      de: 'Benutzer löschen', 
      fr: 'Supprimer l\'utilisateur', 
      es: 'Eliminar usuario', 
      'pt-BR': 'Excluir usuário' 
    }),
    passwordReset: t({ 
      en: 'Password Reset', 
      de: 'Passwort zurücksetzen', 
      fr: 'Réinitialisation du mot de passe', 
      es: 'Restablecimiento de contraseña', 
      'pt-BR': 'Redefinição de senha' 
    }),
    // Dialog descriptions
    createNewUserDescription: t({ 
      en: 'Create a new user account. You can auto-generate a secure password or set a custom one.', 
      de: 'Erstellen Sie ein neues Benutzerkonto. Sie können ein sicheres Passwort automatisch generieren oder ein benutzerdefiniertes festlegen.', 
      fr: 'Créez un nouveau compte utilisateur. Vous pouvez générer automatiquement un mot de passe sécurisé ou en définir un personnalisé.', 
      es: 'Crear una nueva cuenta de usuario. Puede generar automáticamente una contraseña segura o establecer una personalizada.', 
      'pt-BR': 'Criar uma nova conta de usuário. Você pode gerar automaticamente uma senha segura ou definir uma personalizada.' 
    }),
    editUserDescription: t({ 
      en: 'Update user information. Use the password reset button to change the password.', 
      de: 'Aktualisieren Sie Benutzerinformationen. Verwenden Sie die Schaltfläche zum Zurücksetzen des Passworts, um das Passwort zu ändern.', 
      fr: 'Mettez à jour les informations utilisateur. Utilisez le bouton de réinitialisation du mot de passe pour changer le mot de passe.', 
      es: 'Actualizar información del usuario. Use el botón de restablecimiento de contraseña para cambiar la contraseña.', 
      'pt-BR': 'Atualizar informações do usuário. Use o botão de redefinição de senha para alterar a senha.' 
    }),
    deleteUserDescription: t({ 
      en: 'Are you sure you want to delete user {username}? This action cannot be undone.', 
      de: 'Sind Sie sicher, dass Sie den Benutzer {username} löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.', 
      fr: 'Êtes-vous sûr de vouloir supprimer l\'utilisateur {username}? Cette action ne peut pas être annulée.', 
      es: '¿Está seguro de que desea eliminar al usuario {username}? Esta acción no se puede deshacer.', 
      'pt-BR': 'Tem certeza de que deseja excluir o usuário {username}? Esta ação não pode ser desfeita.' 
    }),
    warningThisIsAdminUser: t({ 
      en: 'Warning: This is an admin user.', 
      de: 'Warnung: Dies ist ein Administratorbenutzer.', 
      fr: 'Avertissement: Ceci est un utilisateur administrateur.', 
      es: 'Advertencia: Este es un usuario administrador.', 
      'pt-BR': 'Aviso: Este é um usuário administrador.' 
    }),
    passwordResetDescription: t({ 
      en: 'A new temporary password has been generated for {username}.', 
      de: 'Ein neues temporäres Passwort wurde für {username} generiert.', 
      fr: 'Un nouveau mot de passe temporaire a été généré pour {username}.', 
      es: 'Se ha generado una nueva contraseña temporal para {username}.', 
      'pt-BR': 'Uma nova senha temporária foi gerada para {username}.' 
    }),
    passwordResetDescriptionGeneric: t({ 
      en: 'A new temporary password has been generated for the user.', 
      de: 'Ein neues temporäres Passwort wurde für den Benutzer generiert.', 
      fr: 'Un nouveau mot de passe temporaire a été généré pour l\'utilisateur.', 
      es: 'Se ha generado una nueva contraseña temporal para el usuario.', 
      'pt-BR': 'Uma nova senha temporária foi gerada para o usuário.' 
    }),
    copyPasswordNow: t({ 
      en: 'Copy this password now - it will not be shown again!', 
      de: 'Kopieren Sie dieses Passwort jetzt - es wird nicht erneut angezeigt!', 
      fr: 'Copiez ce mot de passe maintenant - il ne sera plus affiché!', 
      es: '¡Copie esta contraseña ahora - no se mostrará nuevamente!', 
      'pt-BR': 'Copie esta senha agora - ela não será mostrada novamente!' 
    }),
    // Form labels
    usernameLabel: t({ 
      en: 'Username', 
      de: 'Benutzername', 
      fr: 'Nom d\'utilisateur', 
      es: 'Nombre de usuario', 
      'pt-BR': 'Nome de usuário' 
    }),
    autoGenerateSecurePassword: t({ 
      en: 'Auto-generate secure password', 
      de: 'Sicheres Passwort automatisch generieren', 
      fr: 'Générer automatiquement un mot de passe sécurisé', 
      es: 'Generar automáticamente contraseña segura', 
      'pt-BR': 'Gerar senha segura automaticamente' 
    }),
    adminUser: t({ 
      en: 'Admin user', 
      de: 'Administratorbenutzer', 
      fr: 'Utilisateur administrateur', 
      es: 'Usuario administrador', 
      'pt-BR': 'Usuário administrador' 
    }),
    requirePasswordChangeOnFirstLogin: t({ 
      en: 'Require password change on first login', 
      de: 'Passwortänderung bei erster Anmeldung erforderlich', 
      fr: 'Exiger le changement de mot de passe lors de la première connexion', 
      es: 'Requerir cambio de contraseña en el primer inicio de sesión', 
      'pt-BR': 'Exigir alteração de senha no primeiro login' 
    }),
    requirePasswordChangeOnNextLogin: t({ 
      en: 'Require password change on next login', 
      de: 'Passwortänderung bei nächster Anmeldung erforderlich', 
      fr: 'Exiger le changement de mot de passe lors de la prochaine connexion', 
      es: 'Requerir cambio de contraseña en el próximo inicio de sesión', 
      'pt-BR': 'Exigir alteração de senha no próximo login' 
    }),
    // Placeholders
    enterUsername: t({ 
      en: 'Enter username', 
      de: 'Benutzername eingeben', 
      fr: 'Entrer le nom d\'utilisateur', 
      es: 'Ingresar nombre de usuario', 
      'pt-BR': 'Digite o nome de usuário' 
    }),
    enterPassword: t({ 
      en: 'Enter password', 
      de: 'Passwort eingeben', 
      fr: 'Entrer le mot de passe', 
      es: 'Ingresar contraseña', 
      'pt-BR': 'Digite a senha' 
    }),
    // Password requirements
    passwordRequirements: t({ 
      en: 'Password Requirements:', 
      de: 'Passwortanforderungen:', 
      fr: 'Exigences du mot de passe:', 
      es: 'Requisitos de contraseña:', 
      'pt-BR': 'Requisitos de senha:' 
    }),
    atLeastXCharactersLong: t({ 
      en: 'At least {minLength} characters long', 
      de: 'Mindestens {minLength} Zeichen lang', 
      fr: 'Au moins {minLength} caractères', 
      es: 'Al menos {minLength} caracteres de longitud', 
      'pt-BR': 'Pelo menos {minLength} caracteres' 
    }),
    containsUppercaseLetter: t({ 
      en: 'Contains at least one uppercase letter (A-Z)', 
      de: 'Enthält mindestens einen Großbuchstaben (A-Z)', 
      fr: 'Contient au moins une lettre majuscule (A-Z)', 
      es: 'Contiene al menos una letra mayúscula (A-Z)', 
      'pt-BR': 'Contém pelo menos uma letra maiúscula (A-Z)' 
    }),
    containsLowercaseLetter: t({ 
      en: 'Contains at least one lowercase letter (a-z)', 
      de: 'Enthält mindestens einen Kleinbuchstaben (a-z)', 
      fr: 'Contient au moins une lettre minuscule (a-z)', 
      es: 'Contiene al menos una letra minúscula (a-z)', 
      'pt-BR': 'Contém pelo menos uma letra minúscula (a-z)' 
    }),
    containsNumber: t({ 
      en: 'Contains at least one number (0-9)', 
      de: 'Enthält mindestens eine Zahl (0-9)', 
      fr: 'Contient au moins un chiffre (0-9)', 
      es: 'Contiene al menos un número (0-9)', 
      'pt-BR': 'Contém pelo menos um número (0-9)' 
    }),
    // Buttons
    cancel: t({ 
      en: 'Cancel', 
      de: 'Abbrechen', 
      fr: 'Annuler', 
      es: 'Cancelar', 
      'pt-BR': 'Cancelar' 
    }),
    createUser: t({ 
      en: 'Create User', 
      de: 'Benutzer erstellen', 
      fr: 'Créer l\'utilisateur', 
      es: 'Crear usuario', 
      'pt-BR': 'Criar usuário' 
    }),
    creating: t({ 
      en: 'Creating...', 
      de: 'Wird erstellt...', 
      fr: 'Création...', 
      es: 'Creando...', 
      'pt-BR': 'Criando...' 
    }),
    saveChanges: t({ 
      en: 'Save Changes', 
      de: 'Änderungen speichern', 
      fr: 'Enregistrer les modifications', 
      es: 'Guardar cambios', 
      'pt-BR': 'Salvar alterações' 
    }),
    saving: t({ 
      en: 'Saving...', 
      de: 'Wird gespeichert...', 
      fr: 'Enregistrement...', 
      es: 'Guardando...', 
      'pt-BR': 'Salvando...' 
    }),
    delete: t({ 
      en: 'Delete', 
      de: 'Löschen', 
      fr: 'Supprimer', 
      es: 'Eliminar', 
      'pt-BR': 'Excluir' 
    }),
    deleting: t({ 
      en: 'Deleting...', 
      de: 'Wird gelöscht...', 
      fr: 'Suppression...', 
      es: 'Eliminando...', 
      'pt-BR': 'Excluindo...' 
    }),
    close: t({ 
      en: 'Close', 
      de: 'Schließen', 
      fr: 'Fermer', 
      es: 'Cerrar', 
      'pt-BR': 'Fechar' 
    }),
    // Password reset dialog
    temporaryPassword: t({ 
      en: 'Temporary Password', 
      de: 'Temporäres Passwort', 
      fr: 'Mot de passe temporaire', 
      es: 'Contraseña temporal', 
      'pt-BR': 'Senha temporária' 
    }),
    copyPassword: t({ 
      en: 'Copy password', 
      de: 'Passwort kopieren', 
      fr: 'Copier le mot de passe', 
      es: 'Copiar contraseña', 
      'pt-BR': 'Copiar senha' 
    }),
    userWillBeRequiredToChangePassword: t({ 
      en: 'The user will be required to change this password on first login.', 
      de: 'Der Benutzer muss dieses Passwort bei der ersten Anmeldung ändern.', 
      fr: 'L\'utilisateur devra changer ce mot de passe lors de la première connexion.', 
      es: 'El usuario deberá cambiar esta contraseña en el primer inicio de sesión.', 
      'pt-BR': 'O usuário será obrigado a alterar esta senha no primeiro login.' 
    }),
    // Toast messages
    failedToLoadUsers: t({ 
      en: 'Failed to load users', 
      de: 'Fehler beim Laden der Benutzer', 
      fr: 'Échec du chargement des utilisateurs', 
      es: 'Error al cargar usuarios', 
      'pt-BR': 'Falha ao carregar usuários' 
    }),
    usernameRequired: t({ 
      en: 'Username is required', 
      de: 'Benutzername ist erforderlich', 
      fr: 'Le nom d\'utilisateur est requis', 
      es: 'El nombre de usuario es obligatorio', 
      'pt-BR': 'Nome de usuário é obrigatório' 
    }),
    passwordRequiredWhenNotAutoGenerating: t({ 
      en: 'Password is required when not auto-generating', 
      de: 'Passwort ist erforderlich, wenn nicht automatisch generiert', 
      fr: 'Le mot de passe est requis lorsqu\'il n\'est pas généré automatiquement', 
      es: 'La contraseña es obligatoria cuando no se genera automáticamente', 
      'pt-BR': 'Senha é obrigatória quando não está sendo gerada automaticamente' 
    }),
    failedToCreateUser: t({ 
      en: 'Failed to create user', 
      de: 'Fehler beim Erstellen des Benutzers', 
      fr: 'Échec de la création de l\'utilisateur', 
      es: 'Error al crear usuario', 
      'pt-BR': 'Falha ao criar usuário' 
    }),
    userCreatedSuccessfully: t({ 
      en: 'User created successfully', 
      de: 'Benutzer erfolgreich erstellt', 
      fr: 'Utilisateur créé avec succès', 
      es: 'Usuario creado exitosamente', 
      'pt-BR': 'Usuário criado com sucesso' 
    }),
    failedToUpdateUser: t({ 
      en: 'Failed to update user', 
      de: 'Fehler beim Aktualisieren des Benutzers', 
      fr: 'Échec de la mise à jour de l\'utilisateur', 
      es: 'Error al actualizar usuario', 
      'pt-BR': 'Falha ao atualizar usuário' 
    }),
    userUpdatedSuccessfully: t({ 
      en: 'User updated successfully', 
      de: 'Benutzer erfolgreich aktualisiert', 
      fr: 'Utilisateur mis à jour avec succès', 
      es: 'Usuario actualizado exitosamente', 
      'pt-BR': 'Usuário atualizado com sucesso' 
    }),
    failedToDeleteUser: t({ 
      en: 'Failed to delete user', 
      de: 'Fehler beim Löschen des Benutzers', 
      fr: 'Échec de la suppression de l\'utilisateur', 
      es: 'Error al eliminar usuario', 
      'pt-BR': 'Falha ao excluir usuário' 
    }),
    userDeletedSuccessfully: t({ 
      en: 'User deleted successfully', 
      de: 'Benutzer erfolgreich gelöscht', 
      fr: 'Utilisateur supprimé avec succès', 
      es: 'Usuario eliminado exitosamente', 
      'pt-BR': 'Usuário excluído com sucesso' 
    }),
    failedToResetPassword: t({ 
      en: 'Failed to reset password', 
      de: 'Fehler beim Zurücksetzen des Passworts', 
      fr: 'Échec de la réinitialisation du mot de passe', 
      es: 'Error al restablecer contraseña', 
      'pt-BR': 'Falha ao redefinir senha' 
    }),
  },
} satisfies Dictionary;
