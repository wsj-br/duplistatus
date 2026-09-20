# IP白名单 {/* #ip-allowlist */}

管理员可以限制访问管理界面和外部数据API的用户。这两个列表是独立的。默认情况下都处于关闭状态。

![IP白名单](../../assets/screen-settings-ip-allowlist.png)

应用程序从由`scripts/peer-ip.cjs`设置的内部标头读取TCP对等地址。客户端无法伪造该标头。**检测到的IP**显示用于访问决策的TCP**对等IP**和**允许列表IP**（除非应用受信任代理标头，否则它们匹配）。

被拒绝的请求返回HTTP 403（在API路径上为`IP_NOT_ALLOWED`）。它们不会写入审计日志。会向应用程序标准输出发出速率限制的`console.warn`行（例如`docker logs`）——每个客户端IP和表面（管理、外部或探测）每分钟最多一个日志，每小时十个——因此扫描程序无法淹没日志。

## 受信任的代理 {/* #trusted-proxies */}

仅当无法直接访问 duplistatus，必须通过反向代理才能访问时，才启用 **信任反向代理标头**，且该反向代理会**覆盖** `X-Forwarded-For` / `X-Real-IP`（而非追加）。使用 **添加** 添加每个代理 CIDR（或粘贴逗号或换行符分隔的列表）。条目将以可移除的标签形式显示。当 TCP 对等方不在该列表中时，转发的标头将被忽略。

## 管理界面 {/* #admin-interface */}

启用后，页面、登录、CSRF 和会话 API 仅接受列出的 CIDR。使用 **添加** 添加条目；当您的 **允许列表 IP** 在列表中时，会被标记为 **当前IP**。**127.0.0.1** 和 **::1** 默认包含且无法移除。**添加当前IP** 和 **最近的管理员登录IP**（来自审计日志）提供快速建议。除非您当前的 IP 已被包含（或您正从环回连接），否则无法启用此列表。可通过以下方式恢复锁定：

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

或通过将您的CIDR添加到`ADMIN_IP_ALLOWLIST`。完整恢复步骤（Docker重新创建，然后修复设置并删除覆盖）请参见[因IP白名单被锁定](../troubleshooting.md#locked-out-by-ip-allowlist)。

## 外部API {/* #external-apis */}

启用后，`/api/upload`、`/api/summary`和`/api/lastbackup*`仅接受列出的CIDR。

`/api/health`和`/api/ping`不能单独在外部列表上（仪表板ping来自管理UI IP）。当**任一**白名单启用时，这些探测接受环回（`127.0.0.1`、`::1`）和来自**管理或外部**列表的CIDR。未列出的IP接收HTTP 403。当两个列表都关闭时，探测保持公开。

非环回探测请求也受到速率限制（HTTP 429，`PROBE_RATE_LIMITED`）：`/api/ping`每分钟60次，每小时600次；`/api/health`每分钟30次，每小时120次。容器内Docker检查命中本地主机且从不节流。应用程序级限制无法阻止大量连接洪水；应将其放在反向代理上。

此列表是在不需要 API 密钥时使用的保护措施。像管理员列表一样，以芯片形式添加 CIDR。默认包含 **127.0.0.1** 和 **::1**，无法移除。审计日志中的 **最近上传源IP** 会作为快速添加建议提供。

如果此白名单和API密钥都需要，则请求必须通过**两者**。

## 环境覆盖 {/* #environment-overrides */}

| 变量 | 用途 |
|----------|---------|
| `IP_TRUSTED_PROXIES` | 逗号分隔的受信任代理CIDR（也意味着信任代理） |
| `ADMIN_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `ADMIN_IP_ALLOWLIST` | 逗号分隔的CIDR |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `EXTERNAL_API_IP_ALLOWLIST` | 逗号分隔的 CIDR |

环境值会覆盖数据库，因此无需 UI 即可恢复锁定。
