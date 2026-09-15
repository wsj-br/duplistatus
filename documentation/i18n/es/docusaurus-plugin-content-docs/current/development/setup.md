# Configuración de Desarrollo {/* #development-setup */}

## Requisitos {/* #prerequisites */}

- Docker / Docker Compose
- Node.js (ver `engines.node` en `package.json`)
- pnpm (ver `engines.pnpm` / `packageManager` en `package.json`)
- SQLite3
- Inkscape (para la traducción de SVG y exportación de PNG en la documentación; requerido solo si ejecutas `translate` o `translate:svg`)
- bat/batcat (para mostrar una versión bonita del `translate:help`)
- direnv (para cargar automáticamente los archivos `.env*`)
- Playwright Chromium (ejecutar `pnpm take-screenshots:install` después de `pnpm install`; esto ejecuta `playwright install chromium`)

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

### 5. Configurar soporte para direnv {/* #5-set-up-direnv-support */}

Añadir estas líneas a tu archivo `~/.bashrc`

    ```bash 
    # direnv support (apt install direnv)
    eval "$(direnv hook bash)"
    ```

con este comando:

    ```bash 
    (echo "# direnv support (apt install direnv)"; echo 'eval "$(direnv hook bash)') >> ~/.bashrc
    ```

en el directorio base del repositorio, ejecutar:

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
  Necesitas volver a abrir la terminal o puede que necesites cerrar/reabrir el editor de código IDE (Visual Studio Code, 
  Cursor, Lingma, Antigravity, Zed, ...) para que estos cambios surtan efecto.
:::

### 6. Crear el archivo `.env` en el directorio base del repositorio con estas variables. {/* #6-create-the-env-file-at-the-repository-basedir-with-these-variables */}

- Puedes usar cualquier valor para `VERSION`; se actualizará automáticamente al usar los scripts de desarrollo.
- Usa contraseñas aleatorias para `ADMIN_PASSWORD` y `USER_PASSWORD`; estas contraseñas se usarán en el script `pnpm take-screenshots`.
- Puedes obtener la `OPENROUTER_API_KEY` de [openrouter.ai](https://openrouter.ai).

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
- `pnpm dev` - Iniciar el servidor de desarrollo de Next.js (puerto 8666) y el servicio cron (puerto 8667) juntos mediante `concurrently` (incluye precomprobaciones). CTRL-C detiene ambos. `NODE_OPTIONS` para Next.js carga `scripts/dev-preload.cjs`, que aplica `scripts/peer-ip.cjs` (dirección de par TCP para listas de permitidos de IP) y marcas de tiempo de registro de solicitudes.
- `pnpm dev:next` - Iniciar solo el servidor de desarrollo de Next.js en el puerto 8666 (sin cron).
- `pnpm build` - Compilar la aplicación para producción (incluye precomprobaciones)
- `pnpm lint` - Ejecutar ESLint para verificar la calidad del código
- `pnpm typecheck` - Ejecutar la comprobación de tipos de TypeScript
- `scripts/upgrade-dependencies.sh` — Actualización segura de compilación de todos los paquetes del espacio de trabajo (detección automática). Resuelve las últimas versiones con `npm-check-updates`, instala desde la raíz del espacio de trabajo y mantiene solo las actualizaciones que pasan cada `typecheck`/`lint` del paquete (las compuertas de pares fijan `eslint` / `typescript` cuando la pila de lint no permite la última versión mayor). Luego ejecuta `pnpm audit` / `audit --fix` y fuerza la aplicación (y reporta) cualquier corrección de seguridad que necesite cambios en el código. Actualiza el archivo de bloqueo del espacio de trabajo y browserslist. Prefiere `source ./scripts/upgrade-dependencies.sh` para que **nvm** se aplique a tu shell; en CI o automatización usa `CI=1` o `UPGRADE_ALLOW_EXEC=1` al ejecutar el archivo directamente. Consulta también `scripts/upgrade-tools.sh` para herramientas de Node/pnpm solo.
- `scripts/clean-workspace.sh` - Limpiar el espacio de trabajo

**Nota:** El script `preinstall` aplica automáticamente pnpm como gestor de paquetes.

### Scripts de documentación {/* #documentation-scripts */}

Estos scripts deben ejecutarse desde el directorio `documentation/`:

- `pnpm start` - Compilar y servir el sitio de documentación en modo producción (puerto 3000 por defecto)
- `pnpm start:en` - Iniciar servidor de desarrollo de documentación en inglés (recarga en caliente habilitada)
- `pnpm start:fr` - Iniciar servidor de desarrollo de documentación en francés (recarga en caliente habilitada)
- `pnpm start:de` - Iniciar servidor de desarrollo de documentación en alemán (recarga en caliente habilitada)
- `pnpm start:es` - Iniciar servidor de desarrollo de documentación en español (recarga en caliente habilitada)
- `pnpm start:pt-br` - Iniciar servidor de desarrollo de documentación en portugués (Brasil) (recarga en caliente habilitada)
- `pnpm build` - Compilar el sitio de documentación para producción
- `pnpm write-translations` - Extraer cadenas traducibles de la documentación
- `pnpm translate` - Traducir archivos de documentación usando IA (ver [Flujo de Traducción](translation-workflow))
- `pnpm lint` - Ejecutar ESLint en archivos fuente de documentación

Los servidores de desarrollo (`start:*`) proporcionan reemplazo de módulos en caliente para un desarrollo rápido. El puerto por defecto es 3000.

### Scripts de producción {/* #production-scripts */}
- `pnpm build-local` - Compilar y preparar para producción local (incluye precomprobaciones, copia archivos estáticos al directorio independiente)
- `pnpm start-local` - Iniciar servidor de producción localmente (puerto 8666, incluye precomprobaciones). **Nota:** Ejecuta `pnpm build-local` primero. Inicia el servidor independiente con `--require ./scripts/peer-ip.cjs`.
- `pnpm start` - Iniciar servidor de producción (puerto 9666) con la misma precarga de IP de par. Docker usa `docker-entrypoint.sh` para cargar el mismo script.

### Scripts de Docker {/* #docker-scripts */}
- `pnpm docker:up` - Iniciar pila Docker Compose
- `pnpm docker:down` - Detener pila Docker Compose
- `pnpm docker:clean` - Limpiar entorno y caché de Docker
- `pnpm docker:devel` - Compilar una imagen de Docker de desarrollo etiquetada como `wsj-br/duplistatus:devel`

### Scripts del servicio cron {/* #cron-service-scripts */}
- `pnpm cron:start` - Iniciar servicio cron en modo producción
- `pnpm cron:dev` - Iniciar solo el servicio cron en modo desarrollo con vigilancia de archivos (puerto 8667). Suele ser innecesario al usar `pnpm dev`, que ya inicia cron.
- `pnpm cron:start-local` - Iniciar servicio cron localmente para pruebas (puerto 8667)

### Scripts de prueba {/* #test-scripts */}
- `pnpm generate-test-data` - Generar datos de copia de seguridad de prueba (requiere el parámetro --servers=N)
- `pnpm validate-csv-export` - Validar funcionalidad de exportación CSV
- `pnpm test-entrypoint` - Probar script de entrada de Docker en desarrollo local (ver [Scripts de Prueba](test-scripts))
- `pnpm take-screenshots` - Tomar capturas de pantalla para documentación (ver [Herramientas de Documentación](documentation-tools))

Las comprobaciones vencidas, las comprobaciones de salud de cron y las pruebas de SMTP se realizan a través de la aplicación en ejecución y `curl` (ver [Scripts de Prueba](test-scripts)); los antiguos ayudantes independientes `pnpm` para esos fueron eliminados.
