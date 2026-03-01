---
translation_last_updated: '2026-03-01T00:16:52.924Z'
source_file_mtime: '2026-03-01T00:09:33.538Z'
source_file_hash: 24e59da35ba78059
translation_language: es
source_file_path: development/development-guidelines.md
---
# Referencia de Desarrollo {#development-reference}

## Organización del Código {#code-organisation}

- **Componentes**: `src/components/` con subdirectorios:
  - `ui/` - componentes shadcn/ui y elementos de interfaz de usuario reutilizables
  - `dashboard/` - Componentes específicos del Panel de control
  - `settings/` - Componentes de la página de Configuración
  - `server-details/` - Componentes de la página de Detalles del Servidor
- **Rutas API**: `src/app/api/` con estructura de puntos finales RESTful (véase [Referencia de API](../api-reference/overview))
- **Base de datos**: SQLite con better-sqlite3, utilidades en `src/lib/db-utils.ts`, migraciones en `src/lib/db-migrations.ts`
- **Tipos**: Interfaces de TypeScript en `src/lib/types.ts`
- **Configuración**: Configuraciones por defecto en `src/lib/default-config.ts`
- **Servicio Cron**: `src/cron-service/` (se ejecuta en Puerto 8667 desarrollo, 9667 producción)
- **Scripts**: Scripts de utilidad en el directorio `scripts/`
- **Seguridad**: Protección CSRF en `src/lib/csrf-middleware.ts`, utilice el middleware `withCSRF` para puntos finales protegidos

## Pruebas y Depuración {#testing-debugging}

- Generación de datos de prueba: `pnpm generate-test-data --servers=N`
- Prueba de notificaciones: endpoint `/api/notifications/test`
- Comprobaciones de salud de Cron: `curl http://localhost:8667/health` o `curl http://localhost:8666/api/cron/health`
- Prueba de backup retrasado: `pnpm run-overdue-check`
- Modo de desarrollo: registro detallado y almacenamiento en archivo JSON
- Mantenimiento de base de datos: utilice el menú de mantenimiento para operaciones de limpieza
- Comprobaciones previas: `scripts/pre-checks.sh` para solucionar problemas de inicio

## Referencias de Desarrollo {#development-references}

- Puntos finales de API: Consulte [Referencia de API](../api-reference/overview)
- Esquema de base de datos: Consulte [Esquema de base de datos](database)
- Siga los patrones en `src/lib/db-utils.ts` para operaciones de base de datos

## Marcos de trabajo y bibliotecas {#frameworks-libraries}

### Gestión de Runtime y Paquetes {#runtime-package-management}
- Node.js >=24.12.0
- pnpm >=10.24.0 (packageManager: pnpm@10.30.3)

### Marcos de Trabajo y Librerías Principales {#core-frameworks-libraries}
- Next.js ^16.1.6 (App Router)
- React ^19.2.4 y React-DOM ^19.2.4
- Radix UI (@radix-ui/react-*): ^1.1.8 - ^2.2.6 (accordion ^1.2.12, alert-dialog ^1.1.15, avatar ^1.1.11, checkbox ^1.3.3, dialog ^1.1.15, dropdown-menu ^2.1.16, label ^2.1.8, menubar ^1.1.16, popover ^1.1.15, progress ^1.1.8, radio-group ^1.3.8, scroll-area ^1.2.10, select ^2.2.6, separator ^1.1.8, slider ^1.3.6, slot ^1.2.4, switch ^1.2.6, tabs ^1.1.13, toast ^1.2.15, tooltip ^1.2.8)
- Tailwind CSS ^4.2.1 + tailwindcss-animate ^1.0.7
- Better-sqlite3 ^12.6.2
- Recharts ^3.7.0, react-day-picker ^9.14.0, react-hook-form ^7.71.2, react-datepicker ^9.1.0
- lucide-react ^0.575.0, clsx ^2.1.1, class-variance-authority ^0.7.1
- date-fns ^4.1.0, uuid ^13.0.0
- express ^5.2.1 (servicio cron), node-cron ^4.2.1
- nodemailer ^8.0.1, qrcode ^1.5.4
- intlayer ^8.1.8, next-intlayer ^8.1.8, react-intlayer ^8.1.8, @intlayer/editor-react ^8.1.8, @intlayer/swc ^8.1.8

### Verificación de Tipos y Linting {#type-checking-linting}
- TypeScript ^5.9.3
- TSX ^4.21.0
- ESLint ^9.16.0 (vía `next lint`)
- intlayer-editor ^8.1.8
- webpack ^5.105.3

### Compilación e Implementación {#build-deployment}
- Salida independiente de Next.js (`output: 'standalone'`) con punto de entrada de contenedor iniciando `server.js`
- Docker (base node:alpine) con compilaciones de múltiples arquitecturas (AMD64, ARM64)
- Flujos de trabajo de GitHub Acciones para CI/CD
- Inkscape para logotipos e imágenes
- Docusaurus para documentación
- Greenfish Icon Editor para iconos

### Configuración del Proyecto {#project-configuration}
- `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- `pnpm-workspace.yaml`, `components.json` (shadcn/ui)

## Características del Sistema {#system-features}

- **Servicio Cron**: Servicio separado para tareas programadas, iniciado por `docker-entrypoint.sh` en implementaciones de Docker
- **Notificaciones**: Integración de ntfy.sh y correo electrónico SMTP (nodemailer), plantillas configurables
- **Actualización automática**: Actualización automática configurable para el panel de control y páginas de detalles
