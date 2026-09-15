# Scripts de prueba {/* #test-scripts */}

El proyecto incluye varios scripts de prueba para ayudar con el desarrollo y las pruebas:

> [!NOTE]
> Los ayudantes `pnpm` para la depuración de tareas vencidas, pruebas de matriz SMTP y comprobaciones de puerto cron se eliminaron del repositorio raíz. Utilice la interfaz de usuario de la aplicación (**Configuración → Monitoreo de copias de seguridad**), las API HTTP autenticadas y `curl` contra el servicio cron, tal como se documenta a continuación.

## Generar datos de prueba {/* #generate-test-data */}

```bash
pnpm generate-test-data --servers=N
```

Este script genera datos de copia de seguridad de prueba para múltiples servidores y copias de seguridad.

El parámetro `--servers=N` es **obligatorio** y especifica el número de servidores a generar (1-30).

Use la opción `--upload` para enviar los datos generados a `/api/upload`

```bash
pnpm generate-test-data --servers=N --upload
pnpm generate-test-data --servers=N --upload --api-key=YOUR_UPLOAD_KEY
```

`--api-key` es obligatorio cuando Configuración → Claves de API está configurado para requerir claves. El script reintenta una vez en HTTP 429 para que una ejecución grande de `--upload` se mantenga dentro de los límites de velocidad predeterminados.

**Ejemplos:**

```bash
# Generate data for 5 servers
pnpm generate-test-data --servers=5

# Generate data for 1 server with upload mode
pnpm generate-test-data --upload --servers=1

# Generate data for all 30 servers
pnpm generate-test-data --servers=30
```

El script asigna versiones de Duplicati **por servidor** (la misma cadena de informe se escribe en cada copia de seguridad para ese servidor):

- **70–80% actual**: usa la última versión estable en caché de `configurations.duplicati_versions` cuando está disponible, de lo contrario, una versión de respaldo fija (`2.1.0.5_stable`).
- **Resto más antiguas**: una versión estable anterior para que la insignia del panel de control se compare como obsoleta (amarilla).
- El modo Direct-DB borra `configurations` primero, luego restaura o semilla la caché de versiones para que la comparación actual/obsoleta funcione inmediatamente.
- Las cantidades pequeñas no siempre pueden caer en el 70–80%: `--servers=1` es 100% actual; `--servers=2` o `3` mantiene al menos un servidor más antiguo; `--servers=6` es 5 actuales (83%). `--servers=12` (usado por `pnpm take-screenshots`) es **9 actuales / 3 más antiguas**.
- Cuando `pnpm take-screenshots` reduce más tarde el conjunto de datos a tres servidores, mantiene el servidor vencido protegido y **al menos un servidor de versión anterior**.

>[!CAUTION]
> Este script elimina todos los datos anteriores en la base de datos y los reemplaza con datos de prueba.
> Realice una copia de seguridad de su base de datos antes de ejecutar este script.

## Comprobaciones de vencimiento y conectividad de cron (desarrollo) {/* #overdue-checks-and-cron-connectivity-development */}

### Ejecutar una comprobación de copia de seguridad vencida {/* #run-an-overdue-backup-check */}

Mientras la aplicación está en ejecución:

- **Interfaz de usuario (recomendado):** abra **Configuración → Monitoreo de copias de seguridad** y use **Probar copias de seguridad vencidas**. Esto ejecuta la misma lógica que el trabajo programado a través de `POST /api/notifications/check-overdue` autenticado.

### Salud del servicio cron {/* #cron-service-health */}

```bash
curl http://localhost:8667/health
curl http://localhost:8666/api/cron/health
```

### Simular una fecha o hora específica {/* #simulating-a-specific-date-or-time */}

No hay una CLI empaquetada para inyectar una hora “actual” simulada. Para el algoritmo y las ideas de pruebas manuales, consulte el archivo del repositorio `dev/OVERDUE_DETECTION_ALGORITHM.md` y la implementación en `src/lib/overdue-backup-checker.ts`.

## Validar exportación CSV {/* #validate-csv-export */}

```bash
pnpm validate-csv-export
```

Este script valida la funcionalidad de exportación CSV. Realiza:
- Pruebas de generación de exportación CSV
- Verifica el formato y estructura de los datos
- Comprueba la integridad de los datos en los archivos exportados

Útil para asegurarse de que las exportaciones CSV funcionan correctamente antes de los lanzamientos.

## Bloquear temporalmente el servidor NTFY (para pruebas) {/* #temporarily-block-ntfy-server-for-testing */}

```bash
sudo ./scripts/temporary_ntfy.sh_block.sh
```

Este script bloquea temporalmente el acceso de red saliente al servidor NTFY (`ntfy.sh`) para probar el mecanismo de reintento de notificaciones. Realiza:
- Resuelve la dirección IP del servidor NTFY
- Añade una regla de iptables para bloquear el tráfico saliente
- Bloquea durante 10 segundos (configurable)
- Elimina automáticamente la regla de bloqueo al salir
- Requiere privilegios de root (sudo)

>[!CAUTION]
> Este script modifica las reglas de iptables y requiere privilegios de root. Úsalo solo para probar los mecanismos de reintento de notificaciones.

## Pruebas de migración de base de datos {/* #database-migration-testing */}

El proyecto incluye scripts para probar las migraciones de base de datos desde versiones antiguas a la versión actual. Estos scripts aseguran que las migraciones de base de datos funcionen correctamente y preserven la integridad de los datos.

### Generar datos de prueba de migración {/* #generate-migration-test-data */}

```bash
./scripts/generate-migration-test-data.sh
```

Este script genera bases de datos de prueba para múltiples versiones históricas de la aplicación. Realiza:

1. **Detiene y elimina** cualquier contenedor Docker existente
2. **Para cada versión** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21):
   - Elimina los archivos de base de datos existentes
   - Crea un archivo de etiqueta de versión
   - Inicia un contenedor Docker con la versión específica
   - Espera a que el contenedor esté listo
   - Genera datos de prueba usando `pnpm generate-test-data`
   - Captura una captura de pantalla de la interfaz de usuario con datos de prueba
   - Detiene y elimina el contenedor
   - Vacía los archivos WAL y guarda el esquema de la base de datos
   - Copia el archivo de base de datos a `scripts/migration_test_data/`

**Requisitos:**
- Docker debe estar instalado y configurado
- Chromium (a través de Playwright) debe estar instalado
- Acceso root/sudo para operaciones de Docker
- El volumen Docker `duplistatus_data` debe existir

**Salida:**
- Archivos de base de datos: `scripts/migration_test_data/backups_<VERSION>.db`
- Archivos de esquema: `scripts/migration_test_data/backups_<VERSION>.schema`
- Capturas de pantalla: `scripts/migration_test_data/duplistatus_test_data_<VERSION>.png`

**Configuración:**
- Número de servidores: Establecido mediante la variable `SERVERS` (predeterminada: 3)
- Directorio de datos: `/var/lib/docker/volumes/duplistatus_data/_data`
- Puerto: 9666 (puerto del contenedor Docker)

>[!CAUTION]
> Este script requiere Docker y detendrá/eliminará contenedores existentes. También requiere acceso sudo para operaciones de Docker y acceso al sistema de archivos. Ejecuta `pnpm take-screenshots:install` primero para instalar el navegador Chromium de Playwright si aún no lo has hecho.

>[!IMPORTANT]
> Este script estaba destinado a ejecutarse solo una vez, ya que en nuevas versiones el desarrollador puede copiar directamente el archivo de base de datos y las capturas de pantalla al directorio `scripts/migration_test_data/`. Durante el desarrollo, solo ejecuta el script `./scripts/test-migrations.sh` para probar las migraciones.

### Probar migraciones de bases de datos {/* #test-database-migrations */}

```bash
./scripts/test-migrations.sh
```

Este script prueba las migraciones de bases de datos desde versiones antiguas hasta la versión actual (4.0). Hace lo siguiente:

1. **Para cada versión** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21):
   - Crea una copia temporal de la base de datos de prueba
   - Ejecuta el proceso de migración usando `test-migration.ts`
   - Valida la estructura de la base de datos migrada
   - Comprueba las tablas y columnas requeridas
   - Verifica que la versión de la base de datos sea 4.0
   - Limpia los archivos temporales

**Requisitos:**
- Las bases de datos de prueba deben existir en `scripts/migration_test_data/`
- Generadas ejecutando `generate-migration-test-data.sh` primero

**Salida:**
- Resultados de prueba con colores (verde para pasar, rojo para fallar)
- Resumen de versiones pasadas y fallidas
- Mensajes de error detallados para migraciones fallidas
- Código de salida 0 si todas las pruebas pasan, 1 si alguna falla

**Qué valida:**
- La versión de la base de datos es 4.0 después de la migración
- Todas las tablas requeridas existen: `servers`, `backups`, `configurations`, `users`, `sessions`, `audit_log`, `db_version`
- Las columnas requeridas existen en cada tabla
- La estructura de la base de datos es correcta

**Ejemplo de salida:**

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
> Este script usa el script de prueba de migración de TypeScript (`test-migration.ts`) internamente. El script de prueba valida la estructura de la base de datos después de la migración y asegura la integridad de los datos.

## SMTP y correo electrónico (desarrollo) {/* #smtp-and-email-development */}

Configura SMTP en **Configuración → Correo electrónico** y usa las pruebas y flujos de notificación de correo electrónico en la aplicación. Los scripts de ayuda `pnpm set-smtp-test-config` y `pnpm test-smtp-connections` eliminados del repositorio.

## Probar script de entrada de Docker {/* #test-docker-entrypoint-script */}

```bash
pnpm test-entrypoint
```

Este script proporciona un contenedor de prueba para `docker-entrypoint.sh` en el desarrollo local. Configura el entorno para probar la funcionalidad de registro de la entrada y asegura que los registros se escriban en `data/logs/` para que la aplicación pueda acceder a ellos.

**Qué hace:**

1. **Siempre construye una versión nueva**: Ejecuta automáticamente `pnpm build-local` para crear una nueva compilación antes de probar (no es necesario compilar manualmente primero)
2. **Construye el servicio cron**: Asegura que el servicio cron se construya (`dist/cron-service.cjs`)
3. **Configura la estructura de Docker**: Crea los enlaces simbólicos y la estructura de directorios necesarios para simular el entorno de Docker
4. **Ejecuta el script de entrada**: Ejecuta `docker-entrypoint.sh` con las variables de entorno adecuadas
5. **Limpieza**: Elimina automáticamente los archivos temporales al salir

**Uso:**

```bash
# Run the test (builds fresh version automatically)
pnpm test-entrypoint
```

**Variables de entorno:**
- `PORT=8666` - Puerto para el servidor Next.js (coincide con `start-local`)
- `CRON_PORT=8667` - Puerto para el servicio cron
- `VERSION` - Se establece automáticamente en formato `test-YYYYMMDD-HHMMSS`

**Salida:**
- Los registros se escriben en `data/logs/application.log` (accesibles por la aplicación)
- La salida de la consola muestra la ejecución del script de entrada
- Presione Ctrl+C para detener y probar el vaciado de registros

**Requisitos:**
- El script debe ejecutarse desde el directorio raíz del repositorio (pnpm maneja esto automáticamente)
- El script maneja automáticamente todos los prerrequisitos (compilación, servicio cron, etc.)

**Casos de uso:**
- Probar cambios en el script de entrada localmente antes del despliegue en Docker
- Verificar la rotación de registros y la funcionalidad de registro
- Probar el apagado elegante y el manejo de señales
- Depurar el comportamiento del script de entrada en un entorno local

## Validación del Resumen Diario {/* #daily-summary-validation */}

```bash
pnpm validate-daily-summary
```

Ejecuta comprobaciones deterministas para la programación del Resumen Diario (incluyendo DST), la agregación de instantáneas (solo los últimos trabajos de copia de seguridad), la poda de la configuración de notificaciones residuales, las filas de copia de seguridad/servidor huérfanas, la sanitización de Markdown, las reclamaciones del registro de entrega y la migración del esquema 4.1 → 4.2 con plantillas personalizadas. No envía correo electrónico ni NTFY.
