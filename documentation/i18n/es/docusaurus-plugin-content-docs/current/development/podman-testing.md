---
translation_last_updated: '2026-02-16T00:13:35.993Z'
source_file_mtime: '2026-01-25T02:45:42.745Z'
source_file_hash: 841b30d8ee97e362
translation_language: es
source_file_path: development/podman-testing.md
---
# Pruebas de Podman {#podman-testing}

Copiar y ejecutar los scripts ubicados en `scripts/podman_testing` en el Servidor de prueba de Podman.

## Configuración Inicial y Gestión {#initial-setup-and-management}

1. `copy.docker.duplistatus.local`: Copia la imagen de Docker del daemon de Docker local a Podman (para pruebas locales).
2. `copy.docker.duplistatus.remote`: Copia la imagen de Docker de un servidor de desarrollo remoto a Podman (requiere acceso SSH).
   - Cree la imagen en el servidor de desarrollo utilizando: `docker build . -t wsj-br/duplistatus:devel`
3. `start.duplistatus`: Inicia el contenedor en modo sin privilegios de root.
4. `pod.testing`: Prueba el contenedor dentro de un pod de Podman (con privilegios de root).
5. `stop.duplistatus`: Detiene el pod y elimina el contenedor.
6. `clean.duplistatus`: Detiene los contenedores, elimina los pods y limpia las imágenes antiguas.

## Configuración de DNS {#dns-configuration}

Los scripts detectan y configuran automáticamente la configuración de DNS desde el sistema host:

- **Detección Automática**: Utiliza `resolvectl status` (systemd-resolved) para extraer servidores DNS y dominios de búsqueda
- **Soporte de Respaldo**: Recurre al análisis de `/etc/resolv.conf` en sistemas sin systemd
- **Filtrado Inteligente**: Filtra automáticamente direcciones localhost y servidores de nombres IPv6
- **Compatible con**:
  - Tailscale MagicDNS (100.100.100.100)
  - Servidores DNS corporativos
  - Configuraciones de red estándar
  - Configuraciones DNS Personalizadas

No es necesaria ninguna configuración manual de DNS: ¡los scripts la manejan automáticamente!

## Monitoreo y Verificaciones de Salud {#monitoring-and-health-checks}

- `check.duplistatus`: Comprueba los logs, la conectividad y el estado de la aplicación.

## Comandos de Depuración {#debugging-commands}

- `logs.duplistatus`: Muestra los logs del pod.
- `exec.shell.duplistatus`: Abre un shell en el contenedor.
- `restart.duplistatus`: Detiene el pod, elimina el contenedor, copia la imagen, crea el contenedor e inicia el pod.

## Flujo de Trabajo de Uso {#usage-workflow}

### Servidor de Desarrollo {#development-server}

Crear la imagen de Docker en el servidor de desarrollo:

```bash
docker build . -t wsj-br/duplistatus:devel
```

### Servidor Podman {#podman-server}

1. Transferir la imagen de Docker:
   - Use `./copy.docker.duplistatus.local` si Docker y Podman están en la misma máquina
   - Use `./copy.docker.duplistatus.remote` si copia desde un servidor de desarrollo remoto (requiere archivo `.env` con `REMOTE_USER` y `REMOTE_HOST`)
2. Inicie el contenedor con `./start.duplistatus` (independiente, sin privilegios)
   - O use `./pod.testing` para probar en modo pod (con root)
3. Monitoree con `./check.duplistatus` y `./logs.duplistatus`
4. Detenga con `./stop.duplistatus` cuando haya terminado
5. Use `./restart.duplistatus` para un ciclo de reinicio completo (detener, copiar imagen, iniciar)
   - **Nota**: Este script actualmente hace referencia a `copy.docker.duplistatus` que debe reemplazarse con la variante `.local` o `.remote`
6. Use `./clean.duplistatus` para eliminar contenedores, pods e imágenes antiguas

# Prueba de la Aplicación {#testing-the-application}

Si está ejecutando el servidor de Podman en la misma máquina, utilice `http://localhost:9666`.

Si estás en otro servidor, obtén la URL con:

```bash
echo "http://$(hostname -I | awk '{print $1}'):9666"
```

## Notas Importantes {#important-notes}

### Redes de Pods de Podman {#podman-pod-networking}

Cuando se ejecuta en pods de Podman, la aplicación requiere:
- Configuración explícita de DNS (manejada automáticamente por el script `pod.testing`)
- Vinculación de puerto a todas las interfaces (`0.0.0.0:9666`)

Los scripts manejan estos requisitos automáticamente - no se requiere configuración manual.

### Modo sin root vs Modo root {#rootless-vs-root-mode}

- **Modo independiente** (`start.duplistatus`): Se ejecuta sin privilegios de root con `--userns=keep-id`
- **Modo pod** (`pod.testing`): Se ejecuta como root dentro del pod para propósitos de prueba

Ambos modos funcionan correctamente con la detección automática de DNS.

## Configuración del Entorno {#environment-configuration}

Tanto `copy.docker.duplistatus.local` como `copy.docker.duplistatus.remote` requieren un archivo `.env` en el directorio `scripts/podman_testing`:

**Para copia local** (`copy.docker.duplistatus.local`):

```
IMAGE=wsj-br/duplistatus:devel
```

**Para copia remota** (`copy.docker.duplistatus.remote`):

```
IMAGE=wsj-br/duplistatus:devel
REMOTE_USER=your_username
REMOTE_HOST=your_hostname
```

El script `start.duplistatus` requiere un archivo `.env` con al menos la variable `IMAGE`:

```
IMAGE=wsj-br/duplistatus:devel
```

**Nota**: El mensaje de error del script menciona `REMOTE_USER` y `REMOTE_HOST`, pero estos no son utilizados realmente por `start.duplistatus`—solo se requiere `IMAGE`.
