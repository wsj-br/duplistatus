---
translation_last_updated: '2026-01-31T00:51:29.017Z'
source_file_mtime: '2026-01-29T17:58:29.899Z'
source_file_hash: 091dcbb5c0bb63c5
translation_language: es
source_file_path: user-guide/admin-recovery.md
---
# Recuperación de Cuenta Admin {#admin-account-recovery}

Recupere el acceso de administrador a **duplistatus** cuando haya perdido su contraseña o esté bloqueado de su cuenta. Esta guía cubre el uso del script de recuperación de admin en entornos Docker.

## Uso del Script en Docker {#using-the-script-in-docker}

El Dockerfile incluye el directorio `scripts` y un práctico envoltorio de shell.

```bash
# Execute inside the running container using the wrapper
docker exec -it duplistatus /app/admin-recovery <username> <new-password>
```

**Ejemplo:**

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

## Solución de problemas {#troubleshooting}

Si encuentra problemas con el script de recuperación:

1. **Verificar que el contenedor está en ejecución**: Verifique que el contenedor está en ejecución con `docker ps`
2. **Verificar disponibilidad del script**: Verifique que el script existe en el contenedor con `docker exec -it duplistatus ls -la /app/admin-recovery`
3. **Revisar logs del contenedor**: Verifique si hay errores con `docker logs duplistatus`
4. **Verificar nombre de usuario**: Asegúrese de que el nombre de usuario existe en la base de datos
5. **Verificar formato de contraseña**: Asegúrese de que la nueva contraseña cumple con todos los requisitos

Si los problemas persisten, consulte la guía de [Solución de problemas](troubleshooting.md) para obtener más ayuda.
