---
translation_last_updated: '2026-01-31T00:51:29.239Z'
source_file_mtime: '2026-01-27T14:22:06.838Z'
source_file_hash: ece7b76b8fa36b8d
translation_language: es
source_file_path: user-guide/settings/user-management-settings.md
---
# Usuarios {#users}

Gestione cuentas de usuario, permisos y control de acceso para **duplistatus**. Esta sección permite a los administradores crear, modificar y eliminar cuentas de usuario.

![User Management](/assets/screen-settings-users.png)

>[!TIP] 
>La cuenta `admin` por defecto puede ser eliminada. Para hacerlo, primero cree un nuevo usuario administrador, inicie sesión con esa cuenta, 
> y luego elimine la cuenta `admin`.
>
> La contraseña por defecto para la cuenta `admin` es `Duplistatus09`. Se le requerirá cambiarla en el primer inicio de sesión.

## Acceso a Gestión de usuarios {#accessing-user-management}

Puede acceder a la sección de Gestión de usuarios de dos formas:

1. **Desde el Menú de Usuario**: Haga clic en <IconButton icon="lucide:user" label="Nombre de usuario" />   en la [Barra de herramientas de la aplicación](../overview.md#application-toolbar) y seleccione "Admin Usuarios".

2. **Desde Configuración**: Haga clic en <IconButton icon="lucide:settings"/> y `Users` en la barra lateral de configuración

## Crear un Nuevo Usuario {#creating-a-new-user}

1. Haga clic en el botón <IconButton icon="lucide:plus" label="Agregar usuario"/>
2. Ingrese los detalles del usuario:
   - **Nombre de usuario**: Debe tener entre 3 y 50 caracteres, ser único y no distinguir entre mayúsculas y minúsculas
   - **Admin**: Marque para otorgar privilegios de administrador
   - **Requerir cambio de contraseña**: Marque para forzar el cambio de contraseña en el primer inicio de sesión
   - **Contraseña**: 
     - Opción 1: Marque "Generar contraseña automáticamente" para crear una contraseña temporal segura
     - Opción 2: Desmarque e ingrese una contraseña personalizada
3. Haga clic en <IconButton icon="lucide:user-plus" label="Crear usuario" />.

## Edición de un Usuario {#editing-a-user}

1. Haga clic en el icono <IconButton icon="lucide:edit" /> Editar junto al usuario
2. Modifique cualquiera de los siguientes:
   - **Nombre de usuario**: Cambie el nombre de usuario (debe ser único)
   - **Admin**: Alternar privilegios de administrador
   - **Requerir cambio de contraseña**: Alternar requisito de cambio de contraseña
3. Haga clic en <IconButton icon="lucide:check" label="Guardar cambios" />.

## Restablecimiento de una Contraseña de Usuario {#resetting-a-user-password}

1. Haga clic en el icono <IconButton icon="lucide:key-round" /> de clave junto al usuario
2. Confirme el restablecimiento de contraseña
3. Se generará una nueva contraseña temporal y se mostrará
4. Copie la contraseña y proporciónela al usuario de forma segura

## Eliminación de un Usuario {#deleting-a-user}

1. Haga clic en el icono <IconButton icon="lucide:trash-2" /> eliminar junto al usuario
2. Confirme la eliminación en el cuadro de diálogo. **La eliminación del usuario es permanente y no se puede deshacer.**

## Bloqueo de Cuenta {#account-lockout}

Las cuentas se bloquean automáticamente después de múltiples intentos fallidos de inicio de sesión:
- **Umbral de bloqueo**: 5 intentos fallidos
- **Duración del bloqueo**: 15 minutos
- Las cuentas bloqueadas no pueden iniciar sesión hasta que expire el período de bloqueo

## Recuperación del Acceso de Admin {#recovering-admin-access}

Si ha perdido su contraseña de admin o ha sido bloqueado de su cuenta, puede recuperar el acceso utilizando el script de recuperación de admin. Consulte la guía [Recuperación de Cuenta de Admin](../admin-recovery.md) para obtener instrucciones detalladas sobre cómo recuperar el acceso de administrador en entornos Docker.
