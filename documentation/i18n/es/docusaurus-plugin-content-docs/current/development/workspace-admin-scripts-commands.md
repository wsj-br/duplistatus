---
translation_last_updated: '2026-02-14T04:57:45.174Z'
source_file_mtime: '2026-02-06T21:19:15.606Z'
source_file_hash: a8ff236072ebae34
translation_language: es
source_file_path: development/workspace-admin-scripts-commands.md
---
# Scripts y Comandos de Admin del Workspace {#workspace-admin-scripts-commands}

## Limpiar Base de Datos {#clean-database}

```bash
./scripts/clean-db.sh
```

Limpia la base de datos eliminando todos los datos mientras preserva el esquema y la estructura de la base de datos.

>[!CAUTION]
> Utilice con precaución ya que esto eliminará todos los datos existentes.

## Limpiar artefactos de compilación y dependencias {#clean-build-artefacts-and-dependencies}

```bash
scripts/clean-workspace.sh
```

Elimina todos los artefactos de compilación, el directorio node_modules y otros archivos generados para garantizar un estado limpio. Esto es útil cuando necesita realizar una instalación desde cero o resolver problemas de dependencias. El comando eliminará:
- Directorio `node_modules/`
- Directorio de compilación `.next/`
- Directorio `dist/`
- Directorio `out/`
- Directorio `.turbo/`
- `pnpm-lock.yaml`
- `data/*.json` (archivos de backup JSON de desarrollo)
- `public/documentation`
- `documentation/.docusaurus`, `.cache`, `.cache-*`, `build`, `node_modules`, `pnpm-lock.yaml`
- Directorio `.genkit/`
- Archivos `*.tsbuildinfo`
- Caché de almacén de pnpm (mediante `pnpm store prune`)
- Caché de compilación de Docker y limpieza del sistema (imágenes, redes, volúmenes)

## Limpiar Docker Compose y el entorno Docker {#clean-docker-compose-and-docker-environment}

```bash
scripts/clean-docker.sh
```

Realizar una limpieza completa de Docker, que es útil para:
- Liberar espacio en disco
- Eliminar artefactos antiguos/no utilizados de Docker
- Limpiar después de sesiones de desarrollo o pruebas
- Mantener un entorno Docker limpio

## Actualizar los paquetes a la última versión {#update-the-packages-to-the-latest-version}

Puede actualizar paquetes manualmente utilizando:

```bash
ncu --upgrade
pnpm update
```

O utiliza el script automatizado:

```bash
./scripts/upgrade-dependencies.sh
```

El script `upgrade-dependencies.sh` automatiza todo el proceso de actualización de dependencias:
- Actualiza `package.json` con las últimas versiones utilizando `npm-check-updates`
- Actualiza el archivo de bloqueo de pnpm e instala las dependencias actualizadas
- Actualiza la base de datos de browserslist
- Verifica vulnerabilidades utilizando `pnpm audit`
- Corrige automáticamente las vulnerabilidades utilizando `pnpm audit fix`
- Verifica nuevamente las vulnerabilidades después de la corrección para verificar que las correcciones funcionan

Este script proporciona un flujo de trabajo completo para mantener las dependencias actualizadas y seguras.

## Verificar paquetes no utilizados {#check-for-unused-packages}

```bash
pnpm depcheck
```

## Actualizar información de versión {#update-version-information}

```bash
./scripts/update-version.sh
```

Este script actualiza automáticamente la información de versión en múltiples archivos para mantenerlos sincronizados. Realiza lo siguiente:
- Extrae la versión de `package.json`
- Actualiza el archivo `.env` con la variable `VERSION` (la crea si no existe)
- Actualiza el `Dockerfile` con la variable `VERSION` (si existe)
- Actualiza el campo de versión en `documentation/package.json` (si existe)
- Solo actualiza si la versión ha cambiado
- Proporciona retroalimentación en cada operación

## Script de verificaciones previas {#pre-checks-script}

```bash
./scripts/pre-checks.sh
```

Este script ejecuta verificaciones previas antes de iniciar el servidor de desarrollo, compilar o iniciar el servidor de producción. Realiza lo siguiente:
- Garantiza que el archivo `.duplistatus.key` exista (mediante `ensure-key-file.sh`)
- Actualiza la información de versión (mediante `update-version.sh`)

Este script se llama automáticamente mediante `pnpm dev`, `pnpm build` y `pnpm start-local`.

## Asegurar que el archivo de clave existe {#ensure-key-file-exists}

```bash
./scripts/ensure-key-file.sh
```

Este script garantiza que el archivo `.duplistatus.key` exista en el directorio `data`. Realiza lo siguiente:
- Crea el directorio `data` si no existe
- Genera un nuevo archivo de clave aleatoria de 32 bytes si falta
- Establece los permisos del archivo en 0400 (solo lectura para el propietario)
- Corrige los permisos si son incorrectos

El archivo de clave se utiliza para operaciones criptográficas en la aplicación.

## Recuperación de cuenta de Admin {#admin-account-recovery}

```bash
./admin-recovery <username> <new-password>
```

Este script permite la recuperación de cuentas de admin si están bloqueadas u olvida la contraseña. Realiza lo siguiente:
- Restablece la contraseña del usuario especificado
- Desbloquea la cuenta si estaba bloqueada
- Restablece el contador de intentos de iniciar sesión fallidos
- Borra la bandera "Debe cambiar la contraseña"
- Valida que la contraseña cumpla con los requisitos de seguridad
- Registra la acción en el Log de Auditoría

**Ejemplo:**

```bash
./admin-recovery admin NewPassword123
```

>[!CAUTION]
> Este script modifica directamente la base de datos. Utilícelo solo cuando sea necesario para la recuperación de cuentas.

## Copiar imágenes {#copy-images}

```bash
./scripts/copy-images.sh
```

Copia archivos de imagen de `documentation/static/img` a sus ubicaciones correspondientes en la aplicación:
- Copia `favicon.ico` a `src/app/`
- Copia `duplistatus_logo.png` a `public/images/`
- Copia `duplistatus_banner.png` a `public/images/`

Útil para mantener las imágenes de la aplicación sincronizadas con las imágenes de la documentación.

## Comparar versiones entre desarrollo y Docker {#compare-versions-between-development-and-docker}

```bash
./scripts/compare-versions.sh
```

Este script compara versiones entre su entorno de desarrollo y un contenedor Docker en ejecución. Realiza lo siguiente:
- Compara versiones de SQLite solo por versión principal (por ejemplo, 3.45.1 vs 3.51.1 se consideran compatibles, mostrado como "✅ (major)")
- Compara versiones de Node, npm y Duplistatus exactamente (deben coincidir exactamente)
- Muestra una tabla formateada con todas las comparaciones de versiones
- Proporciona un resumen con resultados codificados por color (✅ para coincidencias, ❌ para discrepancias)
- Sale con código 0 si todas las versiones coinciden, 1 si hay discrepancias

**Requisitos:**
- El contenedor Docker denominado `duplistatus` debe estar en ejecución
- El script lee información de versión desde los logs del contenedor Docker

**Salida de ejemplo:**

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

**Nota:** Las versiones de SQLite se comparan solo por versión principal porque las diferentes versiones de parche dentro de la misma versión principal generalmente son compatibles. El script indicará si las versiones de SQLite coinciden a nivel principal pero difieren en versiones de parche.

## Visualización de las configuraciones en la base de datos {#viewing-the-configurations-in-the-database}

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

## Mostrar configuración de backup

```bash
./scripts/show-backup-settings.sh [database_path]
```

Muestra el contenido del valor `backup_settings` en la tabla de configuraciones en un formato de tabla. Útil para depurar configuraciones de notificaciones. Ruta predeterminada de la base de datos: `data/backups.db`.
