# Recuperación de la cuenta de Administrador {/* #admin-account-recovery */}

Recupera el acceso de administrador a **duplistatus** cuando hayas perdido tu contraseña o hayas sido bloqueado de tu cuenta. Esta guía cubre el uso del script de recuperación de administrador en entornos Docker.

Si el navegador muestra **Acceso denegado** (HTTP 403) antes del formulario de inicio de sesión, la [lista de IPs permitidas de administrador](settings/ip-allowlist-settings.md) está bloqueando la solicitud. Usa [Bloqueado por la lista de IPs permitidas](troubleshooting.md#locked-out-by-ip-allowlist) en lugar de este script.

## Usando el script en Docker {/* #using-the-script-in-docker */}

El Dockerfile incluye el directorio `scripts` y un conveniente envoltorio de shell.

```bash
# Execute inside the running container using the wrapper
docker exec -it duplistatus /app/admin-recovery <username> <new-password>
```

**Ejemplo:**

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

## Solución de problemas {/* #troubleshooting */}

Si encuentras problemas con el script de recuperación:

1. **Verificar que el contenedor está en ejecución**: Comprueba que el contenedor está en ejecución con `docker ps`
2. **Comprobar la disponibilidad del script**: Verifica que el script existe en el contenedor con `docker exec -it duplistatus ls -la /app/admin-recovery`
3. **Revisar los registros del contenedor**: Busca errores con `docker logs duplistatus`
4. **Verificar el nombre de usuario**: Asegúrate de que el nombre de usuario existe en la base de datos
5. **Comprobar el formato de la contraseña**: Asegúrate de que la nueva contraseña cumple todos los requisitos

Si los problemas persisten, consulta la guía de [Solución de problemas](troubleshooting.md) para obtener más ayuda.
