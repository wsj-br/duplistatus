# Configuración de Desarrollo {/* #development-setup */}

## Requisitos Previos {/* #prerequisites */}

- Docker / Docker Compose
- Node.js (consulta `engines.node` en `package.json`)
- pnpm (consulta `engines.pnpm` / `packageManager` en `package.json`)
- SQLite3
- Inkscape (para traducción de SVG de documentación y exportación PNG; requerido solo si ejecutas `translate` o `translate:svg`)
- bat/batcat (para mostrar una versión bonita del `translate:help`)
- direnv (para cargar automáticamente los archivos `.env*`)
- Playwright Chromium (ejecuta `pnpm take-screenshots:install` después de `pnpm install`; esto ejecuta `playwright install chromium`)

## Pasos {/* #steps */}

### 1. Clonar el repositorio: {/* #1-clone-the-repository */}

    ```bash
    git clone https://github.com/wsj-br/duplistatus.git
    cd duplistatus
    ```

### 2. Instalar dependencias (Debian/Ubuntu): {/* #2-install-dependencies-debianubuntu */}

    ```bash
    sudo apt update
    sudo apt install sqlite3 git inkscape bat -y
    sudo apt install -y build-essential python3 python3-dev python3-setuptools make g++ gcc pkg-config 
    ```

### 3. Eliminar instalaciones antiguas de Node.js (si ya lo tienes instalado) {/* #3-remove-old-nodejs-installations-if-you-already-have-it-installed */}

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

### 4. Instalar Node.js y pnpm: {/* #4-install-nodejs-and-pnpm */}

    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    source ~/.bashrc
    nvm install --lts
    nvm use --lts
    npm config set allow-scripts=pnpm --location=user
    npm install -g pnpm npm-check-updates doctoc
    ```

### 5. Configurar soporte de direnv {/* #5-set-up-direnv-support */}

Añadir estas líneas a tu archivo `~/.bashrc`

    ```bash 
    # direnv support (apt install direnv)
    eval "$(direnv hook bash)"
    ```

con este comando:

    ```bash 
    (echo "# direnv support (apt install direnv)"; echo 'eval "$(direnv hook bash)') >> ~/.bashrc
    ```

en el directorio base del repositorio, ejecuta:

    ```bash
    direnv allow
    ```

Añadir estas líneas a tu archivo `~/.profile`

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
  Necesitas reabrirla terminal o puede que tengas que cerrar/reabrir el editor de código IDE (Visual Studio Code,
  Cursor, Lingma, Antigravity, Zed, ...) para que estos cambios surtan efecto.
:::

### 6. Crear el archivo `.env` en el directorio base del repositorio con estas variables. {/* #6-create-the-env-file-at-the-repository-basedir-with-these-variables */}

- Puedes usar cualquier valor para `VERSION`; se actualizará automáticamente al usar los scripts de desarrollo.
- Usa contraseñas aleatorias para `ADMIN_PASSWORD` y `USER_PASSWORD`; estas contraseñas se utilizarán en el script `pnpm take-screenshots`.
- Puedes obtener `OPENROUTER_API_KEY` de [openrouter.ai](https://openrouter.ai).

    ```bash
    VERSION=x.x.x

    # Development user passwords
    ADMIN_PASSWORD="admin_secret"
    USER_PASSWORD="user_secret"


    # Openrouter.ai API key for translation scripts in documentation 
    OPENROUTER_API_KEY=sk-or-v1-your-key-for-translate-files
    ```

## Scripts Disponibles {/* #available-scripts */}

El proyecto incluye varios scripts npm para diferentes tareas de desarrollo:

### Scripts de desarrollo {/* #development-scripts */}
- `pnpm dev` - Inicia el servidor de desarrollo de Next.js (puerto 8666) y el servicio cron (puerto 8667) juntos a través de `concurrently` (incluye comprobaciones previas). CTRL-C detiene ambos. `NODE_OPTIONS` para Next.js carga `scripts/dev-preload.cjs`, que aplica `scripts/peer-ip.cjs` (dirección de par TCP para listas de permitidos de IP) y marcas de tiempo de registro de solicitudes.
- `pnpm dev:next` - Inicia solo el servidor de desarrollo de Next.js en el puerto 8666 (sin cron).
- `pnpm build` - Compila la aplicación para producción (incluye comprobaciones previas)
- `pnpm lint` - Ejecuta ESLint para comprobar la calidad del código
- `pnpm typecheck` - Ejecuta la comprobación de tipos de TypeScript
- `scripts/upgrade-dependencies.sh` — Actualización segura para compilación de cada paquete del espacio de trabajo (detección automática). Resuelve las versiones más recientes con `npm-check-updates`, instala desde la raíz del espacio de trabajo y mantiene solo las actualizaciones que pasan `typecheck`/`lint` de cada paquete (las compuertas de pares fijan `eslint` / `typescript` cuando la pila de linting no permite la versión principal más reciente). Luego ejecuta `pnpm audit` / `audit --fix` y aplica forzadamente (e informa) cualquier corrección de seguridad que requiera cambios de código. Actualiza el archivo de bloqueo del espacio de trabajo y browserslist. Prefiere `source ./scripts/upgrade-dependencies.sh` para que **nvm** se aplique a tu shell; en CI o automatización usa `CI=1` o `UPGRADE_ALLOW_EXEC=1` al ejecutar el archivo directamente. Consulta también `scripts/upgrade-tools.sh` solo para herramientas de Node/pnpm.
- `scripts/clean-workspace.sh` - Limpia el espacio de trabajo
- `pnpm i18n:tools --local` / `--remote` — Enlace a un `ai-i18n-tools` hermano o restaura el último paquete npm (`scripts/link-ai-i18n-tools.sh`). No cometas el especificador `link:`.

**Nota:** El script `preinstall` aplica automáticamente pnpm como gestor de paquetes.

### Scripts de documentación {/* #documentation-scripts */}

Estos scripts deben ejecutarse desde el directorio `documentation/`:

- `pnpm start` - Compila y sirve el sitio de documentación en modo de producción (puerto 3000 por defecto)
- `pnpm start:en` - Inicia el servidor de desarrollo de documentación en inglés (recarga en caliente habilitada)
- `pnpm start:fr` - Inicia el servidor de desarrollo de documentación en locale francés (recarga en caliente habilitada)
- `pnpm start:de` - Inicia el servidor de desarrollo de documentación en locale alemán (recarga en caliente habilitada)
- `pnpm start:es` - Inicia el servidor de desarrollo de documentación en locale español (recarga en caliente habilitada)
- `pnpm start:pt-br` - Inicia el servidor de desarrollo de documentación en locale portugués (Brasil) (recarga en caliente habilitada)
- `pnpm build` - Compila el sitio de documentación para producción
- `pnpm write-translations` - Extrae cadenas traducibles de la documentación
- `pnpm translate` - Traduce archivos de documentación usando IA (consulta [Flujo de traducción](translation-workflow))
- `pnpm lint` - Ejecuta ESLint en archivos fuente de documentación

Los servidores de desarrollo (`start:*`) proporcionan reemplazo de módulo en caliente para desarrollo rápido. El puerto predeterminado es 3000.

### Scripts de producción {/* #production-scripts */}
- `pnpm build-local` - Compila y prepara para producción local (incluye comprobaciones previas, copia archivos estáticos al directorio independiente)
- `pnpm start-local` - Inicia el servidor de producción localmente (puerto 8666, incluye comprobaciones previas). **Nota:** Ejecuta `pnpm build-local` primero. Inicia el servidor independiente con `--require ./scripts/peer-ip.cjs`.
- `pnpm start` - Inicia el servidor de producción (puerto 9666) con la misma precarga de IP de par. Docker usa `docker-entrypoint.sh` para cargar el mismo script.

### Scripts de Docker {/* #docker-scripts */}
- `pnpm docker:up` - Inicia la pila de Docker Compose
- `pnpm docker:down` - Detiene la pila de Docker Compose
- `pnpm docker:clean` - Limpia el entorno de Docker y la caché
- `pnpm docker:devel` - Compila una imagen de Docker de desarrollo etiquetada como `wsj-br/duplistatus:devel`

### Scripts del servicio cron {/* #cron-service-scripts */}
- `pnpm cron:start` - Inicia el servicio cron en modo de producción
- `pnpm cron:dev` - Inicia solo el servicio cron en modo de desarrollo con observación de archivos (puerto 8667). Generalmente innecesario cuando se usa `pnpm dev`, que ya inicia cron.
- `pnpm cron:start-local` - Inicia el servicio cron localmente para pruebas (puerto 8667)

### Scripts de prueba {/* #test-scripts */}
- `pnpm generate-test-data` - Genera datos de copia de seguridad de prueba (requiere parámetro --servers=N)
- `pnpm validate-csv-export` - Valida la funcionalidad de exportación CSV
- `pnpm test-entrypoint` - Prueba el script de punto de entrada de Docker en desarrollo local (consulta [Scripts de prueba](test-scripts))
- `pnpm take-screenshots` - Toma capturas de pantalla para la documentación (consulta [Herramientas de documentación](documentation-tools))

Las comprobaciones de vencimiento, comprobaciones de salud de cron y pruebas SMTP se realizan a través de la aplicación en ejecución y `curl` (consulta [Scripts de prueba](test-scripts)); los antiguos ayudantes independientes `pnpm` para esos fueron eliminados.
