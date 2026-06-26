# Cron Service {#cron-service}

Is application mein scheduled tasks ko handle karne ke liye ek alag cron service shamil hai:

## Start cron service in development mode {#start-cron-service-in-development-mode}

```bash
pnpm cron:dev
```

## Start cron service in production mode {#start-cron-service-in-production-mode}

```bash
pnpm cron:start
```

## Start cron service locally (for testing) {#start-cron-service-locally-for-testing}

```bash
pnpm cron:start-local
```

Cron service ek alag port par chalti hai (development mein 8667, production mein 9667) aur scheduled tasks jaise overdue backup notifications ko handle karti hai. Port ko `CRON_PORT` environment variable ka istemal karke configure kiya ja sakta hai.

Cron service mein shamil hain:
- **Health check endpoint**: `/health` - Service stithi aur active tasks return karta hai
- **Manual task triggering**: `POST /trigger/:taskName` - Scheduled tasks ko manually execute karein
- **Task management**: `POST /start/:taskName` aur `POST /stop/:taskName` - Individual tasks ko control karein
- **Configuration reload**: `POST /reload-config` - Database se configuration reload karein
- **Automatic restart**: Agar service crash ho jati hai to automatically restart ho jati hai (Docker deployments mein `docker-entrypoint.sh` dwara manage ki jati hai)
- **Watch mode**: Development mode mein code changes par automatic restarts ke liye file watching shamil hai
- **Overdue backup monitoring**: Overdue backups ki automated checking aur notification (default roop se har 5 minute mein chalti hai)
- **Audit log cleanup**: Purane audit log entries ki automated cleanup (har din 2 AM UTC par chalti hai)
- **Flexible scheduling**: Vibhinn tasks ke liye configurable cron expressions
- **Database integration**: Main application ke saath same SQLite database share karti hai
- **RESTful API**: Service management aur monitoring ke liye poori API
