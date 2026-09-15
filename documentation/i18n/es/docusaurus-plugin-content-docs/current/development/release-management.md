# Gestión de versiones {/* #release-management */}

## Control de versiones (Semantic Versioning) {/* #versioning-semantic-versioning */}

El proyecto sigue Semantic Versioning (SemVer) con el formato `MAJOR.MINOR.PATCH`:

- **MAJOR** versión (x.0.0): Cuando se realizan cambios incompatibles en la API
- **MINOR** versión (0.x.0): Cuando se añade funcionalidad de manera compatible hacia atrás
- **PATCH** versión (0.0.x): Cuando se realizan correcciones de errores compatibles hacia atrás

## Lista de comprobación previa a la liberación {/* #pre-release-checklist */}

Antes de liberar una nueva versión, asegúrese de haber completado lo siguiente:

- [ ] Todos los cambios están confirmados y enviados a la rama `vMAJOR.MINOR.x`.
- [ ] El número de versión se actualiza en `package.json` (use `scripts/update-version.sh` para sincronizarlo en todos los archivos).
- [ ] Todos los tests pasan (en modo de desarrollo, local, docker y podman). 
- [ ] Inicie un contenedor Docker con `pnpm docker:up` y ejecute `scripts/compare-versions.sh` para verificar la consistencia de la versión entre el entorno de desarrollo y el contenedor Docker (requiere que el contenedor Docker esté en ejecución). Este script compara las versiones de SQLite por versión principal (por ejemplo, 3.45.1 vs 3.51.1 se consideran compatibles), y compara exactamente las versiones de Node, npm y Duplistatus.
- [ ] La documentación está actualizada, actualice las capturas de pantalla (use `pnpm take-screenshots`)
- [ ] Las notas de la versión están preparadas en `documentation/docs/release-notes/VERSION.md`.
- [ ] Ejecute `scripts/generate-readme-from-intro.sh` para actualizar `README.md` con la nueva versión y cualquier cambio de `documentation/docs/intro.md`. Este script también genera automáticamente `README_dockerhub.md` y `RELEASE_NOTES_github_VERSION.md`.

## Vista general del proceso de liberación {/* #release-process-overview */}

El proceso de liberación recomendado utiliza **GitHub Pull Requests y Releases** (ver más abajo). Esto proporciona una mejor visibilidad, capacidades de revisión y activa automáticamente las compilaciones de imágenes Docker. El método de línea de comandos está disponible como alternativa.

## Método 1: GitHub Pull Request y Release (Recomendado) {/* #method-1-github-pull-request-and-release-recommended */}

Este es el método preferido ya que proporciona una mejor trazabilidad y activa automáticamente las compilaciones de Docker.

### Paso 1: Crear Pull Request {/* #step-1-create-pull-request */}

1. Navegue al [repositorio duplistatus](https://github.com/wsj-br/duplistatus) en GitHub.
2. Haga clic en la pestaña **"Pull requests"**.
3. Haga clic en **"New pull request."**
4. Establezca la **rama base** en `master` y la **rama de comparación** en `vMAJOR.MINOR.x`.
5. Revise la vista previa de los cambios para asegurarse de que todo parece correcto.
6. Haga clic en **"Create pull request."**
7. Añada un título descriptivo (por ejemplo, "Release v1.2.0") y una descripción que resuma los cambios.
8. Haga clic en **"Create pull request"** de nuevo.

### Paso 2: Fusionar el Pull Request {/* #step-2-merge-the-pull-request */}

Después de revisar el pull request:

1. Si no hay conflictos, haga clic en el botón verde **"Merge pull request"**.
2. Elija su estrategia de fusión (típicamente "Create a merge commit").
3. Confirme la fusión.

### Paso 3: Crear GitHub Release {/* #step-3-create-github-release */}

Una vez completada la fusión, cree un GitHub release:

1. Navega al [repositorio duplistatus](https://github.com/wsj-br/duplistatus) en GitHub.
2. Ve a la sección **"Releases"** (o haz clic en "Releases" en la barra lateral derecha).
3. Haz clic en **"Draft a new release."**
4. En el campo **"Choose a tag"**, escribe el número de versión nuevo en el formato `vMAJOR.MINOR.PATCH` (por ejemplo, `v1.2.0`). Esto creará una nueva etiqueta.
5. Selecciona `master` como la rama de destino.
6. Añade un **título de lanzamiento** (por ejemplo, "Release v1.2.0").
7. Añade una **descripción** documentando los cambios en esta versión. Puedes:
   - Copiar el contenido de `RELEASE_NOTES_github_VERSION.md` (generado por `scripts/generate-readme-from-intro.sh`)
   - O referenciar las notas de lanzamiento de `documentation/docs/release-notes/` (pero ten en cuenta que los enlaces relativos no funcionarán en los lanzamientos de GitHub)
8. Haz clic en **"Publish release."**

**Lo que ocurre automáticamente:**
- Se crea una nueva etiqueta Git
- Se activa el flujo de trabajo "Build and Publish Docker Image"
- Se construyen imágenes Docker para las arquitecturas AMD64 y ARM64
- Las imágenes se publican en:
  - Docker Hub: `wsjbr/duplistatus:VERSION` y `wsjbr/duplistatus:latest` (si este es el lanzamiento más reciente)
  - GitHub Container Registry: `ghcr.io/wsj-br/duplistatus:VERSION` y `ghcr.io/wsj-br/duplistatus:latest` (si este es el lanzamiento más reciente)

## Método 2: Línea de comandos (Alternativa) {/* #method-2-command-line-alternative */}

Si prefieres usar la línea de comandos, sigue estos pasos:

### Paso 1: Actualizar la rama local master {/* #step-1-update-local-master-branch */}

Asegúrate de que tu rama local `master` esté actualizada:

```bash
# Checkout the master branch
git checkout master

# Pull the latest changes from the remote repository
git pull origin master
```

### Paso 2: Fusionar la rama de desarrollo {/* #step-2-merge-development-branch */}

Fusiona la rama `vMAJOR.MINOR.x` en `master`:

```bash
# Merge the vMAJOR.MINOR.x branch into master
git merge vMAJOR.MINOR.x
```

Si hay **conflictos de fusión**, resuélvelos manualmente:
1. Edita los archivos conflictivos
2. Añade los archivos resueltos: `git add <file>`
3. Completa la fusión: `git commit`

### Paso 3: Etiquetar el lanzamiento {/* #step-3-tag-the-release */}

Crea una etiqueta anotada para la nueva versión:

```bash
# Create an annotated tag for the new version
git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH - Brief description"
```

La bandera `-a` crea una etiqueta anotada (recomendada para lanzamientos), y la bandera `-m` añade un mensaje.

### Paso 4: Empujar a GitHub {/* #step-4-push-to-github */}

Empuja tanto la rama `master` actualizada como la nueva etiqueta:

```bash
# Push the updated master branch
git push origin master

# Push the new tag
git push origin vMAJOR.MINOR.PATCH
```

Alternativamente, empuja todas las etiquetas a la vez: `git push --tags`

### Paso 5: Crear un lanzamiento en GitHub {/* #step-5-create-github-release */}

Después de empujar la etiqueta, crea un lanzamiento en GitHub (ver Método 1, Paso 3) para activar el flujo de trabajo de construcción de Docker.

## Manual Docker Image Build {/* #manual-docker-image-build */}

Para activar manualmente el flujo de trabajo de construcción de imágenes Docker sin crear una versión:

1. Navegue al [repositorio duplistatus](https://github.com/wsj-br/duplistatus) en GitHub.
2. Haga clic en la pestaña **"Acciones"**.
3. Seleccione el flujo de trabajo **"Build and Publish Docker Image"**.
4. Haga clic en **"Run workflow"**.
5. Seleccione la rama desde la que construir (típicamente `master`).
6. Haga clic en **"Run workflow"** de nuevo.

**Nota:** Las construcciones manuales no etiquetarán automáticamente las imágenes como `latest` a menos que el flujo de trabajo determine que es la última versión.

## Releasing Documentation {/* #releasing-documentation */}

La documentación está alojada en [GitHub Pages](https://wsj-br.github.io/duplistatus/) y se despliega por separado de la versión de la aplicación. Siga estos pasos para publicar documentación actualizada:

### Prerequisites {/* #prerequisites */}

1. Asegúrese de tener un Token de Acceso Personal de GitHub con el ámbito `repo`.
2. Configure las credenciales de Git (configuración única):

```bash
cd documentation
./setup-git-credentials.sh
```

Esto le solicitará su Token de Acceso Personal de GitHub y lo almacenará de forma segura.

### Deploy Documentation {/* #deploy-documentation */}

1. Navegue al directorio `documentation`:

```bash
cd documentation
```

2. Asegúrese de que todos los cambios en la documentación estén confirmados y enviados al repositorio.

3. Construya y despliegue la documentación:

```bash
pnpm run deploy
```

Este comando hará lo siguiente:
- Construir el sitio de documentación Docusaurus
- Enviar el sitio construido a la rama `gh-pages`
- Hacer disponible la documentación en [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/)

### When to Deploy Documentation {/* #when-to-deploy-documentation */}

Despliegue actualizaciones de documentación:
- Después de fusionar cambios de documentación en `master`
- Al publicar una nueva versión (si la documentación se actualizó)
- Después de mejoras significativas en la documentación

**Nota:** El despliegue de la documentación es independiente de las versiones de la aplicación. Puede desplegar la documentación varias veces entre versiones de la aplicación.

### Preparing Release Notes for GitHub {/* #preparing-release-notes-for-github */}

El script `generate-readme-from-intro.sh` genera automáticamente las notas de lanzamiento de GitHub cuando se ejecuta. Lee las notas de lanzamiento de `documentation/docs/release-notes/VERSION.md` (donde VERSION se extrae de `package.json`) y crea `RELEASE_NOTES_github_VERSION.md` en la raíz del proyecto.

**Ejemplo:**

```bash
# This will generate README.md, README_dockerhub.md, and RELEASE_NOTES_github_VERSION.md
./scripts/generate-readme-from-intro.sh
```

El archivo de notas de lanzamiento generado puede copiarse y pegarse directamente en la descripción del lanzamiento de GitHub. Todos los enlaces e imágenes funcionarán correctamente en el contexto del lanzamiento de GitHub.

**Nota:** El archivo generado es temporal y puede eliminarse después de crear la versión de GitHub. Se recomienda añadir `RELEASE_NOTES_github_*.md` a `.gitignore` si no desea confirmar estos archivos.

### Actualizar README.md {/* #update-readmemd */}

Si ha realizado cambios en `documentation/docs/intro.md`, vuelva a generar el repositorio `README.md`:

```bash
./scripts/generate-readme-from-intro.sh
```

Este script:
- Extrae la versión de `package.json`
- Genera `README.md` a partir de `documentation/docs/intro.md` (convierte las advertencias de Docusaurus a alertas de estilo GitHub, convierte enlaces e imágenes)
- Crea `README_dockerhub.md` para Docker Hub (con formato compatible con Docker Hub)
- Genera `RELEASE_NOTES_github_VERSION.md` a partir de `documentation/docs/release-notes/VERSION.md` (convierte enlaces e imágenes a URLs absolutos)
- Actualiza el índice de contenidos usando `doctoc`

Confirme y envíe los cambios actualizados de `README.md` junto con su versión.
