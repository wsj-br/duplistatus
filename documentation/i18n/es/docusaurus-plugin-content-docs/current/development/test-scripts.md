# Scripts de Prueba {#test-scripts}

El proyecto incluye varios scripts de prueba para ayudar con el desarrollo y las pruebas:

> [!NOTE]
> Se eliminaron los ayudantes heredados en la raíz del repositorio `pnpm` para depuración de respaldos atrasados, pruebas de matriz SMTP y verificaciones de puerto cron. Utilice la interfaz de usuario de la aplicación (**Configuración → Monitoreo de Copias de Seguridad**), las API HTTP autenticadas y `curl` contra el servicio cron como se documenta a continuación.

## Generar Datos de Prueba {#generate-test-data}

```bash
pnpm generate-test-data --servers=N
```

Este script genera datos de backup de prueba para múltiples servidores y backups.

El parámetro `--servers=N` es **obligatorio** y especifica la cantidad de servidores a generar (1-30).

Utilice la opción `--upload` para enviar los datos generados a `/api/upload`

```bash
pnpm generate-test-data --servers=N --upload
```

**Ejemplos:**

```bash
# Generate data for 5 servers
pnpm generate-test-data --servers=5

# Generate data for 1 server with upload mode
pnpm generate-test-data --upload --servers=1

# Generate data for all 30 servers
pnpm generate-test-data --servers=30
```

>[!CAUTION]
> Este script elimina todos los datos anteriores en la base de datos y los reemplaza con datos de prueba.
> Realice una copia de seguridad de su base de datos antes de ejecutar este script.

## Verificaciones de retrasos y conectividad cron (desarrollo) {#overdue-checks-and-cron-connectivity-development}

### Ejecutar una verificación de copia de seguridad retrasada {#run-an-overdue-backup-check}

Mientras la aplicación está en ejecución:

- **IU (recomendado):** abra **Configuración → Monitoreo de Copias de Seguridad** y use **Probar copias de seguridad retrasadas**. Esto ejecuta la misma lógica que el trabajo programado mediante `POST /api/notifications/check-overdue` autenticado.

### Estado del servicio cron {#cron-service-health}

```bash
curl http://localhost:8667/health
curl http://localhost:8666/api/cron/health
```

### Simular una fecha u hora específica {#simulating-a-specific-date-or-time}

No hay una CLI incluida para inyectar una hora "actual" simulada. Para el algoritmo y sugerencias de pruebas manuales, consulte el archivo del repositorio `dev/OVERDUE_DETECTION_ALGORITHM.md` y la implementación en `src/lib/overdue-backup-checker.ts`.

## Validar exportación CSV {#validate-csv-export}

```bash
pnpm validate-csv-export
```

Este script valida la funcionalidad de exportación CSV. Realiza lo siguiente:
- Prueba la generación de exportación CSV
- Verifica el formato y la estructura de los datos
- Comprueba la integridad de los datos en los archivos exportados

Útil para garantizar que las exportaciones de CSV funcionen correctamente antes de los lanzamientos.

## Bloquear temporalmente el servidor NTFY (para pruebas) {#temporarily-block-ntfy-server-for-testing}

```bash
sudo ./scripts/temporary_ntfy.sh_block.sh
```

Este script bloquea temporalmente el acceso de red saliente al servidor NTFY (`ntfy.sh`) para probar el mecanismo de reintento de notificaciones. Realiza lo siguiente:
- Resuelve la dirección IP del servidor NTFY
- Añade una regla de iptables para bloquear el tráfico saliente
- Bloquea durante 10 segundos (configurable)
- Elimina automáticamente la regla de bloqueo al salir
- Requiere privilegios de root (sudo)

>[!CAUTION]
> Este script modifica las reglas de iptables y requiere privilegios de root. Úselo solo para probar mecanismos de reintento de notificaciones.

## Pruebas de Migración de Base de Datos {#database-migration-testing}

El proyecto incluye scripts para probar migraciones de base de datos desde versiones anteriores a la versión actual. Estos scripts garantizan que las migraciones de base de datos funcionen correctamente y preserven la integridad de los datos.

### Generar Datos de Prueba de Migración {#generate-migration-test-data}

```bash
./scripts/generate-migration-test-data.sh
```

Este script genera bases de datos de prueba para múltiples versiones históricas de la aplicación. Lo siguiente:

1. **Detiene y elimina** cualquier contenedor Docker existente
2. **Para cada versión** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21):
   - Elimina los archivos de base de datos existentes
   - Crea un archivo de etiqueta de versión
   - Inicia un contenedor Docker con la versión específica
   - Espera a que el contenedor esté listo
   - Genera datos de prueba usando `pnpm generate-test-data`
   - Toma una captura de pantalla de la interfaz con los datos de prueba
   - Detiene y elimina el contenedor
   - Descarga los archivos WAL y guarda el esquema de la base de datos
   - Copia el archivo de base de datos a `scripts/migration_test_data/`

**Requisitos:**
- Docker debe estar instalado y configurado
- Google Chrome (a través de Puppeteer) debe estar instalado
- Acceso root/sudo para operaciones de Docker
- El volumen de Docker `duplistatus_data` debe existir

**Salida:**
- Archivos de base de datos: `scripts/migration_test_data/backups_<VERSION>.db`
- Archivos de esquema: `scripts/migration_test_data/backups_<VERSION>.schema`
- Capturas de pantalla: `scripts/migration_test_data/duplistatus_test_data_<VERSION>.png`

**Configuración:**
- Número de servidores: Se establece mediante la variable `SERVERS` (por defecto: 3)
- Directorio de datos: `/var/lib/docker/volumes/duplistatus_data/_data`
- Puerto: 9666 (puerto del contenedor Docker)

>[!CAUTION]
> Este script requiere Docker y detendrá/eliminará contenedores existentes. También requiere acceso sudo para operaciones de Docker y acceso al sistema de archivos. Es necesario ejecutar primero el script `pnpm take-screenshots` para instalar Google Chrome si aún no lo ha hecho.

>[!IMPORTANT]
> Este script estaba destinado a ejecutarse una sola vez; en nuevas versiones, el desarrollador puede copiar el archivo de base de datos y las capturas de pantalla directamente al directorio `scripts/migration_test_data/`. Durante el desarrollo, simplemente ejecute el script `./scripts/test-migrations.sh` para probar las migraciones.

### Migraciones de Base de Datos de Prueba {#test-database-migrations}

```bash
./scripts/test-migrations.sh
```

Este script prueba migraciones de base de datos desde versiones antiguas a la versión actual (4.0). Lo siguiente:

1. **Para cada versión** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21):
   - Crea una copia temporal de la base de datos de prueba
   - Ejecuta el proceso de migración usando `test-migration.ts`
   - Valida la estructura de la base de datos migrada
   - Verifica la existencia de tablas y columnas requeridas
   - Confirma que la versión de la base de datos sea 4.0
   - Limpia los archivos temporales

**Requisitos:**
- Las bases de datos de prueba deben existir en `scripts/migration_test_data/`
- Generadas ejecutando primero `generate-migration-test-data.sh`

**Salida:**
- Resultados de pruebas con codificación por colores (verde para aprobado, rojo para fallido)
- Resumen de versiones aprobadas y fallidas
- Mensajes detallados de error para migraciones fallidas
- Código de salida 0 si todas las pruebas pasan, 1 si alguna falla

**Lo que valida:**
- La versión de la base de datos es 4.0 después de la migración
- Todas las tablas requeridas existen: `servers`, `backups`, `configurations`, `users`, `sessions`, `audit_log`, `db_version`
- Las columnas requeridas existen en cada tabla
- La estructura de la base de datos es correcta

**Salida de ejemplo:**

```
==========================================
Database Migration Test Suite
==========================================

Testing migrations from old versions to version 4.0
Test data directory: /path/to/migration_test_data
Temporary directory: /path/to/migration_test_data/.tmp

----------------------------------------
Testing version: v0.4.0
----------------------------------------
  Copying database file to temporary location...
  Running migration test...
✅ Version v0.4.0: Migration test PASSED

==========================================
Test Summary
==========================================

✅ Passed versions (5):
  ✓ v0.4.0
  ✓ v0.5.0
  ✓ v0.6.1
  ✓ 0.7.27
  ✓ 0.8.21

All migration tests passed!
```

**Uso:**

```bash
# Run all migration tests
./scripts/test-migrations.sh

# Check exit code
echo $?  # 0 = all passed, 1 = some failed
```

>[!NOTE]
> Este script utiliza internamente el script de prueba de migración de TypeScript (`test-migration.ts`). El script de prueba valida la estructura de la base de datos después de la migración y garantiza la integridad de los datos.

## SMTP y correo electrónico (desarrollo) {#smtp-and-email-development}

Configure SMTP en **Configuración → Correo electrónico** y use las funciones integradas de prueba de correo y notificaciones. Los scripts auxiliares anteriores `pnpm set-smtp-test-config` y `pnpm test-smtp-connections` fueron eliminados del repositorio.

## Probar Script de Punto de Entrada de Docker {#test-docker-entrypoint-script}

```bash
pnpm test-entrypoint
```

Este script proporciona un contenedor de prueba para `docker-entrypoint.sh` en desarrollo local. Configura el entorno para probar la funcionalidad de registro de logs y garantiza que los logs se escriban en `data/logs/` para que la aplicación pueda acceder a ellos.

**Qué hace:**

1. **Construye siempre una versión nueva**: Ejecuta automáticamente `pnpm build-local` para crear una compilación nueva antes de probar (no es necesario compilar manualmente primero)
2. **Construye el servicio cron**: Asegura que el servicio cron se compile (`dist/cron-service.cjs`)
3. **Configura una estructura tipo Docker**: Crea los enlaces simbólicos y la estructura de directorios necesarios para imitar el entorno de Docker
4. **Ejecuta el script de entrada**: Ejecuta `docker-entrypoint.sh` con las variables de entorno adecuadas
5. **Limpieza**: Elimina automáticamente los archivos temporales al salir

**Uso:**

```bash
# Run the test (builds fresh version automatically)
pnpm test-entrypoint
```

**Variables de Entorno:**
- `PORT=8666` - Puerto para el servidor Next.js (coincide con `start-local`)
- `CRON_PORT=8667` - Puerto para el servicio cron
- `VERSION` - Se establece automáticamente en formato `test-YYYYMMDD-HHMMSS`

**Salida:**
- Los logs se escriben en `data/logs/application.log` (accesible por la aplicación)
- La salida de consola muestra la ejecución del script de punto de entrada
- Presione Ctrl+C para detener y probar el vaciado de logs

**Requisitos:**
- El script debe ejecutarse desde el directorio raíz del repositorio (pnpm lo maneja automáticamente)
- El script maneja automáticamente todos los requisitos previos (compilación, servicio cron, etc.)

**Casos de uso:**
- Probar cambios en el script de entrada localmente antes del despliegue en Docker
- Verificar la rotación de registros y la funcionalidad de registro
- Probar el apagado ordenado y el manejo de señales
- Depuración del comportamiento del script de entrada en un entorno local
