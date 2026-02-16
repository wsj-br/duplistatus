---
translation_last_updated: '2026-02-16T00:13:35.572Z'
source_file_mtime: '2026-01-25T02:45:42.744Z'
source_file_hash: 4651d154540967f5
translation_language: es
source_file_path: development/devel.md
---
# Comandos más utilizados {#most-used-commands}

## Ejecutar en modo de desarrollo {#run-in-dev-mode}

```bash
pnpm dev
```

- **Almacenamiento de Archivos JSON**: Todos los datos de backup recibidos se almacenan como archivos JSON en el directorio `data`. Estos archivos se nombran utilizando la marca de tiempo de cuándo fueron recibidos, en el formato `YYYY-MM-DDTHH-mm-ss-sssZ.json` (hora UTC). Esta función solo está activa en modo de desarrollo y ayuda con la depuración al preservar los datos sin procesar recibidos de Duplicati.

- **Verbose Logging**: La aplicación registra información más detallada sobre operaciones de base de datos y solicitudes de API cuando se ejecuta en modo de desarrollo.

- **Actualización de Versión**: El servidor de desarrollo actualiza automáticamente la información de versión antes de iniciarse, asegurando que se muestre la versión más reciente en la aplicación.

- **Eliminación de Backup**: En la página de detalle del servidor, aparece un botón de eliminación en la tabla de backups que le permite eliminar backups individuales. Esta función es especialmente útil para probar y depurar la funcionalidad de backups retrasados.

## Iniciar el servidor de producción (en entorno de desarrollo) {#start-the-production-server-in-development-environment}

En primer lugar, cree la aplicación para producción local:

```bash
pnpm build-local
```

Luego inicia el servidor de producción:

```bash
pnpm start-local
```

## Iniciar una pila de Docker (Docker Compose) {#start-a-docker-stack-docker-compose}

```bash
pnpm docker-up
```

O manualmente:

```bash
docker compose up --build -d
```

## Detener una pila de Docker (Docker Compose) {#stop-a-docker-stack-docker-compose}

```bash
pnpm docker-down
```

O manualmente:

```bash
docker compose down
```

## Limpiar el entorno de Docker {#clean-docker-environment}

```bash
pnpm docker-clean
```

O manualmente:

```bash
./scripts/clean-docker.sh
```

Este script realiza una limpieza completa de Docker, que es útil para:
- Liberar espacio en disco
- Eliminar artefactos antiguos/no utilizados de Docker
- Limpiar después de sesiones de desarrollo o pruebas
- Mantener un entorno Docker limpio

## Crear una imagen de desarrollo (para probar localmente o con Podman) {#create-a-development-image-to-test-locally-or-with-podman}

```bash
export $(grep -v '^#' .env | xargs) && docker build . -t wsj-br/duplistatus:devel-$VERSION
```
