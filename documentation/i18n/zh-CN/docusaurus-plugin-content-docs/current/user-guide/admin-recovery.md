# 管理员账户恢复 {#admin-account-recovery}

当您丢失密码或被锁定账户时，可使用本指南恢复 **duplistatus** 的管理员访问权限。本指南涵盖在 Docker 环境中使用管理员恢复脚本。

## 在 Docker 中使用脚本 {#using-the-script-in-docker}

Dockerfile 包含 `scripts` 目录和便捷的 shell 包装脚本。

```bash
# Execute inside the running container using the wrapper
docker exec -it duplistatus /app/admin-recovery <username> <new-password>
```

**示例：**
```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

## 故障排除 {#troubleshooting}

若恢复脚本遇到问题：

1. **Verify Container is Running**：使用 `docker ps` 检查容器是否正在运行
2. **Check Script Availability**：使用 `docker exec -it duplistatus ls -la /app/admin-recovery` 验证脚本是否存在于容器中
3. **Review Container Logs**：使用 `docker logs duplistatus` 检查错误
4. **Verify Username**：确保用户名存在于数据库中
5. **Check Password Format**：确保新密码符合所有要求

若问题仍然存在，请参阅[故障排除](troubleshooting.md)指南获取更多帮助。
