---
translation_last_updated: '2026-02-05T00:21:01.473Z'
source_file_mtime: '2026-02-04T21:12:31.888Z'
source_file_hash: 95f791c2d9fb0329
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
tsx scripts/take-screenshots.ts
```

Este script toma automáticamente capturas de pantalla de la aplicación con fines de documentación. Realiza lo siguiente:
- Inicia un navegador sin interfaz gráfica (Puppeteer)
- Inicia sesión como admin y usuario regular
- Navega a través de varias páginas (Panel de control, Detalles de servidor, Configuración, etc.)
- Toma capturas de pantalla en diferentes tamaños de ventana gráfica
- Guarda las capturas de pantalla en `documentation/static/img/`

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

El script genera las siguientes capturas de pantalla (guardadas en `documentation/static/img/`):

**Capturas de pantalla del Panel de control:**
- `screen-main-dashboard-card-mode.png` - Panel de control en modo tarjeta/resumen
- `screen-main-dashboard-table-mode.png` - Panel de control en modo tabla
- `screen-overdue-backup-hover-card.png` - Tarjeta/información emergente de backup retrasado
- `screen-backup-tooltip.png` - Información emergente de backup regular (pasar el cursor sobre el backup en la vista de tarjetas)

**Detalles del Servidor - Capturas de pantalla:**
- `screen-server-backup-list.png` - Página de lista de backups del servidor
- `screen-backup-history.png` - Sección de tabla de Historial de backups
- `screen-backup-detail.png` - Página de Detalles de backup individual
- `screen-metrics.png` - Gráfico de Métricas mostrando métricas de backup a lo largo del tiempo

**Capturas de pantalla de Recopilación/Configuración:**
- `screen-collect-button-popup.png` - Ventana emergente de Recopilar logs de backup
- `screen-collect-button-right-click-popup.png` - Menú contextual de Recopilar todo
- `screen-collect-backup-logs.png` - Interfaz de Recopilar logs de backup
- `screen-duplicati-configuration.png` - Menú desplegable de Configuración de Duplicati

**Capturas de pantalla de Configuración:**
- `screen-settings-left-panel-admin.png` - Barra lateral de Configuración (vista admin)
- `screen-settings-left-panel-non-admin.png` - Barra lateral de Configuración (vista no admin)
- `screen-settings-{tab}.png` - Páginas de Configuración individuales para cada pestaña:
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
- `screen-settings-ntfy-configure-device-popup.png` - Ventana emergente de Configurar dispositivo de NTFY
- `screen-settings-backup-notifications-detail.png` - Página de detalle de Notificaciones de backup

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

Cuando tengas el token, ejecuta el siguiente comando para almacenar el token en el almacén de credenciales de Git:

```bash
./setup-git-credentials.sh
```

Luego, para implementar la documentación en GitHub Pages, ejecute el siguiente comando:

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
