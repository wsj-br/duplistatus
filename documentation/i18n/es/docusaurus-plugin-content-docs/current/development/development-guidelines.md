---
translation_last_updated: '2026-05-11T14:27:40.347Z'
source_file_mtime: '2026-05-06T23:18:51.406Z'
source_file_hash: c7ae1bc72c936d2aee0a62300df6c52bf8f2bbcc98ea4f2271e966cc459510be
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
  - `ui/` - componentes shadcn/ui y elementos de interfaz reutilizables
  - `dashboard/` - componentes específicos del panel de control
  - `settings/` - componentes de la página de configuración
  - `server-details/` - componentes de la página de detalles del servidor
- **Rutas de API**: `src/app/api/` con estructura de puntos de conexión RESTful (ver [Referencia de API](../api-reference/overview))
- **Base de datos**: SQLite con better-sqlite3, utilidades en `src/lib/db-utils.ts`, migraciones en `src/lib/db-migrations.ts`
- **Tipos**: interfaces de TypeScript en `src/lib/types.ts`
- **Configuración**: Configuraciones por defecto en `src/lib/default-config.ts`
- **Servicio Cron**: `src/cron-service/` (se ejecuta en el puerto 8667 en desarrollo, 9667 en producción)
- **Scripts**: Scripts de utilidad en el directorio `scripts/`
- **Seguridad**: Protección CSRF en `src/lib/csrf-middleware.ts`, usar middleware `withCSRF` para puntos de conexión protegidos

## Pruebas y depuración {#testing--debugging}

- Generación de datos de prueba: `pnpm generate-test-data --servers=N`
- Pruebas de notificaciones: punto de conexión `/api/notifications/test`
- Comprobaciones de estado del cron: `curl http://localhost:8667/health` o `curl http://localhost:8666/api/cron/health`
- Pruebas de copia de seguridad retrasada: **Configuración → Monitoreo de Copias de Seguridad** (**Probar respaldos atrasados**), o `POST /api/notifications/check-overdue` con autenticación
- Modo de desarrollo: registro detallado y almacenamiento en archivos JSON
- Mantenimiento de la base de datos: usar el menú de mantenimiento para operaciones de limpieza
- Preverificaciones: `scripts/pre-checks.sh` para solucionar problemas de inicio

## Referencias de Desarrollo {#development-references}

- Puntos finales de API: Consulte [Referencia de API](../api-reference/overview)
- Esquema de base de datos: Consulte [Esquema de base de datos](database)
- Siga los patrones en `src/lib/db-utils.ts` para operaciones de base de datos

## Marcos de trabajo y bibliotecas {#frameworks--libraries}

### Entorno de ejecución y gestión de paquetes {#runtime--package-management}
- Node.js >=24.12.0
- pnpm >=10.24.0 (packageManager: pnpm@10.30.3)

### Marcos de trabajo y bibliotecas principales {#core-frameworks--libraries}
- Next.js ^16.1.6 (App Router)
- React ^19.2.4 y React-DOM ^19.2.4
- Radix UI (`@radix-ui/react-*`): ^1.1.8 - ^2.2.6 (acordeón ^1.2.12, cuadro de diálogo de alerta ^1.1.15, avatar ^1.1.11, casilla de verificación ^1.3.3, diálogo ^1.1.15, menú desplegable ^2.1.16, etiqueta ^2.1.8, barra de menús ^1.1.16, ventana emergente ^1.1.15, área de desplazamiento ^1.2.10, selección ^2.2.6, separador ^1.1.8, control deslizante ^1.3.6, ranura ^1.2.4, interruptor ^1.2.6, pestañas ^1.1.13, notificación ^1.2.15, información sobre herramientas ^1.2.8)
- Tailwind CSS ^4.2.1 + tailwindcss-animate ^1.0.7
- Better-sqlite3 ^12.6.2
- Recharts ^3.7.0, react-day-picker ^9.14.0, react-hook-form ^7.71.2, react-datepicker ^9.1.0
- lucide-react ^0.575.0, clsx ^2.1.1, class-variance-authority ^0.7.1
- date-fns ^4.1.0, uuid ^13.0.0
- express ^5.2.1 (servicio cron), node-cron ^4.2.1
- nodemailer ^8.0.1, qrcode ^1.5.4
- ai-i18n-tools ^1.x, i18next ^26.x, react-i18next ^17.x (canalización de traducción de IU y documentación)

### Comprobación de tipos y revisión de código {#type-checking--linting}
- TypeScript ^5.9.3
- TSX ^4.21.0
- ESLint ^9.16.0 (mediante `next lint`)
- webpack ^5.105.3

### Compilación e implementación {#build--deployment}
- Salida independiente de Next.js (`output: 'standalone'`) con punto de entrada del contenedor iniciando `server.js`
- Docker (base node:alpine) con compilaciones multiarquitectura (AMD64, ARM64)
- Flujos de trabajo de GitHub Actions para CI/CD
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
