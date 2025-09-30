# GitHub Copilot / AI Agent Instructions for duplistatus

Quick, focused guidance to make AI coding agents immediately productive in this repository.

1. Big picture
   - duplistatus is a Next.js 15 app with a small custom Node server (`duplistatus-server.ts`) and a separate cron service under `src/cron-service/`.
   - Web app (Next) handles UI and REST API under `/api/*`. Cron service runs scheduled background tasks (overdue checks, notifications) and exposes its own REST API on a separate port (default CRON_PORT=9667).
   - Persistent data lives in a local SQLite DB located under `data/backups.db`. In development the app also writes JSON request dumps into `data/` for debugging.

2. Start / build / dev workflow (use these exact commands)
   - Install: pnpm install (pnpm v10+ required)
   - Dev UI: pnpm dev (starts Next on port 8666)
   - Dev cron (watch mode): pnpm cron:dev (starts cron on 8667)
   - Build: pnpm build
   - Start (production): pnpm start (server on 9666; uses `duplistatus-server.ts` entry)
   - Docker: pnpm docker-up / pnpm docker-down

3. Key files to inspect for behavior and patterns
   - `duplistatus-server.ts` — custom Node server that ensures `.duplistatus.key` permissions, exposes env var checks and starts Next.js. Important for startup, health checks and graceful shutdown.
   - `src/cron-service/` — cron service code and README with API and task lifecycle (watch for `CRON_PORT` logic).
   - `src/lib/` — shared library utilities (DB, cron-client, types). Reuse functions here rather than duplicating logic.
   - `scripts/` — helpful admin scripts (clean-db.sh, generate-test-data.ts, duplistatus-cron.sh). Tests and debugging helpers live here.
   - `Dockerfile` & `docker-compose.yml` — container lifecycle: build stage copies `.next/standalone` and includes cron service runtime files.

4. Project-specific conventions
   - Use `pnpm` (not `npm`/`yarn`) — enforced by `preinstall` script and `packageManager` in package.json.
   - Node >=20 is required (see `engines` in package.json).
   - The app expects `PORT` and `CRON_PORT` env vars. Cron defaults to PORT+1 if not set; tests and scripts assume ports 8666/8667 in dev and 9666/9667 in prod.
   - Key file: `data/.duplistatus.key` must be 0400 permissions. The server will refuse to start if invalid.
   - DB migrations/backups: migrations create `backups-copy-*.db` in `data/bkp/` during startup; be careful when editing migration code.

5. Patterns and examples (copyable snippets)
   - Calling cron endpoints from the UI client: see `src/lib/cron-client.ts` for usage patterns (triggering tasks, health checks).
   - Uploading Duplicati reports: UI POSTs to `/api/upload`; incoming JSON is written to `data/` in dev and inserted into SQLite in prod.
   - Starting cron in production inside container: the Docker CMD runs `node duplistatus-server.ts & /app/duplistatus-cron.sh`.

6. Tests, debugging and safety
   - There are no automated unit tests in the repo; use the provided scripts to generate data and exercise flows:
     - `pnpm run generate-test-data --servers=5` (destructive: replaces DB)
     - `pnpm show-overdue-notifications`
     - `pnpm run-overdue-check "YYYY-MM-DD HH:MM:SS"`
   - To inspect DB: open `data/backups.db` with `sqlite3` or use the SQL scripts in `scripts/`.
   - Use `pnpm lint` and `pnpm typecheck` before publishing changes.

7. Integration points and external deps
   - Duplicati servers POST backup reports to `/api/upload` (JSON). See `docs/INSTALL.md` for exact Duplicati options: `--send-http-url=http://HOST:PORT/api/upload`.
   - Notification delivery via ntfy and optional SMTP; SMTP env vars are read at server startup and masked in logs.
   - Docker images published to Docker Hub / GHCR (`wsjbr/duplistatus` / `ghcr.io/wsj-br/duplistatus`).

8. When making changes
   - Preserve the `.duplistatus.key` permission logic in `duplistatus-server.ts` unless you intentionally change secure behavior.
   - Update `docs/DEVELOPMENT.md` and `docs/INSTALL.md` for any change that affects setup, ports, or environment variables.
   - For DB schema changes, add migration logic and ensure the backup flow still creates `backups-copy-*.db` files.

9. Where to look for more AI guidance in repo
   - `docs/HOW-I-BUILD-WITH-AI.md` and `website/docs/development/ai-development.md` contain examples of previous AI-assisted work and tools recommended.

If something above is unclear or you want a different focus (e.g., write starter tests, implement a new API endpoint, or add TypeScript types), say which area and I will expand this guidance and open a small PR with examples.
