---
translation_last_updated: '2026-02-06T22:33:35.772Z'
source_file_mtime: '2026-02-06T22:10:19.145Z'
source_file_hash: ae2bbcffdb897dd2
translation_language: es
source_file_path: development/setup.md
---
# Configuración de Desarrollo {#development-setup}

## Requisitos previos {#prerequisites}

- Docker / Docker Compose
- Node.js >=24.12.0
- pnpm >=10.24.0
- SQLite3
- Inkscape (para traducción de SVG de documentación y exportación de PNG; requerido solo si ejecuta `translate` o `translate:svg`)
- bat/batcat (para mostrar una versión elegante de `translate:help`)
- direnv (para cargar automáticamente los archivos `.env*`)

## Pasos {#steps}

1. Clona el repositorio:

    ```bash
    git clone https://github.com/wsj-br/duplistatus.git
    cd duplistatus
    ```

2. Instalar dependencias (Debian/Ubuntu):

    ```bash
    sudo apt update
    sudo apt install sqlite3 git inkscape bat -y
    ```

3. Eliminar instalaciones antiguas de Node.js (si ya lo tiene instalado)

    ```bash
    sudo apt-get purge nodejs npm -y
    sudo apt-get autoremove -y
    sudo rm -rf /usr/local/bin/npm 
    sudo rm -rf /usr/local/share/man/man1/node* 
    sudo rm -rf /usr/local/lib/dtrace/node.d
    rm -rf ~/.npm
    rm -rf ~/.node-gyp
    sudo rm -rf /opt/local/bin/node
    sudo rm -rf /opt/local/include/node
    sudo rm -rf /opt/local/lib/node_modules
    sudo rm -rf /usr/local/lib/node*
    sudo rm -rf /usr/local/include/node*
    sudo rm -rf /usr/local/bin/node*
    ```

4. Instala Node.js y pnpm:

    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    source ~/.bashrc
    nvm install --lts
    nvm use --lts
    npm install -g pnpm npm-check-updates doctoc
    ```

5. Configurar soporte de direnv

- Añadir estas líneas a su archivo `~/.bashrc`

    ```bash 
    # direnv support (apt install direnv)
    eval "$(direnv hook bash)"
    ```

con este comando:

    ```bash 
    (echo "# direnv support (apt install direnv)"; echo 'eval "$(direnv hook bash)') >> ~/.bashrc
    ```

en el directorio base del repositorio, ejecute:

    ```bash
    direnv allow
    ```

- Añadir estas líneas a su archivo `~/.profile`

    ```bash 
    # export the Bash environment (needed for Cursor's agents to load it).
    export BASH_ENV="$HOME/.bashrc"
    ```

con este comando:

    ```bash 
    (echo "# export the Bash environment (needed for Cursor's agents to load it)."; echo 'export BASH_ENV="$HOME/.bashrc"') >> ~/.profile
    ```

:::note
Necesita volver a abrir el terminal o cerrar/reabrir la aplicación Cursor para que estos cambios surtan efecto.
:::

6. Crear el archivo .env en el directorio base del repositorio con estas variables.

- Puede usar cualquier valor para `VERSION`; se actualizará automáticamente al usar los scripts de desarrollo.
- Use contraseñas aleatorias para `ADMIN_PASSWORD` y `USER_PASSWORD`; estas contraseñas se utilizarán en el script `pnpm take-screenshots`.
- Puede obtener la `OPENROUTER_API_KEY` desde [openrouter.ai](https://openrouter.ai).

    ```
    VERSION=x.x.x

    # Development user passwords
    ADMIN_PASSWORD="admin_secret"
    USER_PASSWORD="user_secret"


    # Openrouter.ai API key for translation scripts in documentation 
    OPENROUTER_API_KEY=sk-or-v1-your-key-for-translate-files
    ```

## Scripts Disponibles {#available-scripts}

El proyecto incluye varios scripts npm para diferentes tareas de desarrollo:

### Scripts de Desarrollo {#development-scripts}
- `pnpm dev` - Iniciar servidor de desarrollo en el puerto 8666 (incluye verificaciones previas)
- `pnpm build` - Compilar la aplicación para producción (incluye verificaciones previas)
- `pnpm lint` - Ejecutar ESLint para verificar la calidad del código
- `pnpm typecheck` - Ejecutar verificación de tipos de TypeScript
- `scripts/upgrade-dependencies.sh` - Actualizar todos los paquetes a la versión más reciente, verificar vulnerabilidades y repararlas automáticamente
- `scripts/clean-workspace.sh` - Limpiar el espacio de trabajo

**Nota:** El script `preinstall` aplica automáticamente pnpm como gestor de paquetes.

### Scripts de Producción {#production-scripts}
- `pnpm build-local` - Compilar y preparar para producción local (incluye verificaciones previas, copia archivos estáticos al directorio independiente)
- `pnpm start-local` - Iniciar servidor de producción localmente (puerto 8666, incluye verificaciones previas). **Nota:** Ejecute `pnpm build-local` primero.
- `pnpm start` - Iniciar servidor de producción (puerto 9666)

### Scripts de Docker {#docker-scripts}
- `pnpm docker-up` - Iniciar la pila de Docker Compose
- `pnpm docker-down` - Detener la pila de Docker Compose
- `pnpm docker-clean` - Limpiar el entorno de Docker y la caché
- `pnpm docker-devel` - Construir una imagen de Docker de desarrollo etiquetada como `wsj-br/duplistatus:devel`

### Scripts del Servicio Cron {#cron-service-scripts}
- `pnpm cron:start` - Iniciar servicio cron en modo producción
- `pnpm cron:dev` - Iniciar servicio cron en modo desarrollo con observación de archivos (puerto 8667)
- `pnpm cron:start-local` - Iniciar servicio cron localmente para pruebas (puerto 8667)

### Scripts de Prueba {#test-scripts}
- `pnpm generate-test-data` - Generar datos de backup de prueba (requiere parámetro --servers=N)
- `pnpm show-overdue-notifications` - Mostrar contenido de notificaciones retrasadas
- `pnpm run-overdue-check` - Ejecutar verificación de retraso en una fecha/hora específica
- `pnpm test-cron-port` - Probar conectividad del puerto de servicio cron
- `pnpm test-overdue-detection` - Probar lógica de detección de backup retrasado
- `pnpm validate-csv-export` - Validar funcionalidad de exportación CSV
- `pnpm set-smtp-test-config` - Configurar prueba SMTP desde variables de entorno (ver [Scripts de Prueba](test-scripts))
- `pnpm test-smtp-connections` - Probar compatibilidad cruzada de tipos de conexión SMTP (ver [Scripts de Prueba](test-scripts))
- `pnpm test-entrypoint` - Probar script de punto de entrada de Docker en desarrollo local (ver [Scripts de Prueba](test-scripts))
- `pnpm take-screenshots` - Tomar capturas de pantalla para documentación (ver [Herramientas de Documentación](documentation-tools))
