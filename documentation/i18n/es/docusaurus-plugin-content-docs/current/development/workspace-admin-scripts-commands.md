# Scripts y comandos de administrador del espacio de trabajo {/* #workspace-admin-scripts--commands */}

## Limpiar base de datos {/* #clean-database */}

```bash
./scripts/clean-db.sh
```

Limpia la base de datos eliminando todos los datos mientras conserva el esquema y la estructura de la base de datos.

>[!CAUTION]
> Utilice con precaución ya que esto eliminará todos los datos existentes.

## Limpiar artefactos de compilación y dependencias {/* #clean-build-artefacts-and-dependencies */}

```bash
scripts/clean-workspace.sh
```

Elimina todos los artefactos de compilación, directorio node_modules y otros archivos generados para garantizar un estado limpio. Esto es útil cuando necesita realizar una instalación nueva o resolver problemas de dependencias. El comando eliminará:
- Directorio `node_modules/`
- Directorio de compilación `.next/`
- Directorio `dist/`
- Directorio `out/`
- Directorio `.turbo/`
- `pnpm-lock.yaml`
- `data/*.json` (archivos de copia de seguridad JSON de desarrollo)
- `public/documentation`
- `documentation/.docusaurus`, `.cache`, `.cache-*`, `build`, `node_modules`, `pnpm-lock.yaml`
- Directorio `.genkit/`
- Archivos `*.tsbuildinfo`
- Caché de almacén pnpm (mediante `pnpm store prune`)
- Caché de compilación de Docker y limpieza del sistema (imágenes, redes, volúmenes)

## Limpiar entorno de Docker Compose y Docker {/* #clean-docker-compose-and-docker-environment */}

```bash
scripts/clean-docker.sh
```

Realiza una limpieza completa de Docker, lo cual es útil para:
- Liberar espacio en disco
- Eliminar artefactos antiguos/no utilizados de Docker
- Limpiar después de sesiones de desarrollo o pruebas
- Mantener un entorno de Docker limpio

## Actualizar los paquetes a la versión más reciente {/* #update-the-packages-to-the-latest-version */}

Puede actualizar paquetes manualmente usando:

```bash
ncu --upgrade
pnpm update
```

O utilice el script automatizado (prefiera `source` para que **nvm** se aplique a su shell actual; para ejecuciones **CI** o sin interacción use `CI=1` o `UPGRADE_ALLOW_EXEC=1`):

```bash
source ./scripts/upgrade-dependencies.sh
```

El script `upgrade-dependencies.sh` automatiza todo el proceso de actualización de dependencias. Es independiente del proyecto: el gestor de paquetes, los paquetes del espacio de trabajo y el comando de verificación de cada paquete se detectan automáticamente (por lo tanto, se actualizan tanto el paquete raíz como los paquetes `documentation/`, sin rutas codificadas). Lo hace:
- Configura herramientas mediante `upgrade-tools.sh` (nvm / Node LTS, global `pnpm`, `npm-check-updates`, `doctoc`)
- Realiza actualizaciones **seguras para la compilación** para cada paquete: `npm-check-updates` resuelve las últimas versiones, luego instala y ejecuta `typecheck`/`lint` desde la raíz del espacio de trabajo. Las actualizaciones que fallan en la verificación se dividen mediante edición de `package.json` (no `pnpm add`, que pnpm rechaza en la raíz del espacio de trabajo). Las puertas de pares incrustadas fijan `eslint` y `typescript` cuando `eslint-plugin-react` / `typescript-eslint` aún no permiten la última versión principal.
- Actualiza el archivo de bloqueo pnpm del espacio de trabajo e instala dependencias
- Actualiza la base de datos de browserslist
- Verifica vulnerabilidades (`pnpm audit`) y aplica correcciones que no rompen la funcionalidad (`pnpm audit --fix`)
- **Prioriza la seguridad**: si una dependencia directa vulnerable solo puede corregirse con una actualización que rompe la compilación, se aplica la versión segura y se informan los errores de compilación para que el código pueda actualizarse y lograr compatibilidad
- Imprime un resumen (paquetes actualizados frente a paquetes omitidos por romper la compilación, vulnerabilidades corregidas/restantes, y una ruta de instantánea del manifiesto para reversión manual)
- Copia `package.json` y archivos de bloqueo con `/usr/bin/cp` para que un alias `cp` interactivo (por ejemplo `cp -i`) no solicite sobrescribir esos archivos

Este script proporciona un flujo de trabajo completo para mantener las dependencias actualizadas y seguras.

## Comprobar paquetes no utilizados {/* #check-for-unused-packages */}

```bash
pnpm depcheck
```

## Actualizar información de versión {/* #update-version-information */}

```bash
./scripts/update-version.sh
```

Este script actualiza automáticamente la información de versión en múltiples archivos para mantenerlos sincronizados. Él:
- Extrae la versión de `package.json`
- Actualiza el archivo `.env` con la variable `VERSION` (la crea si no existe)
- Actualiza el `Dockerfile` con la variable `VERSION` (si existe)
- Actualiza el campo de versión `documentation/package.json` (si existe)
- Solo actualiza si la versión ha cambiado
- Proporciona comentarios sobre cada operación

## Script de preverificación {/* #pre-checks-script */}

```bash
./scripts/pre-checks.sh
```

Este script ejecuta comprobaciones previas antes de iniciar el servidor de desarrollo, construir o iniciar el servidor de producción. Él:
- Asegura que el archivo `.duplistatus.key` exista (mediante `ensure-key-file.sh`)
- Actualiza la información de versión (mediante `update-version.sh`)

Este script es llamado automáticamente por `pnpm dev`, `pnpm build` y `pnpm start-local`.

## Asegurar que exista archivo clave {/* #ensure-key-file-exists */}

```bash
./scripts/ensure-key-file.sh
```

Este script asegura que el archivo `.duplistatus.key` exista en el directorio `data`. Él:
- Crea el directorio `data` si no existe
- Genera un nuevo archivo de clave aleatoria de 32 bytes si falta
- Establece los permisos del archivo a 0400 (solo lectura para el propietario)
- Corrige permisos si son incorrectos

El archivo clave se utiliza para operaciones criptográficas en la aplicación.

## Recuperación de cuenta de administrador {/* #admin-account-recovery */}

```bash
./admin-recovery <username> <new-password>
```

Este script permite la recuperación de cuentas de administrador si se queda bloqueado o se olvida la contraseña. Él:
- Restablece la contraseña para el usuario especificado
- Desbloquea la cuenta si estaba bloqueada
- Restablece el contador de intentos de inicio de sesión fallidos
- Borra la bandera "debe cambiar la contraseña"
- Valida que la contraseña cumpla los requisitos de seguridad
- Registra la acción en el registro de auditoría

**Ejemplo:**

```bash
./admin-recovery admin NewPassword123
```

>[!CAUTION]
> Este script modifica directamente la base de datos. Úselo solo cuando sea necesario para la recuperación de cuentas.

## Copiar imágenes {/* #copy-images */}

```bash
./scripts/copy-images.sh
```

Copia archivos de imagen de `documentation/static/img` a sus ubicaciones apropiadas en la aplicación:
- Copia `favicon.ico` a `src/app/`
- Copia `duplistatus_logo.png` a `public/images/`
- Copia `duplistatus_banner.png` a `public/images/`

Útil para mantener las imágenes de la aplicación sincronizadas con las imágenes de documentación.

## Alternar herramientas de traducción ai-i18n locales o npm {/* #switch-local-or-npm-ai-i18n-tools */}

```bash
./scripts/link-ai-i18n-tools.sh --local
./scripts/link-ai-i18n-tools.sh --remote
pnpm i18n:tools --local
pnpm i18n:tools --remote
```

Apunta este repositorio a una verificación hermana [ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools) o de vuelta al paquete npm publicado, luego imprime la versión resuelta. `--local` escribe `link:../ai-i18n-tools` (anule la ruta con `--path` o `AI_I18N_TOOLS_PATH`) para que `pnpm i18n:*` y `ai-i18n-tools/runtime` utilicen ambos ese árbol. `--remote` instala la última versión npm como `^x.y.z`. No confirme el especificador `link:`.

## Comparar versiones entre desarrollo y Docker {/* #compare-versions-between-development-and-docker */}

```bash
./scripts/compare-versions.sh
```

Este script compara versiones entre su entorno de desarrollo y un contenedor Docker en ejecución. Él:
- Compara versiones de SQLite solo por versión principal (por ejemplo, 3.45.1 vs 3.51.1 se consideran compatibles, mostradas como "✅ (principal)")
- Compara exactamente las versiones de Node, npm y Duplistatus (deben coincidir exactamente)
- Muestra una tabla formateada mostrando todas las comparaciones de versiones
- Proporciona un resumen con resultados codificados por colores (✅ para coincidencias, ❌ para discrepancias)
- Sale con código 0 si todas las versiones coinciden, 1 si hay discrepancias

**Requisitos:**
- El contenedor de Docker llamado `duplistatus` debe estar en ejecución
- El script lee la información de versión de los registros del contenedor de Docker

**Ejemplo de salida:**

```
┌─────────────────────────┬──────────────────────────────┬──────────────────────────────┬──────────────┐
│ Component               │ Development                  │ Docker                       │   Match      │
├─────────────────────────┼──────────────────────────────┼──────────────────────────────┼──────────────┤
│ SQLite                  │ 3.45.1                       │ 3.51.1                       │ ✅ (major)   │
│ Node                    │ 24.12.0                      │ 24.12.0                      │ ✅           │
│ npm                     │ 10.9.2                       │ 10.9.2                       │ ✅           │
│ Duplistatus             │ 1.2.1                        │ 1.2.1                        │ ✅           │
└─────────────────────────┴──────────────────────────────┴──────────────────────────────┴──────────────┘
```

**Nota:** Las versiones de SQLite se comparan solo por versión principal porque diferentes versiones de parche dentro de la misma versión principal generalmente son compatibles. El script indicará si las versiones de SQLite coinciden en el nivel principal pero difieren en versiones de parche.

## Ver las configuraciones en la base de datos {/* #viewing-the-configurations-in-the-database */}

```bash
sqlite3 data/backups.db "SELECT key, value FROM configurations;" | awk -F'|' '
  {print "\n" $1 ": "; 
   if(index($2,"{")>0) {print $2 |"jq -C ."; close("jq -C .")} 
   else {print $2;}}' | less -R
```

```bash
sqlite3 /var/lib/docker/volumes/duplistatus_data/_data/backups.db "SELECT key, value FROM configurations;" | awk -F'|' '
  {print "\n" $1 ": "; 
   if(index($2,"{")>0) {print $2 |"jq -C ."; close("jq -C .")} 
   else {print $2;}}' | less -R
```

## Mostrar configuración de copia de seguridad {/* #show-backup-settings */}

```bash
./scripts/show-backup-settings.sh [database_path]
```

Muestra el contenido del valor `backup_settings` en la tabla de configuraciones en una tabla formateada. Útil para depurar configuraciones de notificaciones. Ruta predeterminada de la base de datos: `data/backups.db`.
