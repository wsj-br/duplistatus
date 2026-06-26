# 管理员账户恢复 {#admin-account-recovery}

当您丢失密码或被锁定出您的账户时，恢复管理员访问 **duplistatus**。本指南介绍了在 Docker 环境中使用管理员恢复脚本。

## 在 Docker 中使用脚本 {#using-the-script-in-docker}

Dockerfile 包括 `scripts` 目录和一个方便的 shell 包装器。

```bash
# Execute inside the running container using the wrapper
docker exec -it duplistatus /app/admin-recovery <username> <new-password>
```

**示例:**

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

## 故障排除 {#troubleshooting}

如果您遇到恢复脚本的问题:

1. **验证容器是否正在运行**: 检查容器是否正在使用 `docker ps`
2. **检查脚本可用性**: 验证脚本在容器中存在 `docker exec -it duplistatus ls -la /app/admin-recovery`
3. **查看容器日志**: 使用 `docker logs duplistatus` 检查错误
4. **验证用户名**: 确保用户名存在于数据库中
5. **检查密码格式**: 确保新密码满足所有要求

如果问题仍然存在，请参阅 [故障排除](troubleshooting.md) 指南以获取更多帮助。
