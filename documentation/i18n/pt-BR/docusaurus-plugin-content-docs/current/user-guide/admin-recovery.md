---
translation_last_updated: '2026-05-06T23:22:19.365Z'
source_file_mtime: '2026-05-06T23:18:51.430Z'
source_file_hash: 715719058387c53e24d6ec27814f20fb52349ff40f5e59310d6965344bb8f16a
translation_language: pt-BR
source_file_path: documentation/docs/user-guide/admin-recovery.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Recuperação de Conta Admin {#admin-account-recovery}

Recupere o acesso de administrador ao **duplistatus** quando você tiver perdido sua senha ou sido bloqueado de sua conta. Este guia aborda o uso do script de recuperação de admin em ambientes Docker.

## Usando o Script no Docker {#using-the-script-in-docker}

O Dockerfile inclui o diretório `scripts` e um wrapper de shell conveniente.

```bash
# Execute inside the running container using the wrapper
docker exec -it duplistatus /app/admin-recovery <username> <new-password>
```

**Exemplo:**

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

## Solução de Problemas {#troubleshooting}

Se você encontrar problemas com o script de recuperação:

1. **Verificar se o Contêiner está em Execução**: Verifique se o contêiner está em execução com `docker ps`
2. **Verificar Disponibilidade do Script**: Confirme se o script existe no contêiner com `docker exec -it duplistatus ls -la /app/admin-recovery`
3. **Revisar os Logs do Contêiner**: Verifique a presença de erros com `docker logs duplistatus`
4. **Verificar Nome de Usuário**: Certifique-se de que o nome de usuário exista no banco de dados
5. **Verificar Formato da Senha**: Certifique-se de que a nova senha atenda a todos os requisitos

Se os problemas persistirem, consulte o guia [Troubleshooting](troubleshooting.md) para obter mais ajuda.
