---
translation_last_updated: '2026-02-06T22:33:35.267Z'
source_file_mtime: '2026-02-06T21:19:26.573Z'
source_file_hash: bb3c3536a92b19fc
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

Inicia el servidor de desarrollo con recarga en caliente:

```bash
cd documentation
pnpm start
```

El sitio estará disponible en `http://localhost:3000` (o el siguiente puerto disponible).

### Compilar {#build}

Construir el sitio de documentación para producción:

```bash
cd documentation
pnpm build
```

Esto genera archivos HTML estáticos en el directorio `documentation/build`.

### Servir la compilación de producción {#serve-production-build}

Vista previa de la compilación de producción localmente:

```bash
cd documentation
pnpm serve
```

Esto sirve el sitio compilado desde el directorio `documentation/build`.

### Otros Comandos Útiles {#other-useful-commands}

- `pnpm clear` - Limpiar caché de Docusaurus
- `pnpm typecheck` - Ejecutar verificación de tipos de TypeScript
- `pnpm write-heading-ids` - Añadir IDs de encabezados a archivos markdown para enlaces de anclaje

## Generando README.md {#generating-readmemd}

El archivo `README.md` del proyecto se genera automáticamente a partir de `documentation/docs/intro.md` para mantener sincronizado el README del repositorio de GitHub con la documentación de Docusaurus.

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
- Elimina el bloque IMPORTANT de migración y añade una sección de Información de Migración con un enlace a la documentación de Docusaurus
- Genera una tabla de contenidos usando `doctoc`
- Genera `README_dockerhub.md` con formato compatible con Docker Hub (convierte imágenes y enlaces a URLs absolutas, convierte alertas de GitHub a formato basado en emojis)
- Genera notas de lanzamiento de GitHub (`RELEASE_NOTES_github_VERSION.md`) desde `documentation/docs/release-notes/VERSION.md` (convierte enlaces e imágenes a URLs absolutas)

**Nota:** Necesitas tener `doctoc` instalado globalmente para la generación de la tabla de contenidos:

```bash
npm install -g doctoc
```

## Actualizar README para Docker Hub {#update-readme-for-docker-hub}

El script `generate-readme-from-intro.sh` genera automáticamente `README_dockerhub.md` con formato compatible con Docker Hub. Realiza lo siguiente:
- Copia `README.md` a `README_dockerhub.md`
- Convierte rutas de imágenes relativas a URLs absolutas de GitHub raw
- Convierte enlaces de documentos relativos a URLs absolutas de GitHub blob
- Convierte alertas de estilo GitHub (`[!NOTE]`, `[!WARNING]`, etc.) a formato basado en emojis para una mejor compatibilidad con Docker Hub
- Garantiza que todas las imágenes y enlaces funcionen correctamente en Docker Hub

## Generar Notas de Lanzamiento de GitHub {#generate-github-release-notes}

El script `generate-readme-from-intro.sh` genera automáticamente notas de lanzamiento de GitHub cuando se ejecuta. Realiza lo siguiente:
- Lee las notas de lanzamiento desde `documentation/docs/release-notes/VERSION.md` (donde VERSION se extrae de `package.json`)
- Cambia el título de "# Version xxxx" a "# Release Notes - Versión xxxxx"
- Convierte enlaces markdown relativos a URLs absolutas de documentación de GitHub (`https://wsj-br.github.io/duplistatus/...`)
- Convierte rutas de imágenes a URLs raw de GitHub (`https://raw.githubusercontent.com/wsj-br/duplistatus/main/documentation/static/img/...`) para una visualización correcta en descripciones de lanzamiento
- Gestiona rutas relativas con prefijo `../`
- Preserva URLs absolutas (http:// y https://) sin cambios
- Crea `RELEASE_NOTES_github_VERSION.md` en la raíz del proyecto

**Ejemplo:**

```bash
# This will generate both README.md and RELEASE_NOTES_github_VERSION.md
./scripts/generate-readme-from-intro.sh
```

El archivo de notas de lanzamiento generado se puede copiar y pegar directamente en la descripción de lanzamiento de GitHub. Todos los enlaces e imágenes funcionarán correctamente en el contexto de lanzamiento de GitHub.

**Nota:** El archivo generado es temporal y se puede eliminar después de crear la versión de GitHub. Se recomienda añadir `RELEASE_NOTES_github_*.md` a `.gitignore` si no desea confirmar estos archivos.

## Tomar capturas de pantalla para la documentación {#take-screenshots-for-documentation}

```bash
pnpm take-screenshots
```

O ejecute directamente: `tsx scripts/take-screenshots.ts` (use `--env-file=.env` si es necesario para variables de entorno).

Este script toma automáticamente capturas de pantalla de la aplicación para documentación. Hace lo siguiente:
- Inicia un navegador sin interfaz (Puppeteer)
- Inicia sesión como admin y usuario regular
- Navega por diferentes páginas (panel de control, detalles del servidor, configuración, etc.)
- Toma capturas de pantalla en diferentes tamaños de ventana gráfica
- Guarda las capturas de pantalla en `documentation/static/assets/` (inglés) o `documentation/i18n/{locale}/docusaurus-plugin-content-docs/current/assets` (otros idiomas)

**Requisitos:**
- El servidor de desarrollo debe ejecutarse en `http://localhost:8666`
- Las variables de entorno deben establecerse:
  - `ADMIN_PASSWORD`: Contraseña para la cuenta de admin
  - `USER_PASSWORD`: Contraseña para la cuenta de usuario regular

**Opciones:** `--locale` limita las capturas de pantalla a una o más configuraciones regionales (separadas por comas). Si se omite, se capturan todas las configuraciones regionales. Configuraciones regionales válidas: `en`, `de`, `fr`, `es`, `pt-BR`. Use `-h` o `--help` para imprimir el uso.

**Ejemplo:**

```bash
export ADMIN_PASSWORD="your-admin-password"
export USER_PASSWORD="your-user-password"
tsx scripts/take-screenshots.ts
# All locales (default):
tsx scripts/take-screenshots.ts
# Single locale:
tsx scripts/take-screenshots.ts --locale en
# Multiple locales:
tsx scripts/take-screenshots.ts --locale en,de,pt-BR
```

**Capturas de pantalla generadas:**

El script genera las siguientes capturas de pantalla (guardadas en `documentation/static/assets/` para inglés, o `documentation/i18n/{locale}/docusaurus-plugin-content-docs/current/assets` para otros idiomas):

**Capturas de pantalla del Panel de control:**
- `screen-main-dashboard-card-mode.png` - Panel de control en modo tarjeta/resumen
- `screen-main-dashboard-table-mode.png` - Panel de control en modo tabla
- `screen-overdue-backup-hover-card.png` - Tarjeta emergente de backup retrasado
- `screen-backup-tooltip.png` - Tooltip de backup normal (pasar el ratón sobre backup en vista de tarjetas)
- `screen-dashboard-summary.png` - Sección de resumen del panel de control
- `screen-dashboard-summary-table.png` - Tabla de resumen del panel de control
- `screen-overview-side-status.png` - Panel lateral de estado del resumen
- `screen-overview-side-charts.png` - Gráficos laterales del resumen

**Capturas de pantalla de Detalles del servidor:**
- `screen-server-backup-list.png` - Página de lista de backups del servidor
- `screen-backup-history.png` - Sección de tabla de historial de backups
- `screen-backup-detail.png` - Página de detalles de backup individual
- `screen-metrics.png` - Gráfico de métricas que muestra métricas de backup en el tiempo
- `screen-available-backups-modal.png` - Modal de backups disponibles
- `screen-server-overdue-message.png` - Mensaje de backup retrasado del servidor

**Capturas de pantalla de Recopilación/Configuración:**
- `screen-collect-button-popup.png` - Popup de recopilación de logs de backup
- `screen-collect-button-right-click-popup.png` - Menú de clic derecho para recopilar todo
- `screen-duplicati-configuration.png` - Menú desplegable de configuración de Duplicati

**Capturas de pantalla de Configuración:**
- `screen-settings-left-panel-admin.png` - Barra lateral de configuración (vista de admin)
- `screen-settings-left-panel-non-admin.png` - Barra lateral de configuración (vista de no admin)
- `screen-settings-{tab}.png` - Páginas de configuración individuales para cada pestaña:
  - `screen-settings-notifications.png`
  - `screen-settings-notifications-bulk.png`
  - `screen-settings-notifications-server.png`
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
  - `screen-settings-application-logs.png`

**Capturas de pantalla del Menú de usuario:**
- `screen-user-menu-admin.png` - Menú de usuario (vista de admin)
- `screen-user-menu-user.png` - Menú de usuario (vista de usuario regular)

## Traducir archivos SVG {#translate-svg-files}

La traducción de SVG se incluye en `pnpm run translate` por defecto (se ejecuta después de los documentos). El script `translate:svg` es para ejecuciones solo de SVG (por ejemplo, cuando solo cambiaron los SVG). Ambos traducen el texto dentro de los archivos SVG (por ejemplo, diagramas de barra de herramientas y panel de control) a cada configuración regional, luego los exportan a PNG usando Inkscape.

**Requisitos previos:** Inkscape CLI (consulte [Configuración de desarrollo](setup#prerequisites)); `OPENROUTER_API_KEY` para traducción basada en API (no requerido para `--dry-run` o `--stats`).

**Uso rápido:**

```bash
cd documentation
pnpm translate:svg          # SVG-only
pnpm run translate          # Docs + SVGs (use --no-svg for docs only)
```

Para el flujo de trabajo de traducción completo (glosario, traducción de IA, caché, opciones, solución de problemas), consulte [Flujo de trabajo de traducción](translation-workflow.md).

## Implementación de la Documentación {#deploying-the-documentation}

Para implementar la documentación en GitHub Pages, necesitarás generar un Token de Acceso Personal de GitHub. Ve a [GitHub Personal Access Tokens](https://github.com/settings/tokens) y crea un nuevo token con el alcance `repo`.

Cuando tenga el token, guárdelo en el almacén de credenciales de Git (por ejemplo, usando `git config credential.helper store` o el administrador de credenciales de su sistema).

Luego, para implementar la documentación en GitHub Pages, ejecute el siguiente comando desde el directorio `documentation`:

```bash
pnpm run deploy
```

Esto compilará la documentación y la enviará a la rama `gh-pages` del repositorio, y la documentación estará disponible en [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/).

## Trabajar con Documentación {#working-with-documentation}

Para el flujo de trabajo de traducción (glosario, traducción de IA, gestión de caché), consulte [Flujo de trabajo de traducción](translation-workflow.md).

- Los archivos de documentación están escritos en Markdown (`.md`) y ubicados en `documentation/docs/`
- La navegación de la barra lateral se configura en `documentation/sidebars.ts`
- La configuración de Docusaurus está en `documentation/docusaurus.config.ts`
- Los componentes React personalizados se pueden agregar a `documentation/src/components/`
- Los activos estáticos (imágenes, PDFs, etc.) van en `documentation/static/`
- La página principal de documentación es `documentation/docs/intro.md`, que se utiliza como fuente para generar `README.md`
