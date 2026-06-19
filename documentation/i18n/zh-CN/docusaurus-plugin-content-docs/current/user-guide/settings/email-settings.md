# 邮件 {#email}

**duplistatus** 支持通过 SMTP 发送邮件通知，可作为 NTFY 通知的替代或补充。邮件配置现在通过 Web 界面进行管理，并在数据库中加密存储，以增强安全性。

![Email Configuration](../../assets/screen-settings-email.png)

| 设置 | 说明 |
|:------------------------|:-----------------------------------------------------------------|
| **SMTP 服务器主机**    | 您的邮件服务商的 SMTP 服务器（例如 `smtp.gmail.com`）。|
| **SMTP 服务器端口**    | 端口号（通常 `25` 用于纯 SMTP，`587` 用于 STARTTLS，`465` 用于直接 SSL/TLS）。|
| **连接类型**     | 可选择纯 SMTP、STARTTLS 或直接 SSL/TLS。新配置默认为直接 SSL/TLS。|
| **SMTP 认证** | 切换以启用或禁用 SMTP 认证。禁用时，用户名和密码字段非必填。|
| **SMTP 用户名**       | 您的邮箱地址或用户名（启用认证时必填）。|
| **SMTP 密码**       | 您的邮箱密码或应用专用密码（启用认证时必填）。|
| **发件人名称**         | 邮件通知中显示的发件人名称（可选，默认为 "duplistatus"）。|
| **发件地址**        | 显示为发件人的邮箱地址。纯 SMTP 连接或禁用认证时必填。启用认证时默认为 SMTP 用户名。请注意，某些邮件服务商将使用 `SMTP Server Username` 覆盖 `From Address`。|
| **收件人电子邮件**     | 接收通知的邮箱地址。必须为有效的邮箱格式。|

侧边栏中 **邮件** 旁边的 <IIcon2 icon="lucide:mail" color="green"/> 绿色图标表示您的设置有效。如果图标为 <IIcon2 icon="lucide:mail" color="yellow"/> 黄色，则表示您的设置无效或未配置。

当所有必填字段均已设置时，图标显示为绿色：SMTP 服务器主机、SMTP 服务器端口、收件人电子邮件，以及（需要认证时的 SMTP 用户名 + 密码）或（不需要认证时的发件地址）。

当配置未完全填写时，将显示黄色警告框，提示您在正确填写邮件设置之前不会发送任何邮件。[备份通知](backup-notifications-settings.md) 选项卡中的邮件复选框也将变为灰色，并显示 "(已禁用)" 标签。

<br/>

## 可用操作 {#available-actions}

| 按钮 | 说明 |
|:-----------------------------------------------------------------|:---------------------------------------------------------|
| <IconButton label="保存设置" /> | 保存对 NTFY 设置所做的更改。|
| <IconButton icon="lucide:mail" label="发送测试邮件"/> | 使用 SMTP 配置发送测试邮件。测试邮件将显示 SMTP 服务器主机名、端口、连接类型、认证状态、用户名（如适用）、收件人邮箱、发件地址、发件人名称和测试时间戳。|
| <IconButton icon="lucide:trash-2" label="删除 SMTP 设置"/> | 删除 / 清除 SMTP 配置。|

<br/>

:::info[IMPORTANT]
  在依赖邮件通知之前，您必须使用 <IconButton icon="lucide:mail" label="发送测试邮件"/> 按钮确保您的邮件设置正常工作。

 即使您看到绿色的 <IIcon2 icon="lucide:mail" color="green"/> 图标且所有内容看起来已配置，邮件也可能无法发送。
 
 **duplistatus** 仅检查您的 SMTP 设置是否已填写，而不检查邮件是否能够实际送达。
:::

<br/>

## 常见 SMTP 服务商 {#common-smtp-providers}

**Gmail:**

- 主机：`smtp.gmail.com`
- 端口：`587`（STARTTLS）或 `465`（直接 SSL/TLS）
- 连接类型：端口 587 使用 STARTTLS，端口 465 使用直接 SSL/TLS
- 用户名：您的 Gmail 地址
- 密码：使用应用专用密码（而非您的常规密码）。在 https://myaccount.google.com/apppasswords 生成一个
- 身份验证：必需

**Outlook/Hotmail：**

- 主机：`smtp-mail.outlook.com`
- 端口：`587`
- 连接类型：STARTTLS
- 用户名：您的 Outlook 邮箱地址
- 密码：您的账户密码
- 身份验证：必需

**Yahoo 邮箱：**

- 主机：`smtp.mail.yahoo.com`
- 端口：`587`
- 连接类型：STARTTLS
- 用户名：您的 Yahoo 邮箱地址
- 密码：使用应用专用密码
- 身份验证：必需

### 安全最佳实践 {#security-best-practices}

- 建议为通知用途创建专用邮箱账户
 - 使用“发送测试邮件”按钮测试您的配置
 - 设置信息已加密并安全存储在数据库中
 - **使用加密连接** - 生产环境建议使用 STARTTLS 或直接 SSL/TLS
 - 纯 SMTP 连接（端口 25）仅适用于受信任的本地网络，在不受信任的网络中不建议用于生产环境
