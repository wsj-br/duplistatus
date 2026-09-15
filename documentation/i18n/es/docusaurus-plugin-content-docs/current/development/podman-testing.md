# Pruebas de Podman {/* #podman-testing */}

Copie y ejecute los scripts ubicados en `scripts/podman_testing` en el servidor de pruebas de Podman.

## Configuración inicial y gestión {/* #initial-setup-and-management */}

1. `copy.docker.duplistatus.local`: Copia la imagen de Docker desde el demonio Docker local a Podman (para pruebas locales).
2. `copy.docker.duplistatus.remote`: Copia la imagen de Docker desde un servidor de desarrollo remoto a Podman (requiere acceso SSH).
   - Cree la imagen en el servidor de desarrollo usando: `docker build . -t wsj-br/duplistatus:devel`
3. `start.duplistatus`: Inicia el contenedor en modo rootless.
4. `pod.testing`: Prueba el contenedor dentro de un pod de Podman (con privilegios de root).
5. `stop.duplistatus`: Detiene el pod y elimina el contenedor.
6. `clean.duplistatus`: Detiene los contenedores, elimina los pods y limpia las imágenes antiguas.

## Configuración de DNS {/* #dns-configuration */}

Los scripts detectan y configuran automáticamente los ajustes de DNS del sistema host:

- **Detección automática**: Usa `resolvectl status` (systemd-resolved) para extraer servidores DNS y dominios de búsqueda
- **Soporte de respaldo**: Recurre a analizar `/etc/resolv.conf` en sistemas no systemd
- **Filtrado inteligente**: Filtra automáticamente las direcciones localhost y los servidores de nombres IPv6
- **Funciona con**:
  - Tailscale MagicDNS (100.100.100.100)
  - Servidores DNS corporativos
  - Configuraciones de red estándar
  - Configuraciones DNS personalizadas

¡No se requiere configuración manual de DNS: los scripts lo manejan automáticamente!

## Monitoreo y comprobaciones de salud {/* #monitoring-and-health-checks */}

- `check.duplistatus`: Comprueba los registros, la conectividad y la salud de la aplicación.

## Comandos de depuración {/* #debugging-commands */}

- `logs.duplistatus`: Muestra los registros del pod.
- `exec.shell.duplistatus`: Abre una shell en el contenedor.
- `restart.duplistatus`: Detiene el pod, elimina el contenedor, copia la imagen, crea el contenedor y reinicia el pod.

## Flujo de trabajo de uso {/* #usage-workflow */}

### Servidor de desarrollo {/* #development-server */}

Cree la imagen de Docker en el servidor de desarrollo:

```bash
docker build . -t wsj-br/duplistatus:devel
```

### Servidor de Podman {/* #podman-server */}

1. Transfiera la imagen de Docker:
   - Use `./copy.docker.duplistatus.local` si Docker y Podman están en la misma máquina
   - Use `./copy.docker.duplistatus.remote` si copia desde un servidor de desarrollo remoto (requiere archivo `.env` con `REMOTE_USER` y `REMOTE_HOST`)
2. Inicie el contenedor con `./start.duplistatus` (modo independiente, rootless)
   - O use `./pod.testing` para probar en modo pod (con root)
3. Monitoree con `./check.duplistatus` y `./logs.duplistatus`
4. Detenga con `./stop.duplistatus` cuando termine
5. Use `./restart.duplistatus` para un ciclo de reinicio completo (detener, copiar imagen, iniciar)
   - **Nota**: Este script actualmente hace referencia a `copy.docker.duplistatus` que debe reemplazarse con la variante `.local` o `.remote`
6. Usa `./clean.duplistatus` para eliminar contenedores, pods y viejas imágenes

# Pruebas de la aplicación {/* #testing-the-application */}

Si estás ejecutando el servidor Podman en la misma máquina, usa `http://localhost:9666`.

Si estás en otro servidor, obtén la URL con:

```bash
echo "http://$(hostname -I | awk '{print $1}'):9666"
```

## Notas importantes {/* #important-notes */}

### Redes de pods de Podman {/* #podman-pod-networking */}

Cuando se ejecuta en pods de Podman, la aplicación requiere:
- Configuración DNS explícita (manejada automáticamente por el script `pod.testing`)
- Enlace de puerto a todas las interfaces (`0.0.0.0:9666`)

Los scripts manejan estos requisitos automáticamente - no se necesita configuración manual.

### Modo rootless vs modo root {/* #rootless-vs-root-mode */}

- **Modo independiente** (`start.duplistatus`): Se ejecuta en modo rootless con `--userns=keep-id`
- **Modo pod** (`pod.testing`): Se ejecuta como root dentro del pod con fines de prueba

Ambos modos funcionan correctamente con la detección automática de DNS.

## Configuración del entorno {/* #environment-configuration */}

Ambos `copy.docker.duplistatus.local` y `copy.docker.duplistatus.remote` requieren un archivo `.env` en el directorio `scripts/podman_testing`:

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

**Nota**: El mensaje de error del script menciona `REMOTE_USER` y `REMOTE_HOST`, pero estos no son realmente usados por `start.duplistatus`—solo `IMAGE` es requerido.
