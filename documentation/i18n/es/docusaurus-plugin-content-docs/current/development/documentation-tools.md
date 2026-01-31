---
translation_last_updated: '2026-01-31T00:51:26.465Z'
source_file_mtime: '2026-01-29T17:58:29.891Z'
source_file_hash: 48575e653bc418bc
translation_language: es
source_file_path: development/documentation-tools.md
---
# Herramientas de Documentación {#documentation-tools}

La documentación se construye utilizando [Docusaurus](https://docusaurus.io/) y se encuentra en la carpeta `documentation`. La documentación se aloja en [GitHub Pages](https://wsj-br.github.io/duplistatus/) y ya no se incluye en la imagen del contenedor Docker.

## Estructura de Carpetas {#folder-structure}

```
documentation/
├── docs/              # Documentation markdown files
│   ├── api-reference/
│   ├── development/
│   ├── installation/
│   ├── migration/
│   ├── release-notes/
│   └── user-guide/
├── src/               # React components and pages
│   ├── components/    # Custom React components
│   ├── css/           # Custom styles
│   └── pages/         # Additional pages (e.g., 404)
├── static/            # Static assets (images, files)
├── docusaurus.config.ts  # Docusaurus configuration
├── sidebars.ts        # Sidebar navigation configuration
└── package.json       # Dependencies and scripts
```

## Comandos Comunes {#common-commands}

Todos los comandos deben ejecutarse desde el directorio `documentation`:

### Desarrollo {#development}

Inicie el servidor de desarrollo con recarga en caliente:

```bash
cd documentation
pnpm start
```

El sitio estará disponible en `http://localhost:3000` (o el siguiente puerto disponible).

### Compilar {#build}

Compilar el sitio de documentación para producción:

```bash
cd documentation
pnpm build
```

Esto genera archivos HTML estáticos en el directorio `documentation/build`.

### Servir la Compilación de Producción {#serve-production-build}

Vista previa de la compilación de producción localmente:

```bash
cd documentation
pnpm serve
```

Esto sirve el sitio compilado desde el directorio `documentation/build`.

### Otros Comandos Útiles {#other-useful-commands}

- `pnpm clear` - Limpiar la caché de Docusaurus
- `pnpm typecheck` - Ejecutar la verificación de tipos de TypeScript
- `pnpm write-heading-ids` - Añadir IDs de encabezados a archivos markdown para enlaces de anclaje

## Generando README.md {#generating-readmemd}

El archivo `README.md` del proyecto se genera automáticamente a partir de `documentation/docs/intro.md` para mantener el archivo README del repositorio de GitHub sincronizado con la documentación de Docusaurus.

Para generar o actualizar el archivo README.md:

```bash
./scripts/generate-readme-from-intro.sh
```

Este script:
- Extrae la versión actual de `package.json` y añade una insignia de versión
- Copia contenido de `documentation/docs/intro.md`
- Convierte admoniciones de Docusaurus (note, tip, warning, etc.) a alertas de estilo GitHub
- Convierte todos los enlaces relativos de Docusaurus a URLs absolutas de documentación de GitHub (`https://wsj-br.github.io/duplistatus/...`)
- Convierte rutas de imágenes de `/img/` a `documentation/static/img/` para compatibilidad con GitHub
- Elimina el bloque IMPORTANTE de migración y añade una sección de Información de Migración con un enlace a la documentación de Docusaurus
- Genera una tabla de contenidos utilizando `doctoc`
- Genera `README_dockerhub.md` con formato compatible con Docker Hub (convierte imágenes y enlaces a URLs absolutas, convierte alertas de GitHub a formato basado en emojis)
- Genera notas de lanzamiento de GitHub (`RELEASE_NOTES_github_VERSION.md`) desde `documentation/docs/release-notes/VERSION.md` (convierte enlaces e imágenes a URLs absolutas)

**Nota:** Necesita tener `doctoc` instalado globalmente para la generación de la tabla de contenidos:

```bash
npm install -g doctoc
```

## Actualizar README para Docker Hub {#update-readme-for-docker-hub}

El script `generate-readme-from-intro.sh` genera automáticamente `README_dockerhub.md` con formato compatible con Docker Hub. Realiza lo siguiente:
- Copia `README.md` a `README_dockerhub.md`
- Convierte rutas de imagen relativas a URLs absolutas de GitHub raw
- Convierte enlaces de documento relativos a URLs absolutas de GitHub blob
- Convierte alertas de estilo GitHub (`[!NOTE]`, `[!WARNING]`, etc.) a formato basado en emojis para una mejor compatibilidad con Docker Hub
- Garantiza que todas las imágenes y enlaces funcionen correctamente en Docker Hub

## Generar Notas de Lanzamiento de GitHub {#generate-github-release-notes}

El script `generate-readme-from-intro.sh` genera automáticamente notas de lanzamiento de GitHub cuando se ejecuta. Realiza lo siguiente:
- Lee las notas de lanzamiento desde `documentation/docs/release-notes/VERSION.md` (donde VERSION se extrae de `package.json`)
- Cambia el título de "# Versión xxxx" a "# Notas de Lanzamiento - Versión xxxxx"
- Convierte enlaces markdown relativos a URLs absolutas de documentación de GitHub (`https://wsj-br.github.io/duplistatus/...`)
- Convierte rutas de imágenes a URLs raw de GitHub (`https://raw.githubusercontent.com/wsj-br/duplistatus/main/documentation/static/img/...`) para una visualización adecuada en descripciones de lanzamiento
- Gestiona rutas relativas con prefijo `../`
- Preserva URLs absolutas (http:// y https://) sin cambios
- Crea `RELEASE_NOTES_github_VERSION.md` en la raíz del proyecto

**Ejemplo:**

```bash
# This will generate both README.md and RELEASE_NOTES_github_VERSION.md
./scripts/generate-readme-from-intro.sh
```

Las notas de la versión generadas se pueden copiar y pegar directamente en la descripción de la versión de GitHub. Todos los enlaces e imágenes funcionarán correctamente en el contexto de la versión de GitHub.

**Nota:** El archivo generado es temporal y puede eliminarse después de crear la versión de GitHub. Se recomienda añadir `RELEASE_NOTES_github_*.md` a `.gitignore` si no desea confirmar estos archivos.

## Tomar capturas de pantalla para la documentación {#take-screenshots-for-documentation}

```bash
tsx scripts/take-screenshots.ts
```

Este script toma automáticamente capturas de pantalla de la aplicación con fines de documentación. Lo hace:
- Inicia un navegador sin interfaz gráfica (Puppeteer)
- Inicia sesión como admin y usuario regular
- Navega a través de varias páginas (panel de control, detalles del servidor, configuración, etc.)
- Toma capturas de pantalla en diferentes tamaños de ventana gráfica
- Guarda las capturas de pantalla en `documentation/static/img/`

**Requisitos:**
- El servidor de desarrollo debe estar ejecutándose en `http://localhost:8666`
- Las variables de entorno deben estar configuradas:
  - `ADMIN_PASSWORD`: Contraseña para la cuenta de admin
  - `USER_PASSWORD`: Contraseña para la cuenta de usuario regular

**Ejemplo:**

```bash
export ADMIN_PASSWORD="your-admin-password"
export USER_PASSWORD="your-user-password"
tsx scripts/take-screenshots.ts
```

**Capturas de pantalla generadas:**

El script genera las siguientes capturas de pantalla (guardadas en `documentation/static/img/`):

**Capturas de pantalla del Panel de control:**
- `screen-main-dashboard-card-mode.png` - Panel de control en modo tarjeta/resumen
- `screen-main-dashboard-table-mode.png` - Panel de control en modo tabla
- `screen-overdue-backup-hover-card.png` - Tarjeta/información sobre herramienta de backup retrasado
- `screen-backup-tooltip.png` - Información sobre herramienta de backup regular (pasar el cursor sobre el backup en la vista de tarjetas)

**Capturas de pantalla de Detalles del Servidor:**
- `screen-server-backup-list.png` - Página de lista de backups del Servidor
- `screen-backup-history.png` - Sección de tabla del Historial de backups
- `screen-backup-detail.png` - Página de Detalles de backup individual
- `screen-metrics.png` - Gráfico de Métricas mostrando métricas de backup a lo largo del tiempo

**Capturas de pantalla de Recopilar/Configuración:**
- `screen-collect-button-popup.png` - Popup de Recopilar logs de backup
- `screen-collect-button-right-click-popup.png` - Menú de clic derecho Recopilar todo
- `screen-collect-backup-logs.png` - Interfaz de Recopilar logs de backup
- `screen-duplicati-configuration.png` - Desplegable de Configuración de Duplicati

**Capturas de pantalla de Configuración:**
- `screen-settings-left-panel-admin.png` - Barra lateral de Configuración (vista admin)
- `screen-settings-left-panel-non-admin.png` - Barra lateral de Configuración (vista no admin)
- `screen-settings-{tab}.png` - Páginas de configuración individuales para cada pestaña:
  - `screen-settings-notifications.png`
  - `screen-settings-overdue.png`
  - `screen-settings-server.png`
  - `screen-settings-ntfy.png`
  - `screen-settings-email.png`
  - `screen-settings-templates.png`
  - `screen-settings-users.png`
  - `screen-settings-audit.png`
  - `screen-settings-audit-retention.png`
  - `screen-settings-display.png`
  - `screen-settings-database-maintenance.png`
- `screen-settings-ntfy-configure-device-popup.png` - Ventana emergente de Configurar dispositivo NTFY
- `screen-settings-backup-notifications-detail.png` - Página de detalle de Notificaciones de backup

## Implementación de la Documentación {#deploying-the-documentation}

Para desplegar la documentación en GitHub Pages, deberá generar un token de acceso personal de GitHub. Vaya a [GitHub Personal Access Tokens](https://github.com/settings/tokens) y cree un nuevo token con el alcance `repo`.

Cuándo tenga el token, ejecute el siguiente comando para almacenar el token en el almacén de credenciales de Git:

```bash
./setup-git-credentials.sh
```

Luego, para desplegar la documentación en GitHub Pages, ejecute el siguiente comando:

```bash
pnpm run deploy
```

Esto compilará la documentación e la insertará en la rama `gh-pages` del repositorio, y la documentación estará disponible en [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/).

## Trabajar con la Documentación {#working-with-documentation}

- Los archivos de documentación están escritos en Markdown (`.md`) y se encuentran en `documentation/docs/`
- La navegación de la barra lateral está configurada en `documentation/sidebars.ts`
- La configuración de Docusaurus se encuentra en `documentation/docusaurus.config.ts`
- Los componentes React personalizados se pueden añadir a `documentation/src/components/`
- Los activos estáticos (imágenes, PDF, etc.) se encuentran en `documentation/static/`
- La página principal de documentación es `documentation/docs/intro.md`, que se utiliza como fuente para generar `README.md`
