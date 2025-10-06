---
sidebar_position: 9
---

# Development Guidelines

## Code Organisation

- **Components**: Located in `src/components/` with subdirectories for specific features
  - `ui/` - shadcn/ui components and reusable UI elements
  - `dashboard/` - Dashboard-specific components (server cards, tables, summary cards)
  - `settings/` - Settings page components (forms, configuration panels)
  - `server-details/` - Server detail page components (backup tables, charts, summaries)
- **API Routes**: Located in `src/app/api/` with RESTful endpoint structure
  - Core operations: upload, servers, backups, summary, dashboard
  - Configuration: notifications, server connections, backup settings, unified config
  - Chart data: server-specific and aggregated data
  - Cron service: task management and monitoring
  - Health and environment endpoints
  - Session management and CSRF protection
- **Database**: SQLite with better-sqlite3, utilities in `src/lib/db-utils.ts`
- **Types**: TypeScript interfaces in `src/lib/types.ts`
- **Configuration**: Default configs in `src/lib/default-config.ts`
- **Cron Service**: Located in `src/cron-service/` with separate service implementation
- **Scripts**: Utility scripts in `scripts/` directory for testing and maintenance
- **Security**: CSRF protection and session management in `src/lib/csrf-middleware.ts`
- **Pre-checks**: Automated pre-checks via `scripts/pre-checks.sh` for key file and version management

## Testing

- Use the provided test scripts for generating data and testing functionality
- Test notification system with the built-in test endpoints (`/api/notifications/test`)
- Verify cron service functionality by checking the health endpoints (`curl http://localhost:8667/health` or `curl http://localhost:8666/api/cron/health`)
- Test the Docker and Podman images using the provided scripts
- Use TypeScript strict mode for compile-time error checking
- Test database operations with the provided utilities
- Use the test data generation script (`pnpm generate-test-data --servers=N`) for comprehensive testing
- Test overdue backup functionality with manual triggers (`pnpm run-overdue-check`)
- Test server connection management and configuration updates
- Verify CSRF protection and session management

## Debugging

- Development mode provides verbose logging and JSON file storage
- Use the browser's developer tools for frontend debugging
- Check the console for detailed error messages and API responses
- Cron service includes health check endpoints for monitoring (`/api/cron/health`)
- Database utilities include debugging and maintenance functions
- Use the database maintenance menu for cleanup and debugging operations
- Test server connections with the built-in connection testing tools
- Monitor notification system with the NTFY messages button
- Use pre-checks script output for troubleshooting startup issues
- Check CSRF token validation and session management

## API Development

- All API endpoints are documented in `API-ENDPOINTS.md`
- Follow the established RESTful patterns for new endpoints
- Maintain consistent error handling and response formats
- Test new endpoints with the provided test scripts
- Use TypeScript interfaces for type safety
- Implement proper validation and error handling
- Follow the established patterns for configuration endpoints
- Ensure proper CORS handling for cross-origin requests
- Implement CSRF protection for state-changing operations
- Use the `withCSRF` middleware for protected endpoints
- Maintain consistent cache control headers for dynamic data

## Database Development

- Use the migration system for schema changes (`src/lib/db-migrations.ts`)
- Follow the established patterns in `src/lib/db-utils.ts`
- Maintain type safety with TypeScript interfaces
- Test database operations with the provided utilities
- Use the database maintenance tools for cleanup and debugging
- Follow the established schema patterns for new tables
- Implement proper indexing for performance
- Use prepared statements for security
- Maintain session and CSRF token tables for security
- Implement proper request caching for performance optimization
- Use transaction management for data consistency

## UI Development

- Use shadcn/ui components for consistency
- Follow the established patterns in existing components
- Use Tailwind CSS for styling
- Maintain responsive design principles
- Test components in both light and dark themes
- Use TypeScript interfaces for component props
- Implement proper error boundaries and loading states
- Follow accessibility best practices
- Use the established patterns for forms and validation
- Implement proper state management with React hooks
- Use context providers for global state management
- Implement proper CSRF token handling in forms
- Use consistent loading indicators and progress states
