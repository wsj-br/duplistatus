# Recuperação de Conta de Administrador {/* #admin-account-recovery */}

Recupere o acesso de administrador ao **duplistatus** quando você perder sua senha ou for bloqueado da sua conta. Este guia abrange o uso do script de recuperação de administrador em ambientes Docker.

Se o navegador mostrar **Acesso negado** (HTTP 403) antes do formulário de login, a [Lista de permissões de IP do administrador](settings/ip-allowlist-settings.md) está bloqueando a solicitação. Use [Bloqueado pela Lista de permissões de IP](troubleshooting.md#locked-out-by-ip-allowlist) em vez deste script.

## Usando o Script no Docker {/* #using-the-script-in-docker */}

O Dockerfile inclui o diretório `scripts` e um wrapper de shell conveniente.

```bash
# Execute inside the running container using the wrapper
docker exec -it duplistatus /app/admin-recovery <username> <new-password>
```

**Exemplo:**

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

## Solução de problemas {/* #troubleshooting */}

Se você encontrar problemas com o script de recuperação:

1. **Verificar se o Container está em Execução**: Verifique se o container está em execução com `docker ps`
2. **Verificar Disponibilidade do Script**: Verifique se o script existe no container com `docker exec -it duplistatus ls -la /app/admin-recovery`
3. **Revisar Logs do Container**: Verifique por erros com `docker logs duplistatus`
4. **Verificar Nome de usuário**: Certifique-se de que o nome de usuário existe no banco de dados
5. **Verificar Formato da Senha**: Certifique-se de que a nova senha atende a todos os requisitos

Se os problemas persistirem, consulte o guia [Solução de Problemas](troubleshooting.md) para obter mais ajuda.
