# HTTP Connection Support - Update Summary

## Changes Made

The application has been updated to **accept HTTP connections in production by default**. This resolves the login issue when accessing via hostname or IP address (e.g., `http://g5-server:8666`).

## What Was Changed

### Modified File: `src/app/api/auth/login/route.ts`
- Changed cookie security settings to allow HTTP connections by default
- Secure cookies are now **disabled by default**
- Can be enabled via `SECURE_COOKIES=true` environment variable when using HTTPS

### Previous Behavior (ISSUE)
```typescript
secure: process.env.NODE_ENV === 'production'  // Always true in production
```
This caused cookies to only work over HTTPS, breaking HTTP access.

### New Behavior (FIXED)
```typescript
secure: process.env.SECURE_COOKIES === 'true'  // Default: false (HTTP supported)
```

## How to Use

### For HTTP Access (Default - No Action Required)
The application now works with HTTP out of the box:
- ✅ `http://localhost:8666`
- ✅ `http://g5-server:8666`
- ✅ `http://192.168.1.100:8666`

**You can now rebuild and login will work:**
```bash
cd /home/wsj/src/duplistatus
pnpm build
pnpm start
```

Then access: `http://g5-server:8666/login`
- Username: `wsj`
- Password: `Duplistatus090`

### For HTTPS Access (Optional)
If you set up HTTPS in the future, add to your `.env` file:
```bash
SECURE_COOKIES=true
```

## Testing Your Login

1. **Rebuild the application:**
   ```bash
   cd /home/wsj/src/duplistatus
   pnpm build
   ```

2. **Restart the server** (if it's running):
   ```bash
   # If running as a service, restart it
   # Or kill and restart: pnpm start
   ```

3. **Clear browser cookies** for `g5-server:8666`
   - Open browser DevTools (F12)
   - Go to Application/Storage → Cookies
   - Delete cookies for `g5-server:8666`

4. **Test login:**
   - Navigate to: `http://g5-server:8666/login`
   - Enter username: `wsj`
   - Enter password: `Duplistatus090`
   - Should successfully log in ✓

## Security Considerations

### Current Setup (HTTP)
- ✅ Suitable for internal networks
- ✅ Works behind firewalls/VPNs
- ✅ No SSL certificate required
- ⚠️ Credentials sent unencrypted over the network
- ⚠️ Session cookies can be intercepted on the local network

### Recommended for Public Access
If exposing to the internet or untrusted networks:
1. Set up HTTPS with a reverse proxy (nginx/Caddy/Apache)
2. Set `SECURE_COOKIES=true` in `.env`
3. Use strong passwords
4. Consider additional authentication (2FA, VPN, etc.)

## Files Modified
- ✅ `src/app/api/auth/login/route.ts` - Updated cookie security settings
- 📄 `LOGIN_TROUBLESHOOTING.md` - Created troubleshooting guide
- 📄 `HTTP_SUPPORT_UPDATE.md` - This file

## Build Status
- ✅ `pnpm lint` - Passed
- ✅ `pnpm build` - Successful
- ✅ TypeScript compilation - No errors
- ✅ All previous fixes maintained

---

**Ready to use!** The application now supports HTTP connections by default.

