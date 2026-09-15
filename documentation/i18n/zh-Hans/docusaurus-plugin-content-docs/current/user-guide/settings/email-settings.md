# 电子邮件 {/* #email */}

**duplistatus** 支持通过 SMTP 发送电子邮件通知，作为 NTFY 通知的替代或补充。电子邮件配置现在通过网络界面进行管理，数据库中存储加密信息以增强安全性。

![电子邮件配置](../../assets/screen-settings-email.png)

| 设置                 | 描述                                                      |
|:------------------------|:-----------------------------------------------------------------|
| **SMTP 服务器主机**    | 您的电子邮件提供商的 SMTP 服务器（例如，`smtp.gmail.com`）。      |
| **SMTP 服务器端口**    | 端口号（通常为普通 SMTP 的 `25`，STARTTLS 的 `587`，或直接 SSL/TLS 的 `465`）。 |
| **连接类型**     | 在普通 SMTP、STARTTLS 或直接 SSL/TLS 之间进行选择。新配置默认为直接 SSL/TLS。 |
| **SMTP 身份验证** | 切换以启用或禁用 SMTP 身份验证。禁用时，用户名和密码字段不需要。 |
| **SMTP 用户名**       | 您的电子邮件地址或用户名（在启用身份验证时需要）。 |
| **SMTP 密码**       | 您的电子邮件密码或应用程序特定密码（在启用身份验证时需要）。 |
| **发件人名称**         | 在电子邮件通知中显示的发件人名称（可选，默认为“duplistatus”）。 |
| **发件人地址**        | 显示为发件人的电子邮件地址。在普通 SMTP 连接或禁用身份验证时需要。在启用身份验证时，默认为 SMTP 用户名。请注意，某些电子邮件提供商将覆盖 `From Address` 为 `SMTP Server Username`。 |
| **接收者邮箱**     | 接收通知的电子邮件地址。必须是有效的电子邮件地址格式。 |

侧边栏中 **电子邮件** 旁边的 <IIcon2 icon="lucide:mail" color="green"/> 绿色图标表示您的设置有效。如果图标是 <IIcon2 icon="lucide:mail" color="yellow"/> 黄色，则您的设置无效或未配置。

当所有必填字段都设置时，图标显示为绿色：SMTP 服务器主机、SMTP 服务器端口、接收者邮箱，以及（在需要身份验证时为 SMTP 用户名 + 密码）或（在不需要身份验证时为发件人地址）。

当配置不完全时，将显示黄色警报框，通知您在正确填写电子邮件设置之前不会发送电子邮件。[备份通知](backup-notifications-settings.md) 选项卡中的电子邮件复选框也将被灰显，并显示“（已禁用）”标签。

<br/>

## 可用操作 {/* #available-actions */}

| 按钮                                                           | 描述                                              |
|:-----------------------------------------------------------------|:---------------------------------------------------------|
| <IconButton label="保存设置" />                             | 保存对 NTFY 设置所做的更改。              |
| <IconButton icon="lucide:mail" label="发送测试电子邮件"/>         | 使用 SMTP 配置发送测试电子邮件消息。测试电子邮件显示 SMTP 服务器主机名、端口、连接类型、身份验证状态、用户名（如适用）、接收者电子邮件、发件人地址、发件人名称和测试时间戳。 |
| <IconButton icon="lucide:trash-2" label="删除 SMTP 设置"/> | 删除 / 清除 SMTP 配置。在 [每日摘要](daily-summary-settings.md) 启用时禁用，因为该模式需要电子邮件。 |

<br/>

:::info[重要]
  您必须使用 <IconButton icon="lucide:mail" label="发送测试电子邮件"/> 按钮确保您的电子邮件设置正常工作，然后才能依赖它进行通知。

 即使您看到绿色 <IIcon2 icon="lucide:mail" color="green"/> 图标并且一切看起来都已配置，电子邮件也可能不会被发送。
 
  **duplistatus** 仅检查您的 SMTP 设置是否已填写，而不检查电子邮件是否实际可以被投递。
:::

<br/>

## 常见 SMTP 提供商 {/* #common-smtp-providers */}

**Gmail:**

- 主机: `smtp.gmail.com`
- 端口: `587` (STARTTLS) 或 `465` (直接 SSL/TLS)
- 连接类型: 端口 587 使用 STARTTLS，端口 465 使用直接 SSL/TLS
- 用户名: 您的 Gmail 地址
- 密码: 使用应用专用密码（不是您的常规密码）。在 https://myaccount.google.com/apppasswords 生成一个
- 认证: 必需

**Outlook/Hotmail:**

- 主机: `smtp-mail.outlook.com`
- 端口: `587`
- 连接类型: STARTTLS
- 用户名: 您的 Outlook 电子邮件地址
- 密码: 您的账户密码
- 认证: 必需

**Yahoo Mail:**

- 主机: `smtp.mail.yahoo.com`
- 端口: `587`
- 连接类型: STARTTLS
- 用户名: 您的 Yahoo 电子邮件地址
- 密码: 使用应用专用密码
- 认证: 必需

### 安全最佳实践 {/* #security-best-practices */}

- 考虑使用专用电子邮件账户进行通知
 - 使用“发送测试电子邮件”按钮测试您的配置
 - 设置已加密并安全地存储在数据库中
 - **使用加密连接** - 生产环境建议使用 STARTTLS 和直接 SSL/TLS
 - 普通 SMTP 连接（端口 25）可用于受信任的本地网络，但不建议在不受信任的网络上用于生产环境
