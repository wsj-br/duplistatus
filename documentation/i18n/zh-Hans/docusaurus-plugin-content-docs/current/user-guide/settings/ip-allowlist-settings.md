# IP白名单 {#ip-allowlist}

管理员可以限制谁可以访问管理界面和外部数据API。这两个列表是独立的。默认情况下，两者都处于关闭状态。

![IP白名单](../../assets/screen-settings-ip-allowlist.png)

该应用程序从`scripts/peer-ip.cjs`设置的内部标头中读取TCP对等地址。客户端无法伪造该标头。**检测到的 IP**显示TCP**对等 IP**和用于访问决策的**允许列表 IP**（除非应用受信任的代理标头，否则它们匹配）。

## 受信任的代理 {#trusted-proxies}

仅当duplistatus无法通过反向代理访问时，才启用**信任反向代理标头**，该代理**覆盖**`X-Forwarded-For` / `X-Real-IP`（不要追加）。使用**添加**添加每个代理CIDR（或粘贴逗号或换行符分隔的列表）。条目显示为可移除的芯片。当TCP对等不在该列表中时，转发的标头将被忽略。

## 管理界面 {#admin-interface}

启用后，页面、登录、CSRF 和会话 API 仅接受列出的 CIDR。使用 **添加** 添加条目；当前 **允许列表 IP** 在列表中时，会标记为 **当前IP**。**127.0.0.1** 和 **::1** 默认包含且无法移除。**添加当前IP** 和 **最近的管理员登录IP**（来自审计日志）提供快速建议。除非当前 IP 已包含（或您从回环连接），否则无法启用此列表。锁定可通过以下方式恢复：

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

或通过将您的CIDR添加到`ADMIN_IP_ALLOWLIST`。完整恢复步骤（Docker重建，然后修复设置并删除覆盖）请参阅[IP白名单锁定](../troubleshooting.md#locked-out-by-ip-allowlist)。

## 外部API {#external-apis}

启用后，`/api/upload`、`/api/summary`和`/api/lastbackup*`仅接受列出的CIDR。`/api/health`和`/api/ping`保持开放状态，以便Docker健康检查和连接探测继续工作。

此列表是 API 密钥不需要时使用的保护措施。像管理员列表一样添加 CIDR 作为芯片。**127.0.0.1** 和 **::1** 默认包含且无法移除。来自审计日志的 **最近上传源IP** 提供快速添加建议。

如果同时需要此白名单和API密钥，则请求必须通过**两者**。

## 环境覆盖 {#environment-overrides}

| 变量 | 目的 |
|----------|---------|
| `IP_TRUSTED_PROXIES` | 逗号分隔的受信任代理CIDR（也意味着信任代理） |
| `ADMIN_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `ADMIN_IP_ALLOWLIST` | 逗号分隔的CIDR |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `EXTERNAL_API_IP_ALLOWLIST` | 逗号分隔的CIDR |

环境值覆盖数据库，因此无需UI即可恢复锁定。
