# Guía de Instalación {#installation-guide}

La aplicación se puede implementar usando Docker, [Portainer Stacks](https://docs.portainer.io/user/docker/stacks), o Podman. Después de la instalación, es posible que desee configurar la ZONA HORARIA, como se describe en la sección [Configurar Zona horaria](./configure-tz.md) y necesita configurar los servidores Duplicati para enviar logs de backup a **duplistatus**, como se describe en la sección [Configuración de Duplicati](./duplicati-server-configuration.md).

## Requisitos previos {#prerequisites}

Asegúrese de tener lo siguiente instalado:

- Docker Engine - [Guía de instalación en Debian](https://docs.docker.com/engine/install/debian/)
- Docker Compose - [Guía de instalación en Linux](https://docs.docker.com/compose/install/linux/)
- Portainer (opcional) - [Guía de instalación en Docker](https://docs.portainer.io/start/install-ce/server/docker/linux)
- Podman (opcional) - [Guía de instalación](http://podman.io/docs/installation#debian)

## Autenticación {#authentication}

**duplistatus** desde la versión 0.9.x requiere autenticación de usuario. Una cuenta `admin` por defecto se crea automáticamente al instalar la aplicación por primera vez o al actualizar desde una versión anterior:
    - Nombre de usuario: `admin`
    - Contraseña: `Duplistatus09`

Puede crear cuentas de usuario adicionales en [Configuración > Usuarios](../user-guide/settings/user-management-settings.md) después del primer inicio de sesión.

::::info[IMPORTANTE]
El sistema aplica una longitud mínima de contraseña y requisitos de complejidad. Estos requisitos se pueden ajustar utilizando las [variables de entorno](environment-variables.md) `PWD_ENFORCE` y `PWD_MIN_LEN`. Utilizar una contraseña sin suficiente complejidad o con una longitud corta puede comprometer la seguridad. Por favor, utilice estas configuraciones con cuidado.
::::

### Imágenes de Contenedor {#container-images}

Puede utilizar las imágenes de:

- **Docker Hub**: `docker.io/wsjbr/duplistatus:latest`
- **GitHub Container Registry**: `ghcr.io/wsj-br/duplistatus:latest`

### Opción 1: Usar Docker Compose {#option-1-using-docker-compose}

Este es el método recomendado para implementaciones locales o cuando desea personalizar la configuración. Utiliza un archivo `docker compose` para definir y ejecutar el contenedor con todos sus parámetros.

```bash	
# download the compose file
wget https://github.com/wsj-br/duplistatus/raw/refs/heads/master/production.yml -O duplistatus.yml
# start the container
docker compose -f duplistatus.yml up -d
```

Consulte la sección [Zona horaria](./configure-tz.md) para obtener más detalles sobre cómo ajustar la zona horaria y el formato de número/fecha/hora.

### Opción 2: Usar Pilas de Portainer (Docker Compose) {#option-2-using-portainer-stacks-docker-compose}

1. Vaya a "Stacks" en su servidor [Portainer](https://docs.portainer.io/user/docker/stacks) y haga clic en "Añadir stack".
2. Asigne un nombre a su stack (p. ej., "duplistatus").
3. Elija "Build method" como "Web editor".
4. Copie y pegue esto en el editor web:

```yaml
# duplistatus production compose.yml
services:
  duplistatus:
    image: ghcr.io/wsj-br/duplistatus:latest
    container_name: duplistatus
    restart: unless-stopped
    environment:
      - TZ=Europe/London
      - PWD_ENFORCE=true
      - PWD_MIN_LEN=8
    ports:
      - "9666:9666"
    volumes:
      - duplistatus_data:/app/data
    networks:
      - duplistatus_network

networks:
  duplistatus_network:
    driver: bridge

volumes:
  duplistatus_data:
    name: duplistatus_data
``` 

5. Consulte la sección [Zona horaria](./configure-tz.md) para obtener más detalles sobre cómo ajustar la zona horaria y el formato de número/fecha/hora.
6. Haga clic en "Implementar el stack".

### Opción 3: Uso de Portainer Stacks (Repositorio de GitHub) {#option-3-using-portainer-stacks-github-repository}

1. En [Portainer](https://docs.portainer.io/user/docker/stacks), vaya a "Pilas" y haga clic en "Agregar pila".
2. Asigne un nombre a su pila (por ejemplo, "duplistatus").
3. Elija "Método de creación" como "Repositorio".
4. Ingrese la URL del repositorio: `https://github.com/wsj-br/duplistatus.git`
5. En el campo "Ruta de Compose", ingrese: `production.yml`
6. (opcional) Establezca las variables de entorno `TZ`, `LANG`, `PWD_ENFORCE` y `PWD_MIN_LEN` en la sección "Variables de entorno". Consulte la sección [Zona horaria](./configure-tz.md) para obtener más detalles sobre cómo ajustar la zona horaria y el formato de número/fecha/hora. 
6. Haga clic en "Desplegar la pila".

### Opción 4: Usar Docker CLI {#option-4-using-docker-cli}

```bash
# Create the volume
docker volume create duplistatus_data

# Start the container
docker run -d \
  --name duplistatus \
  -p 9666:9666 \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest
```

- El volumen `duplistatus_data` se utiliza para almacenamiento persistente. La imagen del contenedor utiliza `Europe/London` como zona horaria por defecto e `en_GB` como idioma por defecto.

### Opción 5: Usar Podman (CLI) `rootless` {#option-5-using-podman-cli-rootless}

Para configuraciones básicas, puede iniciar el contenedor sin configuración de DNS:

```bash
mkdir -p ~/duplistatus_data
# Start the container (standalone)
podman run -d \
  --name duplistatus \
  --userns=keep-id \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -p 9666:9666 \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest
```

#### Configuración de DNS para contenedores Podman {#configuring-dns-for-podman-containers}

Si necesita una configuración de DNS personalizada (por ejemplo, para Tailscale MagicDNS, redes corporativas o configuraciones de DNS personalizadas), puede configurar manualmente los servidores DNS y los dominios de búsqueda.

**Encontrar tu configuración de DNS:**

1. **Para sistemas con systemd-resolved** (la mayoría de distribuciones Linux modernas):

   ```bash
   # Get DNS servers
   resolvectl status | grep "DNS Servers:" | awk '{print "--dns " $3}'
   
   # Get DNS search domains
   resolvectl status | grep "DNS Domain:" | awk '{print "--dns-search " $3}'
   ```

2. **Para sistemas sin systemd** o como alternativa:

   ```bash
   cat /run/systemd/resolve/resolv.conf 2>/dev/null || cat /etc/resolv.conf
   ```

Busque líneas que comiencen con `nameserver` (para servidores DNS) y `search` (para dominios de búsqueda). Si no está seguro de su configuración de DNS o dominios de búsqueda de red, consulte a su administrador de red para obtener esta información.

**Ejemplo con configuración DNS:**

```bash
mkdir -p ~/duplistatus_data
# Start the container with DNS configuration
podman run -d \
  --name duplistatus \
  --userns=keep-id \
  --dns 100.100.100.100 \
  --dns-search example.com \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -p 9666:9666 \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest
```

Puede especificar múltiples servidores DNS añadiendo múltiples banderas `--dns`:

```bash
--dns 8.8.8.8 --dns 1.1.1.1
```

Puede especificar múltiples dominios de búsqueda añadiendo múltiples banderas `--dns-search`:

```bash
--dns-search example.com --dns-search internal.local
```

**Nota**: Omitir direcciones IPv6 (que contienen `:`) y direcciones localhost (como `127.0.0.53`) al configurar servidores DNS.

Consulte la sección [Zona horaria](./configure-tz.md) para obtener más detalles sobre cómo ajustar la zona horaria y el formato de número/fecha/hora.

### Opción 6: Uso de Pods de Podman {#option-6-using-podman-pods}

Los pods de Podman le permiten ejecutar múltiples contenedores en un espacio de nombres de red compartido. Esto es útil para pruebas o cuándo necesita ejecutar duplistatus junto con otros contenedores.

**Configuración básica del pod:**

```bash
mkdir -p ~/duplistatus_data

# Create the pod
podman pod create --name duplistatus-pod --publish 9666:9666/tcp

# Create the container in the pod
podman create --name duplistatus \
  --pod duplistatus-pod \
  --user root \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Start the pod
podman pod start duplistatus-pod
```

#### Configuración de DNS para Pods de Podman {#configuring-dns-for-podman-pods}

Cuando se utilizan pods, la configuración de DNS debe establecerse a nivel de pod, no a nivel de contenedor.
Utilice los mismos métodos descritos en la Opción 5 para encontrar sus servidores DNS y dominios de búsqueda.

**Ejemplo con configuración DNS:**

```bash
mkdir -p ~/duplistatus_data

# Create the pod with DNS configuration
podman pod create --name duplistatus-pod \
  --publish 9666:9666/tcp \
  --dns 100.100.100.100 \
  --dns-search example.com

# Create the container in the pod
podman create --name duplistatus \
  --pod duplistatus-pod \
  --user root \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Start the pod
podman pod start duplistatus-pod
```

**Gestión del pod:**

```bash
# Stop the pod (stops all containers in the pod)
podman pod stop duplistatus-pod

# Start the pod
podman pod start duplistatus-pod

# Remove the pod and all containers
podman pod rm -f duplistatus-pod
```

## Configuración Esencial {#essential-configuration}

1. Configure sus [servidores Duplicati](duplicati-server-configuration.md) para enviar mensajes de registro de copia de seguridad a duplistatus (requerido).
2. Inicie sesión en duplistatus – consulte las instrucciones en la [Guía del Usuario](../user-guide/overview.md#accessing-the-dashboard).
3. Recopile registros iniciales de copia de seguridad – use la función [Recopilar Registros de Copia de Seguridad](../user-guide/collect-backup-logs.md) para llenar la base de datos con datos históricos de copias de seguridad de todos sus servidores Duplicati. Esto también actualiza automáticamente los intervalos de monitoreo de copias de seguridad según la configuración de cada servidor.
4. Configure los ajustes del servidor – configure alias y notas de servidores en [Configuración → Servidor](../user-guide/settings/server-settings.md) para hacer su panel más informativo.
5. Configure los ajustes de NTFY – configure notificaciones mediante NTFY en [Configuración → NTFY](../user-guide/settings/ntfy-settings.md).
6. Configure los ajustes de correo electrónico – configure notificaciones por correo en [Configuración → Correo electrónico](../user-guide/settings/email-settings.md).
7. Configure las notificaciones de copia de seguridad – configure notificaciones por copia de seguridad o por servidor en [Configuración → Notificaciones de copia de seguridad](../user-guide/settings/backup-notifications-settings.md).

Consulte las siguientes secciones para configurar la configuración opcional como zona horaria, formato de números e HTTPS.
