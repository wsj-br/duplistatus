# Guía de instalación {#installation-guide}

La aplicación se puede implementar usando Docker, [Portainer Stacks](https://docs.portainer.io/user/docker/stacks), o Podman. Después de la instalación, es posible que desee Configurar la Zona horaria e Idioma, como se describe en la sección [Configurar Zona horaria e Idioma](./configure-tz-lang.md) y necesita configurar los Servidores de Duplicati para enviar Logs de backup a **duplistatus**, como se describe en la sección [Configuración de Duplicati](./duplicati-server-configuration.md).

## Requisitos previos {#prerequisites}

Asegúrese de tener lo siguiente instalado:

- Docker Engine - [Guía de instalación de Debian](https://docs.docker.com/engine/install/debian/)
- Docker Compose - [Guía de instalación de Linux](https://docs.docker.com/compose/install/linux/)
- Portainer (opcional) - [Guía de instalación de Docker](https://docs.portainer.io/start/install-ce/server/docker/linux)
- Podman (opcional) - [Guía de instalación](http://podman.io/docs/installation#debian)

## Autenticación {#authentication}

**duplistatus** desde la versión 0.9.x requiere autenticación de Usuario. Una cuenta `admin` Por defecto se crea automáticamente al instalar la aplicación por primera vez o al actualizar desde una Versión anterior:
\- Nombre de usuario: `admin`
\- Contraseña: `Duplistatus09`

Puede crear cuentas de Usuarios adicionales en [Configuración > Usuarios](../user-guide/settings/user-management-settings.md) después del primer Iniciar sesión.

::::info\[IMPORTANT]
The system enforces a minimum password length and complexity. These requirements can be adjusted using the `PWD_ENFORCE` and `PWD_MIN_LEN` [environment variables](environment-variables.md). Using a password without sufficient complexity or with a short length can compromise security. Please configure these settings carefully.
::::

### Imágenes de contenedor {#container-images}

Puede usar las imágenes de:

- **Docker Hub**: `docker.io/wsjbr/duplistatus:latest`
- **GitHub Container Registry**: `ghcr.io/wsj-br/duplistatus:latest`

### Opción 1: Usando Docker Compose {#option-1-using-docker-compose}

Este es el método recomendado para implementaciones locales o cuando desea personalizar la Configuración. Utiliza un archivo `docker compose` para definir y ejecutar el contenedor con toda su Configuración.

```bash
# descargar el archivo de composición {#download-the-compose-file}
wget https://github.com/wsj-br/duplistatus/raw/refs/heads/master/production.yml -O duplistatus.yml
# iniciar el contenedor {#start-the-container}
docker compose -f duplistatus.yml up -d
```

Verifique la sección [Zona horaria y Locale](./configure-tz-lang.md) para más Detalles sobre cómo ajustar la Zona horaria y el formato de números/Fecha/Formato de hora.

### Opción 2: Usando Portainer Stacks (Docker Compose) {#option-2-using-portainer-stacks-docker-compose}

1. Vaya a "Stacks" en su servidor [Portainer](https://docs.portainer.io/user/docker/stacks) y haga clic en "Añadir stack".
2. Nombre su stack (p. ej., "duplistatus").
3. Elija "Build method" como "Web editor".
4. Copiar y pegue esto en el editor web:

```yaml
# duplistatus production compose.yml {#duplistatus-production-composeyml}
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

5. Verifique la sección [Zona horaria y Locale](./configure-tz-lang.md) para más Detalles sobre cómo ajustar la Zona horaria y el formato de números/Fecha/Formato de hora.
6. Haga clic en "Deploy the stack".

### Opción 3: Usando Portainer Stacks (Repositorio de GitHub) {#option-3-using-portainer-stacks-github-repository}

1. En [Portainer](https://docs.portainer.io/user/docker/stacks), vaya a "Stacks" y haga clic en "Añadir stack".
2. Nombre su stack (p. ej., "duplistatus").
3. Elija "Build method" como "Repository".
4. Ingrese la URL del repositorio: `https://github.com/wsj-br/duplistatus.git`
5. En el campo "Compose path", ingrese: `production.yml`
6. (opcional) Establezca las variables de entorno `TZ`, `LANG`, `PWD_ENFORCE` y `PWD_MIN_LEN` en la sección "Environment variables". Verifique la sección [Zona horaria y Locale](./configure-tz-lang.md) para más Detalles sobre cómo ajustar la Zona horaria y el formato de números/Fecha/Formato de hora.
7. Haga clic en "Deploy the stack".

### Opción 4: Usando Docker CLI {#option-4-using-docker-cli}

```bash
# Crear el volumen {#create-the-volume}
docker volume create duplistatus_data

# Iniciar el contenedor {#start-the-container}
docker run -d \
  --name duplistatus \
  -p 9666:9666 \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest
```

- El volumen `duplistatus_data` se utiliza para Alm. persistente. La imagen del contenedor utiliza `Europe/London` como Zona horaria Por defecto e `en_GB` como locale Por defecto (Idioma).

### Opción 5: Usando Podman (CLI) `rootless` {#option-5-using-podman-cli-rootless}

Para configuraciones básicas, puede Iniciar el contenedor sin configuración de DNS:

```bash
mkdir -p ~/duplistatus_data
# Iniciar el contenedor (independiente) {#start-the-container-standalone}
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

Si necesita configuración de DNS personalizada (p. ej., para Tailscale MagicDNS, redes corporativas o configuraciones de DNS personalizadas), puede configurar manualmente Servidores de DNS y dominios de Buscar.

**Encontrar su configuración de DNS:**

1. **Para sistemas systemd-resolved** (la mayoría de las distribuciones modernas de Linux):
   ```bash
   # Obtener Servidores de DNS
   resolvectl status | grep "DNS Servers:" | awk '{print "--dns " $3}'

   # Obtener dominios de Buscar de DNS
   resolvectl status | grep "DNS Domain:" | awk '{print "--dns-search " $3}'
   ```

2. **Para sistemas que no son systemd** o como alternativa:

   ```bash
   cat /run/systemd/resolve/resolv.conf 2>/dev/null || cat /etc/resolv.conf
   ```

   Busque líneas que comiencen con `nameserver` (para Servidores de DNS) y `search` (para dominios de Buscar). Si no está seguro de su Configuración de DNS o dominios de Buscar de red, consulte a su administrador de red para obtener esta información.

**Ejemplo con configuración de DNS:**

```bash
mkdir -p ~/duplistatus_data
# Iniciar el contenedor con configuración de DNS {#start-the-container-with-dns-configuration}
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

Puede especificar múltiples Servidores de DNS Añadiendo múltiples banderas `--dns`:

```bash
--dns 8.8.8.8 --dns 1.1.1.1
```

Puede especificar múltiples dominios de Buscar Añadiendo múltiples banderas `--dns-search`:

```bash
--dns-search example.com --dns-search internal.local
```

**Nota**: Omitir direcciones IPv6 (que contienen `:`) y direcciones localhost (como `127.0.0.53`) cuando configure Servidores de DNS.

Verifique la sección [Zona horaria y Locale](./configure-tz-lang.md) para más Detalles sobre cómo ajustar la Zona horaria y el formato de números/Fecha/Formato de hora.

### Opción 6: Usando Podman Pods {#option-6-using-podman-pods}

Los pods de Podman le permiten ejecutar múltiples contenedores en un espacio de nombres de red compartido. Esto es útil para pruebas o cuando necesita ejecutar duplistatus junto con otros contenedores.

**Configuración básica del pod:**

```bash
mkdir -p ~/duplistatus_data

# Crear el pod {#create-the-pod}
podman pod create --name duplistatus-pod --publish 9666:9666/tcp

# Crear el contenedor en el pod {#create-the-container-in-the-pod}
podman create --name duplistatus \
  --pod duplistatus-pod \
  --user root \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Iniciar el pod {#start-the-pod}
podman pod start duplistatus-pod
```

#### Configuración de DNS para Podman Pods {#configuring-dns-for-podman-pods}

Cuándo se usan pods, la configuración de DNS debe establecerse a nivel de pod, no a nivel de contenedor.
Utilice los mismos métodos descritos en la Opción 5 para encontrar sus Servidores de DNS y dominios de Buscar.

**Ejemplo con configuración de DNS:**

```bash
mkdir -p ~/duplistatus_data

# Crear el pod con configuración de DNS {#create-the-pod-with-dns-configuration}
podman pod create --name duplistatus-pod \
  --publish 9666:9666/tcp \
  --dns 100.100.100.100 \
  --dns-search example.com

# Crear el contenedor en el pod {#create-the-container-in-the-pod}
podman create --name duplistatus \
  --pod duplistatus-pod \
  --user root \
  -e TZ=Europe/London \
  -e LANG=en_GB \
  -v ~/duplistatus_data:/app/data \
  ghcr.io/wsj-br/duplistatus:latest

# Iniciar el pod {#start-the-pod}
podman pod start duplistatus-pod
```

**Gestión del pod:**

```bash
# Detener el pod (detiene todos los contenedores en el pod) {#stop-the-pod-stops-all-containers-in-the-pod}
podman pod stop duplistatus-pod

# Iniciar el pod {#start-the-pod}
podman pod start duplistatus-pod

# Eliminar el pod y todos los contenedores {#remove-the-pod-and-all-containers}
podman pod rm -f duplistatus-pod
```

## Configuración esencial {#essential-configuration}

1. Configurar sus [Servidores de Duplicati](duplicati-server-configuration.md) para enviar Mensajes de Logs de backup a duplistatus (requerido).
2. Iniciar sesión en duplistatus – consulte las instrucciones en la [Guía del Usuario](../user-guide/overview.md#accessing-the-dashboard).
3. Recopilar Logs de backup iniciales – utilice la función [Recopilar logs de backup](../user-guide/collect-backup-logs.md) para completar la base de datos con datos de backup históricos de todos sus Servidores de Duplicati. Esto también actualiza automáticamente los intervalos de monitoreo de backups retrasados según la configuración de cada Servidores.
4. Configurar ajustes del servidor – configure Alias del servidor y Notas en [Configuración → Servidores](../user-guide/settings/server-settings.md) para hacer su Panel de control más informativo.
5. Configurar ajustes de NTFY – configure notificaciones a través de NTFY en [Configuración → NTFY](../user-guide/settings/ntfy-settings.md).
6. Configurar ajustes de Correo electrónico – configure notificaciones por Correo electrónico en [Configuración → Correo electrónico](../user-guide/settings/email-settings.md).
7. Configurar notificaciones de backup – configure notificaciones por backup o por Servidores en [Configuración → Notificaciones de backup](../user-guide/settings/backup-notifications-settings.md).

Consulte las siguientes secciones para Configurar ajustes opcionales como Zona horaria, Formato de números y HTTPS.
