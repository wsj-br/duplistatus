---
translation_last_updated: '2026-05-11T14:27:41.384Z'
source_file_mtime: '2026-05-06T23:18:51.394Z'
source_file_hash: 1b0cbbe3a12f7a343230d78134d9363a4281a2f7fe7a9366fa6509e427ba450b
translation_language: es
source_file_path: documentation/docs/development/release-management.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Gestión de Versiones {#release-management}

## Versionado (Versionado Semántico) {#versioning-semantic-versioning}

El proyecto sigue Versionamiento Semántico (SemVer) con el formato `MAJOR.MINOR.PATCH`:

- **Versión MAJOR** (x.0.0): Cuándo realiza cambios de API incompatibles
- **Versión MINOR** (0.x.0): Cuándo añade funcionalidad de manera compatible con versiones anteriores
- **Versión PATCH** (0.0.x): Cuándo realiza correcciones de errores compatibles con versiones anteriores

## Lista de Verificación Previa al Lanzamiento {#pre-release-checklist}

Antes de lanzar una nueva versión, asegúrese de haber completado lo siguiente:

- [ ] Todos los cambios se han confirmado y subido a la rama `vMAJOR.MINOR.x`.
- [ ] El número de versión se ha actualizado en `package.json` (usa `scripts/update-version.sh` para sincronizarlo entre archivos).
- [ ] Todas las pruebas pasan (en modo desarrollo, local, docker y podman). 
- [ ] Inicia un contenedor Docker con `pnpm docker:up` y ejecuta `scripts/compare-versions.sh` para verificar la coherencia de versiones entre el entorno de desarrollo y el contenedor Docker (requiere que el contenedor Docker esté en ejecución). Este script compara las versiones de SQLite solo por versión principal (por ejemplo, 3.45.1 y 3.51.1 se consideran compatibles), y compara las versiones de Node, npm y Duplistatus exactamente.
- [ ] La documentación está actualizada, actualiza las capturas de pantalla (usa `pnpm take-screenshots`)
- [ ] Las notas de lanzamiento están preparadas en `documentation/docs/release-notes/VERSION.md`.
- [ ] Ejecuta `scripts/generate-readme-from-intro.sh` para actualizar `README.md` con la nueva versión y cualquier cambio de `documentation/docs/intro.md`. Este script también genera automáticamente `README_dockerhub.md` y `RELEASE_NOTES_github_VERSION.md`.

## Resumen del Proceso de Lanzamiento {#release-process-overview}

El proceso de lanzamiento recomendado utiliza **GitHub Pull Requests y Releases** (véase a continuación). Esto proporciona una mejor visibilidad, capacidades de revisión y activa automáticamente las compilaciones de imágenes Docker. El método de línea de comandos está disponible como alternativa.

## Método 1: Solicitud de extracción de GitHub y lanzamiento (Recomendado) {#method-1-github-pull-request-and-release-recommended}

Este es el método preferido ya que proporciona una mejor trazabilidad y activa automáticamente las compilaciones de Docker.

### Paso 1: Crear solicitud de extracción {#step-1-create-pull-request}

1. Ve al [repositorio duplistatus](https://github.com/wsj-br/duplistatus) en GitHub.
2. Haz clic en la pestaña **"Pull requests"**.
3. Haz clic en **"New pull request"**.
4. Establece la rama **base** como `master` y la rama **compare** como `vMAJOR.MINOR.x`.
5. Revisa la vista previa de los cambios para asegurarte de que todo sea correcto.
6. Haz clic en **"Create pull request"**.
7. Añade un título descriptivo (por ejemplo, "Release v1.2.0") y una descripción que resuma los cambios.
8. Haz clic nuevamente en **"Create pull request"**.

### Paso 2: Fusionar la Solicitud de Extracción {#step-2-merge-the-pull-request}

Después de revisar la solicitud de extracción:

1. Si no hay conflictos, haz clic en el botón verde **"Merge pull request"**.
2. Elige tu estrategia de fusión (típicamente "Create a merge commit").
3. Confirma la fusión.

### Paso 3: Crear una versión en GitHub {#step-3-create-github-release}

Una vez que la fusión se complete, crea una versión de GitHub:

1. Ve al [repositorio duplistatus](https://github.com/wsj-br/duplistatus) en GitHub.
2. Ve a la sección **"Releases"** (o haz clic en "Releases" en la barra lateral derecha).
3. Haz clic en **"Draft a new release"**.
4. En el campo **"Choose a tag"**, escribe el nuevo número de versión en el formato `vMAJOR.MINOR.PATCH` (por ejemplo, `v1.2.0`). Esto creará una nueva etiqueta.
5. Selecciona `master` como rama destino.
6. Añade un **título de lanzamiento** (por ejemplo, "Release v1.2.0").
7. Añade una **descripción** que documente los cambios en esta versión. Puedes:
   - Copiar el contenido de `RELEASE_NOTES_github_VERSION.md` (generado por `scripts/generate-readme-from-intro.sh`)
   - O hacer referencia a las notas de lanzamiento en `documentation/docs/release-notes/` (ten en cuenta que los enlaces relativos no funcionarán en los lanzamientos de GitHub)
8. Haz clic en **"Publish release"**.

**Qué sucede automáticamente:**
- Se crea una nueva etiqueta de Git
- Se activa el flujo de trabajo "Build and Publish Docker Image"
- Se construyen imágenes de Docker para las arquitecturas AMD64 y ARM64
- Las imágenes se suben a:
  - Docker Hub: `wsjbr/duplistatus:VERSION` y `wsjbr/duplistatus:latest` (si es el lanzamiento más reciente)
  - GitHub Container Registry: `ghcr.io/wsj-br/duplistatus:VERSION` y `ghcr.io/wsj-br/duplistatus:latest` (si es el lanzamiento más reciente)

## Método 2: Línea de Comandos (Alternativa) {#method-2-command-line-alternative}

Si prefieres usar la línea de comandos, sigue estos pasos:

### Paso 1: Actualizar la rama maestra local {#step-1-update-local-master-branch}

Asegúrate de que tu rama `master` local esté actualizada:

```bash
# Checkout the master branch
git checkout master

# Pull the latest changes from the remote repository
git pull origin master
```

### Paso 2: Fusionar rama de desarrollo {#step-2-merge-development-branch}

Fusionar la rama `vMAJOR.MINOR.x` en `master`:

```bash
# Merge the vMAJOR.MINOR.x branch into master
git merge vMAJOR.MINOR.x
```

Si hay **conflictos de fusión**, resuélvalos manualmente:
1. Edite los archivos en conflicto
2. Prepare los archivos resueltos: `git add <file>`
3. Complete la fusión: `git commit`

### Paso 3: Etiquetar la Versión {#step-3-tag-the-release}

Crear una etiqueta anotada para la nueva versión:

```bash
# Create an annotated tag for the new version
git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH - Brief description"
```

La marca `-a` crea una etiqueta anotada (recomendado para versiones), y la marca `-m` añade un mensaje.

### Paso 4: Enviar a GitHub {#step-4-push-to-github}

Envía tanto la rama `master` actualizada como la nueva etiqueta:

```bash
# Push the updated master branch
git push origin master

# Push the new tag
git push origin vMAJOR.MINOR.PATCH
```

Alternativamente, envía todas las etiquetas a la vez: `git push --tags`

### Paso 5: Crear una versión de GitHub {#step-5-create-github-release}

Después de insertar la etiqueta, cree una versión de GitHub (consulte el Método 1, Paso 3) para activar el flujo de trabajo de compilación de Docker.

## Compilación Manual de Imagen Docker {#manual-docker-image-build}

Para activar manualmente el flujo de trabajo de compilación de la imagen Docker sin crear una versión:

1. Navegue hasta el [repositorio duplistatus](https://github.com/wsj-br/duplistatus) en GitHub.
2. Haga clic en la pestaña **"Acciones"**.
3. Seleccione el flujo de trabajo **"Build and Publish Docker Image"**.
4. Haga clic en **"Run workflow"**.
5. Seleccione la rama desde la cual compilar (normalmente `master`).
6. Haga clic nuevamente en **"Run workflow"**.

**Nota:** Las compilaciones manuales no etiquetarán automáticamente las imágenes como `latest` a menos que el flujo de trabajo determine que es la versión más reciente.

## Publicación de Documentación {#releasing-documentation}

La documentación se aloja en [GitHub Pages](https://wsj-br.github.io/duplistatus/) y se implementa de forma independiente de la versión de la aplicación. Siga estos pasos para publicar la documentación actualizada:

### Requisitos previos {#prerequisites}

1. Asegúrate de tener un Token de Acceso Personal de GitHub con el alcance `repo`.
2. Configura las credenciales de Git (configuración única):

```bash
cd documentation
./setup-git-credentials.sh
```

Esto te pedirá tu Token de Acceso Personal de GitHub y lo almacenará de forma segura.

### Documentación de Implementación {#deploy-documentation}

1. Navegue al directorio `documentation`:

```bash
cd documentation
```

2. Asegúrese de que todos los cambios de documentación se confirmen e inserten en el repositorio.

3. Construir e implementar la documentación:

```bash
pnpm run deploy
```

Este comando hará lo siguiente:
- Compilar el sitio de documentación de Docusaurus
- Enviar el sitio compilado a la rama `gh-pages`
- Poner la documentación disponible en [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/)

### Cuándo Desplegar Documentación {#when-to-deploy-documentation}

Desplegar actualizaciones de documentación:
- Después de fusionar cambios de documentación a `master`
- Al lanzar una nueva versión (si la documentación fue actualizada)
- Después de mejoras significativas en la documentación

**Nota:** La implementación de la documentación es independiente de los lanzamientos de aplicaciones. Puede implementar la documentación varias veces entre lanzamientos de aplicaciones.

### Preparación de Notas de Lanzamiento para GitHub {#preparing-release-notes-for-github}

El script `generate-readme-from-intro.sh` genera automáticamente notas de lanzamiento de GitHub cuando se ejecuta. Lee las notas de lanzamiento desde `documentation/docs/release-notes/VERSION.md` (donde VERSION se extrae de `package.json`) y crea `RELEASE_NOTES_github_VERSION.md` en la raíz del proyecto.

**Ejemplo:**

```bash
# This will generate README.md, README_dockerhub.md, and RELEASE_NOTES_github_VERSION.md
./scripts/generate-readme-from-intro.sh
```

El archivo de notas de lanzamiento generado se puede copiar y pegar directamente en la descripción de lanzamiento de GitHub. Todos los enlaces e imágenes funcionarán correctamente en el contexto de lanzamiento de GitHub.

**Nota:** El archivo generado es temporal y se puede eliminar después de crear la versión de GitHub. Se recomienda añadir `RELEASE_NOTES_github_*.md` a `.gitignore` si no desea confirmar estos archivos.

### Actualizar README.md {#update-readmemd}

Si has realizado cambios en `documentation/docs/intro.md`, regenera el archivo `README.md` del repositorio:

```bash
./scripts/generate-readme-from-intro.sh
```

Este script:
- Extrae la versión de `package.json`
- Genera `README.md` a partir de `documentation/docs/intro.md` (convierte las admoniciones de Docusaurus a alertas con formato de GitHub, convierte enlaces e imágenes)
- Crea `README_dockerhub.md` para Docker Hub (con formato compatible con Docker Hub)
- Genera `RELEASE_NOTES_github_VERSION.md` a partir de `documentation/docs/release-notes/VERSION.md` (convierte enlaces e imágenes a URLs absolutas)
- Actualiza la tabla de contenidos usando `doctoc`

Confirma e impulsa el `README.md` actualizado junto con tu lanzamiento.
