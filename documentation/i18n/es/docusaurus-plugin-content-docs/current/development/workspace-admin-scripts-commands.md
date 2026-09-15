# Scripts y comandos de administración de espacios de trabajo {/* #workspace-admin-scripts--commands */}

## Limpiar base de datos {/* #clean-database */}

```bash
./scripts/clean-db.sh
```

Limpia la base de datos eliminando todos los datos mientras se preserva el esquema y la estructura de la base de datos.

>[!CAUTION]
> Utilice con precaución ya que esto eliminará todos los datos existentes.

## Limpiar artefactos de compilación y dependencias {/* #clean-build-artefacts-and-dependencies */}

```bash
scripts/clean-workspace.sh
```

Elimina todos los artefactos de compilación, el directorio node_modules y otros archivos generados para asegurar un estado limpio. Esto es útil cuando necesitas realizar una instalación fresca o resolver problemas de dependencias. El comando eliminará:
- Directorio `node_modules/`
- Directorio de compilación `.next/`
- Directorio `dist/`
- Directorio `out/`
- Directorio `.turbo/`
- Directorio `pnpm-lock.yaml`
- `data/*.json` (archivos de copia de seguridad JSON de desarrollo)
- `public/documentation`
- `documentation/.docusaurus`, `.cache`, `.cache-*`, `build`, `node_modules`, `pnpm-lock.yaml`
- Directorio `.genkit/`
- Archivos `*.tsbuildinfo`
- Almacén de caché de pnpm (a través de `pnpm store prune`)
- Caché de compilación de Docker y purga del sistema (imágenes, redes, volúmenes)

## Limpiar entorno Docker Compose y Docker {/* #clean-docker-compose-and-docker-environment */}

```bash
scripts/clean-docker.sh
```

Realiza una limpieza completa de Docker, lo cual es útil para:
- Liberar espacio en disco
- Eliminar artefactos de Docker antiguos o no utilizados
- Limpiar después de sesiones de desarrollo o pruebas
- Mantener un entorno de Docker limpio

## Actualizar los paquetes a la versión más reciente {/* #update-the-packages-to-the-latest-version */}

Puedes actualizar los paquetes manualmente usando:

```bash
ncu --upgrade
pnpm update
```

O usa el script automatizado (prefiere `source` para que **nvm** se aplique a tu shell actual; para **CI** o ejecuciones no interactivas usa `CI=1` o `UPGRADE_ALLOW_EXEC=1`):

```bash
source ./scripts/upgrade-dependencies.sh
```

El `upgrade-dependencies.sh` script automatiza todo el proceso de actualización de dependencias. Es agnóstico al proyecto: el gestor de paquetes, los paquetes del espacio de trabajo y cada comando de verificación del paquete se detectan automáticamente (por lo que tanto los paquetes raíz como los `documentation/` se actualizan, sin rutas codificadas). Se realiza lo siguiente:
- Configura las herramientas a través de `upgrade-tools.sh` (nvm / Node LTS, `pnpm` global, `npm-check-updates`, `doctoc`)
- Realiza actualizaciones **seguras para la compilación** de cada paquete: `npm-check-updates` resuelve las últimas versiones, luego instala y ejecuta `typecheck`/`lint` desde la raíz del espacio de trabajo. Las actualizaciones que fallen la verificación se bisecan editando `package.json` (no `pnpm add`, que pnpm rechaza en la raíz del espacio de trabajo). Las compuertas de pares incrustadas fijan `eslint` y `typescript` cuando `eslint-plugin-react` / `typescript-eslint` aún no permiten la última versión principal.
- Actualiza el archivo de bloqueo pnpm del espacio de trabajo e instala las dependencias.
- Actualiza la base de datos de browserslist
- Busca vulnerabilidades (`pnpm audit`) y aplica correcciones no disruptivas (`pnpm audit --fix`)
- **Prioriza la seguridad**: si una dependencia directa vulnerable solo puede corregirse con una actualización que rompe la compilación, se aplica la versión segura y se reportan los errores de compilación para que el código pueda actualizarse para la compatibilidad
- Imprime un resumen (paquetes actualizados vs. paquetes saltados que rompen la compilación, vulnerabilidades corregidas/pendientes, y una ruta de instantánea del manifiesto para reversión manual)
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

Este script actualiza automáticamente la información de la versión en varios archivos para mantenerlos sincronizados. Realiza las siguientes acciones:
- Extrae la versión de `package.json`
- Actualiza el archivo `.env` con la variable `VERSION` (lo crea si no existe)
- Actualiza el `Dockerfile` con la variable `VERSION` (si existe)
- Actualiza el campo de versión de `documentation/package.json` (si existe)
- Solo actualiza si la versión ha cambiado
- Proporciona retroalimentación sobre cada operación

## Script de comprobaciones previas {/* #pre-checks-script */}

```bash
./scripts/pre-checks.sh
```

Este script ejecuta comprobaciones previas antes de iniciar el servidor de desarrollo, construir o iniciar el servidor de producción. Realiza las siguientes acciones:
- Asegura que el archivo `.duplistatus.key` exista (a través de `ensure-key-file.sh`)
- Actualiza la información de la versión (a través de `update-version.sh`)

Este script se llama automáticamente por `pnpm dev`, `pnpm build` y `pnpm start-local`.

## Asegurar que el archivo clave exista {/* #ensure-key-file-exists */}

```bash
./scripts/ensure-key-file.sh
```

Este script asegura que el archivo `.duplistatus.key` exista en el directorio `data`. Realiza las siguientes acciones:
- Crea el directorio `data` si no existe
- Genera un nuevo archivo de clave aleatoria de 32 bytes si falta
- Establece los permisos del archivo a 0400 (solo lectura para el propietario)
- Corrige los permisos si son incorrectos

El archivo de clave se utiliza para operaciones criptográficas en la aplicación.

## Recuperación de cuenta de administrador {/* #admin-account-recovery */}

```bash
./admin-recovery <username> <new-password>
```

Este script permite la recuperación de cuentas de administrador si están bloqueadas o se ha olvidado la contraseña. Realiza las siguientes acciones:
- Restablece la contraseña del usuario especificado
- Desbloquea la cuenta si estaba bloqueada
- Restablece el contador de intentos de inicio de sesión fallidos
- Borra la bandera "debe cambiar la contraseña"
- Valida que la contraseña cumpla con los requisitos de seguridad
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

Copia archivos de imagen desde `documentation/static/img` a sus ubicaciones apropiadas en la aplicación:
- Copia `favicon.ico` a `src/app/`
- Copia `duplistatus_logo.png` a `public/images/`
- Copia `duplistatus_banner.png` a `public/images/`

Útil para mantener las imágenes de la aplicación sincronizadas con las imágenes de la documentación.

## Comparar versiones entre desarrollo y Docker {/* #compare-versions-between-development-and-docker */}

```bash
./scripts/compare-versions.sh
```

Este script compara las versiones entre su entorno de desarrollo y un contenedor Docker en ejecución. Realiza las siguientes acciones:
- Compara las versiones de SQLite por versión principal solo (por ejemplo, 3.45.1 vs 3.51.1 se consideran compatibles, mostradas como "✅ (principal)")
- Compara las versiones de Node, npm y Duplistatus exactamente (deben coincidir exactamente)
- Muestra una tabla formateada que muestra todas las comparaciones de versiones
- Proporciona un resumen con resultados codificados por colores (✅ para coincidencias, ❌ para diferencias)
- Sale con código 0 si todas las versiones coinciden, 1 si hay diferencias

**Requisitos:**
- El contenedor Docker llamado `duplistatus` debe estar en ejecución
- El script lee la información de la versión de los registros del contenedor Docker

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

**Nota:** Las versiones de SQLite se comparan solo por la versión principal porque las diferentes versiones de parche dentro de la misma versión principal son generalmente compatibles. El script indicará si las versiones de SQLite coinciden a nivel principal pero difieren en las versiones de parche.

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

## Mostrar la configuración de copia de seguridad {/* #show-backup-settings */}

```bash
./scripts/show-backup-settings.sh [database_path]
```

Muestra el contenido del valor `backup_settings` en la tabla de configuraciones en una tabla formateada. Útil para depurar las configuraciones de notificación. Ruta de la base de datos predeterminada: `data/backups.db`.
