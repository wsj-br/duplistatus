# Recuperación de Cuenta Admin {#admin-account-recovery}

Recuperar acceso de administrador a **duplistatus** cuando ha perdido su contraseña o ha sido bloqueado de su cuenta. Esta guía cubre el uso del script de recuperación de admin en entornos Docker.

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

1. **Verificar que el contenedor esté en ejecución**: Verifique que el contenedor esté en ejecución con `docker ps`
2. **Verificar disponibilidad del script**: Verifique que el script exista en el contenedor con `docker exec -it duplistatus ls -la /app/admin-recovery`
3. **Revisar registros del contenedor**: Busque errores con `docker logs duplistatus`
4. **Verificar nombre de usuario**: Asegúrese de que el nombre de usuario exista en la base de datos
5. **Verificar formato de la contraseña**: Asegúrese de que la nueva contraseña cumpla con todos los requisitos

Si los problemas persisten, consulte la guía de [Solución de problemas](troubleshooting.md) para obtener más ayuda.
