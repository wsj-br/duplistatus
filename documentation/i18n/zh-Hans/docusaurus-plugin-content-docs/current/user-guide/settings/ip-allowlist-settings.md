# IP白名单 {/* #ip-allowlist */}

管理员可以限制谁可以访问管理界面和外部数据API。这两个列表是独立的。默认情况下，两者都处于关闭状态。

![IP白名单](../../assets/screen-settings-ip-allowlist.png)

该应用程序从`scripts/peer-ip.cjs`设置的内部标头中读取TCP对等地址。客户端无法伪造该标头。**检测到的 IP**显示TCP**对等 IP**和用于访问决策的**允许列表 IP**（除非受信任的代理标头适用，否则它们匹配）。

被拒绝的请求返回HTTP 403（`IP_NOT_ALLOWED`在API路径上）。它们不会被写入审计日志。速率受限的`console.warn`行被发送到应用程序stdout（例如`docker logs`）——每个客户端IP和表面（管理员、外部或探测）每分钟最多一条日志，每小时最多十条——这样扫描仪就无法淹没日志。

## 受信任的代理 {/* #trusted-proxies */}

仅当duplistatus无法通过反向代理访问时，才启用**信任反向代理标头**，该反向代理**覆盖**`X-Forwarded-For` / `X-Real-IP`（不要追加）。使用**添加**添加每个代理CIDR（或粘贴逗号或换行符分隔的列表）。条目显示为可移除的芯片。当TCP对等不在该列表中时，转发的标头将被忽略。

## 管理界面 {/* #admin-interface */}

启用后，页面、登录、CSRF 和会话 API 仅接受列出的 CIDR。使用 **添加** 添加条目；当前 **允许列表 IP** 在列表中时，会标记为 **当前IP**。**127.0.0.1** 和 **::1** 默认包含，无法删除。**添加当前IP** 和 **最近的管理员登录IP**（来自审计日志）提供快速建议。除非当前 IP 已包含（或您从回环连接），否则无法启用此列表。可以通过以下方式恢复锁定：

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

或者通过将您的CIDR添加到`ADMIN_IP_ALLOWLIST`。完整的恢复步骤（Docker重新创建，然后修复设置并删除覆盖）在[IP白名单锁定](../troubleshooting.md#locked-out-by-ip-allowlist)中。

## 外部API {/* #external-apis */}

启用后，`/api/upload`、`/api/summary`和`/api/lastbackup*`仅接受列出的CIDR。

`/api/health`和`/api/ping`不单独在外部列表上（仪表板ping来自管理UI IP）。当**任一**允许列表启用时，这些探测接受回环（`127.0.0.1`、`::1`）和来自**管理或外部**列表的CIDR。未列出的IP收到HTTP 403。当两个列表都关闭时，探测保持公开。

非回环探测请求也受到速率限制（HTTP 429，`PROBE_RATE_LIMITED`）：`/api/ping`每分钟60次，每小时600次；`/api/health`每分钟30次，每小时120次。容器内的Docker检查命中本地主机，永远不会被限流。应用程序级别的限制无法阻止体积连接洪水；将其放在反向代理上。

此列表是当 API 密钥不需要时使用的保护。添加 CIDR 作为芯片，如管理员列表。**127.0.0.1** 和 **::1** 默认包含且无法移除。**审计日志** 中的最近上传源 IP 提供为快速添加建议。

如果此允许列表和API密钥都需要，则请求必须通过**两者**。

## 环境覆盖 {/* #environment-overrides */}

| 变量 | 目的 |
|----------|---------|
| `IP_TRUSTED_PROXIES` | 逗号分隔的受信任代理CIDR（也意味着信任代理） |
| `ADMIN_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `ADMIN_IP_ALLOWLIST` | 逗号分隔的CIDR |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `EXTERNAL_API_IP_ALLOWLIST` | 逗号分隔的 CIDR |

环境变量会覆盖数据库，因此可以在没有 UI 的情况下恢复锁定。
