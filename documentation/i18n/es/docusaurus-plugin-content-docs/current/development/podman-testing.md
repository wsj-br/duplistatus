# Pruebas de Podman {/* #podman-testing */}

Copiar y ejecutar los scripts ubicados en `scripts/podman_testing` en el servidor de pruebas de Podman.

## Configuración inicial y gestión {/* #initial-setup-and-management */}

1. `copy.docker.duplistatus.local`: Copia la imagen de Docker del daemon de Docker local a Podman (para pruebas locales).
2. `copy.docker.duplistatus.remote`: Copia la imagen de Docker de un servidor de desarrollo remoto a Podman (requiere acceso SSH).
   - Crear la imagen en el servidor de desarrollo usando: `docker build . -t wsj-br/duplistatus:devel`
3. `start.duplistatus`: Inicia el contenedor en modo sin raíz.
4. `pod.testing`: Prueba el contenedor dentro de un pod de Podman (con privilegios de raíz).
5. `stop.duplistatus`: Detiene el pod y elimina el contenedor.
6. `clean.duplistatus`: Detiene contenedores, elimina pods y limpia imágenes antiguas.

## Configuración de DNS {/* #dns-configuration */}

Los scripts detectan y configuran automáticamente los parámetros de DNS del sistema host:

- **Detección automática**: Utiliza `resolvectl status` (systemd-resolved) para extraer servidores DNS y dominios de búsqueda
- **Soporte de reserva**: Recurre al análisis de `/etc/resolv.conf` en sistemas sin systemd
- **Filtrado inteligente**: Filtra automáticamente direcciones localhost y servidores de nombres IPv6
- **Compatible con**:
  - Tailscale MagicDNS (100.100.100.100)
  - Servidores DNS corporativos
  - Configuraciones de red estándar
  - Configuraciones de DNS personalizadas

No se requiere configuración manual de DNS: ¡los scripts lo manejan automáticamente!

## Monitoreo y comprobaciones de estado {/* #monitoring-and-health-checks */}

- `check.duplistatus`: Comprueba los registros, la conectividad y el estado de la aplicación.

## Comandos de depuración {/* #debugging-commands */}

- `logs.duplistatus`: Muestra los registros del pod.
- `exec.shell.duplistatus`: Abre un shell en el contenedor.
- `restart.duplistatus`: Detiene el pod, elimina el contenedor, copia la imagen, crea el contenedor e inicia el pod.

## Flujo de trabajo de uso {/* #usage-workflow */}

### Servidor de desarrollo {/* #development-server */}

Crear la imagen de Docker en el servidor de desarrollo:

```bash
docker build . -t wsj-br/duplistatus:devel
```

### Servidor de Podman {/* #podman-server */}

1. Transferir la imagen de Docker:
   - Usar `./copy.docker.duplistatus.local` si Docker y Podman están en la misma máquina
   - Usar `./copy.docker.duplistatus.remote` si se copia desde un servidor de desarrollo remoto (requiere archivo `.env` con `REMOTE_USER` y `REMOTE_HOST`)
2. Iniciar el contenedor con `./start.duplistatus` (independiente, sin raíz)
   - O usar `./pod.testing` para probar en modo pod (con raíz)
3. Monitorear con `./check.duplistatus` y `./logs.duplistatus`
4. Detener con `./stop.duplistatus` cuando termine
5. Usar `./restart.duplistatus` para un ciclo de reinicio completo (detener, copiar imagen, iniciar)
   - **Nota**: Este script actualmente hace referencia a `copy.docker.duplistatus` que debe reemplazarse con la variante `.local` o `.remote`
6. Utiliza `./clean.duplistatus` para eliminar contenedores, pods e imágenes antiguas

# Prueba de la aplicación {/* #testing-the-application */}

Si ejecutas el servidor Podman en la misma máquina, utiliza `http://localhost:9666`.

Si estás en otro servidor, obtén la URL con:

```bash
echo "http://$(hostname -I | awk '{print $1}'):9666"
```

## Notas importantes {/* #important-notes */}

### Redes de Podman Pod {/* #podman-pod-networking */}

Cuando se ejecuta en pods de Podman, la aplicación requiere:
- Configuración explícita de DNS (manejada automáticamente por el script `pod.testing`)
- Vinculación de puerto a todas las interfaces (`0.0.0.0:9666`)

Los scripts manejan estos requisitos automáticamente - no se necesita configuración manual.

### Modo sin raíz frente a modo raíz {/* #rootless-vs-root-mode */}

- **Modo independiente** (`start.duplistatus`): Se ejecuta sin raíz con `--userns=keep-id`
- **Modo pod** (`pod.testing`): Se ejecuta como raíz dentro del pod para fines de prueba

Ambos modos funcionan correctamente con la detección automática de DNS.

## Configuración del entorno {/* #environment-configuration */}

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

**Nota**: El mensaje de error del script menciona `REMOTE_USER` y `REMOTE_HOST`, pero estos no son realmente utilizados por `start.duplistatus`—solo se requiere `IMAGE`.
