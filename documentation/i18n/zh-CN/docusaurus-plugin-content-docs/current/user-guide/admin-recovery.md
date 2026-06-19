# 管理员账户恢复 {#admin-account-recovery}

当您丢失密码或账户被锁定时，可以通过此方法恢复 **duplistatus** 的管理员访问权限。本指南涵盖了在 Docker 环境中使用管理员恢复脚本的操作步骤。

## 在 Docker 中使用脚本 {#using-the-script-in-docker}

Dockerfile 包含了 `scripts` 目录和一个便捷的 shell 封装程序。

```bash
# Execute inside the running container using the wrapper
docker exec -it duplistatus /app/admin-recovery <username> <new-password>
```

**示例：**

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

## 故障排除 {#troubleshooting}

如果您在运行恢复脚本时遇到问题：

1. **验证容器正在运行**：使用 `docker ps` 检查容器是否正在运行
2. **检查脚本可用性**：使用 `docker exec -it duplistatus ls -la /app/admin-recovery` 验证容器中是否存在该脚本
3. **查看容器日志**：使用 `docker logs duplistatus` 检查是否有错误
4. **验证用户名**：确保数据库中存在该用户名
5. **检查密码格式**：确保新密码符合所有要求

如果问题仍然存在，请参阅 [故障排除](troubleshooting.md) 指南以获取更多帮助。
