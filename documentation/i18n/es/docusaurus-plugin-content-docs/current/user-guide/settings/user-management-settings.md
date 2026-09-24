# Usuarios {/* #users */}

Gestione cuentas de usuario, permisos y control de acceso para **duplistatus**. Esta sección permite a los administradores crear, modificar y eliminar cuentas de usuario.

![Gestión de usuarios](../../assets/screen-settings-users.png)

>[!TIP] 
>La cuenta predeterminada `admin` puede eliminarse. Para hacerlo, primero cree un nuevo usuario administrador, inicie sesión con esa cuenta,
> y luego elimine la cuenta `admin`.
>
> La contraseña predeterminada para la cuenta `admin` es `Duplistatus09`. Se le pedirá que la cambie al iniciar sesión por primera vez.

## Acceso a la Gestión de usuarios {/* #accessing-user-management */}

Puede acceder a la sección de Gestión de usuarios de dos maneras:

1. **Desde el menú de usuario**: Haga clic en <IconButton icon="lucide:user" label="nombre de usuario" /> en la [Barra de herramientas de la aplicación](../overview.md#application-toolbar) y seleccione "Usuarios administradores".

2. **Desde Configuración**: Haga clic en <IconButton icon="lucide:settings"/> y **Usuarios** en la barra lateral de configuración

## Crear un nuevo usuario {/* #creating-a-new-user */}

1. Haga clic en el botón <IconButton icon="lucide:plus" label="Añadir usuario"/>
2. Introduzca los detalles del usuario:
   - **Nombre de usuario**: Debe tener entre 3 y 50 caracteres, ser único e independiente de mayúsculas y minúsculas
   - **Administrador**: Marque esta opción para conceder privilegios de administrador
   - **Requerir cambio de contraseña**: Marque esta opción para obligar a cambiar la contraseña en el primer inicio de sesión
   - **Contraseña**: 
     - Opción 1: Marque "Generar contraseña automáticamente" para crear una contraseña temporal segura
     - Opción 2: Desmarque y escriba una contraseña personalizada
3. Haga clic en <IconButton icon="lucide:user-plus" label="Crear usuario" />.

## Editar un usuario {/* #editing-a-user */}

1. Haga clic en el icono de edición <IconButton icon="lucide:edit" /> junto al usuario
2. Modifique cualquiera de las siguientes opciones:
   - **Nombre de usuario**: Cambie el nombre de usuario (debe ser único)
   - **Administrador**: Active o desactive los privilegios de administrador. Al activarla, se otorga acceso a todos los servidores y se borra la lista de servidores personalizada. Al desactivarla, se restablece el acceso a todos los servidores
   - **Requerir cambio de contraseña**: Active o desactive el requisito de cambio de contraseña
3. Haga clic en <IconButton icon="lucide:check" label="Guardar cambios" />.

## Restablecer la contraseña de un usuario {/* #resetting-a-user-password */}

1. Haga clic en el icono de llave <IconButton icon="lucide:key-round" /> junto al usuario
2. Una contraseña sugerida ya está completada y es visible. Editarla oculta la contraseña; use el icono de visualización para mostrarla de nuevo y luego copiarla
3. **Requerir cambio de contraseña en el próximo inicio de sesión** está marcada de forma predeterminada. Desmárquela si el usuario debe conservar esta contraseña
4. Haga clic en **Restablecer contraseña**. La contraseña no se volverá a mostrar

## Eliminar un usuario {/* #deleting-a-user */}

1. Haga clic en el icono de eliminación <IconButton icon="lucide:trash-2" /> junto al usuario
2. Confirme la eliminación en el cuadro de diálogo. **La eliminación de usuarios es permanente y no se puede deshacer.**

## Visibilidad del servidor {/* #server-visibility */}

Los administradores siempre ven todos los servidores. En la lista de usuarios, **Todos los servidores** es un interruptor. Manténgalo activado para cada servidor actual y futuro. Desactívelo para expandir una fila y elegir servidores. La casilla de verificación del encabezado selecciona o desmarca las filas visibles. Guardar muestra cada servidor seleccionado como alias (nombre), con un icono de edición para cambiar la lista. Un nuevo servidor permanece oculto hasta que se marca. No seleccionar ninguno significa que el usuario no ve ningún servidor. El panel de control, el detalle del servidor, el Historial de Copias de Seguridad, los gráficos y la Configuración solo incluirán entonces dichos servidores. Un enlace directo o una solicitud de API para otro servidor se trata como no encontrado. Las claves de API externas no están limitadas por esta concesión.

## Bloqueo de cuenta {/* #account-lockout */}

Las cuentas se bloquean automáticamente tras varios intentos fallidos de inicio de sesión:
- **Umbral de bloqueo**: 5 intentos fallidos
- **Duración del bloqueo**: 15 minutos
- Las cuentas bloqueadas no pueden iniciar sesión hasta que expire el periodo de bloqueo

## Recuperación del acceso de administrador {/* #recovering-admin-access */}

Si ha perdido su contraseña de administrador o ha sido bloqueado de su cuenta, puede recuperar el acceso mediante el script de recuperación de administrador. Consulte la guía [Recuperación de cuenta de administrador](../admin-recovery.md) para obtener instrucciones detalladas sobre cómo recuperar el acceso de administrador en entornos Docker.

Si el navegador muestra **Acceso denegado** (HTTP 403) antes del formulario de inicio de sesión, recupere con [Bloqueado por Lista de IPs permitidas](../troubleshooting.md#locked-out-by-ip-allowlist) en su lugar.
