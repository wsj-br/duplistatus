---
translation_last_updated: '2026-04-18T14:28:08.912Z'
source_file_mtime: '2026-04-18T14:26:07.191Z'
source_file_hash: b2a61a9c45db956c0f6d1fffcaa03aee962a6571671dd2bfeb4aeb1dd5be7a8d
translation_language: es
source_file_path: documentation/docs/development/development-guidelines.md
translation_models:
  - anthropic/claude-3.5-haiku
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
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
- Prueba de notificaciones: punto final `/api/notifications/test`
- Verificaciones de estado de cron: `curl http://localhost:8667/health` o `curl http://localhost:8666/api/cron/health`
- Prueba de copias de seguridad retrasadas: **Configuración → Monitoreo de Copias de Seguridad** (**Probar copias de seguridad atrasadas**), o `POST /api/notifications/check-overdue` con autenticación
- Modo de desarrollo: registro detallado y almacenamiento en archivos JSON
- Mantenimiento de la base de datos: usar el menú de mantenimiento para operaciones de limpieza
- Preverificaciones: `scripts/pre-checks.sh` para solucionar problemas de inicio

## Referencias de Desarrollo {#development-references}

- Puntos finales de API: Consulte [Referencia de API](../api-reference/overview)
- Esquema de base de datos: Consulte [Esquema de base de datos](database)
- Siga los patrones en `src/lib/db-utils.ts` para operaciones de base de datos

## Marcos de trabajo y bibliotecas {#frameworks-libraries}

### Gestión de Runtime y Paquetes {#runtime-package-management}
- Node.js >=24.12.0
- pnpm >=10.24.0 (packageManager: pnpm@10.30.3)

### Core Frameworks & Libraries {#core-frameworks-libraries}
- Next.js ^16.1.6 (App Router)
- React ^19.2.4 & React-DOM ^19.2.4
- Radix UI (@radix-ui/react-*): ^1.1.8 - ^2.2.6 (accordion ^1.2.12, alert-dialog ^1.1.15, avatar ^1.1.11, checkbox ^1.3.3, dialog ^1.1.15, dropdown-menu ^2.1.16, label ^2.1.8, menubar ^1.1.16, popover ^1.1.15, progress ^1.1.8, radio-group ^1.3.8, scroll-area ^1.2.10, select ^2.2.6, separator ^1.1.8, slider ^1.3.6, slot ^1.2.4, switch ^1.2.6, tabs ^1.1.13, toast ^1.2.15, tooltip ^1.2.8)
- Tailwind CSS ^4.2.1 + tailwindcss-animate ^1.0.7
- Better-sqlite3 ^12.6.2
- Recharts ^3.7.0, react-day-picker ^9.14.0, react-hook-form ^7.71.2, react-datepicker ^9.1.0
- lucide-react ^0.575.0, clsx ^2.1.1, class-variance-authority ^0.7.1
- date-fns ^4.1.0, uuid ^13.0.0
- express ^5.2.1 (servicio cron), node-cron ^4.2.1
- nodemailer ^8.0.1, qrcode ^1.5.4
- ai-i18n-tools ^1.x, i18next ^26.x, react-i18next ^17.x (canalización de traducción para UI + docs)

### Type Checking & Linting {#type-checking-linting}
- TypeScript ^5.9.3
- TSX ^4.21.0
- ESLint ^9.16.0 (vía `next lint`)
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
