# Recuperación de Cuenta de Administrador {/* #admin-account-recovery */}

Recupere el acceso de administrador a **duplistatus** cuando haya perdido su contraseña o haya sido bloqueado fuera de su cuenta. Esta guía cubre el uso del script de recuperación de administrador en entornos Docker.

Si el navegador muestra **Acceso denegado** (HTTP 403) antes del formulario de inicio de sesión, la [lista de IPs permitidas de administrador](settings/ip-allowlist-settings.md) está bloqueando la solicitud. Utilice [Bloqueado por Lista de IPs Permitidas](troubleshooting.md#locked-out-by-ip-allowlist) en lugar de este script.

## Uso del Script en Docker {/* #using-the-script-in-docker */}

El Dockerfile incluye el directorio `scripts` y un práctico contenedor de shell.

```bash
# Execute inside the running container using the wrapper
docker exec -it duplistatus /app/admin-recovery <username> <new-password>
```

**Ejemplo:**

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

## Solución de problemas {/* #troubleshooting */}

Si encuentra problemas con el script de recuperación:

1. **Verifique que el Contenedor esté en Ejecución**: Compruebe que el contenedor se esté ejecutando con `docker ps`
2. **Verifique la Disponibilidad del Script**: Verifique que el script exista en el contenedor con `docker exec -it duplistatus ls -la /app/admin-recovery`
3. **Revise los Registros del Contenedor**: Compruebe si hay errores con `docker logs duplistatus`
4. **Verifique el Nombre de Usuario**: Asegúrese de que el nombre de usuario exista en la base de datos
5. **Verifique el Formato de Contraseña**: Asegúrese de que la nueva contraseña cumpla con todos los requisitos

Si los problemas persisten, consulte la guía de [Solución de Problemas](troubleshooting.md) para obtener más ayuda.
