# Gestión de versiones {/* #release-management */}

## Versionado (Versionado Semántico) {/* #versioning-semantic-versioning */}

El proyecto sigue el Versionado Semántico (SemVer) con el formato `MAJOR.MINOR.PATCH`:

- **MAJOR** versión (x.0.0): Cuándo realizas cambios de API incompatibles
- **MINOR** versión (0.x.0): Cuándo añades funcionalidad de manera compatible con versiones anteriores
- **PATCH** versión (0.0.x): Cuándo realizas correcciones de errores compatibles con versiones anteriores

## Lista de verificación previa al lanzamiento {/* #pre-release-checklist */}

Antes de lanzar una nueva versión, asegúrate de haber completado lo siguiente:

- [ ] Todos los cambios están confirmados e insertados en la rama `vMAJOR.MINOR.x`.
- [ ] El número de versión se actualiza en `package.json` (usa `scripts/update-version.sh` para sincronizarlo en todos los archivos).
- [ ] Todas las pruebas pasan (en modo devel, local, docker y podman).
- [ ] Inicia un contenedor Docker con `pnpm docker:up` y ejecuta `scripts/compare-versions.sh` para verificar la coherencia de versiones entre el entorno de desarrollo y el contenedor Docker (requiere que el contenedor Docker esté en ejecución). Este script compara versiones de SQLite solo por versión principal (por ejemplo, 3.45.1 frente a 3.51.1 se consideran compatibles) y compara exactamente las versiones de Node, npm y Duplistatus.
- [ ] La documentación está actualizada, actualiza las capturas de pantalla (usa `pnpm take-screenshots`)
- [ ] Las notas de lanzamiento se preparan en `documentation/docs/release-notes/VERSION.md`.
- [ ] Ejecuta `scripts/generate-readme-from-intro.sh` para actualizar `README.md` con la nueva versión y cualquier cambio de `documentation/docs/intro.md`. Este script también genera automáticamente `README_dockerhub.md` e `RELEASE_NOTES_github_VERSION.md`.

## Vista general del proceso de lanzamiento {/* #release-process-overview */}

El proceso de lanzamiento recomendado utiliza **Solicitudes de extracción y lanzamientos de GitHub** (véase a continuación). Esto proporciona mejor visibilidad, capacidades de revisión y activa automáticamente compilaciones de imágenes Docker. El método de línea de comandos está disponible como alternativa.

## Método 1: Solicitud de extracción y lanzamiento de GitHub (Recomendado) {/* #method-1-github-pull-request-and-release-recommended */}

Este es el método preferido ya que proporciona mejor trazabilidad y activa automáticamente compilaciones de Docker.

### Paso 1: Crear solicitud de extracción {/* #step-1-create-pull-request */}

1. Navega al [repositorio duplistatus](https://github.com/wsj-br/duplistatus) en GitHub.
2. Haz clic en la pestaña **"Solicitudes de extracción"**.
3. Haz clic en **"Nueva solicitud de extracción"**.
4. Establece la **rama base** en `master` y la **rama de comparación** en `vMAJOR.MINOR.x`.
5. Revisa la vista previa de cambios para asegurarte de que todo se ve correcto.
6. Haz clic en **"Crear solicitud de extracción"**.
7. Añade un título descriptivo (por ejemplo, "Lanzamiento v1.2.0") y una descripción que resuma los cambios.
8. Haz clic en **"Crear solicitud de extracción"** de nuevo.

### Paso 2: Fusionar la solicitud de extracción {/* #step-2-merge-the-pull-request */}

Después de revisar la solicitud de extracción:

1. Si no hay conflictos, haz clic en el botón verde **"Fusionar solicitud de extracción"**.
2. Elige tu estrategia de fusión (típicamente "Crear una confirmación de fusión").
3. Confirma la fusión.

### Paso 3: Crear lanzamiento de GitHub {/* #step-3-create-github-release */}

Una vez completada la fusión, crea un lanzamiento de GitHub:

1. Navega al [repositorio duplistatus](https://github.com/wsj-br/duplistatus) en GitHub.
2. Ve a la sección **"Releases"** (o haz clic en "Releases" en la barra lateral derecha).
3. Haz clic en **"Draft a new release."**
4. En el campo **"Choose a tag"**, escribe tu nuevo número de versión en el formato `vMAJOR.MINOR.PATCH` (por ejemplo, `v1.2.0`). Esto creará una nueva etiqueta.
5. Seleccione `master` como la rama de destino.
6. Añada un **título de lanzamiento** (por ejemplo, "Lanzamiento v1.2.0").
7. Añada una **descripción** documentando los cambios en esta versión. Puede:
   - Copiar el contenido de `RELEASE_NOTES_github_VERSION.md` (generado por `scripts/generate-readme-from-intro.sh`)
   - O hacer referencia a las notas de lanzamiento de `documentation/docs/release-notes/` (pero tenga en cuenta que los enlaces relativos no funcionarán en los lanzamientos de GitHub)
8. Haga clic en **"Publicar lanzamiento."**

**Lo que sucede automáticamente:**
- Se crea una nueva etiqueta de Git
- Se activa el flujo de trabajo "Build and Publish Docker Image"
- Se crean imágenes de Docker para arquitecturas AMD64 y ARM64
- Las imágenes se envían a:
  - Docker Hub: `wsjbr/duplistatus:VERSION` y `wsjbr/duplistatus:latest` (si este es el lanzamiento más reciente)
  - GitHub Container Registry: `ghcr.io/wsj-br/duplistatus:VERSION` y `ghcr.io/wsj-br/duplistatus:latest` (si este es el lanzamiento más reciente)

## Método 2: Línea de comandos (Alternativa) {/* #method-2-command-line-alternative */}

Si prefieres usar la línea de comandos, sigue estos pasos:

### Paso 1: Actualizar rama maestra local {/* #step-1-update-local-master-branch */}

Asegúrate de que tu rama `master` local esté actualizada:

```bash
# Checkout the master branch
git checkout master

# Pull the latest changes from the remote repository
git pull origin master
```

### Paso 2: Fusionar rama de desarrollo {/* #step-2-merge-development-branch */}

Fusiona la rama `vMAJOR.MINOR.x` en `master`:

```bash
# Merge the vMAJOR.MINOR.x branch into master
git merge vMAJOR.MINOR.x
```

Si hay **conflictos de fusión**, resuélvelos manualmente:
1. Edita los archivos en conflicto
2. Prepara los archivos resueltos: `git add <file>`
3. Completa la fusión: `git commit`

### Paso 3: Etiquetar el lanzamiento {/* #step-3-tag-the-release */}

Crea una etiqueta anotada para la nueva versión:

```bash
# Create an annotated tag for the new version
git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH - Brief description"
```

La bandera `-a` crea una etiqueta anotada (recomendada para lanzamientos), y la bandera `-m` añade un mensaje.

### Paso 4: Enviar a GitHub {/* #step-4-push-to-github */}

Envía tanto la rama `master` actualizada como la nueva etiqueta:

```bash
# Push the updated master branch
git push origin master

# Push the new tag
git push origin vMAJOR.MINOR.PATCH
```

Alternativamente, envía todas las etiquetas a la vez: `git push --tags`

### Paso 5: Crear lanzamiento en GitHub {/* #step-5-create-github-release */}

Después de enviar la etiqueta, crea un lanzamiento en GitHub (consulta el Método 1, Paso 3) para activar el flujo de trabajo de compilación de Docker.

## Compilación Manual de Imagen Docker {/* #manual-docker-image-build */}

Para activar manualmente el flujo de trabajo de compilación de imagen Docker sin crear una versión:

1. Navega al [repositorio duplistatus](https://github.com/wsj-br/duplistatus) en GitHub.
2. Haz clic en la pestaña **"Acciones"**.
3. Selecciona el flujo de trabajo **"Build and Publish Docker Image"**.
4. Haz clic en **"Run workflow"**.
5. Selecciona la rama desde la que compilar (típicamente `master`).
6. Haz clic en **"Run workflow"** de nuevo.

**Nota:** Las compilaciones manuales no etiquetarán automáticamente las imágenes como `latest` a menos que el flujo de trabajo determine que es la versión más reciente.

## Publicación de Documentación {/* #releasing-documentation */}

La documentación se aloja en [GitHub Pages](https://wsj-br.github.io/duplistatus/) y se implementa de forma independiente de la versión de la aplicación. Sigue estos pasos para publicar la documentación actualizada:

### Requisitos previos {/* #prerequisites */}

1. Asegúrate de tener un Token de Acceso Personal de GitHub con el ámbito `repo`.
2. Configura las credenciales de Git (configuración única):

```bash
cd documentation
./setup-git-credentials.sh
```

Esto te pedirá tu Token de Acceso Personal de GitHub y lo almacenará de forma segura.

### Implementar Documentación {/* #deploy-documentation */}

1. Navega al directorio `documentation`:

```bash
cd documentation
```

2. Asegúrate de que todos los cambios de documentación estén confirmados e insertados en el repositorio.

3. Compila e implementa la documentación:

```bash
pnpm run deploy
```

Este comando hará lo siguiente:
- Compilará el sitio de documentación de Docusaurus
- Insertará el sitio compilado en la rama `gh-pages`
- Hará que la documentación esté disponible en [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/)

### Cuándo Implementar Documentación {/* #when-to-deploy-documentation */}

Implementa actualizaciones de documentación:
- Después de fusionar cambios de documentación en `master`
- Al publicar una nueva versión (si la documentación fue actualizada)
- Después de mejoras significativas en la documentación

**Nota:** La implementación de documentación es independiente de las versiones de la aplicación. Puedes implementar documentación varias veces entre versiones de la aplicación.

### Preparación de Notas de Versión para GitHub {/* #preparing-release-notes-for-github */}

El script `generate-readme-from-intro.sh` genera automáticamente notas de versión de GitHub cuando se ejecuta. Lee las notas de versión de `documentation/docs/release-notes/VERSION.md` (donde VERSION se extrae de `package.json`) y crea `RELEASE_NOTES_github_VERSION.md` en la raíz del proyecto.

**Ejemplo:**

```bash
# This will generate README.md, README_dockerhub.md, and RELEASE_NOTES_github_VERSION.md
./scripts/generate-readme-from-intro.sh
```

El archivo de notas de lanzamiento generado se puede copiar y pegar directamente en la descripción de lanzamiento de GitHub. Todos los enlaces e imágenes funcionarán correctamente en el contexto de lanzamiento de GitHub.

**Nota:** El archivo generado es temporal y se puede eliminar después de crear la versión de GitHub. Se recomienda añadir `RELEASE_NOTES_github_*.md` a `.gitignore` si no deseas confirmar estos archivos.

### Actualizar README.md {/* #update-readmemd */}

Si has realizado cambios en `documentation/docs/intro.md`, regenera el repositorio `README.md`:

```bash
./scripts/generate-readme-from-intro.sh
```

Este script:
- Extrae la versión de `package.json`
- Genera `README.md` desde `documentation/docs/intro.md` (convierte las amonestaciones de Docusaurus a alertas de estilo GitHub, convierte enlaces e imágenes)
- Crea `README_dockerhub.md` para Docker Hub (con formato compatible con Docker Hub)
- Genera `RELEASE_NOTES_github_VERSION.md` desde `documentation/docs/release-notes/VERSION.md` (convierte enlaces e imágenes a URLs absolutas)
- Actualiza la tabla de contenidos usando `doctoc`

Confirma y envía el `README.md` actualizado junto con tu versión.
