# Guía de Instalación

La aplicación puede desplegarse usando Docker, [Portainer Stacks](https://docs.portainer.io/user/docker/stacks) o Podman. Después de la instalación, es posible que desee configurar la ZONA HORARIA y el IDIOMA, como se describe en [Configurar Zona Horaria e Idioma](./configure-tz-lang.md) y necesitará configurar los servidores Duplicati para enviar registros de respaldo a **duplistatus**, como se describe en la sección [Configuración de Duplicati](./duplicati-server-configuration.md).

## Requisitos Previos

Asegúrese de tener instalado lo siguiente:

- Docker Engine - [Guía de instalación en Debian](https://docs.docker.com/engine/install/debian/)
- Docker Compose - [Guía de instalación en Linux](https://docs.docker.com/compose/install/linux/)
- Portainer (opcional) - [Guía de instalación en Docker](https://docs.portainer.io/start/install-ce/server/docker/linux)
- Podman (opcional) - [Guía de instalación](http://podman.io/docs/installation#debian)

## Autenticación

**duplistatus** desde la versión 0.9.x requiere autenticación de usuario. Se crea automáticamente una cuenta `admin` predeterminada al instalar la aplicación por primera vez o al actualizar desde una versión anterior:
\- nombre de usuario: `admin`
\- contraseña: `Duplistatus09`

Puede crear cuentas de usuario adicionales en [Configuración > Usuarios](../user-guide/settings/user-management-settings.md) después del primer inicio de sesión.

::::info\[IMPORTANT]
The system enforces a minimum password length and complexity. These requirements can be adjusted using the `PWD_ENFORCE` and `PWD_MIN_LEN` [environment variables](environment-variables.md). Using a password without sufficient complexity or with a short length can compromise security. Please configure these settings carefully.
::::

### Imágenes de Contenedor

Puede usar las imágenes de:

- **Docker Hub**: `docker.io/wsjbr/duplistatus:latest`
- **GitHub Container Registry**: `ghcr.io/wsj-br/duplistatus:latest`

### Opción 1: Usando Docker Compose

Este es el método recomendado para implementaciones locales o cuando desee personalizar la configuración. Utiliza un archivo `docker compose` para definir y ejecutar el contenedor con todas sus configuraciones.

```bash
# descargar el archivo compose
wget https://github.com/wsj-br/duplistatus/raw/refs/heads/master/production.yml -O duplistatus.yml
# iniciar el contenedor
docker compose -f duplistatus.yml up -d
```

Consulte la sección [Zona Horaria y Configuración Regional](./configure-tz-lang.md) para más detalles sobre cómo ajustar la zona horaria y el formato de números/fecha/hora.

### Opción 2: Usando Portainer Stacks (Docker Compose)

1. Vaya a "Stacks" en su servidor [Portainer](https://docs.portainer.io/user/docker/stacks) y haga clic en "Add stack".
2. Nombre su stack (por ejemplo, "duplistatus").
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
      - LANG=en_GB
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

5. Consulte la sección [Zona Horaria y Configuración Regional](./configure-tz-lang.md) para más detalles sobre cómo ajustar la zona horaria y el formato de números/fecha/hora.
6. Haga clic en "Deploy the stack".

### Opción 3: Usando Portainer Stacks (Repositorio de GitHub)

1. En [Portainer](https://docs.portainer.io/user/docker/stacks), vaya a "Stacks" y haga clic en "Add stack".
2. Nombre su stack (por ejemplo, "duplistatus").
3. Elija "Build method" como "Repository".
4. Ingrese la URL del repositorio: `https://github.com/wsj-br/duplistatus.git`
5. En el campo "Compose path", ingrese: `production.yml`
6. (opcional) Configure las variables de entorno `TZ`, `LANG`, `PWD_ENFORCE` y `PWD_MIN_LEN` en la sección "Environment variables". Consulte la sección [Zona Horaria y Configuración Regional](./configure-tz-lang.md) para más detalles sobre cómo ajustar la zona horaria y el formato de números/fecha/hora.
7. Haga clic en "Deploy the stack".

### Opción 4: Usando Docker CLI

```bash
# Crear el volumen
docker volume create duplistatus_data

# Iniciar el contenedor
docker run -d \
  --name duplistatus \
  -p 9666:9666 \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest
```

- El volumen `duplistatus_data` se utiliza para almacenamiento persistente. La imagen del contenedor usa `Europe/London` como zona horaria predeterminada y `en_GB` como configuración regional (idioma) predeterminada.

### Opción 5: Usando Podman (CLI) `rootless`

Para configuraciones básicas, puede iniciar el contenedor sin configuración de DNS:

```bash
mkdir -p ~/duplistatus_data
# Iniciar el contenedor (independiente)
podman run -d \
  --name duplistatus \
  --userns=keep-id \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -p 9666:9666 \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest
```

#### Configuración de DNS para Contenedores Podman {#configuring-dns-for-podman-containers}

Si necesita una configuración de DNS personalizada (por ejemplo, para Tailscale MagicDNS, redes corporativas o configuraciones de DNS personalizadas), puede configurar manualmente los servidores DNS y los dominios de búsqueda.

**Encontrar su configuración de DNS:**

1. **Para sistemas systemd-resolved** (la mayoría de las distribuciones Linux modernas):
   ```bash
   # Obtener servidores DNS
   resolvectl status | grep "DNS Servers:" | awk '{print "--dns " $3}'

   # Obtener dominios de búsqueda DNS
   resolvectl status | grep "DNS Domain:" | awk '{print "--dns-search " $3}'
   ```

2. **Para sistemas no systemd** o como alternativa:

   ```bash
   cat /run/systemd/resolve/resolv.conf 2>/dev/null || cat /etc/resolv.conf
   ```

   Busque líneas que comiencen con `nameserver` (para servidores DNS) y `search` (para dominios de búsqueda). Si no está seguro de su configuración de DNS o dominios de búsqueda de red, consulte a su administrador de red para obtener esta información.

**Ejemplo con configuración de DNS:**

```bash
mkdir -p ~/duplistatus_data
# Iniciar el contenedor con configuración de DNS
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

Puede especificar múltiples servidores DNS agregando múltiples banderas `--dns`:

```bash
--dns 8.8.8.8 --dns 1.1.1.1
```

Puede especificar múltiples dominios de búsqueda agregando múltiples banderas `--dns-search`:

```bash
--dns-search example.com --dns-search internal.local
```

**Nota**: Omita las direcciones IPv6 (que contienen `:`) y las direcciones localhost (como `127.0.0.53`) al configurar servidores DNS.

Consulte la sección [Zona Horaria y Configuración Regional](./configure-tz-lang.md) para más detalles sobre cómo ajustar la zona horaria y el formato de números/fecha/hora.

### Opción 6: Usando Podman Pods

Los pods de Podman le permiten ejecutar múltiples contenedores en un espacio de nombres de red compartido. Esto es útil para pruebas o cuando necesita ejecutar duplistatus junto con otros contenedores.

**Configuración básica de pod:**

```bash
mkdir -p ~/duplistatus_data

# Crear el pod
podman pod create --name duplistatus-pod --publish 9666:9666/tcp

# Crear el contenedor en el pod
podman create --name duplistatus \
  --pod duplistatus-pod \
  --user root \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Iniciar el pod
podman pod start duplistatus-pod
```

#### Configuración de DNS para Podman Pods

Al usar pods, la configuración de DNS debe establecerse a nivel de pod, no a nivel de contenedor.
Use los mismos métodos descritos en la Opción 5 para encontrar sus servidores DNS y dominios de búsqueda.

**Ejemplo con configuración de DNS:**

```bash
mkdir -p ~/duplistatus_data

# Crear el pod con configuración de DNS
podman pod create --name duplistatus-pod \
  --publish 9666:9666/tcp \
  --dns 100.100.100.100 \
  --dns-search example.com

# Crear el contenedor en el pod
podman create --name duplistatus \
  --pod duplistatus-pod \
  --user root \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Iniciar el pod
podman pod start duplistatus-pod
```

**Gestión del pod:**

```bash
# Detener el pod (detiene todos los contenedores en el pod)
podman pod stop duplistatus-pod

# Iniciar el pod
podman pod start duplistatus-pod

# Eliminar el pod y todos los contenedores
podman pod rm -f duplistatus-pod
```

## Configuración Esencial

1. Configure sus [servidores Duplicati](duplicati-server-configuration.md) para enviar mensajes de registro de respaldo a duplistatus (requerido).
2. Inicie sesión en duplistatus – consulte las instrucciones en la [Guía del Usuario](../user-guide/overview.md#accessing-the-dashboard).
3. Recopile registros de respaldo iniciales – use la función [Recopilar Registros de Respaldo](../user-guide/collect-backup-logs.md) para poblar la base de datos con datos históricos de respaldo de todos sus servidores Duplicati. Esto también actualiza automáticamente los intervalos de monitoreo de vencimiento según la configuración de cada servidor.
4. Configure los ajustes del servidor – establezca alias y notas del servidor en [Configuración → Servidor](../user-guide/settings/server-settings.md) para hacer su panel más informativo.
5. Configure los ajustes de NTFY – configure las notificaciones a través de NTFY en [Configuración → NTFY](../user-guide/settings/ntfy-settings.md).
6. Configure los ajustes de correo electrónico – configure las notificaciones por correo electrónico en [Configuración → Correo Electrónico](../user-guide/settings/email-settings.md).
7. Configure las notificaciones de respaldo – configure notificaciones por respaldo o por servidor en [Configuración → Notificaciones de Respaldo](../user-guide/settings/backup-notifications-settings.md).

Consulte las siguientes secciones para configurar ajustes opcionales como zona horaria, formato de números y HTTPS.
