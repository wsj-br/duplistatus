# 用户 {#users}

管理 **duplistatus** 的用户账户、权限和访问控制。本节允许管理员创建、修改和删除用户账户。

![User Management](../../assets/screen-settings-users.png)

>[!TIP] 
>默认的 `admin` 账户可以被删除。如需删除，请先创建一个新的管理员用户，使用该账户登录，
> 然后删除 `admin` 账户。
>
> `admin` 账户的默认密码为 `Duplistatus09`。首次登录时，您将被要求更改密码。

## 访问用户管理 {#accessing-user-management}

您可以通过两种方式访问用户管理部分：

1. **通过用户菜单**：点击 [应用程序工具栏](../overview.md#application-toolbar) 中的 <IconButton icon="lucide:user" label="用户名" />，然后选择“管理员用户”。

2. **通过设置**：在设置侧边栏中点击 <IconButton icon="lucide:settings"/> 和 **用户**

## 创建新用户 {#creating-a-new-user}

1. 点击 <IconButton icon="lucide:plus" label="添加用户"/> 按钮
2. 输入用户详情：
   - **用户名**：必须为 3-50 个字符，唯一且不区分大小写
   - **管理员**：勾选以授予管理员权限
   - **要求更改密码**：勾选以强制在首次登录时更改密码
   - **密码**：
     - 选项 1：勾选“自动生成密码”以创建安全的临时密码
     - 选项 2：取消勾选并输入自定义密码
3. 点击 <IconButton icon="lucide:user-plus" label="创建用户" />。

## 编辑用户 {#editing-a-user}

1. 点击用户旁边的 <IconButton icon="lucide:edit" /> 编辑图标
2. 修改以下任一项：
   - **用户名**：更改用户名（必须唯一）
   - **管理员**：切换管理员权限
   - **要求更改密码**：切换密码更改要求
3. 点击 <IconButton icon="lucide:check" label="保存更改" />。

## 重置用户密码 {#resetting-a-user-password}

1. 点击用户旁边的 <IconButton icon="lucide:key-round" /> 密钥图标
2. 确认密码重置
3. 系统将生成并显示一个新的临时密码
4. 复制密码并将其安全地提供给用户

## 删除用户 {#deleting-a-user}

1. 点击用户旁边的 <IconButton icon="lucide:trash-2" /> 删除图标
2. 在对话框中确认删除。**用户删除是永久性的，无法撤销。**

## 账户锁定 {#account-lockout}

在多次登录失败后，账户将被自动锁定：
- **锁定阈值**：5 次失败尝试
- **锁定持续时间**：15 分钟
- 被锁定的账户在锁定期间结束前无法登录

## 恢复管理员访问权限 {#recovering-admin-access}

如果您丢失了管理员密码或账户被锁定，可以使用管理员恢复脚本来恢复访问权限。请参阅 [管理员账户恢复](../admin-recovery.md) 指南，了解在 Docker 环境中恢复管理员访问权限的详细说明。
