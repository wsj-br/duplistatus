---
alwaysApply: true
---

# duplistatus Project Rules (v1.0.2)

## Stack & Versions

- **Node.js**: >=24.12.0
- **TypeScript**: ~5.9.3
- **Next.js (App Router)**: ^16.0.10
- **pnpm**: >=10.24.0 (packageManager: pnpm@10.26.0)
- **React & React-DOM**: ^19.2.3
- **Tailwind CSS**: ^4.1.18
- **@radix-ui/react-*** modules: latest versions
- **ESLint**: bundled with Next.js
- **Prettier**: not used

## Project Architecture

- **Main app**: Next.js 15+ with custom Node server (`duplistatus-server.ts`)
- **Cron service**: Separate background service under `src/cron-service/` with its own REST API
- **Database**: SQLite at `data/backups.db`
- **Security**: `data/.duplistatus.key` must have 0400 permissions

## Ports

- **Development**: 8666 (Next), 8667 (cron)
- **Production**: 9666 (Next), 9667 (cron)

## Commands (DO NOT run these automatically)

```bash
pnpm install          # Install dependencies
pnpm dev              # Start Next.js dev server on 8666
pnpm cron:dev         # Start cron service in watch mode on 8667
pnpm build            # Production build
pnpm start            # Production server on 9666
pnpm lint             # Check for errors (use this before suggesting changes)
pnpm typecheck        # Run TypeScript checks
```

## Code Quality Rules

1. **Never use `any`** - Always define proper TypeScript interfaces
2. **Follow DRY** - Reuse functions from `src/lib/` instead of duplicating logic
3. **Preserve security** - Do not modify `.duplistatus.key` permission checks
4. **Run linter** - Use `pnpm lint` before suggesting code changes
5. **Update docs** - When changing ports, env vars, or setup, update:
   - `docs/DEVELOPMENT.md`
   - `docs/INSTALL.md`

## Git Commit Messages

- Do NOT include version number changes in commit headline
- Include version changes in the detailed change list

## Important Files

- `duplistatus-server.ts` - Custom server entry point
- `src/cron-service/` - Background task service
- `src/lib/` - Shared utilities (DB, cron-client, types)
- `data/backups.db` - SQLite database
- `data/.duplistatus.key` - Security key file (must be 0400)

## Change Tracking

**REQUIRED**: Update `dev/CHANGELOG.md` with all changes made to the codebase.

## Integration Points

- Duplicati servers POST to `/api/upload` (JSON backup reports)
- Notifications via ntfy and optional SMTP
- Docker images: `wsjbr/duplistatus` and `ghcr.io/wsj-br/duplistatus`

## Testing & Debugging

No automated tests. 

## Key Patterns

- DB access: use functions in `src/lib/db.ts`

