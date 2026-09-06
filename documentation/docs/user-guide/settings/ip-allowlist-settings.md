

# IP Allowlist {#ip-allowlist}

Administrators can restrict who reaches the admin interface and the external data APIs. The two lists are independent. Both are off by default.

![IP Allowlist](../../assets/screen-settings-ip-allowlist.png)

The application reads the TCP peer address from an internal header set by `scripts/peer-ip.cjs`. A client cannot spoof that header. **Detected IP** shows the TCP **Peer IP** and the **Allowlist IP** used for access decisions (they match unless trusted-proxy headers apply).

## Trusted proxies {#trusted-proxies}

Enable **Trust reverse proxy headers** only when duplistatus is not reachable except through a reverse proxy that **overwrites** `X-Forwarded-For` / `X-Real-IP` (do not append). Add each proxy CIDR with **Add** (or paste a comma- or newline-separated list). Entries appear as removable chips. When the TCP peer is not in that list, forwarded headers are ignored.

## Admin interface {#admin-interface}

When enabled, pages, login, CSRF, and session APIs accept only listed CIDRs. Add entries with **Add**; your current **Allowlist IP** is tagged **current IP** when it is in the list. **127.0.0.1** and **::1** are included by default and cannot be removed. **Add current IP** and **Recent admin login IPs** (from the audit log) offer quick suggestions. You cannot enable this list unless your current IP is already included (or you are connecting from loopback). A lockout can be recovered with:

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

or by adding your CIDR to `ADMIN_IP_ALLOWLIST`. Full recovery steps (Docker recreate, then fix Settings and remove the override) are in [Locked Out by IP Allowlist](../troubleshooting.md#locked-out-by-ip-allowlist).

## External APIs {#external-apis}

When enabled, `/api/upload`, `/api/summary`, and `/api/lastbackup*` accept only listed CIDRs. `/api/health` and `/api/ping` stay open so Docker health checks and the connectivity probe keep working.

This list is the protection to use when API keys are not required. Add CIDRs as chips like the admin list. **127.0.0.1** and **::1** are included by default and cannot be removed. **Recent upload source IPs** from the audit log are offered as quick-add suggestions.

If both this allowlist and API keys are required, a request must pass **both**.

## Environment overrides {#environment-overrides}

| Variable | Purpose |
|----------|---------|
| `IP_TRUSTED_PROXIES` | Comma-separated trusted proxy CIDRs (also implies trust-proxy) |
| `ADMIN_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `ADMIN_IP_ALLOWLIST` | Comma-separated CIDRs |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `EXTERNAL_API_IP_ALLOWLIST` | Comma-separated CIDRs |

Environment values override the database so a lockout is recoverable without the UI.
