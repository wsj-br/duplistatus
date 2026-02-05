---
translation_last_updated: '2026-02-05T00:21:12.587Z'
source_file_mtime: '2026-01-29T17:58:29.899Z'
source_file_hash: 091dcbb5c0bb63c5
translation_language: pt-BR
source_file_path: user-guide/admin-recovery.md
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

1. **Verificar se o Container está em Execução**: Verifique se o container está em execução com `docker ps`
2. **Verificar Disponibilidade do Script**: Verifique se o script existe no container com `docker exec -it duplistatus ls -la /app/admin-recovery`
3. **Revisar Logs do Container**: Verifique se há erros com `docker logs duplistatus`
4. **Verificar Nome de Usuário**: Certifique-se de que o nome de usuário existe no banco de dados
5. **Verificar Formato da Senha**: Certifique-se de que a nova senha atende a todos os requisitos

Se os problemas persistirem, consulte o guia [Troubleshooting](troubleshooting.md) para obter mais ajuda.
