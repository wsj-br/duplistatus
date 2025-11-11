# Login Troubleshooting Guide

## HTTP Connection Support

### Default Behavior
The application **accepts HTTP connections by default** to support internal network deployments where HTTPS may not be required. This means you can access the application via:
- `http://localhost:8666`
- `http://g5-server:8666`
- `http://192.168.1.100:8666`

### Enabling HTTPS (Optional)
If you want to use HTTPS and enable secure cookies for enhanced security:

1. **Set up HTTPS** with a reverse proxy:
   - **nginx**: Configure SSL/TLS termination
   - **Caddy**: Automatic HTTPS with Let's Encrypt
   - **Apache**: Configure mod_ssl
   - Use a self-signed certificate for internal networks

2. **Enable secure cookies** by adding to your `.env` file:
   ```bash
   SECURE_COOKIES=true
   ```

3. **Restart the application**:
   ```bash
   pnpm build && pnpm start
   ```

### Verification
After applying the fix:
1. Clear your browser cookies for the site
2. Navigate to `http://g5-server:8666/login`
3. Enter your credentials
4. Login should succeed and redirect to the dashboard

### Security Notes
- **Never** disable secure cookies when exposing the application to the internet
- For production deployments, always use HTTPS
- Secure cookies help prevent session hijacking and man-in-the-middle attacks
- Consider using a VPN or SSH tunnel if you need to access over untrusted networks

### Environment Variables
- `NODE_ENV`: Set to `production` or `development`
- `SECURE_COOKIES`: Set to `true` to enable secure cookies when using HTTPS (default: `false`)

