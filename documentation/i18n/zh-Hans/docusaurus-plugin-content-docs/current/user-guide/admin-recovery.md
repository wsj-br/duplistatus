# 管理员账户恢复 {/* #admin-account-recovery */}

当您丢失密码或被锁定在账户之外时，恢复对 **duplistatus** 的管理员访问权限。本指南涵盖在 Docker 环境中使用管理员恢复脚本。

如果浏览器在登录表单之前显示 **拒绝访问**（HTTP 403），则 [管理员IP白名单](settings/ip-allowlist-settings.md) 正在阻止请求。请使用 [被IP白名单锁定](troubleshooting.md#locked-out-by-ip-allowlist) 而不是此脚本。

## 在 Docker 中使用脚本 {/* #using-the-script-in-docker */}

Dockerfile 包含 `scripts` 目录和一个便捷的 shell 包装器。

```bash
# Execute inside the running container using the wrapper
docker exec -it duplistatus /app/admin-recovery <username> <new-password>
```

**示例：**

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

## 故障排除 {/* #troubleshooting */}

如果您在使用恢复脚本时遇到问题：

1. **验证容器正在运行**：使用 `docker ps` 检查容器是否正在运行
2. **检查脚本可用性**：使用 `docker exec -it duplistatus ls -la /app/admin-recovery` 验证脚本是否存在于容器中
3. **查看容器日志**：使用 `docker logs duplistatus` 检查错误
4. **验证用户名**：确保数据库中存在该用户名
5. **检查密码格式**：确保新密码满足所有要求

如果问题仍然存在，请参阅 [故障排除](troubleshooting.md) 指南以获取更多帮助。
