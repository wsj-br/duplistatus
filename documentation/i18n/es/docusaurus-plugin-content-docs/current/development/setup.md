# Configuración de Desarrollo {#development-setup}

## Requisitos previos {#prerequisites}

- Docker / Docker Compose
- Node.js >=24.12.0
- pnpm >=10.24.0 (packageManager: pnpm@10.30.3)
- SQLite3
- Inkscape (para la traducción de SVGs de documentación y exportación a PNG; requerido solo si ejecutas `translate` o `translate:svg`)
- bat/batcat (para mostrar una versión bonita de `translate:help`)
- direnv (para cargar automáticamente los archivos `.env*`)

## Pasos {#steps}

### 1. Clonar el repositorio: {#1-clone-the-repository}

    ```bash
    git clone https://github.com/wsj-br/duplistatus.git
    cd duplistatus
    ```

### 2. Instalar dependencias (Debian/Ubuntu): {#2-install-dependencies-debianubuntu}

    ```bash
    sudo apt update
    sudo apt install sqlite3 git inkscape bat -y
    ```

### 3. Eliminar instalaciones antiguas de Node.js (si ya lo tiene instalado) {#3-remove-old-nodejs-installations-if-you-already-have-it-installed}

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

### 4. Instalar Node.js y pnpm: {#4-install-nodejs-and-pnpm}

    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    source ~/.bashrc
    nvm install --lts
    nvm use --lts
    npm install -g pnpm npm-check-updates doctoc
    ```

### 5. Configurar soporte de direnv {#5-set-up-direnv-support}

Añadir estas líneas a su archivo `~/.bashrc`

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

Añadir estas líneas a su archivo `~/.profile`

    ```bash 
    # export the Bash environment (needed for code editor or AI Agents to load it).
    export BASH_ENV="$HOME/.bashrc"
    ```

con este comando:

    ```bash 
    (echo "# export the Bash environment (needed for code editor or AI Agents to load it)."; \
     echo 'export BASH_ENV="$HOME/.bashrc"') >> ~/.profile
    ```

:::info
  Necesita volver a abrir el terminal o es posible que deba cerrar/volver a abrir el editor de código IDE (Visual Studio Code, 
  Cursor, Lingma, Antigravity, Zed, ...) para que estos cambios surtan efecto.
:::

### 6. Crear el archivo `.env` en el directorio base del repositorio con estas variables. {#6-create-the-env-file-at-the-repository-basedir-with-these-variables}

- Puede usar cualquier valor para `VERSION`; se actualizará automáticamente al usar los scripts de desarrollo.
- Use contraseñas aleatorias para `ADMIN_PASSWORD` y `USER_PASSWORD`; estas contraseñas se utilizarán en el script `pnpm take-screenshots`.
- Puede obtener la `OPENROUTER_API_KEY` desde [openrouter.ai](https://openrouter.ai).

    ```bash
    VERSION=x.x.x

    # Development user passwords
    ADMIN_PASSWORD="admin_secret"
    USER_PASSWORD="user_secret"


    # Openrouter.ai API key for translation scripts in documentation 
    OPENROUTER_API_KEY=sk-or-v1-your-key-for-translate-files
    ```

## Scripts Disponibles {#available-scripts}

El proyecto incluye varios scripts npm para diferentes tareas de desarrollo:

### Scripts de desarrollo {#development-scripts}
- `pnpm dev` - Iniciar el servidor de desarrollo en el puerto 8666 (incluye verificaciones previas)
- `pnpm build` - Compilar la aplicación para producción (incluye verificaciones previas)
- `pnpm lint` - Ejecutar ESLint para verificar la calidad del código
- `pnpm typecheck` - Ejecutar verificación de tipos de TypeScript
- `scripts/upgrade-dependencies.sh` — Actualizar paquetes raíz y `documentation/` (`npm-check-updates`), actualizar el archivo de bloqueo del espacio de trabajo, actualizar browserslist y ejecutar `pnpm audit` / fix. Prefiere `source ./scripts/upgrade-dependencies.sh` para que **nvm** se aplique a tu shell; en CI o automatización, usa `CI=1` o `DUPLISTATUS_UPGRADE_ALLOW_EXEC=1` al ejecutar el archivo directamente. Consulta también `scripts/upgrade-tools.sh` para herramientas de Node/pnpm únicamente.
- `scripts/clean-workspace.sh` - Limpiar el espacio de trabajo

**Nota:** El script `preinstall` aplica automáticamente pnpm como gestor de paquetes.

### Scripts de Documentación {#documentation-scripts}

Estos scripts deben ejecutarse desde el directorio `documentation/`:

- `pnpm start` - Construir y servir el sitio de documentación en modo producción (puerto 3000 por defecto)
- `pnpm start:en` - Iniciar el servidor de desarrollo de documentación en inglés (recarga automática habilitada)
- `pnpm start:fr` - Iniciar el servidor de desarrollo de documentación en configuración regional francesa (recarga automática habilitada)
- `pnpm start:de` - Iniciar el servidor de desarrollo de documentación en configuración regional alemana (recarga automática habilitada)
- `pnpm start:es` - Iniciar el servidor de desarrollo de documentación en configuración regional española (recarga automática habilitada)
- `pnpm start:pt-br` - Iniciar el servidor de desarrollo de documentación en configuración regional portuguesa (Brasil) (recarga automática habilitada)
- `pnpm build` - Construir el sitio de documentación para producción
- `pnpm write-translations` - Extraer cadenas traducibles de la documentación
- `pnpm translate` - Traducir archivos de documentación usando IA (ver [Flujo de traducción](translation-workflow))
- `pnpm lint` - Ejecutar ESLint en los archivos fuente de la documentación

Los servidores de desarrollo (`start:*`) proporcionan reemplazo de módulos en caliente para un desarrollo rápido. El puerto por defecto es 3000.

### Scripts de Producción {#production-scripts}
- `pnpm build-local` - Compilar y preparar para producción local (incluye verificaciones previas, copia archivos estáticos al directorio independiente)
- `pnpm start-local` - Iniciar servidor de producción localmente (puerto 8666, incluye verificaciones previas). **Nota:** Ejecute `pnpm build-local` primero.
- `pnpm start` - Iniciar servidor de producción (puerto 9666)

### Scripts de Docker {#docker-scripts}
- `pnpm docker:up` - Iniciar la pila de Docker Compose
- `pnpm docker:down` - Detener la pila de Docker Compose
- `pnpm docker:clean` - Limpiar el entorno y caché de Docker
- `pnpm docker:devel` - Crear una imagen de desarrollo de Docker etiquetada como `wsj-br/duplistatus:devel`

### Scripts del Servicio Cron {#cron-service-scripts}
- `pnpm cron:start` - Iniciar servicio cron en modo producción
- `pnpm cron:dev` - Iniciar servicio cron en modo desarrollo con observación de archivos (puerto 8667)
- `pnpm cron:start-local` - Iniciar servicio cron localmente para pruebas (puerto 8667)

### Scripts de prueba {#test-scripts}
- `pnpm generate-test-data` - Generar datos de respaldo para pruebas (requiere el parámetro --servers=N)
- `pnpm validate-csv-export` - Validar la funcionalidad de exportación CSV
- `pnpm test-entrypoint` - Probar el script de entrada de Docker en desarrollo local (ver [Scripts de prueba](test-scripts))
- `pnpm take-screenshots` - Tomar capturas de pantalla para la documentación (ver [Herramientas de documentación](documentation-tools))

Las comprobaciones retrasadas, las comprobaciones de salud de cron y las pruebas de SMTP se realizan a través de la aplicación en ejecución y `curl` (ver [Test Scripts](test-scripts)); se eliminaron los antiguos ayudantes independientes `pnpm` para esos.
